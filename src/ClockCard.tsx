import { useEffect, useState } from 'react'
import { Ico } from './Icons'
import './Icons2'
import { WIcon } from './WeatherIcons'
import { useWx, wdesc, toBn, rnd } from './weatherData'
import { bnDate } from './DayCard'
import { PN, bnDigits, fmtLeft, getAdj, getAsr, getLoc, hijri, HIJRI_BN, nextPrayer, prayerTimes } from './prayer'
import { feat } from './features'

const KEY = 'clock-style-v2'
const bn = (n: number) => bnDigits(String(n))
const P = (h: number) => (h >= 19 || h < 4 ? 'রাত' : h < 6 ? 'ভোর' : h < 12 ? 'সকাল' : h < 15 ? 'দুপুর' : h < 17 ? 'বিকাল' : 'সন্ধ্যা')
const GREET: Record<string, string> = {
  ভোর: 'শুভ ভোর', সকাল: 'শুভ সকাল', দুপুর: 'শুভ দুপুর', বিকাল: 'শুভ বিকাল', সন্ধ্যা: 'শুভ সন্ধ্যা', রাত: 'শুভ রাত্রি',
}
const SCENE = (h: number): [string, string, string] =>
  h >= 4 && h < 6 ? ['#0b2447', '#1b4d7a', '#e89a5b']
    : h >= 6 && h < 16 ? ['#0b5ea8', '#2f8fd0', '#8fd0ee']
      : h >= 16 && h < 18 ? ['#1f5f86', '#c9953f', '#f0b45b']
        : h === 18 ? ['#2b1d4e', '#9a3f5f', '#f28c4a']
          : ['#03293a', '#04566a', '#064e5a']

const CX = 105
const pol = (r: number, deg: number): [number, number] => [
  CX + r * Math.sin((deg * Math.PI) / 180),
  CX - r * Math.cos((deg * Math.PI) / 180),
]

