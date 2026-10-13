import { useEffect, useState } from 'react'
import { WIcon, Fx } from './WeatherIcons'
import { Sheet, LocBody } from './IslamicViews'
import { getLoc, setLoc } from './prayer'
import type { Loc } from './prayer'
import { useWx, wdesc, toBn, rnd, nowIdx, todayIdx, minOf } from './weatherData'
import type { Wx } from './weatherData'

const SKY_DAY: Record<string, string> = {
  clear: 'linear-gradient(180deg,#1d4ed8 0%,#3b9be0 62%,#8fd0ee 100%)',
  partly: 'linear-gradient(180deg,#2f66b0 0%,#6aa3d4 62%,#a9c8e2 100%)',
  cloud: 'linear-gradient(180deg,#4b6a8f 0%,#8aa3bd 100%)',
  fog: 'linear-gradient(180deg,#7d8ba1 0%,#b9c3d1 100%)',
  drizzle: 'linear-gradient(180deg,#3d5470 0%,#7f93aa 100%)',
  rain: 'linear-gradient(180deg,#2e4056 0%,#66798f 100%)',
  heavy: 'linear-gradient(180deg,#1f2a3c 0%,#566579 100%)',
  thunder: 'linear-gradient(180deg,#1b1740 0%,#4b556b 100%)',
  snow: 'linear-gradient(180deg,#6c7f96 0%,#c7d2e0 100%)',
}
const SKY_NIGHT: Record<string, string> = {
  clear: 'linear-gradient(180deg,#020617 0%,#0b2447 58%,#1e3a8a 100%)',
  partly: 'linear-gradient(180deg,#0b1220 0%,#1e3552 100%)',
  cloud: 'linear-gradient(180deg,#0f172a 0%,#334155 100%)',
  fog: 'linear-gradient(180deg,#1e293b 0%,#475569 100%)',
  drizzle: 'linear-gradient(180deg,#0f1b2d 0%,#334155 100%)',
  rain: 'linear-gradient(180deg,#0b1220 0%,#27364a 100%)',
  heavy: 'linear-gradient(180deg,#070d18 0%,#1f2a3c 100%)',
  thunder: 'linear-gradient(180deg,#0a0820 0%,#2b3248 100%)',
  snow: 'linear-gradient(180deg,#1e293b 0%,#475569 100%)',
}
const skyOf = (kind: string, night: boolean) => (night ? SKY_NIGHT : SKY_DAY)[kind] || SKY_DAY.cloud

const AQI_C: [number, string, string][] = [
  [50, '#16a34a', 'ভালো'],
  [100, '#eab308', 'মাঝারি'],
  [150, '#f97316', 'সংবেদনশীলদের জন্য ঝুঁকিপূর্ণ'],
  [200, '#ef4444', 'অস্বাস্থ্যকর'],
  [300, '#9333ea', 'খুব অস্বাস্থ্যকর'],
  [9999, '#7f1d1d', 'বিপজ্জনক'],
]
const aqiOf = (v: number) => AQI_C.find(x => v <= x[0]) || AQI_C[5]

function uvOf(v: number): [string, string] {
  if (v < 3) return ['কম', '#16a34a']
  if (v < 6) return ['মাঝারি', '#eab308']
  if (v < 8) return ['উচ্চ', '#f97316']
  if (v < 11) return ['অতি উচ্চ', '#ef4444']
  return ['চরম', '#9333ea']
}

const DIRS = ['উত্তর', 'উত্তর-পূর্ব', 'পূর্ব', 'দক্ষিণ-পূর্ব', 'দক্ষিণ', 'দক্ষিণ-পশ্চিম', 'পশ্চিম', 'উত্তর-পশ্চিম']
const per = (h: number) => (h >= 19 || h < 4 ? 'রাত' : h < 6 ? 'ভোর' : h < 12 ? 'সকাল' : h < 15 ? 'দুপুর' : h < 17 ? 'বিকাল' : 'সন্ধ্যা')
const wd = (date: string, w: 'long' | 'short') => new Date(date + 'T12:00:00').toLocaleDateString('bn-BD', { weekday: w })

