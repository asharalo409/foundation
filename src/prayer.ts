import { DISTRICTS } from './districts'

export type Loc = { name: string; lat: number; lng: number; tz: number }
export type Times = { fajr: number; sunrise: number; dhuhr: number; asr: number; maghrib: number; isha: number }

const R = Math.PI / 180
const sin = (d: number) => Math.sin(d * R)
const cos = (d: number) => Math.cos(d * R)
const tan = (d: number) => Math.tan(d * R)
const asin = (x: number) => Math.asin(x) / R
const acos = (x: number) => Math.acos(x) / R
const acot = (x: number) => Math.atan(1 / x) / R
const atan2 = (y: number, x: number) => Math.atan2(y, x) / R
const fix = (a: number, b: number) => {
  a = a - b * Math.floor(a / b)
  return a < 0 ? a + b : a
}

function julian(y: number, m: number, d: number) {
  if (m <= 2) { y -= 1; m += 12 }
  const A = Math.floor(y / 100)
  const B = 2 - A + Math.floor(A / 4)
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5
}

function sun(jd: number) {
  const D = jd - 2451545.0
  const g = fix(357.529 + 0.98560028 * D, 360)
  const q = fix(280.459 + 0.98564736 * D, 360)
  const L = fix(q + 1.915 * sin(g) + 0.02 * sin(2 * g), 360)
  const e = 23.439 - 0.00000036 * D
  const RA = fix(atan2(cos(e) * sin(L), cos(L)) / 15, 24)
  return { decl: asin(sin(e) * sin(L)), eqt: q / 15 - RA }
}

function rawTimes(y: number, m: number, d: number, lat: number, lng: number, tz: number, asrF: number) {
  const jd = julian(y, m, d) - lng / 360
  const mid = (t: number) => fix(12 - sun(jd + t).eqt, 24)
  const byAngle = (ang: number, t: number, ccw: boolean) => {
    const { decl } = sun(jd + t)
    const x = (-sin(ang) - sin(decl) * sin(lat)) / (cos(decl) * cos(lat))
    if (x < -1 || x > 1) return NaN
    const h = acos(x) / 15
    return mid(t) + (ccw ? -h : h)
  }
  const asr = (t: number) => {
    const { decl } = sun(jd + t)
    return byAngle(-acot(asrF + tan(Math.abs(lat - decl))), t, false)
  }
  const f = (h: number) => h / 24
  const off = tz - lng / 15
  return {
    fajr: byAngle(18, f(5), true) + off,
    sunrise: byAngle(0.833, f(6), true) + off,
    dhuhr: mid(f(12)) + off,
    asr: asr(f(13)) + off,
    maghrib: byAngle(0.833, f(18), false) + off,
    isha: byAngle(18, f(18), false) + off,
  }
}

export function prayerTimes(date: Date, loc: Loc, asrF = 2, adj: Record<string, number> = {}): Times {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  const r = rawTimes(y, m, d, loc.lat, loc.lng, loc.tz, asrF)
  const base = Date.UTC(y, m - 1, d)
  const ts = (h: number, k: string) => base + (h - loc.tz) * 3600000 + (adj[k] || 0) * 60000
  return {
    fajr: ts(r.fajr, 'fajr'),
    sunrise: ts(r.sunrise, 'sunrise'),
    dhuhr: ts(r.dhuhr, 'dhuhr'),
    asr: ts(r.asr, 'asr'),
    maghrib: ts(r.maghrib, 'maghrib'),
    isha: ts(r.isha, 'isha'),
  }
}

export const PN: Record<string, string> = {
  fajr: 'ফজর', sunrise: 'সূর্যোদয়', dhuhr: 'যোহর', asr: 'আসর',
  maghrib: 'মাগরিব', isha: 'এশা', sehri: 'সাহরি', iftar: 'ইফতার',
}

const BN = '০১২৩৪৫৬৭৮৯'
export const bnDigits = (s: string) => s.replace(/[0-9]/g, c => BN[Number(c)])

export function fmtClock(ts: number, tz: number) {
  if (!isFinite(ts)) return '--'
  const dt = new Date(ts + tz * 3600000)
  let h = dt.getUTCHours()
  const m = dt.getUTCMinutes()
  const ap = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return bnDigits(h + ':' + String(m).padStart(2, '0')) + ' ' + ap
}

export function fmtLeft(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return bnDigits(h > 0 ? `${h} ঘণ্টা ${m} মিনিট` : `${m} মিনিট ${sec} সেকেন্ড`)
}

const rd = (k: string, d: any) => {
  try {
    const v = localStorage.getItem(k)
    return v ? JSON.parse(v) : d
  } catch { return d }
}
const wr = (k: string, v: any) => {
  try { localStorage.setItem(k, JSON.stringify(v)) } catch {}
}

export const DEFAULT_LOC: Loc = { name: 'ঢাকা', lat: 23.81, lng: 90.41, tz: 6 }
export const getLoc = (): Loc => rd('loc-v1', DEFAULT_LOC)
export const setLoc = (l: Loc) => wr('loc-v1', l)
export const getAdj = (): Record<string, number> => rd('prayer-adj', {})
export const setAdj = (a: Record<string, number>) => wr('prayer-adj', a)
export const getAsr = (): number => rd('asr-f', 2)
export const setAsr = (n: number) => wr('asr-f', n)

export function districtLoc(name: string): Loc {
  const d = DISTRICTS.find(x => x[1] === name)
  return d ? { name, lat: d[2], lng: d[3], tz: 6 } : DEFAULT_LOC
}

export function nextPrayer(now = Date.now()) {
  const loc = getLoc()
  const adj = getAdj()
  const asr = getAsr()
  for (let i = 0; i < 2; i++) {
    const t: any = prayerTimes(new Date(now + i * 86400000), loc, asr, adj)
    for (const k of ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']) {
      if (t[k] > now) return { key: k, at: t[k] as number, loc }
    }
  }
  return null
}

export const HIJRI_BN = ['মুহাররম', 'সফর', 'রবিউল আউয়াল', 'রবিউস সানি', 'জমাদিউল আউয়াল', 'জমাদিউস সানি',
  'রজব', 'শা’বান', 'রমজান', 'শাওয়াল', 'জিলকদ', 'জিলহজ']

export function hijri(d: Date) {
  const p = new Intl.DateTimeFormat('en-u-ca-islamic-civil', {
    day: 'numeric', month: 'numeric', year: 'numeric',
  }).formatToParts(d)
  const g = (t: string) => Number(p.find(x => x.type === t)?.value)
  return { d: g('day'), m: g('month'), y: g('year') }
}

export function nextRamadan(from: Date) {
  for (let i = 0; i < 420; i++) {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i)
    const h = hijri(d)
    if (h.m === 9) return new Date(d.getFullYear(), d.getMonth(), d.getDate() - (h.d - 1))
  }
  return null
}

export function qiblaBearing(lat: number, lng: number) {
  const p1 = lat * R
  const p2 = 21.4225 * R
  const dl = (39.8262 - lng) * R
  const y = Math.sin(dl) * Math.cos(p2)
  const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl)
  return (Math.atan2(y, x) / R + 360) % 360
}
