import { getLoc, getAdj, getAsr, prayerTimes, PN, fmtClock } from './prayer'

export type Sound = 'adhan' | 'beep' | 'notify' | 'silent'

export type Cfg = {
  on: boolean
  keepAwake: boolean
  sehriBefore: number
  items: Record<string, boolean>
  off: Record<string, number>
  sound: Sound
}
export type Ev = { key: string; label: string; at: number }

const DEF: Cfg = {
  on: false,
  keepAwake: false,
  sehriBefore: 30,
  items: {
    fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true,
    sehri: false, iftar: false,
    duha: false, tahajjud: false,
    f_morning: false, f_noon: false, f_evening: false,
  },
  off: {},
  sound: 'adhan',
}

export const LBL: Record<string, string> = {
  ...PN,
  duha: 'দুহা',
  tahajjud: 'তাহাজ্জুদ',
  f_morning: 'নিষিদ্ধ সময় শুরু (সকাল)',
  f_noon: 'নিষিদ্ধ সময় শুরু (দুপুর)',
  f_evening: 'নিষিদ্ধ সময় শুরু (সন্ধ্যা)',
}

const PRAYER_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'sehri', 'iftar']

const rd = (k: string, d: any) => {
  try {
    const v = localStorage.getItem(k)
    return v ? JSON.parse(v) : d
  } catch { return d }
}
const get = (k: string) => {
  try { return localStorage.getItem(k) || '' } catch { return '' }
}

export function getCfg(): Cfg {
  const c = rd('alarm-cfg', DEF)
  return {
    ...DEF,
    ...c,
    items: { ...DEF.items, ...(c.items || {}) },
    off: { ...(c.off || {}) },
    sound: ['adhan', 'beep', 'notify', 'silent'].includes(c.sound) ? c.sound : 'adhan',
  }
}
export function saveCfg(c: Cfg) {
  try { localStorage.setItem('alarm-cfg', JSON.stringify(c)) } catch {}
}

export function setAdhanUrls(a?: string | null, f?: string | null) {
  try {
    if (a !== undefined) localStorage.setItem('adhan-url', a || '')
    if (f !== undefined) localStorage.setItem('adhan-fajr-url', f || '')
  } catch {}
}

export function eventBase(d: Date): Record<string, number> {
  const loc = getLoc()
  const adj = getAdj()
  const asr = getAsr()
  const t: any = prayerTimes(d, loc, asr, adj)
  const n: any = prayerTimes(new Date(d.getTime() + 86400000), loc, asr, adj)
  const M = 60000
  return {
    fajr: t.fajr,
    dhuhr: t.dhuhr,
    asr: t.asr,
    maghrib: t.maghrib,
    isha: t.isha,
    sehri: t.fajr,
    iftar: t.maghrib,
    duha: t.sunrise + 16 * M,
    tahajjud: t.maghrib + ((n.fajr - t.maghrib) * 2) / 3,
    f_morning: t.sunrise,
    f_noon: t.dhuhr - 8 * M,
    f_evening: t.maghrib - 15 * M,
  }
}

export function offOf(cfg: Cfg, k: string) {
  const v = cfg.off[k]
  if (typeof v === 'number') return v
  return k === 'sehri' ? -cfg.sehriBefore : 0
}

export function eventsFor(d: Date, cfg: Cfg): Ev[] {
  const b = eventBase(d)
  return Object.keys(b)
    .filter(k => cfg.items[k] && isFinite(b[k]))
    .map(k => ({ key: k, label: LBL[k] || k, at: b[k] + offOf(cfg, k) * 60000 }))
}

const CACHE = 'img-v1'
const SILENT = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='

let audio: HTMLAudioElement | null = null
let ctx: any = null
let wake: any = null
let timer: number | null = null
let rang: Record<string, boolean> = {}
const blobs: Record<string, string> = {}

async function loadBlob(url: string): Promise<string | null> {
  try {
    const c = await caches.open(CACHE)
    let res = await c.match(url)
    if (!res) {
      if (!navigator.onLine) return null
      const net = await fetch(url)
      if (!net.ok) return null
      await c.put(url, net.clone())
      res = net
    }
    return URL.createObjectURL(await res.blob())
  } catch { return null }
}