const cardSt: any = { background: 'linear-gradient(160deg,#11264a,#0b1730)', color: '#fff', borderRadius: 26, padding: 16 }
const tileSt: any = { background: 'rgba(255,255,255,.07)', borderRadius: 20, padding: 14, minHeight: 142 }

function Ring({ v, color, size = 78, children }: { v: number; color: string; size?: number; children?: any }) {
  const C = size / 2
  const R = size / 2 - 7
  const A0 = 135
  const SW = 270
  const p = Math.min(1, Math.max(0, v))
  const pt = (a: number): [number, number] => [C + R * Math.cos((a * Math.PI) / 180), C + R * Math.sin((a * Math.PI) / 180)]
  const d = (a1: number, a2: number) => {
    const [x1, y1] = pt(a1)
    const [x2, y2] = pt(a2)
    return `M${x1.toFixed(1)} ${y1.toFixed(1)}A${R} ${R} 0 ${a2 - a1 > 180 ? 1 : 0} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`
  }
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <path d={d(A0, A0 + SW)} fill="none" stroke="rgba(255,255,255,.16)" strokeWidth="7" strokeLinecap="round" />
        {p > 0.01 && <path d={d(A0, A0 + SW * p)} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" />}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-bold">{children}</div>
    </div>
  )
}

function Tile({ title, children }: { title: string; children: any }) {
  return (
    <div style={tileSt}>
      <p className="text-xs opacity-70">{title}</p>
      {children}
    </div>
  )
}

function Field({ wx }: { wx: Wx }) {
  const i0 = nowIdx(wx)
  const nx = wx.hours.slice(i0, i0 + 12)
  const feels = Math.max(wx.cur.feels, ...nx.map(h => h.feels))
  const rain = Math.max(0, ...nx.map(h => h.rain))
  const wind = Math.max(wx.cur.wind, ...nx.map(h => h.wind))
  const uv = Math.max(0, ...nx.map(h => h.uv))
  const aqi = wx.aqi || 0
  let s = 100
  const why: [string, string][] = []
  const hit = (pen: number, color: string, text: string) => { s -= pen; why.push([color, text]) }

  if (feels >= 41) hit(45, '#ef4444', 'অনুভূত তাপ ' + toBn(rnd(feels)) + '° । দুপুরের মাঠের কাজ এড়ান, ঘন ঘন পানি পান করুন')
  else if (feels >= 38) hit(30, '#f97316', 'অনুভূত তাপ ' + toBn(rnd(feels)) + '° । ছায়ায় বিরতি ও বেশি পানি দরকার')
  else if (feels >= 35) hit(18, '#f97316', 'গরম বেশি (অনুভূত ' + toBn(rnd(feels)) + '°)। পানি সাথে রাখুন')
  else if (feels >= 32) hit(8, '#eab308', 'একটু গরম (অনুভূত ' + toBn(rnd(feels)) + '°)')

  if (rain >= 70) hit(30, '#ef4444', 'বৃষ্টির সম্ভাবনা ' + toBn(rain) + '%। ত্রাণ সামগ্রী ঢেকে রাখুন')
  else if (rain >= 40) hit(15, '#f97316', 'বৃষ্টির সম্ভাবনা ' + toBn(rain) + '%। ছাতা বা তারপলিন রাখুন')
  else if (rain >= 20) hit(5, '#eab308', 'হালকা বৃষ্টির সম্ভাবনা ' + toBn(rain) + '%')

  if (wind >= 40) hit(25, '#ef4444', 'বাতাস ' + toBn(rnd(wind)) + ' কিমি/ঘণ্টা। নৌকা বা উঁচু কাজে ঝুঁকি')
  else if (wind >= 25) hit(10, '#f97316', 'বাতাস জোরালো (' + toBn(rnd(wind)) + ' কিমি/ঘণ্টা)')

  if (uv >= 8) hit(15, '#ef4444', 'UV সূচক ' + toBn(rnd(uv)) + '। সরাসরি রোদ এড়ান')
  else if (uv >= 6) hit(8, '#f97316', 'UV সূচক ' + toBn(rnd(uv)) + '। টুপি বা ছাতা নিন')

  if (aqi > 150) hit(25, '#ef4444', 'বায়ু অস্বাস্থ্যকর (AQI ' + toBn(aqi) + ')। মাস্ক পরুন')
  else if (aqi > 100) hit(12, '#f97316', 'বায়ুমান সংবেদনশীলদের জন্য ঝুঁকিপূর্ণ')

  s = Math.max(0, Math.min(100, s))
  const [label, color] = s >= 80 ? ['চমৎকার', '#22c55e'] : s >= 60 ? ['ভালো', '#a3e635'] : s >= 40 ? ['সতর্কতা', '#f59e0b'] : ['ঝুঁকিপূর্ণ', '#ef4444']

  return (
    <div style={cardSt} className="space-y-3">
      <div className="flex items-center gap-4">
        <Ring v={s / 100} color={color} size={96}>
          <span className="text-2xl">{toBn(s)}</span>
        </Ring>
        <div>
          <p className="text-xs opacity-70">মাঠকর্মী সূচক</p>
          <p className="text-xl font-extrabold" style={{ color }}>{label}</p>
          <p className="text-[11px] opacity-70">পরের ১২ ঘণ্টায় ত্রাণ বা মাঠের কাজের জন্য আবহাওয়া কেমন</p>
        </div>
      </div>
      {why.length === 0 && (
        <p className="text-sm rounded-xl p-3" style={{ background: 'rgba(34,197,94,.14)' }}>
          আজ মাঠে কাজের জন্য আবহাওয়া অনুকূল।
        </p>
      )}
      {why.map(([c, t], i) => (
        <p key={i} className="text-sm flex items-start gap-2">
          <i className="w-2.5 h-2.5 rounded-full shrink-0 mt-1.5" style={{ background: c }} />
          <span>{t}</span>
        </p>
      ))}
      <p className="text-[10px] opacity-50">এটা আমাদের নিজস্ব হিসাব, সরকারি সতর্কতা নয়।</p>
    </div>
  )
}

