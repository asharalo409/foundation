import { useEffect, useState } from 'react'
import { feat } from './features'

const BN_MONTHS = ['বৈশাখ', 'জ্যৈষ্ঠ', 'আষাঢ়', 'শ্রাবণ', 'ভাদ্র', 'আশ্বিন', 'কার্তিক', 'অগ্রহায়ণ', 'পৌষ', 'মাঘ', 'ফাল্গুন', 'চৈত্র']
const SEASONS = ['গ্রীষ্ম', 'গ্রীষ্ম', 'বর্ষা', 'বর্ষা', 'শরৎ', 'শরৎ', 'হেমন্ত', 'হেমন্ত', 'শীত', 'শীত', 'বসন্ত', 'বসন্ত']
const STARTS: [number, number][] = [
  [3, 14], [4, 15], [5, 15], [6, 16], [7, 16], [8, 16],
  [9, 16], [10, 15], [11, 15], [0, 14], [1, 13], [2, 15],
]

const bn = (n: number) => n.toLocaleString('bn-BD', { useGrouping: false })

function banglaDate(d: Date) {
  const y = d.getFullYear()
  const today = new Date(y, d.getMonth(), d.getDate())
  let best = 0
  let bestDate = new Date(0)
  for (const yy of [y - 1, y]) {
    STARTS.forEach(([m, day], i) => {
      const s = new Date(yy, m, day)
      if (s <= today && s > bestDate) { best = i; bestDate = s }
    })
  }
  const dayNo = Math.round((today.getTime() - bestDate.getTime()) / 86400000) + 1
  const year = today >= new Date(y, 3, 14) ? y - 593 : y - 594
  return {
    text: bn(dayNo) + ' ' + BN_MONTHS[best] + ' ' + bn(year) + ' বঙ্গাব্দ',
    season: SEASONS[best],
  }
}

function polar(len: number, deg: number): [number, number] {
  const r = (deg * Math.PI) / 180
  return [100 + len * Math.sin(r), 100 - len * Math.cos(r)]
}

function Analog({ now }: { now: Date }) {
  const h = now.getHours() % 12
  const m = now.getMinutes()
  const s = now.getSeconds()
  const [hx, hy] = polar(48, h * 30 + m * 0.5)
  const [mx, my] = polar(70, m * 6 + s * 0.1)
  const [sx, sy] = polar(80, s * 6)
  const [tx, ty] = polar(-16, s * 6)

  return (
    <svg viewBox="0 0 200 200" className="w-44 h-44 mx-auto">
      <circle cx="100" cy="100" r="96" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.75)" strokeWidth="2" />
      {Array.from({ length: 60 }).map((_, i) => {
        const [x1, y1] = polar(90, i * 6)
        const [x2, y2] = polar(i % 5 === 0 ? 80 : 85, i * 6)
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff"
            strokeWidth={i % 5 === 0 ? 2.5 : 1} opacity={i % 5 === 0 ? 1 : 0.6} />
        )
      })}
      {[12, 3, 6, 9].map(n => {
        const [x, y] = polar(66, (n % 12) * 30)
        return (
          <text key={n} x={x} y={y} fill="#fff" fontSize="18" fontWeight="700"
            textAnchor="middle" dominantBaseline="central">
            {bn(n)}
          </text>
        )
      })}
      <line x1="100" y1="100" x2={hx} y2={hy} stroke="#fff" strokeWidth="6" strokeLinecap="round" />
      <line x1="100" y1="100" x2={mx} y2={my} stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      <line x1={tx} y1={ty} x2={sx} y2={sy} stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
      <circle cx="100" cy="100" r="6" fill="#fbbf24" />
      <circle cx="100" cy="100" r="2.5" fill="#0b3d2e" />
    </svg>
  )
}

