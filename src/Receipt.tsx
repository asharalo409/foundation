import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// দানের রসিদ ও দাতা সম্মাননা সনদ: ক্যানভাসে ছবি আঁকা হয়, তারপর শেয়ার বা সেভ করা যায়।
// ব্যবহার: <ReceiptBtn supabase={supabase} d={donationRow} fund="খাতের নাম" donor="দাতার নাম" settings={settings} />

const W = 1080
const H = 1500
const FONT = '"Noto Sans Bengali", "Hind Siliguri", system-ui, sans-serif'
const font = (w: number, px: number) => `${w} ${px}px ${FONT}`

const bn = (n: number) => Number(n || 0).toLocaleString('bn-BD')
const taka = (n: any) => '৳' + bn(Math.round(Number(n || 0) * 100) / 100)
const fdate = (s: string) =>
  new Date(s).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })

function shade(hex: string, k: number) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '')
  if (!m) return '#0b2a1c'
  const n = parseInt(m[1], 16)
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v * (1 + k))))
  const r = ch((n >> 16) & 255), g = ch((n >> 8) & 255), b = ch(n & 255)
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
}

type Ctx = CanvasRenderingContext2D

function rr(c: Ctx, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath()
  c.moveTo(x + r, y)
  c.arcTo(x + w, y, x + w, y + h, r)
  c.arcTo(x + w, y + h, x, y + h, r)
  c.arcTo(x, y + h, x, y, r)
  c.arcTo(x, y, x + w, y, r)
  c.closePath()
}

function fit(c: Ctx, text: string, maxW: number, weight: number, px: number, min = 22) {
  let s = px
  c.font = font(weight, s)
  while (c.measureText(text).width > maxW && s > min) { s -= 2; c.font = font(weight, s) }
  if (c.measureText(text).width <= maxW) return text
  let t = text
  while (t.length > 1 && c.measureText(t + '…').width > maxW) t = t.slice(0, -1)
  return t + '…'
}

function wrap(c: Ctx, text: string, maxW: number) {
  const out: string[] = []
  let cur = ''
  for (const w of text.split(/\s+/)) {
    const t = cur ? cur + ' ' + w : w
    if (cur && c.measureText(t).width > maxW) { out.push(cur); cur = w } else cur = t
  }
  if (cur) out.push(cur)
  return out
}

function logoCircle(c: Ctx, im: HTMLImageElement | null, cx: number, cy: number, r: number, color: string) {
  c.save()
  c.beginPath(); c.arc(cx, cy, r + 8, 0, Math.PI * 2); c.fillStyle = '#fff'; c.fill()
  if (im) {
    c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.clip()
    const s = Math.max((2 * r) / im.width, (2 * r) / im.height)
    c.drawImage(im, cx - (im.width * s) / 2, cy - (im.height * s) / 2, im.width * s, im.height * s)
  } else {
    c.fillStyle = color; c.textAlign = 'center'; c.textBaseline = 'middle'
    c.font = font(700, Math.round(r * 1.1))
    c.fillText('💚', cx, cy + 4)
  }
  c.restore()
}

type Data = {
  org: string; color: string; logo: HTMLImageElement | null
  no: string; date: string; donor: string; fund: string; method: string; amount: any
  host: string
}