async function blobFor(url: string) {
  if (!url) return null
  if (blobs[url]) return blobs[url]
  const b = await loadBlob(url)
  if (b) blobs[url] = b
  return b
}

export async function preloadAdhan() {
  const a = get('adhan-url')
  const f = get('adhan-fajr-url')
  const r1 = a ? await blobFor(a) : null
  if (f) await blobFor(f)
  return !!r1
}

export async function unlock() {
  try {
    audio = audio || new Audio()
    audio.muted = true
    audio.src = SILENT
    await audio.play()
    audio.pause()
    audio.muted = false
  } catch {}
  try {
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext
    ctx = ctx || new AC()
    await ctx.resume()
  } catch {}
}

function beep() {
  try {
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext
    ctx = ctx || new AC()
    const t0 = ctx.currentTime
    for (let i = 0; i < 6; i++) {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.frequency.value = i % 2 ? 660 : 880
      g.gain.setValueAtTime(0.0001, t0 + i * 0.6)
      g.gain.exponentialRampToValueAtTime(0.4, t0 + i * 0.6 + 0.05)
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + i * 0.6 + 0.5)
      o.connect(g)
      g.connect(ctx.destination)
      o.start(t0 + i * 0.6)
      o.stop(t0 + i * 0.6 + 0.55)
    }
  } catch {}
}

function stopSound() {
  try { audio?.pause() } catch {}
}

async function notify(ev: Ev) {
  try {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    const opts: any = {
      body: fmtClock(ev.at, getLoc().tz),
      tag: 'alarm-' + ev.key,
      requireInteraction: true,
      vibrate: [300, 150, 300, 150, 600],
    }
    const reg = await navigator.serviceWorker?.getRegistration()
    if (reg) reg.showNotification(ev.label, opts)
    else new Notification(ev.label, opts)
  } catch {}
}

function overlay(ev: Ev, missed: boolean) {
  document.getElementById('alarm-ov')?.remove()
  const w = document.createElement('div')
  w.id = 'alarm-ov'
  w.style.cssText =
    'position:fixed;inset:0;z-index:99999;background:rgba(6,40,24,.96);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:24px;text-align:center'

  const mk = (tag: string, css: string, text: string) => {
    const e = document.createElement(tag)
    e.style.cssText = css
    e.textContent = text
    return e
  }
  w.append(
    mk('div', 'font-size:64px;line-height:1', missed ? '!' : '☾'),
    mk('div', 'font-size:30px;font-weight:700', ev.label),
    mk('div', 'font-size:18px;opacity:.9', missed ? 'অ্যালার্ম মিস হয়েছে' : 'সময় হয়েছে'),
    mk('div', 'font-size:22px;font-weight:600', fmtClock(ev.at, getLoc().tz)),
  )

  const close = () => {
    stopSound()
    w.remove()
  }
  const b1 = mk('button',
    'margin-top:10px;background:#fff;color:#14532d;border:0;border-radius:14px;padding:14px 36px;font-size:18px;font-weight:700',
    missed ? 'ঠিক আছে' : 'থামান')
  b1.onclick = close
  w.append(b1)

  if (!missed) {
    const b2 = mk('button',
      'background:transparent;color:#fff;border:1px solid rgba(255,255,255,.6);border-radius:14px;padding:10px 24px;font-size:15px',
      '৫ মিনিট পরে')
    b2.onclick = () => {
      close()
      window.setTimeout(() => ring(ev), 5 * 60000)
    }
    w.append(b2)
  }
  document.body.appendChild(w)
}

async function playSound(key: string, force?: Sound) {
  const snd: Sound = force || getCfg().sound
  if (snd === 'silent' || snd === 'notify') return
  if (snd === 'beep') { beep(); return }

  if (!PRAYER_KEYS.includes(key)) { beep(); return }
  const isF = key === 'fajr' || key === 'sehri'
  const url = isF ? get('adhan-fajr-url') || get('adhan-url') : get('adhan-url')
  const src = url ? await blobFor(url) : null
  if (!src) { beep(); return }
  try {
    audio = audio || new Audio()
    audio.muted = false
    audio.src = src
    audio.currentTime = 0
    await audio.play()
  } catch {
    beep()
  }
}