function Hourly({ wx }: { wx: Wx }) {
  const i = nowIdx(wx)
  const hs = wx.hours.slice(i, i + 25)
  const W = 56
  const H = 76
  const ts = hs.map(h => h.t)
  const mn = Math.min(...ts)
  const mx = Math.max(...ts)
  const rg = Math.max(1, mx - mn)
  const y = (t: number) => 22 + (H - 22 - 8) * (1 - (t - mn) / rg)
  const x = (k: number) => k * W + W / 2
  const pts = hs.map((h, k) => `${x(k).toFixed(1)},${y(h.t).toFixed(1)}`).join(' ')

  return (
    <div style={cardSt} className="space-y-2">
      <p className="font-bold">আগামী ২৪ ঘণ্টা</p>
      <div className="overflow-x-auto">
        <div style={{ width: hs.length * W }}>
          <svg width={hs.length * W} height={H + 6}>
            <polyline points={pts} fill="none" stroke="#fbbf24" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
            {hs.map((h, k) => (
              <g key={h.time}>
                <circle cx={x(k)} cy={y(h.t)} r={k === 0 ? 4 : 2.8} fill={k === 0 ? '#fff' : '#fbbf24'} />
                <text x={x(k)} y={y(h.t) - 9} textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">{toBn(rnd(h.t))}°</text>
              </g>
            ))}
          </svg>
          <div className="flex">
            {hs.map((h, k) => {
              const hr = Number(h.time.slice(11, 13))
              const night = hr < 6 || hr >= 18
              return (
                <div key={h.time} className="flex flex-col items-center gap-0.5" style={{ width: W }}>
                  <WIcon kind={wdesc(h.code)[1]} night={night} size={28} />
                  <span className="text-[10px]" style={{ color: '#60a5fa', visibility: h.rain >= 20 ? 'visible' : 'hidden' }}>
                    {toBn(h.rain)}%
                  </span>
                  <b className="text-xs">{k === 0 ? 'এখন' : toBn(hr % 12 || 12) + 'টা'}</b>
                  <span className="text-[10px] opacity-60">{per(hr)}</span>
                  <span className="text-[9px] opacity-50">{toBn(rnd(h.wind))} কিমি</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function SunTile({ today }: { today: { sunrise: string; sunset: string } }) {
  const sr = minOf(today.sunrise)
  const ss = minOf(today.sunset)
  const d = new Date()
  const nm = d.getHours() * 60 + d.getMinutes()
  const p = (nm - sr) / Math.max(1, ss - sr)
  const day = p >= 0 && p <= 1
  const q = Math.min(1, Math.max(0, p))
  const cx = 65
  const cy = 62
  const r = 54
  const a = Math.PI * (1 - q)
  const sx = cx + r * Math.cos(a)
  const sy = cy - r * Math.sin(a)
  return (
    <Tile title="সূর্যোদয় ও সূর্যাস্ত">
      <svg viewBox="0 0 130 78" width="100%" style={{ maxWidth: 150, display: 'block', margin: '4px auto 0' }}>
        <path d={`M${cx - r} ${cy}A${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="3" strokeDasharray="3 4" />
        {day && <path d={`M${cx - r} ${cy}A${r} ${r} 0 0 1 ${sx.toFixed(1)} ${sy.toFixed(1)}`} fill="none" stroke="#fbbf24" strokeWidth="3.4" strokeLinecap="round" />}
        <line x1="6" y1={cy} x2="124" y2={cy} stroke="rgba(255,255,255,.25)" />
        <circle cx={sx} cy={sy} r="6" fill={day ? '#fde047' : '#94a3b8'} />
      </svg>
      <div className="flex justify-between text-xs mt-1">
        <span>↑ {toBn(today.sunrise.slice(11, 16))}</span>
        <span>↓ {toBn(today.sunset.slice(11, 16))}</span>
      </div>
      <p className="text-[11px] opacity-70 text-center">{day ? 'এখন দিনের আলো' : 'এখন রাত'}</p>
    </Tile>
  )
}

function Compass({ dir, speed }: { dir: number; speed: number }) {
  const name = DIRS[Math.round(dir / 45) % 8]
  const lab = speed < 6 ? 'প্রায় শান্ত' : speed < 20 ? 'মৃদু' : speed < 30 ? 'মাঝারি' : speed < 45 ? 'তীব্র' : 'ঝড়ো'
  return (
    <Tile title="বাতাস">
      <div className="flex items-center gap-2 mt-1">
        <svg viewBox="0 0 80 80" width="76" height="76" className="shrink-0">
          <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="3" />
          {[['উ', 40, 10], ['পূ', 70, 44], ['দ', 40, 76], ['প', 10, 44]].map(([l, x, y]) => (
            <text key={l as string} x={x as number} y={y as number} textAnchor="middle" fontSize="9" fill="#fff" fillOpacity=".7">{l}</text>
          ))}
          <g style={{ transform: `rotate(${dir + 180}deg)`, transformOrigin: '40px 40px', transition: 'transform .6s' }}>
            <path d="M40 18 46 40H34z" fill="#38bdf8" />
            <rect x="38.8" y="40" width="2.4" height="14" rx="1.2" fill="#38bdf8" fillOpacity=".5" />
          </g>
          <circle cx="40" cy="40" r="5" fill="#0b1730" stroke="#38bdf8" strokeWidth="2" />
        </svg>
        <div>
          <p className="text-2xl font-extrabold leading-none">{toBn(rnd(speed))}</p>
          <p className="text-[10px] opacity-60">কিমি/ঘণ্টা</p>
          <p className="text-xs mt-1">{lab}</p>
        </div>
      </div>
      <p className="text-[11px] opacity-70 mt-1">{name} দিক থেকে</p>
    </Tile>
  )
}

function DaysList({ wx, onMore }: { wx: Wx; onMore: () => void }) {
  const ti = todayIdx(wx)
  const ds = wx.days.slice(ti, ti + 7)
  const gmin = Math.min(...ds.map(x => x.min))
  const gmax = Math.max(...ds.map(x => x.max))
  const rg = Math.max(1, gmax - gmin)
  return (
    <div style={cardSt} className="space-y-1">
      <div className="flex items-center justify-between mb-1">
        <p className="font-bold">৭ দিনের পূর্বাভাস</p>
        <button className="text-xs font-semibold underline" style={{ color: '#7dd3fc' }} onClick={onMore}>বিস্তারিত ›</button>
      </div>
      {ds.map((d, i) => (
        <div key={d.date} className="flex items-center gap-2 py-1.5 border-t" style={{ borderColor: 'rgba(255,255,255,.08)' }}>
          <span className="w-16 text-sm font-semibold">{i === 0 ? 'আজ' : i === 1 ? 'আগামীকাল' : wd(d.date, 'long')}</span>
          <WIcon kind={wdesc(d.code)[1]} size={28} />
          <span className="w-9 text-[11px]" style={{ color: '#60a5fa' }}>{d.rain >= 20 ? toBn(d.rain) + '%' : ''}</span>
          <span className="w-7 text-sm opacity-80 text-right">{toBn(rnd(d.min))}°</span>
          <div className="flex-1 h-1.5 rounded-full relative" style={{ background: 'rgba(255,255,255,.14)' }}>
            <div className="absolute h-full rounded-full"
              style={{
                left: ((d.min - gmin) / rg) * 100 + '%', width: Math.max(6, ((d.max - d.min) / rg) * 100) + '%',
                background: 'linear-gradient(90deg,#fb923c,#f59e0b)',
              }} />
          </div>
          <span className="w-7 text-sm font-bold">{toBn(rnd(d.max))}°</span>
        </div>
      ))}
    </div>
  )
}

function Curve({ wx }: { wx: Wx }) {
  const ti = todayIdx(wx)
  const ds = wx.days.slice(Math.max(0, ti - 1), ti + 6)
  const CW = 64
  const H = 230
  const top = 38
  const bot = 38
  const all = ds.flatMap(d => [d.max, d.min])
  const mn = Math.min(...all)
  const mx = Math.max(...all)
  const rg = Math.max(1, mx - mn)
  const y = (v: number) => top + (H - top - bot) * (1 - (v - mn) / rg)
  const x = (i: number) => CW * i + CW / 2
  const line = (k: 'max' | 'min') => ds.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(d[k]).toFixed(1)}`).join(' ')
  const todayCol = ds.findIndex(d => d.date === wx.cur.time.slice(0, 10))

  return (
    <div className="overflow-x-auto">
      <div style={{ width: ds.length * CW }}>
        <div className="flex">
          {ds.map((d, i) => (
            <div key={d.date} className="text-center py-1 rounded-t-xl"
              style={{ width: CW, background: i === todayCol ? 'rgba(100,116,139,.18)' : undefined }}>
              <b className="text-xs block">{i === todayCol ? 'আজ' : i === todayCol + 1 ? 'আগামীকাল' : i === todayCol - 1 ? 'গতকাল' : wd(d.date, 'short')}</b>
              <span className="text-[10px] text-gray-500">{toBn(d.date.slice(8, 10))}/{toBn(d.date.slice(5, 7))}</span>
              <div className="flex justify-center mt-1"><WIcon kind={wdesc(d.code)[1]} size={26} /></div>
            </div>
          ))}
        </div>
        <svg width={ds.length * CW} height={H}>
          {todayCol >= 0 && <rect x={x(todayCol) - CW / 2} y="0" width={CW} height={H} fill="rgba(100,116,139,.13)" />}
          <path d={line('max')} fill="none" stroke="#f97316" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
          <path d={line('min')} fill="none" stroke="#eab308" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
          {ds.map((d, i) => (
            <g key={d.date}>
              <circle cx={x(i)} cy={y(d.max)} r="3.4" fill="#f97316" />
              <text x={x(i)} y={y(d.max) - 9} textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">{toBn(rnd(d.max))}°</text>
              <circle cx={x(i)} cy={y(d.min)} r="3.4" fill="#eab308" />
              <text x={x(i)} y={y(d.min) + 18} textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">{toBn(rnd(d.min))}°</text>
            </g>
          ))}
        </svg>
        <div className="flex">
          {ds.map((d, i) => (
            <div key={d.date} className="text-center py-1 rounded-b-xl"
              style={{ width: CW, background: i === todayCol ? 'rgba(100,116,139,.18)' : undefined }}>
              <div className="flex justify-center"><WIcon kind={wdesc(d.code)[1] === 'clear' ? 'clear' : wdesc(d.code)[1]} night size={24} /></div>
              <span className="text-[10px] text-gray-500">{toBn(rnd(d.wind))} কিমি</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Weather({ settings }: any) {
  const accent = settings?.theme_color || '#087a43'
  const [loc, setLocS] = useState<Loc>(getLoc())
  const { wx, err, busy, reload } = useWx(loc)
  const [sheet, setSheet] = useState('')
  const [, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick(x => x + 1), 60000)
    return () => clearInterval(id)
  }, [])

  if (!wx) {
    return (
      <div className="rounded-3xl p-8 text-center space-y-3 text-white" style={{ background: 'linear-gradient(180deg,#1d4ed8,#3b9be0)' }}>
        <WIcon kind="partly" size={64} />
        <p className="font-bold">{busy ? 'আবহাওয়ার তথ্য আনা হচ্ছে...' : err || 'আবহাওয়ার তথ্য নেই'}</p>
        {!busy && (
          <button className="rounded-lg px-5 py-2 font-semibold text-white" style={{ background: 'rgba(255,255,255,.22)' }}
            onClick={reload}>
            আবার চেষ্টা করুন
          </button>
        )}
      </div>
    )
  }

  const c = wx.cur
  const [desc, kind] = wdesc(c.code)
  const night = !c.day
  const ti = todayIdx(wx)
  const today = wx.days[ti]
  const i0 = nowIdx(wx)
  const nx = wx.hours.slice(i0, i0 + 12)
  const nx24 = wx.hours.slice(i0, i0 + 24)
  const maxRain = Math.max(0, ...nx.map(h => h.rain))
  const maxWind = Math.max(c.wind, ...nx.map(h => h.wind))
  const maxFeels = Math.max(c.feels, ...nx.map(h => h.feels))
  const rain24 = Math.max(0, ...nx24.map(h => h.rain))
  const uvNow = Math.max(wx.hours[i0] ? wx.hours[i0].uv : 0, 0)
  const [uvL, uvC] = uvOf(uvNow)
  const aq = wx.aqi !== null ? aqiOf(wx.aqi) : null
  const age = Math.max(0, Math.floor((Date.now() - wx.at) / 60000))

  const warn: string[] = []
  if (nx.some(h => h.code >= 95)) warn.push('বজ্রসহ বৃষ্টির সম্ভাবনা আছে। খোলা মাঠ ও গাছের নিচ এড়িয়ে চলুন।')
  if (maxRain >= 70) warn.push('আগামী ১২ ঘণ্টায় বৃষ্টির সম্ভাবনা ' + toBn(maxRain) + '%।')
  if (maxWind >= 40) warn.push('বাতাসের গতি ' + toBn(rnd(maxWind)) + ' কিমি/ঘণ্টা পর্যন্ত হতে পারে।')
  if (maxFeels >= 40) warn.push('অনুভূত তাপমাত্রা ' + toBn(rnd(maxFeels)) + '° পর্যন্ত উঠবে। দুপুরে রোদে কাজ এড়ান।')

  const chip: any = { background: 'rgba(255,255,255,.18)', backdropFilter: 'blur(6px)' }

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden text-white p-5" style={{ borderRadius: 32, background: skyOf(kind, night) }}>
        <Fx kind={kind} night={night} />
        <div className="relative space-y-3">
          <div className="flex items-center justify-between gap-2">
            <button onClick={() => setSheet('loc')} className="rounded-full px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5" style={chip}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11z" />
                <circle cx="12" cy="10" r="2.4" />
              </svg>
              {loc.name}
            </button>
            <button onClick={reload} disabled={busy} className="rounded-full px-3 py-1.5 text-xs font-semibold disabled:opacity-60" style={chip}>
              {busy ? '...' : '↻ ' + (age < 1 ? 'এইমাত্র' : toBn(age) + ' মিনিট আগে')}
            </button>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <p style={{ fontSize: 104, fontWeight: 200, lineHeight: 1, letterSpacing: -4 }}>
                {toBn(rnd(c.t))}<span style={{ fontSize: 40, verticalAlign: 'top', fontWeight: 300 }}>°</span>
              </p>
              <p className="text-xl font-semibold mt-1">{desc}</p>
              <p className="text-sm opacity-90">
                সর্বোচ্চ {toBn(rnd(today.max))}° · সর্বনিম্ন {toBn(rnd(today.min))}°
              </p>
              <p className="text-sm opacity-90">অনুভূত {toBn(rnd(c.feels))}°</p>
            </div>
            <WIcon kind={kind} night={night} size={104} />
          </div>

          <div className="flex gap-2 flex-wrap">
            {aq && (
              <span className="rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1.5" style={chip}>
                <i className="w-2.5 h-2.5 rounded-full" style={{ background: aq[1] }} /> AQI {toBn(wx.aqi || 0)}
              </span>
            )}
            <span className="rounded-full px-3 py-1 text-xs font-bold" style={chip}>আর্দ্রতা {toBn(rnd(c.hum))}%</span>
            <span className="rounded-full px-3 py-1 text-xs font-bold" style={chip}>বাতাস {toBn(rnd(c.wind))} কিমি/ঘণ্টা</span>
          </div>
        </div>
      </section>

      {warn.length > 0 && (
        <div className="rounded-2xl p-4 space-y-1" style={{ background: '#fef3c7', color: '#78350f', border: '1px solid #fcd34d' }}>
          <p className="font-bold text-sm">⚠ সতর্কতা (পূর্বাভাস অনুযায়ী)</p>
          {warn.map((w, i) => <p key={i} className="text-sm">• {w}</p>)}
          <p className="text-[11px] opacity-80">সরকারি সতর্কতা ও ঘূর্ণিঝড়ের সংকেতের জন্য আবহাওয়া অধিদপ্তরের তথ্য দেখুন।</p>
        </div>
      )}

      <Field wx={wx} />
      <Hourly wx={wx} />

      <div style={cardSt} className="space-y-3">
        <p className="font-bold">আজকের বিস্তারিত</p>
        <div className="grid grid-cols-2 gap-3">
          <Tile title="UV সূচক">
            <div className="flex items-center gap-2 mt-1">
              <Ring v={uvNow / 11} color={uvC}><span className="text-lg">{toBn(rnd(uvNow))}</span></Ring>
              <b style={{ color: uvC }}>{uvL}</b>
            </div>
            <p className="text-[11px] opacity-70 mt-1">আজকের সর্বোচ্চ {toBn(rnd(today.uv))}</p>
          </Tile>

          <Tile title="আর্দ্রতা">
            <div className="flex items-center gap-2 mt-1">
              <Ring v={c.hum / 100} color="#38bdf8"><span className="text-base">{toBn(rnd(c.hum))}%</span></Ring>
              <b className="text-sm">{c.hum < 30 ? 'শুষ্ক' : c.hum < 60 ? 'আরামদায়ক' : c.hum < 80 ? 'আর্দ্র' : 'অতি আর্দ্র'}</b>
            </div>
          </Tile>

          <Tile title="অনুভূত তাপমাত্রা">
            <div className="flex items-center gap-2 mt-1">
              <Ring v={(c.feels - 10) / 40} color="#fb923c"><span className="text-base">{toBn(rnd(c.feels))}°</span></Ring>
              <div className="text-xs">
                <p>আসলে {toBn(rnd(c.t))}°</p>
                <p className="opacity-70">{c.feels - c.t >= 3 ? 'গরম লাগবে বেশি' : c.feels - c.t <= -3 ? 'ঠান্ডা লাগবে বেশি' : 'প্রায় সমান'}</p>
              </div>
            </div>
          </Tile>

          <Compass dir={c.dir} speed={c.wind} />
          <SunTile today={today} />

          <Tile title="বায়ুচাপ">
            <div className="flex items-center gap-2 mt-1">
              <Ring v={(c.pres - 980) / 60} color="#a78bfa"><span className="text-[13px]">{toBn(rnd(c.pres))}</span></Ring>
              <div className="text-xs">
                <p>hPa</p>
                <p className="opacity-70">{c.pres < 1000 ? 'নিম্ন চাপ' : c.pres > 1020 ? 'উচ্চ চাপ' : 'স্বাভাবিক'}</p>
              </div>
            </div>
          </Tile>

          <Tile title="বৃষ্টির সম্ভাবনা">
            <div className="flex items-center gap-2 mt-1">
              <Ring v={rain24 / 100} color="#60a5fa"><span className="text-base">{toBn(rain24)}%</span></Ring>
              <div className="text-xs">
                <p>আগামী ২৪ ঘণ্টা</p>
                <p className="opacity-70">আজ {toBn(Number(today.mm.toFixed(1)))} মিমি</p>
              </div>
            </div>
          </Tile>

          {aq && wx.aqi !== null && (
            <Tile title="বায়ুমান (AQI)">
              <p className="text-2xl font-extrabold mt-1" style={{ color: aq[1] }}>{toBn(wx.aqi)}</p>
              <div className="relative h-2 rounded-full mt-2"
                style={{ background: 'linear-gradient(90deg,#16a34a,#eab308,#f97316,#ef4444,#9333ea)' }}>
                <i className="absolute -top-1 w-3.5 h-4 rounded bg-white"
                  style={{ left: Math.min(97, (wx.aqi / 300) * 100) + '%', boxShadow: '0 0 0 2px rgba(0,0,0,.4)' }} />
              </div>
              <p className="text-[11px] mt-2" style={{ color: aq[1] }}>{aq[2]}</p>
              {wx.pm25 !== null && <p className="text-[10px] opacity-60">PM২.৫: {toBn(Number(wx.pm25.toFixed(1)))}</p>}
            </Tile>
          )}
        </div>
      </div>

      <DaysList wx={wx} onMore={() => setSheet('curve')} />

      <p className="text-[11px] text-gray-500 text-center px-3">
        তথ্য: Open-Meteo (আন্তর্জাতিক পূর্বাভাস মডেল), অবাণিজ্যিক ব্যবহার। এটি সরকারি আবহাওয়া সংকেত নয়।
        {err && <b className="block text-amber-600">{err}</b>}
      </p>

      {sheet === 'loc' && (
        <Sheet title="স্থান বাছুন" onClose={() => setSheet('')}>
          <LocBody loc={loc} onPick={(l: Loc) => { setLoc(l); setLocS(l); setSheet('') }} />
          <p className="text-[11px]" style={{ color: accent }}>এই স্থানই ইসলামিক কর্নারের নামাজের সময়েও ব্যবহার হয়।</p>
        </Sheet>
      )}
      {sheet === 'curve' && (
        <Sheet title="তাপমাত্রার বক্ররেখা" wide onClose={() => setSheet('')}>
          <Curve wx={wx} />
          <p className="text-[11px] text-gray-500">কমলা রেখা দিনের সর্বোচ্চ, হলুদ রেখা রাতের সর্বনিম্ন তাপমাত্রা।</p>
        </Sheet>
      )}
    </div>
  )
}