function drawReceipt(c: Ctx, o: Data) {
  const col = o.color
  const dark = shade(col, -0.55)
  const paper = '#fbfaf6'
  c.textBaseline = 'alphabetic'
  c.fillStyle = paper; c.fillRect(0, 0, W, H)

  const g = c.createLinearGradient(0, 0, W, 330)
  g.addColorStop(0, col); g.addColorStop(1, dark)
  c.fillStyle = g; c.fillRect(0, 0, W, 330)
  c.save(); c.globalAlpha = 0.07; c.fillStyle = '#fff'
  for (let i = 0; i < 8; i++) {
    c.beginPath(); c.moveTo(i * 170, 0); c.lineTo(i * 170 + 60, 0)
    c.lineTo(i * 170 - 100, 330); c.lineTo(i * 170 - 160, 330); c.closePath(); c.fill()
  }
  c.restore()
  c.fillStyle = paper
  for (let x = 0; x <= W + 40; x += 40) { c.beginPath(); c.arc(x, 330, 14, 0, Math.PI * 2); c.fill() }

  logoCircle(c, o.logo, W / 2, 105, 62, col)
  c.textAlign = 'center'; c.fillStyle = '#fff'
  const org = fit(c, o.org, 900, 700, 48)
  c.fillText(org, W / 2, 238)
  rr(c, W / 2 - 150, 262, 300, 54, 27); c.fillStyle = 'rgba(255,255,255,.2)'; c.fill()
  c.fillStyle = '#fff'; c.font = font(600, 30); c.fillText('অনুদান রসিদ', W / 2, 300)

  c.fillStyle = '#78716c'; c.font = font(400, 32); c.fillText('প্রাপ্ত অনুদান', W / 2, 425)
  c.fillStyle = col
  const amt = fit(c, taka(o.amount), 900, 700, 128, 60)
  c.fillText(amt, W / 2, 550)
  c.save(); c.setLineDash([14, 10]); c.strokeStyle = '#d6d3d1'; c.lineWidth = 3
  c.beginPath(); c.moveTo(70, 600); c.lineTo(W - 70, 600); c.stroke(); c.restore()

  const rows = ([
    ['রসিদ নং', o.no],
    ['তারিখ', o.date ? fdate(o.date) : ''],
    ['দাতা', o.donor],
    ['অনুদানের খাত', o.fund],
    ['মাধ্যম', o.method],
  ] as [string, string][]).filter(r => r[1] && r[1] !== '-')
  const top = 635
  const rowH = 92
  const cardH = rows.length * rowH + 30
  rr(c, 60, top, 960, cardH, 28); c.fillStyle = '#fff'; c.fill()
  c.strokeStyle = '#e7e5df'; c.lineWidth = 2; c.stroke()
  rows.forEach(([k, v], i) => {
    const y = top + 72 + i * rowH
    c.textAlign = 'left'; c.fillStyle = '#78716c'; c.font = font(400, 30); c.fillText(k, 100, y)
    c.textAlign = 'right'; c.fillStyle = '#1c1917'
    c.fillText(fit(c, v, 600, 700, 38, 24), 980, y)
    if (i < rows.length - 1) {
      c.strokeStyle = '#ece9e2'; c.lineWidth = 2
      c.beginPath(); c.moveTo(100, y + 28); c.lineTo(980, y + 28); c.stroke()
    }
  })

  const bot = top + cardH
  c.textAlign = 'left'; c.fillStyle = col
  c.fillText(fit(c, 'আপনার দানের জন্য আন্তরিক ধন্যবাদ', 640, 700, 40, 28), 100, bot + 100)
  c.fillStyle = '#78716c'; c.font = font(400, 28)
  wrap(c, 'স্বচ্ছতাই আমাদের অঙ্গীকার। এই রসিদ নম্বর দিয়ে আয়-ব্যয় পেজে আপনার দান মিলিয়ে দেখা যায়।', 640)
    .forEach((ln, i) => c.fillText(ln, 100, bot + 152 + i * 42))

  c.save()
  c.translate(W - 190, bot + 120); c.rotate(-0.22); c.globalAlpha = 0.9
  c.strokeStyle = col; c.fillStyle = col
  c.lineWidth = 6; c.beginPath(); c.arc(0, 0, 85, 0, Math.PI * 2); c.stroke()
  c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 72, 0, Math.PI * 2); c.stroke()
  c.textAlign = 'center'; c.font = font(700, 44); c.fillText('গৃহীত', 0, 6)
  c.font = font(600, 22); c.fillText('✓ হিসাবে যুক্ত', 0, 44)
  c.restore()

  c.fillStyle = dark; c.fillRect(0, H - 110, W, 110)
  c.textAlign = 'center'; c.fillStyle = '#fff'
  c.fillText(fit(c, o.host, 960, 600, 28, 18), W / 2, H - 62)
  c.globalAlpha = 0.75; c.font = font(400, 24)
  c.fillText('রসিদ তৈরি: ' + new Date().toLocaleString('bn-BD'), W / 2, H - 26)
  c.globalAlpha = 1
}

