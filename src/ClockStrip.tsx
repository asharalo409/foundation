import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import { WIcon } from './WeatherIcons'
import { useWx, wdesc, toBn, rnd } from './weatherData'
import { bnDate } from './DayCard'
import {
  PN, bnDigits, fmtClock, fmtLeft, getAdj, getAsr, getLoc, hijri, HIJRI_BN, nextPrayer, prayerTimes,
} from './prayer'
import { feat } from './features'

// হোম পেজের একমাত্র ঘড়ি: সময়, আকাশের পথে সূর্য/চাঁদ, তিন ক্যালেন্ডারের তারিখ,
// পাঁচ ওয়াক্তের সময় ও পরের নামাজের কাউন্টডাউন, আবহাওয়া। আলাদা করে কিছু খুলতে হয় না।

const bn = (n: number) => bnDigits(String(n))
const two = (n: number) => bn(n).padStart(2, '০')
const GREET = (h: number) =>
  h >= 19 || h < 4 ? 'শুভ রাত্রি' : h < 6 ? 'শুভ ভোর' : h < 12 ? 'শুভ সকাল'
    : h < 15 ? 'শুভ দুপুর' : h < 17 ? 'শুভ বিকাল' : 'শুভ সন্ধ্যা'
const SKY = (h: number): [string, string] =>
  h >= 4 && h < 6 ? ['#13335c', '#d98b57']
    : h >= 6 && h < 16 ? ['#0d63b0', '#59b4e0']
      : h >= 16 && h < 18 ? ['#1d5a80', '#e0a24a']
        : h === 18 ? ['#2b1d4e', '#d9704a']
          : ['#04202f', '#0a5568']

const ORDER = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']

// দিনের পথের (বক্ররেখার) উপর t (০ থেকে ১) অবস্থানের বিন্দু
const arc = (t: number): [number, number] => {
  const x0 = 14, y0 = 56, cx = 150, cy = -14, x1 = 286, y1 = 56
  const u = 1 - t
  return [u * u * x0 + 2 * u * t * cx + t * t * x1, u * u * y0 + 2 * u * t * cy + t * t * y1]
}