export function Widgets({ color }: { color?: string }) {
  const [now, setNow] = useState(new Date())
  const [style, setStyle] = useState<string>(() => {
    try { return localStorage.getItem('clockStyle') || 'digital' } catch { return 'digital' }
  })

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  if (!feat('clock')) return null

  function pick(s: string) {
    setStyle(s)
    try { localStorage.setItem('clockStyle', s) } catch {}
  }

  const time = now.toLocaleTimeString('bn-BD', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
  })
  const greg = now.toLocaleDateString('bn-BD-u-ca-gregory', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  let hijri = ''
  try {
    hijri = now.toLocaleDateString('bn-BD-u-ca-islamic-civil', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
  } catch { hijri = '-' }
  const b = banglaDate(now)

  const rows: [string, string][] = [
    ['ইংরেজি', greg],
    ['বাংলা', b.text + ' (' + b.season + ')'],
    ['হিজরি', hijri],
  ]

  return (
    <div className="rounded-2xl p-4 text-white shadow-sm space-y-3"
      style={{ background: `linear-gradient(135deg, ${color || '#087a43'}, #0b3d2e)` }}>
      <div className="flex justify-between items-center gap-2">
        <p className="font-bold text-sm">🕒 বর্তমান সময়</p>
        <div className="flex rounded-full p-0.5 text-xs" style={{ background: 'rgba(255,255,255,.18)' }}>
          {[['digital', 'ডিজিটাল'], ['analog', 'অ্যানালগ']].map(([k, l]) => (
            <button key={k} onClick={() => pick(k)}
              className="px-3 py-1 rounded-full font-semibold"
              style={style === k ? { background: '#fff', color: '#14532d' } : { color: '#fff' }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {style === 'analog' ? (
        <>
          <Analog now={now} />
          <p className="text-center text-lg font-bold tracking-wide">{time}</p>
        </>
      ) : (
        <p className="text-center text-4xl font-bold tracking-wider py-2">{time}</p>
      )}

      <div className="space-y-1.5 text-sm">
        {rows.map(([l, v]) => (
          <div key={l} className="flex justify-between gap-3 rounded-lg px-3 py-2"
            style={{ background: 'rgba(255,255,255,.15)' }}>
            <span className="opacity-80">{l}</span>
            <span className="font-semibold text-right">{v}</span>
          </div>
        ))}
      </div>
      <p className="text-[10px] opacity-70 text-center">
        হিজরি তারিখ চাঁদ দেখার ওপর নির্ভর করে ১ দিন আগে-পিছে হতে পারে
      </p>
    </div>
  )
}

export function Social({ settings }: { settings: any }) {
  if (!settings || !feat('meet')) return null
  const meet: [string, string][] = [
    ['📹 জুম মিটিং', settings.zoom_link],
    ['🎥 গুগল মিট', settings.meet_link],
  ]
  const soc: [string, string][] = [
    ['ফেসবুক পেজ', settings.facebook_page],
    ['ফেসবুক গ্রুপ', settings.facebook_group],
    ['হোয়াটসঅ্যাপ', settings.whatsapp_url],
    ['টেলিগ্রাম', settings.telegram_url],
  ]
  const m = meet.filter(x => x[1])
  const s = soc.filter(x => x[1])
  if (!m.length && !s.length) return null

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
      {m.length > 0 && (
        <div>
          <h2 className="font-bold mb-2">ভার্চুয়াল মিটিং</h2>
          <div className="flex gap-2">
            {m.map(([l, u]) => (
              <a key={l} href={u} target="_blank" rel="noreferrer"
                className="flex-1 text-center bg-green-700 text-white rounded-lg py-2 text-sm font-semibold">
                {l}
              </a>
            ))}
          </div>
        </div>
      )}
      {s.length > 0 && (
        <div>
          <h2 className="font-bold mb-2">আমাদের সাথে যুক্ত হোন</h2>
          <div className="grid grid-cols-2 gap-2">
            {s.map(([l, u]) => (
              <a key={l} href={u} target="_blank" rel="noreferrer"
                className="text-center border border-green-700 text-green-700 rounded-lg py-2 text-sm font-semibold">
                {l}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