function drawCert(c: Ctx, o: Data) {
  const col = o.color
  const gold = '#c9a227'
  c.textBaseline = 'alphabetic'
  c.fillStyle = '#fffdf7'; c.fillRect(0, 0, W, H)
  const glow = c.createRadialGradient(W / 2, 240, 40, W / 2, 240, 700)
  glow.addColorStop(0, 'rgba(245,215,110,.28)'); glow.addColorStop(1, 'rgba(245,215,110,0)')
  c.fillStyle = glow; c.fillRect(0, 0, W, H)

  rr(c, 30, 30, W - 60, H - 60, 18); c.strokeStyle = col; c.lineWidth = 14; c.stroke()
  rr(c, 62, 62, W - 124, H - 124, 10); c.strokeStyle = gold; c.lineWidth = 3; c.stroke()
  c.fillStyle = gold
  ;([[62, 62], [W - 62, 62], [62, H - 62], [W - 62, H - 62]] as number[][]).forEach(([x, y]) => {
    c.save(); c.translate(x, y); c.rotate(Math.PI / 4); c.fillRect(-14, -14, 28, 28); c.restore()
  })

  logoCircle(c, o.logo, W / 2, 190, 70, col)
  c.textAlign = 'center'; c.fillStyle = col
  c.fillText(fit(c, o.org, 860, 700, 44), W / 2, 335)

  const gg = c.createLinearGradient(240, 0, 840, 0)
  gg.addColorStop(0, '#a77c0b'); gg.addColorStop(0.5, '#f5d76e'); gg.addColorStop(1, '#a77c0b')
  c.fillStyle = gg
  c.fillText(fit(c, 'সম্মাননা সনদ', 900, 700, 110, 60), W / 2, 478)
  c.fillStyle = '#78716c'; c.font = font(400, 36)
  c.fillText('এই সনদ সানন্দে প্রদান করা হলো', W / 2, 552)

  c.fillStyle = '#1c1917'
  const nm = fit(c, o.donor || 'সম্মানিত দাতা', 880, 700, 96, 44)
  c.fillText(nm, W / 2, 700)
  const tw = c.measureText(nm).width
  c.strokeStyle = gold; c.lineWidth = 3
  c.beginPath(); c.moveTo(W / 2 - tw / 2 - 20, 735); c.lineTo(W / 2 + tw / 2 + 20, 735); c.stroke()

  c.fillStyle = '#44403c'; c.font = font(400, 40)
  const para = `${o.fund ? o.fund + ' খাতে ' : ''}${taka(o.amount)} অনুদান দিয়ে মানবসেবায় অংশ নেওয়ার জন্য আপনাকে আন্তরিক কৃতজ্ঞতা ও ধন্যবাদ জানাই।`
  const lines = wrap(c, para, 820)
  lines.forEach((ln, i) => c.fillText(ln, W / 2, 825 + i * 66))
  const yEnd = 825 + (lines.length - 1) * 66
  c.fillStyle = '#78716c'; c.font = font(400, 32)
  if (o.date) c.fillText('তারিখ: ' + fdate(o.date), W / 2, yEnd + 80)

  const sy = Math.max(1085, yEnd + 190)
  const sg = c.createRadialGradient(W / 2 - 20, sy - 20, 10, W / 2, sy, 84)
  sg.addColorStop(0, '#fff3b0'); sg.addColorStop(1, '#b8860b')
  c.fillStyle = sg; c.beginPath(); c.arc(W / 2, sy, 80, 0, Math.PI * 2); c.fill()
  c.save(); c.setLineDash([6, 6]); c.strokeStyle = '#fff8dc'; c.lineWidth = 3
  c.beginPath(); c.arc(W / 2, sy, 66, 0, Math.PI * 2); c.stroke(); c.restore()
  c.fillStyle = '#5a3d00'; c.font = font(700, 32); c.fillText('ধন্যবাদ', W / 2, sy + 11)

  const ly = H - 235
  c.strokeStyle = '#a8a29e'; c.lineWidth = 2
  ;([[150, 450], [630, 930]] as number[][]).forEach(([a, b]) => { c.beginPath(); c.moveTo(a, ly); c.lineTo(b, ly); c.stroke() })
  c.fillStyle = '#57534e'; c.font = font(600, 30)
  c.fillText('সভাপতি', 300, ly + 46)
  c.fillText('সাধারণ সম্পাদক', 780, ly + 46)
  c.fillStyle = '#a8a29e'; c.font = font(400, 24)
  if (o.no) c.fillText('রসিদ নং: ' + o.no, W / 2, H - 125)
  c.fillText(fit(c, o.host, 860, 400, 24, 16), W / 2, H - 90)
}

async function ensureFont() {
  try {
    await Promise.all([400, 600, 700].map(w => document.fonts.load(`${w} 30px "Noto Sans Bengali"`)))
  } catch { /* ফন্ট না এলেও ডিফল্ট ফন্টে আঁকবে */ }
}

function loadImg(url?: string): Promise<HTMLImageElement | null> {
  return new Promise(res => {
    if (!url) { res(null); return }
    const im = new Image()
    im.crossOrigin = 'anonymous'
    im.onload = () => res(im)
    im.onerror = () => res(null)
    im.src = url
  })
}

// ---- UI ----

