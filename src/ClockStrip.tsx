import { useEffect, useState } from 'react'
import { ChevronDown, Moon, Sun } from 'lucide-react'
import ClockCard from './ClockCard'
import { WIcon } from './WeatherIcons'
import { useWx, wdesc, toBn, rnd } from './weatherData'
import { PN, bnDigits, fmtLeft, getAdj, getAsr, getLoc, hijri, HIJRI_BN, nextPrayer, prayerTimes } from './prayer'
import { feat } from './features'

// হোম পেজের উপরের ছোট ঘড়ি: সময় অনুযায়ী আকাশের রং, সূর্য/চাঁদের চলার পথ, পরের নামাজ।
// চাপলে নিচে আগের পুরো ঘড়ি-কার্ড (নামাজ, আবহাওয়া, স্টাইল) খোলে।

const bn = (n: number) => bnDigits(String(n))
const two = (n: number) => bn(n).padStart(2, '০')
const PART = (h: number) =>
  h >= 19 || h < 4 ? 'রাত' : h < 6 ? 'ভোর' : h < 12 ? 'সকাল' : h < 15 ? 'দুপুর' : h < 17 ? 'বিকাল' : 'সন্ধ্যা'
const SKY = (h: number): [string, string] =>
  h >= 4 && h < 6 ? ['#13335c', '#d98b57']
    : h >= 6 && h < 16 ? ['#0d63b0', '#59b4e0']
      : h >= 16 && h < 18 ? ['#1d5a80', '#e0a24a']
        : h === 18 ? ['#2b1d4e', '#d9704a']
          : ['#04202f', '#0a5568']

// x,y = দিনের পথের (বক্ররেখার) উপর t (০ থেকে ১) অবস্থানের বিন্দু
const arc = (t: number): [number, number] => {
  const x0 = 14, y0 = 58, cx = 150, cy = -12, x1 = 286, y1 = 58
  const u = 1 - t
  return [u * u * x0 + 2 * u * t * cx + t * t * x1, u * u * y0 + 2 * u * t * cy + t * t * y1]
}

export default function ClockStrip({ settings, onNav }: any) {
  const accent = settings?.theme_color || '#087a43'
  const [open, setOpen] = useState(false)
  const [now, setNow] = useState(Date.now())
  const { wx } = useWx(getLoc())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!feat('clock')) return null

  const d = new Date(now)
  const h = d.getHours()
  const h12 = h % 12 || 12
  const [c1, c2] = SKY(h)
  const night = h < 6 || h >= 18

  const t: any = prayerTimes(d, getLoc(), getAsr(), getAdj())
  const span = t.maghrib - t.sunrise
  const p = span > 0 ? (now - t.sunrise) / span : 0.5
  const isDay = p >= 0 && p <= 1
  const [sx, sy] = arc(isDay ? p : p < 0 ? 0 : 1)

  const hj = hijri(d)
  const np = nextPrayer(now)
  const cur = wx ? wx.cur : null
  const desc = cur ? wdesc(cur.code) : null
  const path = 'M14 58 Q150 -12 286 58'

  return (
    <div>
      <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open}
        className="relative w-full overflow-hidden text-left text-white active:opacity-90 transition"
        style={{
          borderRadius: 28, padding: '16px 16px 10px',
          background: `linear-gradient(150deg, ${c1}, ${c2})`,
          boxShadow: `0 10px 28px ${c1}55`,
        }}>
        {night && Array.from({ length: 9 }, (_, i) => (
          <i key={i} className="absolute rounded-full bg-white"
            style={{
              left: ((i * 67) % 90) + 4 + '%', top: ((i * 29) % 38) + 5 + '%',
              width: 2, height: 2, opacity: 0.55, animation: `wxTw 3s ${(i * 0.45) % 3}s infinite`,
            }} />
        ))}

        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold tracking-wide opacity-80">
              {d.toLocaleDateString('bn-BD', { weekday: 'long' })} · {PART(h)}
            </p>
            <p className="tabular-nums leading-none mt-1" style={{ fontSize: 46, fontWeight: 600, letterSpacing: -1 }}>
              {two(h12)}
              <span className="opacity-60 mx-0.5">:</span>
              {two(d.getMinutes())}
              <span className="text-base font-semibold opacity-75 ml-1.5">{two(d.getSeconds())}</span>
            </p>
            <p className="text-xs mt-1.5 opacity-90">
              {d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long' })}
              <span className="opacity-60"> · </span>
              {bn(hj.d)} {HIJRI_BN[hj.m - 1]}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            {cur && desc ? (
              <span className="flex items-center gap-1.5 rounded-2xl px-2.5 py-1"
                style={{ background: 'rgba(255,255,255,.16)', backdropFilter: 'blur(6px)' }}>
                <WIcon kind={desc[1]} night={!cur.day} size={26} />
                <b className="text-base">{toBn(rnd(cur.t))}°</b>
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-2xl px-2.5 py-1 text-xs"
                style={{ background: 'rgba(255,255,255,.16)' }}>
                {night ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </span>
            )}
            {np && (
              <span className="rounded-full px-3 py-1 text-[11px] font-bold whitespace-nowrap"
                style={{ background: accent, boxShadow: '0 0 0 1px rgba(255,255,255,.35)' }}>
                {PN[np.key]} · {fmtLeft(np.at - now)}
              </span>
            )}
          </div>
        </div>

        <svg viewBox="0 0 300 66" className="relative w-full mt-2" style={{ height: 52 }} aria-hidden="true">
          <path d={path} fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="2" strokeDasharray="3 5" strokeLinecap="round" />
          {isDay && (
            <path d={path} fill="none" stroke="#fde68a" strokeWidth="3" strokeLinecap="round"
              pathLength={1} strokeDasharray={`${Math.max(0.001, p)} 1`} />
          )}
          <line x1="6" y1="60" x2="294" y2="60" stroke="rgba(255,255,255,.28)" strokeWidth="1.5" />
          <circle cx={sx} cy={sy} r="11" fill={isDay ? 'rgba(253,224,71,.28)' : 'rgba(226,232,240,.2)'} />
          <circle cx={sx} cy={sy} r="6.5" fill={isDay ? '#fde047' : '#e2e8f0'} />
          {!isDay && <circle cx={sx + 2.4} cy={sy - 1.6} r="5.4" fill={c1} />}
        </svg>

        <div className="relative flex items-center justify-center gap-1 text-[11px] opacity-85 pb-0.5">
          {open ? 'বন্ধ করুন' : 'নামাজের সময় ও আবহাওয়া'}
          <ChevronDown className={'w-3.5 h-3.5 transition-transform ' + (open ? 'rotate-180' : '')} />
        </div>
      </button>

      {open && <div className="mt-3"><ClockCard settings={settings} onNav={onNav} /></div>}
    </div>
  )
}
