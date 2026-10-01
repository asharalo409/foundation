import { useEffect, useState } from 'react'

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

export function Widgets() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

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

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
      <p className="text-center text-3xl font-bold tracking-wide">{time}</p>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between border-t pt-2">
          <span className="text-gray-500">ইংরেজি</span>
          <span className="font-semibold text-right">{greg}</span>
        </div>
        <div className="flex justify-between border-t pt-2">
          <span className="text-gray-500">বাংলা</span>
          <span className="font-semibold text-right">{b.text} ({b.season})</span>
        </div>
        <div className="flex justify-between border-t pt-2">
          <span className="text-gray-500">হিজরি</span>
          <span className="font-semibold text-right">{hijri}</span>
        </div>
      </div>
      <p className="text-[10px] text-gray-400 text-center">
        হিজরি তারিখ চাঁদ দেখার ওপর নির্ভর করে ১ দিন আগে-পিছে হতে পারে
      </p>
    </div>
  )
}

export function Social({ settings }: { settings: any }) {
  if (!settings) return null
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
