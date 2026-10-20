import { useEffect, useRef, useState } from 'react'
import { Download, Share2, FileImage } from 'lucide-react'

const BN = '০১২৩৪৫৬৭৮৯'
const bn = (v: any) => String(v).replace(/\d/g, d => BN[+d])
const money = (n: number) => '৳ ' + bn(Math.round(n).toLocaleString('en-US'))
const MONTHS = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর']
const pad = (n: number) => String(n).padStart(2, '0')

type Data = { income: number; expense: number; donors: number; members: number; blood: number; cats: [string, number][] }

function range(y: number, m: number) {
  const from = `${y}-${pad(m + 1)}-01`
  const ny = m === 11 ? y + 1 : y
  const nm = m === 11 ? 0 : m + 1
  return { from, to: `${ny}-${pad(nm + 1)}-01` }
}

function rr(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath(); c.moveTo(x + r, y)
  c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r)
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath()
}

function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise(res => {
    if (!src) return res(null)
    const i = new Image(); i.crossOrigin = 'anonymous'
    i.onload = () => res(i); i.onerror = () => res(null); i.src = src
  })
}

async function draw(cv: HTMLCanvasElement, d: Data, y: number, m: number, s: any) {
  const W = 1080, H = 1350, c = cv.getContext('2d')!
  cv.width = W; cv.height = H
  const col = s?.theme_color || '#087a43'
  const FONT = '"Noto Sans Bengali","Hind Siliguri",system-ui,sans-serif'
  try { await (document as any).fonts?.ready } catch {}

  c.fillStyle = '#f6f8f5'; c.fillRect(0, 0, W, H)
  const g = c.createLinearGradient(0, 0, W, 360)
  g.addColorStop(0, col); g.addColorStop(1, '#0b2a1c')
  c.fillStyle = g; c.fillRect(0, 0, W, 360)
  c.globalAlpha = .08; c.strokeStyle = '#fff'; c.lineWidth = 2
  for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(W - 60, 40, 80 + i * 44, 0, 7); c.stroke() }
  c.globalAlpha = 1

  const logo = await loadImg(s?.logo_url || '')
  if (logo) {
    c.save(); c.beginPath(); c.arc(130, 120, 56, 0, 7); c.clip()
    c.fillStyle = '#fff'; c.fillRect(74, 64, 112, 112)
    c.drawImage(logo, 74, 64, 112, 112); c.restore()
  }
  c.fillStyle = '#fff'; c.textBaseline = 'alphabetic'
  c.font = `700 44px ${FONT}`; c.fillText('মানবসেবা ফাউন্ডেশন', logo ? 210 : 80, 112)
  c.font = `400 26px ${FONT}`; c.globalAlpha = .8
  c.fillText('বাকড়া, আশাশুনি, সাতক্ষীরা', logo ? 210 : 80, 154); c.globalAlpha = 1
  c.font = `700 30px ${FONT}`; c.globalAlpha = .9
  c.fillText('মাসিক কার্যক্রম প্রতিবেদন', 80, 262); c.globalAlpha = 1
  c.font = `800 78px ${FONT}`; c.fillText(`${MONTHS[m]} ${bn(y)}`, 80, 338)

  const net = d.income - d.expense
  c.save(); c.shadowColor = 'rgba(0,0,0,.12)'; c.shadowBlur = 30; c.shadowOffsetY = 10
  c.fillStyle = '#fff'; rr(c, 60, 400, W - 120, 230, 28); c.fill(); c.restore()
  const half = (W - 120) / 2
  const cell = (x: number, label: string, val: string, color: string) => {
    c.fillStyle = '#64748b'; c.font = `600 28px ${FONT}`; c.fillText(label, x, 462)
    c.fillStyle = color; c.font = `800 60px ${FONT}`; c.fillText(val, x, 540)
  }
  cell(96, 'মোট আয়', money(d.income), '#0f7a45')
  cell(60 + half + 36, 'মোট ব্যয়', money(d.expense), '#b45309')
  c.strokeStyle = '#e5e7eb'; c.lineWidth = 2
  c.beginPath(); c.moveTo(60 + half, 440); c.lineTo(60 + half, 540); c.stroke()
  c.beginPath(); c.moveTo(96, 568); c.lineTo(W - 96, 568); c.stroke()
  c.fillStyle = '#64748b'; c.font = `600 26px ${FONT}`; c.fillText('মাস শেষে অবশিষ্ট', 96, 608)
  c.fillStyle = net >= 0 ? '#0f7a45' : '#b91c1c'; c.font = `800 34px ${FONT}`
  c.textAlign = 'right'; c.fillText((net < 0 ? '- ' : '') + money(Math.abs(net)), W - 96, 612); c.textAlign = 'left'

  const stats: [string, number][] = [['দাতা', d.donors], ['নতুন সদস্য', d.members], ['রক্তের আবেদন', d.blood]]
  const sw = (W - 120 - 40) / 3
  stats.forEach(([l, v], i) => {
    const x = 60 + i * (sw + 20)
    c.fillStyle = '#fff'; rr(c, x, 670, sw, 150, 22); c.fill()
    c.strokeStyle = '#e2e8f0'; c.lineWidth = 2; rr(c, x, 670, sw, 150, 22); c.stroke()
    c.fillStyle = col; c.font = `800 62px ${FONT}`; c.textAlign = 'center'
    c.fillText(bn(v), x + sw / 2, 746)
    c.fillStyle = '#64748b'; c.font = `600 26px ${FONT}`; c.fillText(l, x + sw / 2, 790)
    c.textAlign = 'left'
  })

  c.fillStyle = '#0f172a'; c.font = `700 34px ${FONT}`; c.fillText('ব্যয়ের খাত', 70, 892)
  const cats = d.cats.slice(0, 4)
  if (!cats.length) {
    c.fillStyle = '#94a3b8'; c.font = `500 28px ${FONT}`; c.fillText('এই মাসে কোনো ব্যয় নেই', 70, 950)
  }
  const max = Math.max(1, ...cats.map(x => x[1]))
  cats.forEach(([n, v], i) => {
    const y0 = 930 + i * 72
    c.fillStyle = '#334155'; c.font = `600 26px ${FONT}`; c.fillText(n, 70, y0 + 24)
    c.fillStyle = '#e5e7eb'; rr(c, 330, y0 + 4, 470, 26, 13); c.fill()
    c.fillStyle = col; rr(c, 330, y0 + 4, Math.max(26, 470 * v / max), 26, 13); c.fill()
    c.fillStyle = '#0f172a'; c.font = `700 26px ${FONT}`; c.textAlign = 'right'
    c.fillText(money(v), W - 70, y0 + 26); c.textAlign = 'left'
  })

  c.fillStyle = col; c.fillRect(0, H - 90, W, 90)
  c.fillStyle = '#fff'; c.font = `600 26px ${FONT}`; c.textAlign = 'center'
  c.fillText('প্রতিটি টাকার হিসাব আমরা সবার সামনে রাখি', W / 2, H - 38)
  c.textAlign = 'left'
}