export default function ClockStrip({ settings, onNav }: any) {
  const accent = settings?.theme_color || '#087a43'
  const [now, setNow] = useState(Date.now())
  const loc = getLoc()
  const { wx } = useWx(loc)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!feat('clock')) return null

  const d = new Date(now)
  const h = d.getHours()
  const h12 = h % 12 || 12
  const s = d.getSeconds()
  const [c1, c2] = SKY(h)
  const night = h < 6 || h >= 18

  const t: any = prayerTimes(d, loc, getAsr(), getAdj())
  const span = t.maghrib - t.sunrise
  const p = span > 0 ? (now - t.sunrise) / span : 0.5
  const isDay = p >= 0 && p <= 1
  const [sx, sy] = arc(isDay ? p : p < 0 ? 0 : 1)

  const hj = hijri(d)
  const bd = bnDate(d)
  const np = nextPrayer(now)
  const cur = wx ? wx.cur : null
  const desc = cur ? wdesc(cur.code) : null
  const path = 'M14 56 Q150 -14 286 56'

  const glass = { background: 'rgba(255,255,255,.14)', border: '1px solid rgba(255,255,255,.14)' }
  const R = 16, C = 2 * Math.PI * R

  return (
    <section className="relative overflow-hidden text-white"
      style={{
        borderRadius: 32, padding: 16,
        background: `linear-gradient(155deg, ${c1}, ${c2})`,
        boxShadow: `0 14px 34px ${c1}55`,
      }}>
      {night && Array.from({ length: 12 }, (_, i) => (
        <i key={i} className="absolute rounded-full bg-white"
          style={{
            left: ((i * 67) % 92) + 3 + '%', top: ((i * 29) % 36) + 4 + '%',
            width: 2, height: 2, opacity: 0.55, animation: `wxTw 3s ${(i * 0.45) % 3}s infinite`,
          }} />
      ))}

      <div className="relative space-y-3">
        {/* উপরের সারি: শুভেচ্ছা ও আবহাওয়া */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-bold">{GREET(h)}</p>
            <p className="text-[11px] opacity-80 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {loc.name}
              <span className="opacity-60">·</span>
              {d.toLocaleDateString('bn-BD', { weekday: 'long' })}
            </p>
          </div>
          <button type="button" onClick={() => onNav('weather')}
            className="flex items-center gap-1.5 rounded-2xl px-2.5 py-1.5 active:scale-95 transition"
            style={{ ...glass, backdropFilter: 'blur(6px)' }}>
            <WIcon kind={desc ? desc[1] : 'partly'} night={cur ? !cur.day : night} size={26} />
            {cur && desc ? (
              <span className="leading-tight text-left">
                <b className="text-base">{toBn(rnd(cur.t))}°</b>
                <span className="block text-[10px] opacity-85">{desc[0]}</span>
              </span>
            ) : (
              <span className="text-[11px] font-semibold">আবহাওয়া</span>
            )}
          </button>
        </div>

        {/* বড় সময় ও সেকেন্ডের রিং */}
        <div className="flex items-end gap-3">
          <p className="tabular-nums leading-none"
            style={{ fontSize: 58, fontWeight: 600, letterSpacing: -2 }}>
            {two(h12)}
            <span className="opacity-55 mx-0.5">:</span>
            {two(d.getMinutes())}
          </p>
          <div className="flex items-center gap-2 pb-1.5">
            <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
              <circle cx="20" cy="20" r={R} fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="3" />
              <circle cx="20" cy="20" r={R} fill="none" stroke="#fde68a" strokeWidth="3" strokeLinecap="round"
                strokeDasharray={`${(s / 60) * C} ${C}`} transform="rotate(-90 20 20)" />
              <text x="20" y="24" textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">{bn(s)}</text>
            </svg>
            <span className="text-xs font-bold rounded-full px-2 py-0.5" style={{ background: 'rgba(255,255,255,.2)' }}>
              {h >= 12 ? 'অপরাহ্ন' : 'পূর্বাহ্ন'}
            </span>
          </div>
        </div>

        {/* সূর্য/চাঁদের পথ */}
        <div>
          <svg viewBox="0 0 300 64" className="w-full" style={{ height: 56 }} aria-hidden="true">
            <path d={path} fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="2" strokeDasharray="3 5" strokeLinecap="round" />
            {isDay && (
              <path d={path} fill="none" stroke="#fde68a" strokeWidth="3" strokeLinecap="round"
                pathLength={1} strokeDasharray={`${Math.max(0.001, p)} 1`} />
            )}
            <line x1="6" y1="58" x2="294" y2="58" stroke="rgba(255,255,255,.28)" strokeWidth="1.5" />
            <circle cx={sx} cy={sy} r="11" fill={isDay ? 'rgba(253,224,71,.28)' : 'rgba(226,232,240,.2)'} />
            <circle cx={sx} cy={sy} r="6.5" fill={isDay ? '#fde047' : '#e2e8f0'} />
            {!isDay && <circle cx={sx + 2.4} cy={sy - 1.6} r="5.4" fill={c1} />}
          </svg>
          <div className="flex justify-between text-[10px] opacity-80 -mt-0.5 px-1">
            <span>সূর্যোদয় {fmtClock(t.sunrise, loc.tz)}</span>
            <span>সূর্যাস্ত {fmtClock(t.maghrib, loc.tz)}</span>
          </div>
        </div>

        {/* তিন ক্যালেন্ডারের তারিখ */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {([
            ['ইংরেজি', d.toLocaleDateString('bn-BD-u-ca-gregory', { day: 'numeric', month: 'short', year: 'numeric' })],
            ['বাংলা', bn(bd.day) + ' ' + bd.month + ' ' + bn(bd.year)],
            ['হিজরি', bn(hj.d) + ' ' + HIJRI_BN[hj.m - 1] + ' ' + bn(hj.y)],
          ] as [string, string][]).map(([l, v]) => (
            <div key={l} className="rounded-2xl px-1.5 py-2 min-w-0" style={glass}>
              <p className="text-[9px] uppercase tracking-wide opacity-70">{l}</p>
              <p className="text-[11px] font-semibold leading-tight mt-0.5">{v}</p>
            </div>
          ))}
        </div>

        {/* পাঁচ ওয়াক্ত */}
        <button type="button" onClick={() => onNav('islamic')} className="block w-full text-left active:opacity-90">
          <div className="grid grid-cols-5 gap-1.5">
            {ORDER.map(k => {
              const on = np?.key === k
              return (
                <div key={k} className="rounded-xl py-1.5 text-center"
                  style={on
                    ? { background: accent, boxShadow: '0 0 0 1.5px rgba(255,255,255,.55)' }
                    : glass}>
                  <p className="text-[10px] font-bold">{PN[k]}</p>
                  <p className="text-[9.5px] tabular-nums opacity-90 leading-tight">
                    {fmtClock(t[k], loc.tz).replace(' AM', '').replace(' PM', '')}
                  </p>
                </div>
              )
            })}
          </div>
          {np && (
            <p className="text-[11px] text-center mt-2 opacity-95">
              <b>{PN[np.key]}</b> শুরু হতে আর <b>{fmtLeft(np.at - now)}</b>
            </p>
          )}
        </button>
      </div>
    </section>
  )
}
