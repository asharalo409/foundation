import { useState } from 'react'
import { DISTRICTS } from './districts'
import { IIco } from './IslamIcons'
import { KEYS, dateKey, effectiveDay, dayInfo, hm } from './salat'
import type { Log } from './salat'
import {
  PN, bnDigits, districtLoc, fmtClock, fmtLeft, getAdj, getAsr, hijri, HIJRI_BN, nextRamadan, prayerTimes,
} from './prayer'
import type { Loc } from './prayer'
import { downloadIcs, getCfg } from './alarm'

const input =
  'w-full border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-green-600'
const bn = (n: number) => bnDigits(String(n))

export function Sheet({ title, onClose, wide, children }: any) {
  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-end" onClick={onClose}>
      <div
        className={'bg-white w-full mx-auto rounded-t-3xl p-4 space-y-3 max-h-[90vh] overflow-y-auto ' +
          (wide ? 'max-w-2xl' : 'max-w-md')}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">{title}</h3>
          <button className="text-xl" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function LocBody({ loc, onPick }: { loc: Loc; onPick: (l: Loc) => void }) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  function gps() {
    if (!navigator.geolocation) { setMsg('এই ফোনে লোকেশন সুবিধা নেই'); return }
    setBusy(true)
    setMsg('')
    navigator.geolocation.getCurrentPosition(
      p => {
        setBusy(false)
        onPick({
          name: 'আমার অবস্থান',
          lat: p.coords.latitude,
          lng: p.coords.longitude,
          tz: -new Date().getTimezoneOffset() / 60,
        })
      },
      () => { setBusy(false); setMsg('অবস্থান পাওয়া যায়নি, জেলা বাছাই করুন') },
      { timeout: 10000 }
    )
  }

  const inList = DISTRICTS.some(d => d[1] === loc.name)

  return (
    <div className="space-y-2">
      <select className={input} value={inList ? loc.name : ''}
        onChange={e => e.target.value && onPick(districtLoc(e.target.value))}>
        {!inList && <option value="">{loc.name}</option>}
        {DISTRICTS.map(d => <option key={d[1]} value={d[1]}>{d[1]}</option>)}
      </select>
      <button className="w-full border border-green-700 text-green-700 rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50"
        disabled={busy} onClick={gps}>
        {busy ? 'অবস্থান খোঁজা হচ্ছে...' : '📍 আমার বর্তমান অবস্থান ব্যবহার করুন'}
      </button>
      {msg && <p className="text-xs text-red-600">{msg}</p>}
    </div>
  )
}