export default function ClockCard({ settings, onNav }: any) {
  const accent = settings?.theme_color || '#087a43'
  const [now, setNow] = useState(Date.now())
  const [style, setStyle] = useState<'orbit' | 'flip'>(() => {
    try { return localStorage.getItem(KEY) === 'flip' ? 'flip' : 'orbit' } catch { return 'orbit' }
  })
  const { wx } = useWx(getLoc())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!feat('clock')) return null

  const d = new Date(now)
  const h = d.getHours()
  const m = d.getMinutes()
  const s = d.getSeconds()
  const h12 = h % 12 || 12
  const off = d.getTimezoneOffset() * 60000
  const lt = now - off
  const per = P(h)
  const [c1, c2, c3] = SCENE(h)
  const night = h < 6 || h >= 18

  const t: any = prayerTimes(d, getLoc(), getAsr(), getAdj())
  const frac = (ts: number) => ((((ts - off) % 86400000) + 86400000) % 86400000) / 86400000
  const th = (f: number) => f * 360 + 180
  const ths = th(frac(t.sunrise))
  let the = th(frac(t.maghrib))
  if (the < ths) the += 360
  const [ax1, ay1] = pol(96, ths)
  const [ax2, ay2] = pol(96, the)
  const dayArc = `M${ax1.toFixed(1)} ${ay1.toFixed(1)}A96 96 0 ${the - ths > 180 ? 1 : 0} 1 ${ax2.toFixed(1)} ${ay2.toFixed(1)}`
  const fNow = frac(now)
  const [mx, my] = pol(96, th(fNow))
  const isDay = fNow >= frac(t.sunrise) && fNow <= frac(t.maghrib)

  const date1 = d.toLocaleDateString('bn-BD', { weekday: 'long', day: 'numeric', month: 'long' })
  const hj = hijri(d)
  const bd = bnDate(d)
  const np = nextPrayer(now)

  const cur = wx ? wx.cur : null
  const desc = cur ? wdesc(cur.code) : null

  function toggleStyle() {
    const nx = style === 'orbit' ? 'flip' : 'orbit'
    setStyle(nx)
    try { localStorage.setItem(KEY, nx) } catch {}
  }

  const temp = (
    <button onClick={() => onNav('weather')}
      className="flex items-center gap-2 rounded-2xl px-3 py-1.5 text-left active:scale-95 transition"
      style={{ background: 'rgba(255,255,255,.16)', backdropFilter: 'blur(6px)' }}>
      <WIcon kind={desc ? desc[1] : 'partly'} night={cur ? !cur.day : night} size={34} />
      {cur && desc ? (
        <span className="leading-tight">
          <b className="text-xl">{toBn(rnd(cur.t))}°</b>
          <span className="block text-[11px] opacity-90">{desc[0]}</span>
        </span>
      ) : (
        <span className="text-xs font-semibold">আবহাওয়া দেখুন ›</span>
      )}
    </button>
  )

  const ticks = Array.from({ length: 60 }, (_, i) => {
    const big = i % 5 === 0
    const [x1, y1] = pol(80, i * 6)
    const [x2, y2] = pol(big ? 72 : 76, i * 6)
    return (
      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={big ? '#fde68a' : 'rgba(255,255,255,.45)'} strokeWidth={big ? 2 : 1} strokeLinecap="round" />
    )
  })

  const hand = (deg: number, len: number, w: number, col: string, tail = 0) => (
    <g style={{ transform: `rotate(${deg}deg)`, transformOrigin: `${CX}px ${CX}px`, transition: 'transform 1s linear' }}>
      <line x1={CX} y1={CX + tail} x2={CX} y2={CX - len} stroke={col} strokeWidth={w} strokeLinecap="round" />
    </g>
  )

  const Tile = ({ v, l }: { v: string; l: string }) => (
    <div className="flex-1 text-center">
      <div className="relative rounded-2xl py-2 text-3xl font-bold tabular-nums"
        style={{ background: 'rgba(0,0,0,.28)', border: '1px solid rgba(255,255,255,.12)' }}>
        {v}
        <span className="absolute left-0 right-0 top-1/2 h-px" style={{ background: 'rgba(255,255,255,.14)' }} />
      </div>
      <p className="text-[10px] mt-1 opacity-80">{l}</p>
    </div>
  )

  const chip = 'rounded-full px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap'
  const chipBg = { background: 'rgba(255,255,255,.16)' }

  return (
    <section className="relative overflow-hidden text-white p-3.5"
      style={{ borderRadius: 32, background: `linear-gradient(165deg, ${c1}, ${c2} 60%, ${c3})` }}>
      {night && Array.from({ length: 10 }, (_, i) => (
        <i key={i} className="absolute rounded-full bg-white"
          style={{
            left: ((i * 61) % 94) + 3 + '%', top: ((i * 23) % 40) + 4 + '%', width: 2, height: 2, opacity: 0.6,
            animation: `wxTw 3s ${(i * 0.4) % 3}s infinite`,
          }} />
      ))}

      <div className="relative space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="text-xs opacity-90">{GREET[per]} · {date1}</p>
          <button onClick={toggleStyle} aria-label="clock style" className="p-1.5 rounded-full"
            style={{ background: 'rgba(255,255,255,.16)' }}>
            <Ico name="palette" size={16} />
          </button>
        </div>

        {style === 'orbit' ? (
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 210 210" width="136" height="136" className="shrink-0">
              <circle cx={CX} cy={CX} r="96" fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="9" />
              <path d={dayArc} fill="none" stroke="#fbbf24" strokeOpacity=".9" strokeWidth="9" strokeLinecap="round" />
              {['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map(k => {
                const [px, py] = pol(96, th(frac(t[k])))
                const nx = !!np && np.key === k
                return (
                  <g key={k}>
                    {nx && (
                      <circle cx={px} cy={py} r="9" fill="none" stroke="#fff" strokeWidth="1.5">
                        <animate attributeName="r" values="6;14;6" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values=".9;0;.9" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle cx={px} cy={py} r={nx ? 5.5 : 3.4} fill={nx ? accent : '#fff'} stroke="#fff" strokeWidth={nx ? 2 : 0} />
                  </g>
                )
              })}
              <circle cx={CX} cy={CX} r="85" fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.16)" />
              {ticks}
              {[['১২', 0], ['৩', 90], ['৬', 180], ['৯', 270]].map(([n, a]) => {
                const [x, y] = pol(58, a as number)
                return (
                  <text key={n as string} x={x} y={y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="#fff" fillOpacity=".9">
                    {n}
                  </text>
                )
              })}
              {hand((lt / 3600000) * 30, 38, 5, '#ffffff')}
              {hand((lt / 60000) * 6, 56, 3.4, '#ffffff')}
              {hand((lt / 1000) * 6, 66, 1.6, '#fbbf24', 14)}
              <circle cx={CX} cy={CX} r="5.5" fill="#fbbf24" />
              <circle cx={CX} cy={CX} r="2" fill="#0f172a" />
              <circle cx={mx} cy={my} r="11" fill={isDay ? 'rgba(253,224,71,.3)' : 'rgba(226,232,240,.25)'} />
              <circle cx={mx} cy={my} r={7.2} fill={isDay ? '#fde047' : '#e2e8f0'} />
              {!isDay && <circle cx={mx + 2.6} cy={my - 1.6} r={5.8} fill={c2} />}
            </svg>

            <div className="flex-1 min-w-0 space-y-2">
              <div>
                <p className="font-light leading-none tabular-nums" style={{ fontSize: 38, letterSpacing: -1 }}>
                  {bn(h12).padStart(2, '০')}
                  <span className="opacity-70">:</span>
                  {bn(m).padStart(2, '০')}
                </p>
                <p className="text-sm mt-1 flex items-center gap-2">
                  <span className="tabular-nums opacity-90">{bn(s).padStart(2, '০')} সে.</span>
                  <span className="rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ background: 'rgba(255,255,255,.2)' }}>{per}</span>
                </p>
              </div>
              {temp}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Tile v={bn(h12).padStart(2, '০')} l="ঘণ্টা" />
              <Tile v={bn(m).padStart(2, '০')} l="মিনিট" />
              <Tile v={bn(s).padStart(2, '০')} l="সেকেন্ড" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: 'rgba(255,255,255,.2)' }}>{per}</span>
              {temp}
            </div>
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-0.5">
          <span className={chip} style={chipBg}>{bn(bd.day)} {bd.month}, {bn(bd.year)}</span>
          <span className={chip} style={chipBg}>{bn(hj.d)} {HIJRI_BN[hj.m - 1]}, {bn(hj.y)}</span>
          {np && (
            <button className={chip} style={{ background: accent, boxShadow: '0 0 0 1px rgba(255,255,255,.3)' }}
              onClick={() => onNav('islamic')}>
              পরের নামাজ: {PN[np.key]} · {fmtLeft(np.at - now)} বাকি
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
