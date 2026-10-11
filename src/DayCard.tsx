import { useEffect, useState } from 'react'
import { IIco } from './IslamIcons'
import { hm, hms } from './salat'
import { PN, bnDigits, getAdj, getAsr, hijri, HIJRI_BN, prayerTimes } from './prayer'
import type { Loc } from './prayer'

const bn = (n: number) => bnDigits(String(n))
const MIN = 60000

const BN_MONTHS = [
  'বৈশাখ', 'জ্যৈষ্ঠ', 'আষাঢ়', 'শ্রাবণ', 'ভাদ্র', 'আশ্বিন',
  'কার্তিক', 'অগ্রহায়ণ', 'পৌষ', 'মাঘ', 'ফাল্গুন', 'চৈত্র',
]
const STARTS: [number, number][] = [
  [3, 14], [4, 15], [5, 15], [6, 16], [7, 16], [8, 16],
  [9, 16], [10, 15], [11, 15], [0, 14], [1, 13], [2, 15],
]

export function bnDate(d: Date) {
  const y = d.getFullYear()
  const m0 = d.getMonth()
  const day = d.getDate()
  const D0 = new Date(y, m0, day).getTime()
  const sy = m0 > 3 || (m0 === 3 && day >= 14) ? y : y - 1
  const startOf = (i: number) => {
    const [m, dd] = STARTS[i]
    return new Date(m >= 3 ? sy : sy + 1, m, dd).getTime()
  }
  let k = 0
  for (let i = 0; i < 12; i++) if (startOf(i) <= D0) k = i
  return {
    day: Math.round((D0 - startOf(k)) / 86400000) + 1,
    month: BN_MONTHS[k],
    year: sy - 593,
  }
}

const Ban = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9"
    strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="8.5" />
    <path d="m6 6 12 12" />
  </svg>
)