export function CalendarBody({ loc }: { loc: Loc }) {
  const today = new Date()
  const [y, setY] = useState(today.getFullYear())
  const [m, setM] = useState(today.getMonth())
  const adj = getAdj()
  const asr = getAsr()
  const days = new Date(y, m + 1, 0).getDate()
  const rows = Array.from({ length: days }, (_, i) => {
    const d = new Date(y, m, i + 1)
    return { d, t: prayerTimes(d, loc, asr, adj) as any }
  })
  const h1 = hijri(rows[0].d)
  const h2 = hijri(rows[rows.length - 1].d)

  function step(k: number) {
    const dt = new Date(y, m + k, 1)
    setY(dt.getFullYear())
    setM(dt.getMonth())
  }

  const head = ['তারিখ', PN.fajr, PN.sunrise, PN.dhuhr, PN.asr, PN.maghrib, PN.isha]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button className="px-3 py-1.5 border rounded-lg" onClick={() => step(-1)}>‹</button>
        <div className="text-center">
          <p className="font-bold">
            {new Date(y, m, 1).toLocaleDateString('bn-BD', { month: 'long', year: 'numeric' })}
          </p>
          <p className="text-[11px] text-gray-500">
            হিজরি: {HIJRI_BN[h1.m - 1]} {bn(h1.y)}
            {h1.m !== h2.m ? ' – ' + HIJRI_BN[h2.m - 1] : ''}
          </p>
        </div>
        <button className="px-3 py-1.5 border rounded-lg" onClick={() => step(1)}>›</button>
      </div>

      <p className="text-xs text-gray-500">স্থান: {loc.name}</p>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-[11px] tabular-nums" style={{ minWidth: 420 }}>
          <thead>
            <tr className="bg-gray-50">
              {head.map(h => <th key={h} className="py-2 px-1.5 text-center font-semibold whitespace-nowrap">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ d, t }) => {
              const isToday = d.toDateString() === today.toDateString()
              return (
                <tr key={d.getDate()} className="border-t"
                  style={isToday ? { background: 'rgba(22,163,74,.14)', fontWeight: 700 } : undefined}>
                  <td className="py-1.5 px-1.5 text-center whitespace-nowrap">
                    {bn(d.getDate())} {d.toLocaleDateString('bn-BD', { weekday: 'short' })}
                  </td>
                  {['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'].map(k => (
                    <td key={k} className="py-1.5 px-1.5 text-center">{hm(t[k], loc.tz)}</td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <button className="w-full border border-green-700 text-green-700 rounded-lg py-2 text-sm font-semibold"
        onClick={() => downloadIcs(getCfg(), 30)}>
        📅 ৩০ দিনের রিমাইন্ডার (.ics)
      </button>
    </div>
  )
}

export function Roza({ loc }: { loc: Loc }) {
  const now = Date.now()
  const adj = getAdj()
  const asr = getAsr()
  const today = new Date(now)
  const t = prayerTimes(today, loc, asr, adj)
  const tom = prayerTimes(new Date(now + 86400000), loc, asr, adj)
  const h = hijri(today)

  let label = 'সাহরি শেষ হতে'
  let at = t.fajr
  if (now >= t.fajr && now < t.maghrib) { label = 'ইফতারের বাকি'; at = t.maghrib }
  else if (now >= t.maghrib) { label = 'পরের সাহরি শেষ হতে'; at = tom.fajr }

  const dow = today.getDay()
  const nafl: string[] = []
  if (dow === 1 || dow === 4) nafl.push('আজ ' + (dow === 1 ? 'সোমবার' : 'বৃহস্পতিবার') + ' (নফল রোজার দিন)')
  if ([13, 14, 15].includes(h.d) && h.m !== 12 && h.m !== 9) nafl.push('আজ আইয়ামে বীজের রোজার দিন (আনুমানিক)')

  const start = nextRamadan(today)
  const days = start
    ? Array.from({ length: 30 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))
    : []
  const inRamadan = h.m === 9
  const daysTo = start
    ? Math.ceil((start.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / 86400000)
    : 0

  return (
    <div className="space-y-3">
      <div className="rounded-2xl p-4 text-white space-y-1"
        style={{ background: 'linear-gradient(135deg,#0f766e,#064e3b)' }}>
        <p className="text-xs opacity-80">{label}</p>
        <p className="text-2xl font-bold">{fmtLeft(at - now)}</p>
        <p className="text-sm">
          সাহরি শেষ: <b>{fmtClock(t.fajr, loc.tz)}</b> · ইফতার: <b>{fmtClock(t.maghrib, loc.tz)}</b>
        </p>
      </div>

      <div className="bg-white rounded-xl p-3 shadow-sm space-y-1 text-sm">
        <p>
          আজকের হিজরি তারিখ: <b>{bnDigits(h.d + ' ') + HIJRI_BN[h.m - 1] + ' ' + bnDigits(String(h.y))}</b>
        </p>
        {nafl.length === 0 && <p className="text-gray-500">আজ বিশেষ নফল রোজার দিন নয়।</p>}
        {nafl.map(n => <p key={n} className="text-green-700">🌙 {n}</p>)}
        <p className="text-[11px] text-gray-400">
          হিজরি তারিখ গাণিতিক হিসাবে, চাঁদ দেখার ওপর ১ দিন আগে-পিছে হতে পারে।
        </p>
      </div>

      {start && (
        <div className="bg-white rounded-xl p-3 shadow-sm space-y-2">
          <h3 className="font-bold text-sm">📅 রমজানের সময়সূচি (আনুমানিক)</h3>
          {!inRamadan && (
            <p className="text-xs text-gray-600">
              রমজান শুরু প্রায় {start.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}, আর {bn(daysTo)} দিন বাকি
            </p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 text-left">
                  <th className="py-1">রোজা</th><th>তারিখ</th><th>সাহরি শেষ</th><th>ইফতার</th>
                </tr>
              </thead>
              <tbody>
                {days.map((d, i) => {
                  const p: any = prayerTimes(d, loc, asr, adj)
                  const isToday = d.toDateString() === today.toDateString()
                  return (
                    <tr key={i} className={'border-t ' + (isToday ? 'bg-green-50 font-semibold' : '')}>
                      <td className="py-1">{bn(i + 1)}</td>
                      <td>{d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })}</td>
                      <td>{fmtClock(p.fajr, loc.tz)}</td>
                      <td>{fmtClock(p.maghrib, loc.tz)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export function Tracker({
  log, onToggle, now, accent,
}: { log: Log; onToggle: (dk: string, key: string) => void; now: number; accent: string }) {
  const day = effectiveDay(now)
  const info = dayInfo(day)
  const days = Array.from({ length: 7 }, (_, i) => new Date(day.getTime() - (6 - i) * 86400000))
  const dk = (d: Date) => dateKey(d)
  const cnt = (d: Date) => (log[dk(d)] || []).length

  const todayPct = Math.round((cnt(day) / 5) * 100)
  const weekDone = days.reduce((t, d) => t + cnt(d), 0)
  const weekPct = Math.round((weekDone / 35) * 100)

  let streak = 0
  for (let i = cnt(day) >= 5 ? 0 : 1; i < 365; i++) {
    const d = new Date(day.getTime() - i * 86400000)
    if (cnt(d) >= 5) streak++
    else break
  }

  const stat = (n: string, l: string) => (
    <div className="flex-1 bg-white rounded-xl p-3 shadow-sm text-center">
      <p className="text-xl font-bold" style={{ color: accent }}>{n}</p>
      <p className="text-[11px] text-gray-500">{l}</p>
    </div>
  )

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {stat(bn(todayPct) + '%', 'আজ')}
        {stat(bn(weekPct) + '%', 'এই সপ্তাহ')}
        {stat(bn(streak) + ' দিন', 'টানা সম্পূর্ণ')}
      </div>

      <div className="bg-white rounded-xl p-3 shadow-sm overflow-x-auto">
        <div className="grid items-center gap-y-2" style={{ gridTemplateColumns: '64px repeat(7, 1fr)', minWidth: 340 }}>
          <span />
          {days.map(d => (
            <div key={dk(d)} className="text-center leading-tight">
              <p className="text-[10px] text-gray-500">{d.toLocaleDateString('bn-BD', { weekday: 'short' })}</p>
              <p className="text-xs font-semibold">{bn(d.getDate())}</p>
            </div>
          ))}
          {KEYS.map((k, ki) => (
            <div key={k} className="contents">
              <span className="text-sm font-semibold">{PN[k]}</span>
              {days.map((d, di) => {
                const isToday = di === 6
                const ok = (log[dk(d)] || []).includes(k)
                const locked = isToday && now < info.list[ki].start
                return (
                  <div key={dk(d) + k} className="flex justify-center">
                    <button disabled={locked} onClick={() => onToggle(dk(d), k)}
                      className="w-7 h-7 rounded-full border-2 flex items-center justify-center disabled:opacity-30"
                      style={ok ? { background: accent, borderColor: accent, color: '#fff' } : { borderColor: '#cbd5e1' }}>
                      {ok && <IIco name="check" size={15} stroke={3} />}
                    </button>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
      <p className="text-[11px] text-gray-400 text-center">
        আগের ৭ দিনের টিক বদলানো যায়। তথ্য শুধু আপনার ফোনে থাকে।
      </p>
    </div>
  )
}

export function Soon({ icon, title, text, accent }: { icon: string; title: string; text: string; accent: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm text-center space-y-3">
      <span className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
        style={{ background: accent + '1f', color: accent }}>
        <IIco name={icon} size={32} />
      </span>
      <h3 className="font-bold text-lg">{title}</h3>
      <p className="text-sm text-gray-600">{text}</p>
      <span className="inline-block rounded-full px-3 py-1 text-xs font-bold" style={{ background: '#fef3c7', color: '#92400e' }}>
        পরের ধাপে আসছে
      </span>
    </div>
  )
}