function ReceiptModal({ supabase, d, fund, donor, settings, onClose }: any) {
  const [tab, setTab] = useState<'receipt' | 'cert'>('receipt')
  const [cfg, setCfg] = useState<any>(settings?.org_name ? settings : null)
  const [url, setUrl] = useState('')
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')
  const cv = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (cfg) return
    if (!supabase) { setCfg({}); return }
    supabase.from('settings').select('org_name, logo_url, theme_color').eq('id', 1).single()
      .then(({ data }: any) => setCfg(data || {}))
  }, [])

  useEffect(() => {
    if (!cfg) return
    let off = false
    setUrl(''); setErr(''); setMsg('')
    ;(async () => {
      try {
        await ensureFont()
        const logo = await loadImg(cfg.logo_url)
        if (off) return
        const canvas = document.createElement('canvas')
        canvas.width = W; canvas.height = H
        const c = canvas.getContext('2d')
        if (!c) throw new Error('ক্যানভাস চালু হয়নি')
        const data: Data = {
          org: cfg.org_name || 'আমাদের ফাউন্ডেশন',
          color: cfg.theme_color || '#087a43',
          logo,
          no: d.receipt_no || '',
          date: d.donated_on || d.created_at || '',
          donor: donor || d.donor_name || '',
          fund: fund && fund !== '-' ? fund : '',
          method: d.method || '',
          amount: d.amount,
          host: window.location.origin + window.location.pathname,
        }
        if (tab === 'receipt') drawReceipt(c, data); else drawCert(c, data)
        cv.current = canvas
        const u = canvas.toDataURL('image/png')
        if (!off) setUrl(u)
      } catch (e: any) {
        if (!off) setErr('ছবি বানানো যায়নি: ' + (e?.message || 'অজানা সমস্যা'))
      }
    })()
    return () => { off = true }
  }, [cfg, tab, d?.id])

  async function share() {
    const canvas = cv.current
    if (!canvas) return
    const blob: Blob | null = await new Promise(r => canvas.toBlob(r, 'image/png'))
    if (!blob) { setMsg('ছবি তৈরি হয়নি, আবার চেষ্টা করুন'); return }
    const name = (tab === 'receipt' ? 'rosid-' : 'sonod-') + String(d.receipt_no || d.id).replace(/[^\w-]/g, '') + '.png'
    const file = new File([blob], name, { type: 'image/png' })
    const nav: any = navigator
    if (nav.canShare && nav.canShare({ files: [file] })) {
      try {
        await nav.share({ files: [file], title: tab === 'receipt' ? 'অনুদান রসিদ' : 'সম্মাননা সনদ' })
        return
      } catch (e: any) {
        if (e && e.name === 'AbortError') return
      }
    }
    const u = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = u; a.download = name
    document.body.appendChild(a); a.click(); a.remove()
    setTimeout(() => URL.revokeObjectURL(u), 5000)
    setMsg('✅ ছবি সেভ হয়েছে (ডাউনলোড ফোল্ডারে দেখুন)')
  }

  const tabCls = (on: boolean) =>
    'rounded-lg py-2 border ' + (on ? 'bg-green-700 text-white border-green-700' : 'bg-white text-gray-700 border-gray-300')

  return createPortal(
    <div className="fixed inset-0 z-[90] bg-black/60 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-4 space-y-3 max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <b>🧾 রসিদ ও সম্মাননা সনদ</b>
          <button type="button" onClick={onClose} aria-label="বন্ধ করুন" className="text-gray-500 text-xl leading-none px-2">✕</button>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm font-semibold">
          <button type="button" className={tabCls(tab === 'receipt')} onClick={() => setTab('receipt')}>🧾 রসিদ</button>
          <button type="button" className={tabCls(tab === 'cert')} onClick={() => setTab('cert')}>🏅 সম্মাননা সনদ</button>
        </div>
        <div className="rounded-xl border bg-gray-50 min-h-[220px] flex items-center justify-center overflow-hidden">
          {err ? (
            <p className="text-sm text-red-600 p-4 text-center">{err}</p>
          ) : url ? (
            <img src={url} alt={tab === 'receipt' ? 'অনুদান রসিদ' : 'সম্মাননা সনদ'} className="w-full h-auto" />
          ) : (
            <p className="text-sm text-gray-500">তৈরি হচ্ছে...</p>
          )}
        </div>
        <button type="button" disabled={!url}
          className="w-full bg-green-700 text-white font-semibold rounded-lg py-2.5 disabled:opacity-50 active:opacity-80"
          onClick={share}>
          📤 শেয়ার / ছবি সেভ
        </button>
        {msg && <p className="text-xs text-center text-green-700">{msg}</p>}
        <p className="text-[11px] text-gray-400 text-center">ছবিটা চেপে ধরেও সেভ করা যায়।</p>
      </div>
    </div>,
    document.body
  )
}

export function ReceiptBtn({ supabase, d, fund, donor, settings, small }: any) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        className={small
          ? 'underline'
          : 'text-xs font-semibold text-green-700 border border-green-700 rounded-lg px-2.5 py-1 active:opacity-70'}>
        🧾 রসিদ
      </button>
      {open && (
        <ReceiptModal supabase={supabase} d={d} fund={fund} donor={donor} settings={settings}
          onClose={() => setOpen(false)} />
      )}
    </>
  )
}

export default ReceiptBtn
