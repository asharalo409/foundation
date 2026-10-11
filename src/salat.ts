import { prayerTimes, getLoc, getAdj, getAsr, bnDigits } from './prayer'

export type Win = { key: string; start: number; end: number }

export function dayInfo(date: Date) {
  const loc = getLoc()
  const adj = getAdj()
  const asr = getAsr()
  const t: any = prayerTimes(date, loc, asr, adj)
  const n: any = prayerTimes(new Date(date.getTime() + 86400000), loc, asr, adj)
  const list: Win[] = [
    { key: 'fajr', start: t.fajr, end: t.sunrise },
    { key: 'dhuhr', start: t.dhuhr, end: t.asr },
    { key: 'asr', start: t.asr, end: t.maghrib },
    { key: 'maghrib', start: t.maghrib, end: t.isha },
    { key: 'isha', start: t.isha, end: n.fajr },
  ]
  return { loc, t, list }
}

export function effectiveDay(now: number): Date {
  const d = new Date(now)
  const t: any = prayerTimes(d, getLoc(), getAsr(), getAdj())
  return now < t.fajr ? new Date(now - 86400000) : d
}

export type Status = { mode: 'in' | 'gap'; cur: Win; next: Win; day: Date }

export function status(now: number): Status {
  const day = effectiveDay(now)
  const info = dayInfo(day)
  const L = info.list
  for (let i = 0; i < 5; i++) {
    if (now >= L[i].start && now < L[i].end) {
      const next = i < 4 ? L[i + 1] : { key: 'fajr', start: L[4].end, end: L[4].end }
      return { mode: 'in', cur: L[i], next, day }
    }
  }
  return {
    mode: 'gap',
    cur: { key: 'gap', start: info.t.sunrise, end: info.t.dhuhr },
    next: L[1],
    day,
  }
}

export const dateKey = (d: Date) => d.toLocaleDateString('en-CA')

export function hm(ts: number, tz: number) {
  if (!isFinite(ts)) return '--'
  const d = new Date(ts + tz * 3600000)
  const h = d.getUTCHours() % 12 || 12
  return bnDigits(String(h).padStart(2, '0') + ':' + String(d.getUTCMinutes()).padStart(2, '0'))
}

export function hms(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return bnDigits([h, m, sec].map(x => String(x).padStart(2, '0')).join(':'))
}

export const SCENE: Record<string, { bg: string; night: boolean }> = {
  fajr: { bg: 'linear-gradient(180deg,#0b2447 0%,#1b4d7a 55%,#e89a5b 100%)', night: true },
  gap: { bg: 'linear-gradient(180deg,#0e7490 0%,#38b6cf 70%,#9be0ee 100%)', night: false },
  dhuhr: { bg: 'linear-gradient(180deg,#0369a1 0%,#38a9e0 65%,#bfe6f7 100%)', night: false },
  asr: { bg: 'linear-gradient(180deg,#1f6f8b 0%,#d7a24f 100%)', night: false },
  maghrib: { bg: 'linear-gradient(180deg,#2b1d4e 0%,#9a3f5f 55%,#f28c4a 100%)', night: true },
  isha: { bg: 'linear-gradient(180deg,#03293a 0%,#04566a 60%,#056b6b 100%)', night: true },
}

const LOG = 'salat-log-v1'
export type Log = Record<string, string[]>

export function getLog(): Log {
  try {
    return JSON.parse(localStorage.getItem(LOG) || '{}')
  } catch {
    return {}
  }
}

export function toggleLog(dk: string, key: string): Log {
  const log = getLog()
  const cur = log[dk] || []
  const next = cur.includes(key) ? cur.filter(k => k !== key) : [...cur, key]
  if (next.length === 0) delete log[dk]
  else log[dk] = next
  try { localStorage.setItem(LOG, JSON.stringify(log)) } catch {}
  return log
}