export default function MonthlyReport({ supabase, settings }: any) {
  const now = new Date()
  const [y, setY] = useState(now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear())
  const [m, setM] = useState(now.getMonth() === 0 ? 11 : now.getMonth() - 1)
  const [d, setD] = useState<Data | null>(null)
  const [busy, setBusy] = useState(false)
  const cv = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let off = false
    setD(null)
    const { from, to } = range(y, m)
    const fromTs = from + 'T00:00:00', toTs = to + 'T00:00:00'
    ;(async () => {
      const [a, b, c, e] = await Promise.all([
        supabase.from('donations').select('amount, member_id').gte('donated_on', from).lt('donated_on', to),
        supabase.from('expenses').select('amount, category').gte('spent_on', from).lt('spent_on', to),
        supabase.from('members').select('id', { count: 'exact', head: true }).gte('created_at', fromTs).lt('created_at', toTs),
        supabase.from('blood_requests').select('id', { count: 'exact', head: true }).gte('created_at', fromTs).lt('created_at', toTs),
      ])
      if (off) return
      const don = a.data || [], exp = b.data || []
      const map: Record<string, number> = {}
      exp.forEach((x: any) => { const k = x.category || 'অন্যান্য'; map[k] = (map[k] || 0) + Number(x.amount || 0) })
      setD({
        income: don.reduce((s: number, x: any) => s + Number(x.amount || 0), 0),
        expense: exp.reduce((s: number, x: any) => s + Number(x.amount || 0), 0),
        donors: new Set(don.map((x: any, i: number) => x.member_id || 'anon' + i)).size,
        members: c.count || 0,
        blood: e.count || 0,
        cats: Object.entries(map).sort((p, q) => q[1] - p[1]),
      })
    })()
    return () => { off = true }
  }, [y, m, supabase])

  useEffect(() => { if (d && cv.current) draw(cv.current, d, y, m, settings) }, [d, y, m, settings])

  const blob = () => new Promise<Blob | null>(r => cv.current?.toBlob(b => r(b), 'image/png'))
  const name = `msf-report-${y}-${pad(m + 1)}.png`
  const save = async () => {
    setBusy(true)
    const b = await blob(); setBusy(false)
    if (!b) return alert('ছবি তৈরি হয়নি')
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; a.click()
  }
  const share = async () => {
    const b = await blob(); if (!b) return
    const f = new File([b], name, { type: 'image/png' })
    const nav: any = navigator
    if (nav.canShare?.({ files: [f] })) { try { await nav.share({ files: [f], title: 'মাসিক প্রতিবেদন' }) } catch {} }
    else save()
  }

  const years = [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2]
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><FileImage size={18} /></span>
        <div>
          <h3 className="text-base font-bold text-slate-900">মাসিক প্রতিবেদন ছবি</h3>
          <p className="text-xs text-slate-500">ফেসবুক ও হোয়াটসঅ্যাপে শেয়ার করার জন্য</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <select value={m} onChange={e => setM(+e.target.value)} className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
          {MONTHS.map((n, i) => <option key={n} value={i}>{n}</option>)}
        </select>
        <select value={y} onChange={e => setY(+e.target.value)} className="w-28 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
          {years.map(v => <option key={v} value={v}>{bn(v)}</option>)}
        </select>
      </div>
      <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
        {!d && <div className="grid h-48 place-items-center text-sm text-slate-400">হিসাব তৈরি হচ্ছে...</div>}
        <canvas ref={cv} className={d ? 'block h-auto w-full' : 'hidden'} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button onClick={save} disabled={!d || busy} className="flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Download size={16} />ছবি নামান</button>
        <button onClick={share} disabled={!d} className="flex items-center justify-center gap-2 rounded-xl border border-emerald-700 px-3 py-2.5 text-sm font-semibold text-emerald-800 disabled:opacity-50"><Share2 size={16} />শেয়ার করুন</button>
      </div>
    </section>
  )
}