export async function ring(ev: Ev, missed = false) {
  overlay(ev, missed)
  if (missed) return
  try { navigator.vibrate?.([300, 150, 300, 150, 600]) } catch {}
  notify(ev)
  await playSound(ev.key)
}

export async function previewSound(s: Sound) {
  await unlock()
  if (s === 'silent') {
    try { navigator.vibrate?.(300) } catch {}
    return
  }
  if (s === 'notify') {
    try { await Notification.requestPermission() } catch {}
    notify({ key: 'asr', label: 'পরীক্ষা', at: Date.now() })
    return
  }
  await playSound('asr', s)
}

export function testRing() {
  ring({ key: 'asr', label: 'পরীক্ষা', at: Date.now() })
}

function prime() {
  const cfg = getCfg()
  const now = Date.now()
  for (const off of [-1, 0, 1]) {
    for (const ev of eventsFor(new Date(now + off * 86400000), cfg)) {
      if (ev.at <= now) rang[ev.key + '-' + Math.floor(ev.at / 60000)] = true
    }
  }
}

function tick() {
  const cfg = getCfg()
  if (!cfg.on) return
  const now = Date.now()
  for (const off of [-1, 0, 1]) {
    for (const ev of eventsFor(new Date(now + off * 86400000), cfg)) {
      const id = ev.key + '-' + Math.floor(ev.at / 60000)
      if (rang[id]) continue
      const late = now - ev.at
      if (late >= 0 && late < 120000) {
        rang[id] = true
        ring(ev)
      } else if (late >= 120000 && late < 20 * 60000) {
        rang[id] = true
        ring(ev, true)
      }
    }
  }
}

async function keepAwake(on: boolean) {
  try {
    if (wake) { await wake.release(); wake = null }
    if (on && 'wakeLock' in navigator) wake = await (navigator as any).wakeLock.request('screen')
  } catch {}
}

function onVis() {
  if (document.visibilityState !== 'visible') return
  tick()
  const cfg = getCfg()
  if (cfg.on && cfg.keepAwake) keepAwake(true)
}

export function startAlarms() {
  const cfg = getCfg()
  if (!cfg.on) return
  prime()
  if (timer) clearInterval(timer)
  timer = window.setInterval(tick, 5000)
  document.removeEventListener('visibilitychange', onVis)
  document.addEventListener('visibilitychange', onVis)
  keepAwake(cfg.keepAwake)
  preloadAdhan()
}

export function stopAlarms() {
  if (timer) clearInterval(timer)
  timer = null
  document.removeEventListener('visibilitychange', onVis)
  keepAwake(false)
}

export function initAlarms() {
  if (!getCfg().on) return
  startAlarms()
  document.addEventListener('pointerdown', () => { unlock() }, { once: true })
}

export function downloadIcs(cfg: Cfg, days = 30) {
  const pad = (n: number) => String(n).padStart(2, '0')
  const utc = (ts: number) => {
    const d = new Date(ts)
    return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`
  }
  const now = Date.now()
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Foundation//Salat//BN',
    'CALSCALE:GREGORIAN', 'X-WR-CALNAME:নামাজ ও রোজার সময়']
  for (let i = 0; i < days; i++) {
    for (const ev of eventsFor(new Date(now + i * 86400000), cfg)) {
      if (ev.at < now - 60000) continue
      lines.push(
        'BEGIN:VEVENT',
        `UID:${ev.key}-${Math.floor(ev.at / 60000)}@foundation`,
        `DTSTAMP:${utc(now)}`,
        `DTSTART:${utc(ev.at)}`,
        `DTEND:${utc(ev.at + 600000)}`,
        `SUMMARY:${ev.label}`,
        'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${ev.label}`, 'TRIGGER:PT0S', 'END:VALARM',
        'END:VEVENT',
      )
    }
  }
  lines.push('END:VCALENDAR')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/calendar' }))
  a.download = 'namaz-reminders.ics'
  document.body.appendChild(a)
  a.click()
  a.remove()
}