export default function DayCard({ loc, accent }: { loc: Loc; accent: string }) {
  const [off, setOff] = useState(0)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const adj = getAdj()
  const asr = getAsr()
  const date = new Date(now + off * 86400000)
  const t: any = prayerTimes(date, loc, asr, adj)
  const n: any = prayerTimes(new Date(date.getTime() + 86400000), loc, asr, adj)
  const tom: any = prayerTimes(new Date(now + 86400000), loc, asr, adj)
  const tod: any = prayerTimes(new Date(now), loc, asr, adj)

  const hj = hijri(date)
  const bd = bnDate(date)
  const line1 =
    bn(date.getDate()) + ' ' + date.toLocaleDateString('bn-BD', { month: 'long' }) + ', ' +
    bn(date.getFullYear()) + ' - ' + date.toLocaleDateString('bn-BD', { weekday: 'long' })
  const line2 =
    bn(hj.d) + ' ' + HIJRI_BN[hj.m - 1] + ', ' + bn(hj.y) + ' • ' + bn(bd.day) + ' ' + bd.month + ', ' + bn(bd.year)

  const R = (a: number, b: number) => hm(a, loc.tz) + ' - ' + hm(b, loc.tz)
  const third = t.maghrib + ((n.fajr - t.maghrib) * 2) / 3

  const forbidden: [string, string][] = [
    ['সকাল', R(t.sunrise, t.sunrise + 15 * MIN)],
    ['দুপুর', R(t.dhuhr - 8 * MIN, t.dhuhr - 1 * MIN)],
    ['সন্ধ্যা', R(t.maghrib - 15 * MIN, t.maghrib - 1 * MIN)],
  ]

  const nafl: [string, string, string, string?][] = [
    ['p-dhuhr', 'দুহা', R(t.sunrise + 16 * MIN, t.dhuhr - 9 * MIN)],
    ['p-asr', 'জাওয়াল শুরু', hm(t.dhuhr, loc.tz)],
    ['p-maghrib', 'আওয়াবিন', 'মাগরিবের পর - ' + hm(t.isha, loc.tz)],
    ['p-isha', 'তাহাজ্জুদ', 'ইশার পর - ' + hm(n.fajr, loc.tz), 'রাতের শেষ ১/৩ শুরু: ' + hm(third, loc.tz)],
  ]

  const nextSehri = now < tod.fajr ? tod.fajr : tom.fajr
  const nextIftar = now < tod.maghrib ? tod.maghrib : tom.maghrib

  const five = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
  const box = { background: 'rgba(100,116,139,.1)', border: '1px solid rgba(100,116,139,.18)' }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="text-white text-center px-4 py-3 relative"
        style={{ background: 'linear-gradient(135deg,' + accent + ',#047857)' }}>
        <div className="flex items-center justify-between gap-2">
          <button className="w-9 h-9 rounded-full text-xl" style={{ background: 'rgba(255,255,255,.18)' }}
            onClick={() => setOff(off - 1)} aria-label="prev">‹</button>
          <div className="min-w-0">
            <p className="font-semibold text-sm flex items-center justify-center gap-2 flex-wrap">
              {line1}
              {off === 0 && (
                <span className="rounded-full px-3 py-0.5 text-xs font-bold bg-white" style={{ color: accent }}>আজ</span>
              )}
            </p>
            <p className="text-xs opacity-90 mt-0.5">{line2}</p>
          </div>
          <button className="w-9 h-9 rounded-full text-xl" style={{ background: 'rgba(255,255,255,.18)' }}
            onClick={() => setOff(off + 1)} aria-label="next">›</button>
        </div>
        {off !== 0 && (
          <button className="text-[11px] underline mt-1" onClick={() => setOff(0)}>আজকে ফিরুন</button>
        )}
      </div>

      <div className="p-4 space-y-4">
        <div className="rounded-2xl grid grid-cols-5 text-center py-3" style={box}>
          {five.map(k => (
            <div key={k}>
              <p className="text-[11px] text-gray-500">{PN[k]}</p>
              <p className="font-bold text-sm tabular-nums">{hm(t[k], loc.tz)}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl grid grid-cols-2 text-center py-3" style={box}>
            <div className="border-r border-gray-300/40">
              <p className="text-[11px] text-gray-500">{PN.sunrise}</p>
              <p className="font-bold text-sm tabular-nums">{hm(t.sunrise, loc.tz)}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500">সূর্যাস্ত</p>
              <p className="font-bold text-sm tabular-nums">{hm(t.maghrib, loc.tz)}</p>
            </div>
          </div>
          <div className="rounded-2xl grid grid-cols-2 text-center py-3" style={box}>
            <div className="border-r border-gray-300/40">
              <p className="text-[11px] text-gray-500">{PN.sehri}</p>
              <p className="font-bold text-sm tabular-nums">{hm(t.fajr, loc.tz)}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500">{PN.iftar}</p>
              <p className="font-bold text-sm tabular-nums">{hm(t.maghrib, loc.tz)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-bold">সালাতের নিষিদ্ধ সময়</p>
          <div className="grid grid-cols-3 gap-2">
            {forbidden.map(([l, r]) => (
              <div key={l} className="rounded-2xl text-center py-3 px-1" style={{ background: 'rgba(239,68,68,.09)' }}>
                <p className="text-xs text-gray-600">{l}</p>
                <p className="text-[11px] font-semibold tabular-nums whitespace-nowrap mt-1">{r}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 flex items-start gap-1">
            <span className="text-red-500 mt-0.5"><Ban /></span>
            আনুমানিক হিসাব: সূর্যোদয় ও সূর্যাস্তের প্রায় ১৫ মিনিট এবং দুপুরে প্রায় ৭ মিনিট। মাসআলার জন্য আলেমের কাছে নিশ্চিত হোন।
          </p>
        </div>

        <div className="space-y-1">
          <p className="font-bold">নফল সালাতের সময়</p>
          {nafl.map(([icon, l, r, extra]) => (
            <div key={l} className="py-2.5 border-b last:border-b-0 border-gray-100">
              <div className="flex items-center gap-3">
                <span style={{ color: accent }}><IIco name={icon} size={26} /></span>
                <span className="flex-1 font-semibold">{l}</span>
                <span className="text-sm tabular-nums text-gray-700 text-right">{r}</span>
              </div>
              {extra && (
                <p className="text-xs text-right mt-1 flex items-center justify-end gap-1.5 text-gray-600">
                  <span className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} /> {extra}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {off === 0 && (
        <div className="grid grid-cols-3 text-center py-4 border-t border-gray-100"
          style={{ background: accent + '12' }}>
          <div>
            <p className="font-bold text-lg tabular-nums">{hm(nextSehri, loc.tz)}</p>
            <p className="text-[11px] text-gray-600">পরবর্তী সাহরি</p>
          </div>
          <div className="border-x border-gray-300/50">
            <p className="font-bold text-lg tabular-nums">{hm(nextIftar, loc.tz)}</p>
            <p className="text-[11px] text-gray-600">পরবর্তী ইফতার</p>
          </div>
          <div>
            <p className="font-bold text-lg tabular-nums" style={{ color: accent }}>{hms(nextIftar - now)}</p>
            <p className="text-[11px] text-gray-600">ইফতারের বাকি</p>
          </div>
        </div>
      )}
    </div>
  )
}
