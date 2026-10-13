import { useCallback, useEffect, useState } from 'react'
import type { Loc } from './prayer'

export type Hour = { time: string; t: number; feels: number; code: number; rain: number; wind: number; uv: number }
export type Day = {
  date: string; code: number; max: number; min: number; sunrise: string; sunset: string
  uv: number; rain: number; mm: number; wind: number
}
export type Wx = {
  at: number
  lat: number
  lng: number
  cur: { time: string; t: number; feels: number; hum: number; day: boolean; code: number; pres: number; wind: number; dir: number }
  hours: Hour[]
  days: Day[]
  aqi: number | null
  pm25: number | null
}

const KEY = 'wx-v1'
const BN = '০১২৩৪৫৬৭৮৯'
export const toBn = (s: string | number) => String(s).replace(/\d/g, d => BN[Number(d)])
export const rnd = (n: number) => Math.round(n)
const num = (v: any, d = 0) => (typeof v === 'number' && isFinite(v) ? v : d)

export function wdesc(code: number): [string, string] {
  if (code === 0) return ['পরিষ্কার আকাশ', 'clear']
  if (code === 1) return ['প্রায় পরিষ্কার', 'clear']
  if (code === 2) return ['আংশিক মেঘলা', 'partly']
  if (code === 3) return ['মেঘলা', 'cloud']
  if (code === 45 || code === 48) return ['কুয়াশা', 'fog']
  if (code >= 51 && code <= 55) return ['গুঁড়ি গুঁড়ি বৃষ্টি', 'drizzle']
  if (code === 56 || code === 57) return ['হিমশীতল গুঁড়ি বৃষ্টি', 'drizzle']
  if (code === 61) return ['হালকা বৃষ্টি', 'rain']
  if (code === 63) return ['মাঝারি বৃষ্টি', 'rain']
  if (code === 65) return ['ভারী বৃষ্টি', 'heavy']
  if (code === 66 || code === 67) return ['হিমশীতল বৃষ্টি', 'rain']
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return ['তুষারপাত', 'snow']
  if (code === 80) return ['হালকা ঝড়ো বৃষ্টি', 'rain']
  if (code === 81) return ['ঝড়ো বৃষ্টি', 'rain']
  if (code === 82) return ['প্রবল বৃষ্টি', 'heavy']
  if (code === 95) return ['বজ্রসহ বৃষ্টি', 'thunder']
  if (code === 96 || code === 99) return ['বজ্র ও শিলাবৃষ্টি', 'thunder']
  return ['আবহাওয়া', 'cloud']
}

export const minOf = (iso: string) => Number(iso.slice(11, 13)) * 60 + Number(iso.slice(14, 16))

export function nowIdx(wx: Wx) {
  const key = wx.cur.time.slice(0, 13)
  const i = wx.hours.findIndex(h => h.time.slice(0, 13) === key)
  return i < 0 ? Math.min(24, Math.max(0, wx.hours.length - 1)) : i
}

export function todayIdx(wx: Wx) {
  const key = wx.cur.time.slice(0, 10)
  const i = wx.days.findIndex(d => d.date === key)
  return i < 0 ? Math.min(1, Math.max(0, wx.days.length - 1)) : i
}

export function readCache(): Wx | null {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || 'null')
    return v && v.cur && v.hours && v.days ? (v as Wx) : null
  } catch { return null }
}

const near = (w: Wx, l: Loc) => Math.abs(w.lat - l.lat) < 0.06 && Math.abs(w.lng - l.lng) < 0.06

async function get(url: string) {
  const r = await fetch(url)
  if (!r.ok) throw new Error('HTTP ' + r.status)
  return r.json()
}

export async function fetchWx(loc: Loc): Promise<Wx> {
  const q = `latitude=${loc.lat.toFixed(3)}&longitude=${loc.lng.toFixed(3)}`
  const f = await get(
    `https://api.open-meteo.com/v1/forecast?${q}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m` +
    `&hourly=temperature_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m,uv_index` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max,precipitation_sum,wind_speed_10m_max` +
    `&timezone=auto&past_days=1&forecast_days=7&wind_speed_unit=kmh`
  )
  if (!f || !f.current || !f.hourly || !f.daily) throw new Error('ডেটা অসম্পূর্ণ')

  let aqi: number | null = null
  let pm25: number | null = null
  try {
    const a = await get(`https://air-quality-api.open-meteo.com/v1/air-quality?${q}&current=us_aqi,pm2_5&timezone=auto`)
    if (a && a.current) {
      aqi = typeof a.current.us_aqi === 'number' ? a.current.us_aqi : null
      pm25 = typeof a.current.pm2_5 === 'number' ? a.current.pm2_5 : null
    }
  } catch {}

  const c = f.current
  const h = f.hourly
  const d = f.daily
  return {
    at: Date.now(),
    lat: loc.lat,
    lng: loc.lng,
    cur: {
      time: String(c.time),
      t: num(c.temperature_2m),
      feels: num(c.apparent_temperature, num(c.temperature_2m)),
      hum: num(c.relative_humidity_2m),
      day: c.is_day === 1,
      code: num(c.weather_code),
      pres: num(c.surface_pressure, 1010),
      wind: num(c.wind_speed_10m),
      dir: num(c.wind_direction_10m),
    },
    hours: h.time.map((time: string, i: number) => ({
      time,
      t: num(h.temperature_2m[i]),
      feels: num(h.apparent_temperature[i]),
      code: num(h.weather_code[i]),
      rain: num(h.precipitation_probability[i]),
      wind: num(h.wind_speed_10m[i]),
      uv: num(h.uv_index[i]),
    })),
    days: d.time.map((date: string, i: number) => ({
      date,
      code: num(d.weather_code[i]),
      max: num(d.temperature_2m_max[i]),
      min: num(d.temperature_2m_min[i]),
      sunrise: String(d.sunrise[i]),
      sunset: String(d.sunset[i]),
      uv: num(d.uv_index_max[i]),
      rain: num(d.precipitation_probability_max[i]),
      mm: num(d.precipitation_sum[i]),
      wind: num(d.wind_speed_10m_max[i]),
    })),
    aqi,
    pm25,
  }
}

export function useWx(loc: Loc) {
  const [wx, setWx] = useState<Wx | null>(() => {
    const c = readCache()
    return c && near(c, loc) ? c : null
  })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async (force?: boolean) => {
    const c = readCache()
    if (!force && c && near(c, loc) && Date.now() - c.at < 25 * 60000) {
      setWx(c)
      return
    }
    setBusy(true)
    setErr('')
    try {
      const w = await fetchWx(loc)
      try { localStorage.setItem(KEY, JSON.stringify(w)) } catch {}
      setWx(w)
    } catch {
      setErr(navigator.onLine ? 'আবহাওয়ার তথ্য আনা যায়নি' : 'ইন্টারনেট নেই, শেষ সংরক্ষিত তথ্য দেখানো হচ্ছে')
    }
    setBusy(false)
  }, [loc.lat, loc.lng])

  useEffect(() => {
    load()
    const id = setInterval(() => load(), 30 * 60000)
    return () => clearInterval(id)
  }, [load])

  return { wx, err, busy, reload: () => load(true) }
}
