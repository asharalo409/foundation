import { useEffect, useMemo, useState } from 'react'
import { fmtDT } from './time'

const toBn = (s: string | number) => String(s).replace(/\d/g, x => '০১২৩৪৫৬৭৮৯'[Number(x)])
const bn = (n: number) => Math.round(n || 0).toLocaleString('bn-BD')
const taka = (n: number) => '৳' + bn(n)
const compact = (n: number) => {
  const a = Math.abs(n)
  const sg = n < 0 ? '−' : ''
  const f = (x: number) => toBn(Number(x.toFixed(1)))
  if (a >= 1e7) return sg + '৳' + f(a / 1e7) + ' কোটি'
  if (a >= 1e5) return sg + '৳' + f(a / 1e5) + ' লাখ'
  if (a >= 1e3) return sg + '৳' + f(a / 1e3) + ' হাজার'
  return sg + '৳' + toBn(Math.round(a))
}
const axis = (n: number) => {
  if (n >= 1e5) return toBn(Number((n / 1e5).toFixed(1))) + 'ল'
  if (n >= 1e3) return toBn(Number((n / 1e3).toFixed(1))) + 'হা'
  return toBn(Math.round(n))
}

const MON = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রি', 'মে', 'জুন', 'জুলা', 'আগ', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে']
const PAL = ['#5e35b1', '#1e88e5', '#26a69a', '#ffb300', '#ef5350', '#8d6e63', '#ec407a', '#7cb342']
const ymOf = (y: number, m: number) => y * 12 + (m - 1)
const ymStr = (s: string) => ymOf(Number(s.slice(0, 4)), Number(s.slice(5, 7)))
const ymLabel = (ym: number) => MON[ym % 12] + ' ' + toBn(Math.floor(ym / 12)).slice(2)
const ymFull = (ym: number) => MON[ym % 12] + ' ' + toBn(Math.floor(ym / 12))
const sumA = (a: number[]) => a.reduce((t, x) => t + x, 0)
const chg = (a: number, b: number | null) => (b === null || b === 0 ? null : ((a - b) / b) * 100)

const PRESETS: [string, string][] = [['3', '৩ মাস'], ['6', '৬ মাস'], ['12', '১২ মাস'], ['y', 'এ বছর'], ['all', 'সব']]

function Spark({ vals, color }: { vals: number[]; color: string }) {
  const W = 100
  const H = 34
  if (vals.length < 2) return <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" />
  const mn = Math.min(...vals)
  const mx = Math.max(...vals)
  const rg = mx - mn || 1
  const pts = vals.map((v, i) => [(i / (vals.length - 1)) * W, H - 4 - ((v - mn) / rg) * (H - 8)])
  const dd = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
      <path d={dd + ` L${W} ${H} L0 ${H} Z`} fill={color} opacity=".12" />
      <path d={dd} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

function Delta({ v, up = 'good', suffix = '%' }: { v: number | null; up?: 'good' | 'bad'; suffix?: string }) {
  if (v === null || !isFinite(v)) return <span className="text-[11px] text-gray-400">—</span>
  const pos = v > 0.05
  const neg = v < -0.05
  const good = up === 'good' ? pos : neg
  const bad = up === 'good' ? neg : pos
  const bg = good ? '#dcfce7' : bad ? '#fee2e2' : '#f1f5f9'
  const fg = good ? '#15803d' : bad ? '#b91c1c' : '#64748b'
  return (
    <span className="rounded-md px-1.5 py-0.5 text-[11px] font-bold whitespace-nowrap" style={{ background: bg, color: fg }}>
      {pos ? '▲' : neg ? '▼' : '–'} {toBn(Math.abs(v).toFixed(1))}{suffix}
    </span>
  )
}

function Kpi({ label, value, color, vals, badge, sub }: any) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-3 shrink-0" style={{ width: 172, scrollSnapAlign: 'start' }}>
      <p className="text-[11px] text-gray-500">{label}</p>
      <p className="text-lg font-bold leading-tight mt-0.5" style={{ color }}>{value}</p>
      <div className="flex items-center justify-between mt-1 gap-1">
        <div>{badge}</div>
        <div style={{ width: 62, height: 28 }}><Spark vals={vals} color={color} /></div>
      </div>
      {sub && <p className="text-[10px] text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function Card({ title, right, children }: { title: string; right?: any; children: any }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-bold">{title}</p>
        {right}
      </div>
      {children}
    </div>
  )
}

function BarChart({ labels, a, b, line, sel, onSel, accent }: any) {
  const W = 340
  const H = 196
  const L = 38
  const R = 6
  const T = 10
  const B = 24
  const n = labels.length
  const mx = Math.max(1, ...a, ...b, ...line)
  const raw = mx / 4
  const p10 = Math.pow(10, Math.floor(Math.log10(raw)))
  const fr = raw / p10
  const step = (fr <= 1 ? 1 : fr <= 2 ? 2 : fr <= 5 ? 5 : 10) * p10
  const top = Math.max(step, Math.ceil(mx / step) * step)
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step)
  const cw = (W - L - R) / n
  const bw = Math.min(13, cw * 0.38)
  const y = (v: number) => T + (H - T - B) * (1 - v / top)
  const cx = (i: number) => L + cw * i + cw / 2
  const skip = n > 12 ? 2 : 1
  const pts = line.map((v: number, i: number) => cx(i).toFixed(1) + ',' + y(v).toFixed(1)).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {ticks.map(t => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="currentColor" strokeOpacity=".12" />
          <text x={L - 5} y={y(t) + 3} textAnchor="end" fontSize="9" fill="currentColor" fillOpacity=".5">{axis(t)}</text>
        </g>
      ))}
      {sel !== null && (
        <rect x={cx(sel) - cw / 2} y={T} width={cw} height={H - T - B} fill={accent} fillOpacity=".09" rx="4" />
      )}
      {a.map((v: number, i: number) => (
        <g key={i}>
          <rect x={cx(i) - bw - 1} y={y(b[i])} width={bw} height={Math.max(0, H - B - y(b[i]))} rx="2" fill="#93c5fd" />
          <rect x={cx(i) + 1} y={y(v)} width={bw} height={Math.max(0, H - B - y(v))} rx="2" fill="#2563eb" />
        </g>
      ))}
      {n > 1 && <polyline points={pts} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />}
      {line.map((v: number, i: number) => (
        <circle key={i} cx={cx(i)} cy={y(v)} r="2.6" fill="#f59e0b" stroke="#fff" strokeWidth="1" />
      ))}
      {labels.map((l: string, i: number) => i % skip === 0 && (
        <text key={i} x={cx(i)} y={H - 8} textAnchor="middle" fontSize="8.5" fill="currentColor" fillOpacity=".55">{l}</text>
      ))}
      {labels.map((_: string, i: number) => (
        <rect key={'c' + i} x={cx(i) - cw / 2} y={T} width={cw} height={H - T - B} fill="transparent"
          onClick={() => onSel(i)} style={{ cursor: 'pointer' }} />
      ))}
    </svg>
  )
}

function GrowthChart({ labels, mem, rate, accent }: any) {
  const W = 340
  const H = 176
  const L = 32
  const R = 32
  const T = 10
  const B = 22
  const n = labels.length
  const mtop = Math.max(4, Math.ceil(Math.max(1, ...mem) * 1.2))
  const x = (i: number) => (n === 1 ? (L + W - R) / 2 : L + ((W - L - R) * i) / (n - 1))
  const ym = (v: number) => T + (H - T - B) * (1 - v / mtop)
  const yr = (v: number) => T + (H - T - B) * (1 - v / 100)
  const base = H - B
  const area = mem.map((v: number, i: number) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + ym(v).toFixed(1)).join(' ')
  const line = rate.map((v: number, i: number) => x(i).toFixed(1) + ',' + yr(v).toFixed(1)).join(' ')
  const skip = n > 12 ? 2 : 1

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[0, 0.5, 1].map(f => (
        <g key={f}>
          <line x1={L} x2={W - R} y1={ym(mtop * f)} y2={ym(mtop * f)} stroke="currentColor" strokeOpacity=".12" />
          <text x={L - 5} y={ym(mtop * f) + 3} textAnchor="end" fontSize="9" fill="currentColor" fillOpacity=".5">
            {toBn(Math.round(mtop * f))}
          </text>
          <text x={W - R + 5} y={yr(100 * f) + 3} fontSize="9" fill="#10b981">{toBn(Math.round(100 * f))}%</text>
        </g>
      ))}
      {n > 1 && <path d={`${area} L${x(n - 1).toFixed(1)} ${base} L${x(0).toFixed(1)} ${base} Z`} fill={accent} fillOpacity=".15" />}
      <path d={area} fill="none" stroke={accent} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
      {n > 1 && <polyline points={line} fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="4 3" />}
      {rate.map((v: number, i: number) => (
        <circle key={i} cx={x(i)} cy={yr(v)} r="2.4" fill="#10b981" stroke="#fff" strokeWidth="1" />
      ))}
      {labels.map((l: string, i: number) => i % skip === 0 && (
        <text key={i} x={x(i)} y={H - 7} textAnchor="middle" fontSize="8.5" fill="currentColor" fillOpacity=".55">{l}</text>
      ))}
    </svg>
  )
}

function Donut({ items, total }: { items: { name: string; v: number; color: string }[]; total: number }) {
  const r = 52
  const c = 2 * Math.PI * r
  let acc = 0
  return (
    <div className="relative mx-auto" style={{ width: 150, height: 150 }}>
      <svg viewBox="0 0 150 150" width="150" height="150" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="75" cy="75" r={r} fill="none" stroke="currentColor" strokeOpacity=".08" strokeWidth="18" />
        {total > 0 && items.map(it => {
          const len = (it.v / total) * c
          const el = (
            <circle key={it.name} cx="75" cy="75" r={r} fill="none" stroke={it.color} strokeWidth="18"
              strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-acc} />
          )
          acc += len
          return el
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-[10px] text-gray-500">মোট আয়</p>
        <p className="font-bold text-sm">{compact(total)}</p>
      </div>
    </div>
  )
}

export default function Executive({ supabase, settings, member, onNav }: any) {
  const accent = settings?.theme_color || '#087a43'
  const role = member?.role || ''
  const [d, setD] = useState<any>(null)
  const [preset, setPreset] = useState('12')
  const [fund, setFund] = useState('all')
  const [selIdx, setSelIdx] = useState<number | null>(null)
  const [stamp, setStamp] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    setBusy(true)
    const [f, dn, ex, fe, pm, pr, nt, ap, at, dr, pu, fr, te]: any[] = await Promise.all([
      supabase.from('funds').select('id, name'),
      supabase.from('donations').select('amount, fund_id, member_id, donor_name, donated_on, created_at'),
      supabase.from('expenses').select('amount, fund_id, spent_on'),
      supabase.from('monthly_fees').select('member_id, year, month, amount, status, paid_on'),
      supabase.from('public_members').select('id, district, role, is_active, joined_at'),
      supabase.from('projects').select('goal, fund_id, status'),
      supabase.from('notices').select('id, title, kind, is_urgent, created_at').neq('kind', 'gallery')
        .order('created_at', { ascending: false }).limit(3),
      supabase.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('applications').select('id', { count: 'exact', head: true }),
      supabase.from('donation_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('public_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('field_reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('testimonials').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ])
    const errs = ([['তহবিল', f], ['অনুদান', dn], ['খরচ', ex], ['ফি', fe], ['সদস্য', pm]] as [string, any][])
      .filter(([, r]) => r.error).map(([n]) => n)
    setD({
      funds: f.data || [],
      don: dn.data || [],
      exp: ex.data || [],
      fees: fe.data || [],
      people: pm.data || [],
      projects: pr.data || [],
      notices: nt.data || [],
      apps: ap.error ? null : ap.count ?? 0,
      appsTotal: at.error ? null : at.count ?? 0,
      reqs: dr.error ? null : dr.count ?? 0,
      pub: pu.error ? null : pu.count ?? 0,
      reports: fr.error ? null : fr.count ?? 0,
      voices: te.error ? null : te.count ?? 0,
      errs,
    })
    setStamp(new Date().toISOString())
    setBusy(false)
  }
  useEffect(() => { load() }, [])

  const M = useMemo(() => {
    if (!d) return null
    const nd = new Date()
    const nowYM = ymOf(nd.getFullYear(), nd.getMonth() + 1)
    const generalId = d.funds.find((f: any) => (f.name || '').includes('সাধারণ'))?.id || d.funds[0]?.id
    const dateYM = (s: string) => {
      const t = (s || '').slice(0, 10)
      return t.length >= 7 ? ymStr(t) : NaN
    }

    const incAll: any[] = []
    d.don.forEach((x: any) => {
      const ym = dateYM(x.donated_on || x.created_at)
      if (!isNaN(ym)) incAll.push({ a: Number(x.amount), f: x.fund_id, ym, m: x.member_id, nm: x.donor_name })
    })
    d.fees.forEach((x: any) => {
      if (x.status !== 'paid') return
      const p = x.paid_on ? dateYM(x.paid_on) : NaN
      incAll.push({ a: Number(x.amount), f: generalId, ym: isNaN(p) ? ymOf(x.year, x.month) : p, m: x.member_id, nm: null, fee: true })
    })
    const expAll: any[] = []
    d.exp.forEach((x: any) => {
      const ym = dateYM(x.spent_on)
      if (!isNaN(ym)) expAll.push({ a: Number(x.amount), f: x.fund_id, ym })
    })

    const inF = incAll.filter(x => fund === 'all' || x.f === fund)
    const exF = expAll.filter(x => fund === 'all' || x.f === fund)
    const firstYM = Math.min(nowYM, ...inF.map(x => x.ym), ...exF.map(x => x.ym))

    let s = nowYM - 11
    if (preset === 'y') s = Math.floor(nowYM / 12) * 12
    else if (preset === 'all') s = firstYM
    else s = nowYM - Number(preset) + 1
    const e = nowYM
    const len = e - s + 1
    const ps = s - len
    const pe = s - 1
    const hasPrev = preset !== 'all'

    const rangeSum = (list: any[], a: number, b: number) => list.reduce((t, x) => (x.ym >= a && x.ym <= b ? t + x.a : t), 0)
    const income = rangeSum(inF, s, e)
    const expense = rangeSum(exF, s, e)
    const pIncome = hasPrev ? rangeSum(inF, ps, pe) : null
    const pExpense = hasPrev ? rangeSum(exF, ps, pe) : null

    const mStart = Math.max(s, e - 23)
    const months = Array.from({ length: e - mStart + 1 }, (_, i) => mStart + i)
    const byMonth = (list: any[]) => months.map(ym => list.reduce((t, x) => (x.ym === ym ? t + x.a : t), 0))
    const incM = byMonth(inF)
    const expM = byMonth(exF)
    const prevYM = months.map(ym => inF.reduce((t, x) => (x.ym === ym - 12 ? t + x.a : t), 0))
    const cum = months.map(ym =>
      inF.reduce((t, x) => (x.ym <= ym ? t + x.a : t), 0) - exF.reduce((t, x) => (x.ym <= ym ? t + x.a : t), 0))
    const balance = inF.reduce((t, x) => t + x.a, 0) - exF.reduce((t, x) => t + x.a, 0)
    const net = income - expense

    const act = d.people.filter((p: any) => p.is_active !== false)
    const joinYM = (p: any) => (p.joined_at ? ymStr(String(p.joined_at).slice(0, 10)) : -Infinity)
    const memAt = (ym: number) => act.filter((p: any) => joinYM(p) <= ym).length
    const memM = months.map(memAt)
    const newIn = (a: number, b: number) => act.filter((p: any) => joinYM(p) >= a && joinYM(p) <= b).length
    const paidSet = (ym: number) =>
      new Set(d.fees.filter((f: any) => f.status === 'paid' && ymOf(f.year, f.month) === ym).map((f: any) => f.member_id))
    const rateAt = (ym: number) => {
      const ids = paidSet(ym)
      const c = act.filter((p: any) => ids.has(p.id)).length
      return Math.round((c / Math.max(1, memAt(ym))) * 100)
    }
    const rateM = months.map(rateAt)
    const paidNow = paidSet(nowYM)
    const paidNowN = act.filter((p: any) => paidNow.has(p.id)).length
    const duesN = Math.max(0, act.length - paidNowN)

    const rate = rateM[rateM.length - 1] ?? 0
    const ratePrev = rateM.length > 1 ? rateM[rateM.length - 2] : null

    const inRange = (list: any[], a: number, b: number) => list.filter(x => x.ym >= a && x.ym <= b)
    const donCur = inRange(inF.filter(x => !x.fee), s, e)
    const donPrev = hasPrev ? inRange(inF.filter(x => !x.fee), ps, pe) : []
    const avgDon = donCur.length ? sumA(donCur.map(x => x.a)) / donCur.length : 0
    const avgDonP = hasPrev && donPrev.length ? sumA(donPrev.map(x => x.a)) / donPrev.length : null
    const donorsOf = (l: any[]) => new Set(l.map(x => x.m || 'n:' + (x.nm || '?'))).size
    const donors = donorsOf(donCur)
    const donorsP = hasPrev ? donorsOf(donPrev) : null
    const newM = newIn(s, e)
    const newP = hasPrev ? newIn(ps, pe) : null
    const avgInc = income / len
    const avgIncP = pIncome === null ? null : pIncome / len
    const ratio = income > 0 ? (expense / income) * 100 : 0
    const ratioP = pIncome && pIncome > 0 && pExpense !== null ? (pExpense / pIncome) * 100 : null

    const fundName = (id: string) => d.funds.find((f: any) => f.id === id)?.name || 'অন্যান্য'
    const byFund: Record<string, number> = {}
    inRange(inF, s, e).forEach(x => { byFund[x.f] = (byFund[x.f] || 0) + x.a })
    const donut = Object.entries(byFund).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1])
      .map(([id, v], i) => ({ name: fundName(id), v, color: PAL[i % PAL.length] }))

    const allIn: Record<string, number> = {}
    const allEx: Record<string, number> = {}
    incAll.forEach(x => { allIn[x.f] = (allIn[x.f] || 0) + x.a })
    expAll.forEach(x => { allEx[x.f] = (allEx[x.f] || 0) + x.a })
    const over = d.funds.filter((f: any) => (allEx[f.id] || 0) > (allIn[f.id] || 0))

    const donorIds = new Set(d.don.map((x: any) => x.member_id).filter(Boolean))
    const last3 = [nowYM, nowYM - 1, nowYM - 2].map(paidSet)
    const regular = act.filter((p: any) => last3.every(st => st.has(p.id))).length
    const funnel: [string, number][] = []
    if (d.appsTotal !== null && d.appsTotal >= act.length) funnel.push(['আবেদন জমা', d.appsTotal])
    funnel.push(['সক্রিয় সদস্য', act.length])
    funnel.push(['এ মাসে ফি দিয়েছেন', paidNowN])
    funnel.push(['দান করেছেন (একবার বা বেশি)', act.filter((p: any) => donorIds.has(p.id)).length])
    funnel.push(['নিয়মিত (শেষ ৩ মাস ফি)', regular])

    const dist: Record<string, number> = {}
    act.forEach((p: any) => {
      const k = (p.district || '').trim() || 'অজানা'
      dist[k] = (dist[k] || 0) + 1
    })
    const districts = Object.entries(dist).sort((a, b) => b[1] - a[1]).slice(0, 5)

    const goal = d.projects.filter((p: any) => p.status === 'active').reduce((t: number, p: any) => t + Number(p.goal || 0), 0)
    const pFunds = Array.from(new Set(d.projects.filter((p: any) => p.status === 'active' && p.fund_id).map((p: any) => p.fund_id)))
    const collected = pFunds.reduce((t: number, id: any) =>
      t + d.don.filter((x: any) => x.fund_id === id).reduce((u: number, x: any) => u + Number(x.amount), 0), 0)

    const insights: string[] = []
    const c1 = chg(income, pIncome)
    if (c1 !== null) insights.push('এই সময়ে আয় আগের সমান সময়ের চেয়ে ' + toBn(Math.abs(c1).toFixed(1)) + '% ' + (c1 >= 0 ? 'বেশি' : 'কম') + '।')
    if (donut.length && income > 0) insights.push('সবচেয়ে বেশি আয় এসেছে "' + donut[0].name + '" খাত থেকে (' + toBn(Math.round((donut[0].v / income) * 100)) + '%)।')
    const bi = incM.indexOf(Math.max(...incM))
    if (incM.length && incM[bi] > 0) insights.push('সর্বোচ্চ মাসিক আয় ' + ymFull(months[bi]) + ' মাসে (' + compact(incM[bi]) + ')।')
    insights.push('এ মাসে ' + toBn(rate) + '% সদস্য ফি দিয়েছেন, ' + bn(duesN) + ' জনের ফি বাকি।')
    if (income > 0) insights.push('প্রতি ১০০ টাকা আয়ে ' + toBn(Math.round(ratio)) + ' টাকা খরচ হয়েছে।')

    return {
      nowYM, s, e, hasPrev, months, labels: months.map(ymLabel),
      income, expense, pIncome, pExpense, balance, net, incM, expM, prevYM, cum,
      act, memM, rateM, rate, ratePrev, paidNowN, duesN, newM, newP,
      avgDon, avgDonP, donors, donorsP, avgInc, avgIncP, ratio, ratioP,
      donut, over, funnel, districts, goal, collected, insights,
    }
  }, [d, preset, fund])

  if (!d || !M) return <p className="text-center text-sm text-gray-500 py-10">ড্যাশবোর্ড লোড হচ্ছে...</p>

  const has = (...r: string[]) => r.includes(role)
  const alerts: { tone: string; text: string; tab: string }[] = []
  if (has('admin', 'cashier') && d.reqs) alerts.push({ tone: '#d97706', text: bn(d.reqs) + 'টি অনুদানের তথ্য যাচাইয়ের অপেক্ষায়', tab: 'finance' })
  if (has('admin') && d.apps) alerts.push({ tone: '#2563eb', text: bn(d.apps) + 'টি নতুন সদস্য আবেদন', tab: 'admin' })
  if (has('admin', 'health', 'president', 'general_secretary') && d.pub) {
    alerts.push({ tone: '#dc2626', text: bn(d.pub) + 'টি জনসাধারণের আবেদন বাকি', tab: role === 'health' ? 'blood' : role === 'admin' ? 'admin' : 'volunteers' })
  }
  if (has('admin', 'president', 'general_secretary') && d.reports) alerts.push({ tone: '#d97706', text: bn(d.reports) + 'টি কাজের রিপোর্ট যাচাই বাকি', tab: 'works' })
  if (has('admin', 'president', 'publicity') && d.voices) alerts.push({ tone: '#2563eb', text: bn(d.voices) + 'টি মতামত যাচাই বাকি', tab: role === 'admin' ? 'admin' : 'voices' })
  if (M.duesN > 0) alerts.push({ tone: '#d97706', text: bn(M.duesN) + ' জন সদস্যের এ মাসের ফি বাকি', tab: 'members' })
  M.over.forEach((f: any) => alerts.push({ tone: '#dc2626', text: '"' + f.name + '" খাতে ব্যয় আয়ের চেয়ে বেশি', tab: 'ledger' }))

  const last = M.months.length - 1
  const sel = selIdx !== null && selIdx <= last ? selIdx : last
  const goalPct = M.goal > 0 ? Math.min(100, Math.round((M.collected / M.goal) * 100)) : 0
  const firstFun = M.funnel[0][1] || 1

  const rows: [string, string, string, number | null, 'good' | 'bad'][] = [
    ['গড় দানের পরিমাণ', taka(M.avgDon), M.avgDonP === null ? '—' : taka(M.avgDonP), chg(M.avgDon, M.avgDonP), 'good'],
    ['দানকারীর সংখ্যা', bn(M.donors), M.donorsP === null ? '—' : bn(M.donorsP), chg(M.donors, M.donorsP), 'good'],
    ['নতুন সদস্য', bn(M.newM), M.newP === null ? '—' : bn(M.newP), chg(M.newM, M.newP), 'good'],
    ['গড় মাসিক আয়', compact(M.avgInc), M.avgIncP === null ? '—' : compact(M.avgIncP), chg(M.avgInc, M.avgIncP), 'good'],
    ['ব্যয়ের অনুপাত', toBn(Math.round(M.ratio)) + '%', M.ratioP === null ? '—' : toBn(Math.round(M.ratioP)) + '%', M.ratioP === null ? null : M.ratio - M.ratioP, 'bad'],
  ]

  function exportCsv() {
    const out: (string | number)[][] = [['মাস', 'আয়', 'ব্যয়', 'নিট', 'সদস্য', 'ফি আদায় %']]
    M!.months.forEach((ym, i) => {
      out.push([Math.floor(ym / 12) + '-' + String((ym % 12) + 1).padStart(2, '0'), M!.incM[i], M!.expM[i], M!.incM[i] - M!.expM[i], M!.memM[i], M!.rateM[i]])
    })
    const csv = '\uFEFF' + out.map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    a.download = 'dashboard-report.csv'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  const fundSel = (
    <select className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs bg-white" value={fund}
      onChange={e => setFund(e.target.value)}>
      <option value="all">সব খাত</option>
      {d.funds.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
    </select>
  )

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          সম্মিলিত ড্যাশবোর্ড
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <circle cx="12" cy="12" r="10" fill="#2563eb" />
            <path d="m7.5 12.3 3 3 6-6.3" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </h2>
        <p className="text-xs text-gray-500">আয়-ব্যয়, সদস্য ও কাজের সর্বশেষ চিত্র</p>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {PRESETS.map(([k, l]) => (
            <button key={k} onClick={() => { setPreset(k); setSelIdx(null) }}
              className={'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ' + (preset === k ? 'text-white' : 'bg-white border')}
              style={preset === k ? { background: accent } : undefined}>
              {l}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {fundSel}
          <button onClick={load} disabled={busy}
            className="border rounded-lg px-3 py-1.5 text-xs font-semibold bg-white disabled:opacity-50">
            {busy ? '...' : '↻ রিফ্রেশ'}
          </button>
          <button onClick={exportCsv} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white" style={{ background: accent }}>
            রিপোর্ট ডাউনলোড
          </button>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollSnapType: 'x mandatory' }}>
        <Kpi label="মোট আয়" value={compact(M.income)} color="#2563eb" vals={M.incM}
          badge={<Delta v={chg(M.income, M.pIncome)} />} sub="অনুদান ও মাসিক ফি" />
        <Kpi label="মোট ব্যয়" value={compact(M.expense)} color="#f59e0b" vals={M.expM}
          badge={<Delta v={chg(M.expense, M.pExpense)} up="bad" />} sub="ভাউচারসহ খরচ" />
        <Kpi label="বর্তমান উদ্বৃত্ত" value={compact(M.balance)} color="#16a34a" vals={M.cum}
          badge={<span className="text-[11px] font-bold" style={{ color: M.net >= 0 ? '#15803d' : '#b91c1c' }}>
            {M.net >= 0 ? '+' : '−'}{compact(Math.abs(M.net))}</span>} sub="এই সময়ের নিট" />
        <Kpi label="সক্রিয় সদস্য" value={bn(M.act.length) + ' জন'} color="#7c3aed" vals={M.memM}
          badge={<span className="rounded-md px-1.5 py-0.5 text-[11px] font-bold" style={{ background: '#ede9fe', color: '#6d28d9' }}>
            +{bn(M.newM)} নতুন</span>} sub="এই সময়ে যোগ দিয়েছেন" />
        <Kpi label="এ মাসের ফি আদায়" value={toBn(M.rate) + '%'} color="#0891b2" vals={M.rateM}
          badge={<Delta v={M.ratePrev === null ? null : M.rate - M.ratePrev} suffix=" পয়েন্ট" />}
          sub={bn(M.paidNowN) + ' জন দিয়েছেন'} />
      </div>

      <div className="rounded-2xl p-4 text-white space-y-2" style={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f)' }}>
        <p className="text-[11px] tracking-wide opacity-70">কৌশলগত লক্ষ্য · চলমান প্রকল্প</p>
        {M.goal > 0 ? (
          <>
            <p className="text-sm">
              মোট লক্ষ্য <b>{compact(M.goal)}</b> · সংগৃহীত <b>{compact(M.collected)}</b>
            </p>
            <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,.18)' }}>
              <div className="h-full rounded-full" style={{ width: goalPct + '%', background: 'linear-gradient(90deg,#38bdf8,#22c55e)' }} />
            </div>
            <p className="text-xs opacity-80">{toBn(goalPct)}% সম্পন্ন · বাকি {compact(Math.max(0, M.goal - M.collected))}</p>
          </>
        ) : (
          <p className="text-sm opacity-80">লক্ষ্যমাত্রাসহ কোনো চলমান প্রকল্প নেই।</p>
        )}
        <button className="text-xs font-semibold underline" onClick={() => onNav('projects')}>প্রকল্পগুলো দেখুন ›</button>
      </div>

      <Card title="মাসিক আয় বনাম ব্যয়"
        right={<button className="text-xs font-semibold underline" style={{ color: accent }} onClick={() => onNav('finance')}>বিস্তারিত ›</button>}>
        <div className="rounded-xl px-3 py-2 text-xs flex flex-wrap gap-x-4 gap-y-1" style={{ background: 'rgba(100,116,139,.1)' }}>
          <b>{ymFull(M.months[sel])}</b>
          <span style={{ color: '#2563eb' }}>আয় {taka(M.incM[sel])}</span>
          <span className="text-gray-500">গত বছর {taka(M.prevYM[sel])}</span>
          <span style={{ color: '#d97706' }}>ব্যয় {taka(M.expM[sel])}</span>
        </div>
        <BarChart labels={M.labels} a={M.incM} b={M.prevYM} line={M.expM} sel={sel} onSel={setSelIdx} accent={accent} />
        <div className="flex flex-wrap gap-3 text-[11px] text-gray-500">
          <span className="flex items-center gap-1"><i className="w-3 h-3 rounded-sm" style={{ background: '#2563eb' }} /> আয়</span>
          <span className="flex items-center gap-1"><i className="w-3 h-3 rounded-sm" style={{ background: '#93c5fd' }} /> গত বছরের আয়</span>
          <span className="flex items-center gap-1"><i className="w-3 h-1 rounded-sm" style={{ background: '#f59e0b' }} /> ব্যয়</span>
        </div>
      </Card>

      <Card title="সদস্য বৃদ্ধি ও ফি আদায়">
        <GrowthChart labels={M.labels} mem={M.memM} rate={M.rateM} accent={accent} />
        <div className="flex flex-wrap gap-3 text-[11px] text-gray-500">
          <span className="flex items-center gap-1"><i className="w-3 h-3 rounded-sm" style={{ background: accent }} /> সদস্য সংখ্যা (বামে)</span>
          <span className="flex items-center gap-1"><i className="w-3 h-1 rounded-sm" style={{ background: '#10b981' }} /> ফি আদায় % (ডানে)</span>
        </div>
      </Card>

      <Card title="খাত অনুযায়ী আয়">
        {M.donut.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">এই সময়ে কোনো আয় নেই</p>
        ) : (
          <>
            <Donut items={M.donut} total={M.income} />
            <div className="space-y-1.5">
              {M.donut.map(it => (
                <div key={it.name} className="flex items-center gap-2 text-sm">
                  <i className="w-3 h-3 rounded-sm shrink-0" style={{ background: it.color }} />
                  <span className="flex-1 truncate">{it.name}</span>
                  <b>{compact(it.v)}</b>
                  <span className="text-xs text-gray-500 w-10 text-right">{toBn(Math.round((it.v / (M.income || 1)) * 100))}%</span>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      <Card title="সদস্য সম্পৃক্ততার ধাপ">
        <div className="space-y-2">
          {M.funnel.map(([l, v], i) => (
            <div key={l}>
              <div className="flex justify-between text-xs mb-0.5">
                <span>{l}</span>
                <b>{bn(v)} <span className="font-normal text-gray-500">({toBn(Math.round((v / firstFun) * 100))}%)</span></b>
              </div>
              <div className="h-5 rounded-md" style={{ background: 'rgba(100,116,139,.12)' }}>
                <div className="h-full rounded-md" style={{
                  width: Math.max(2, (v / firstFun) * 100) + '%',
                  background: ['#2563eb', '#3b82f6', '#60a5fa', '#f59e0b', '#16a34a'][i % 5],
                }} />
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-gray-400">"আবেদন জমা" ধাপ শুধু অ্যাডমিনের অ্যাক্সেসে আসে।</p>
      </Card>

      <Card title="জেলা অনুযায়ী সদস্য">
        {M.districts.length === 0 && <p className="text-sm text-gray-500">কোনো তথ্য নেই</p>}
        {M.districts.map(([name, n]) => (
          <div key={name} className="flex items-center gap-2 text-sm">
            <span className="w-20 truncate">{name}</span>
            <div className="flex-1 h-3 rounded-full" style={{ background: 'rgba(100,116,139,.12)' }}>
              <div className="h-full rounded-full" style={{ width: (n / M.act.length) * 100 + '%', background: accent }} />
            </div>
            <b className="w-8 text-right">{bn(n)}</b>
            <span className="text-xs text-gray-500 w-10 text-right">{toBn(Math.round((n / M.act.length) * 100))}%</span>
          </div>
        ))}
      </Card>

      <Card title="মূল সূচক">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 320 }}>
            <thead>
              <tr className="text-xs text-gray-500 text-left">
                <th className="py-1 font-medium">সূচক</th>
                <th className="font-medium">এখন</th>
                <th className="font-medium">আগের সময়</th>
                <th className="font-medium">পরিবর্তন</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([l, now, prev, c, up]) => (
                <tr key={l} className="border-t">
                  <td className="py-2 pr-2">{l}</td>
                  <td className="font-bold whitespace-nowrap">{now}</td>
                  <td className="text-gray-500 whitespace-nowrap">{prev}</td>
                  <td><Delta v={c} up={up} suffix={l === 'ব্যয়ের অনুপাত' ? ' পয়েন্ট' : '%'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!M.hasPrev && <p className="text-[11px] text-gray-400">"সব" বাছলে আগের সময়ের তুলনা হয় না।</p>}
      </Card>

      <Card title="সর্বশেষ ঘোষণা" right={<button className="text-xs font-semibold underline" style={{ color: accent }} onClick={() => onNav('notices')}>সব ›</button>}>
        {d.notices.length === 0 && <p className="text-sm text-gray-500">কোনো ঘোষণা নেই</p>}
        {d.notices.map((n: any) => (
          <div key={n.id} className="border-t first:border-t-0 pt-2 first:pt-0">
            <p className="text-sm font-semibold">{n.is_urgent && 'জরুরি: '}{n.title}</p>
            <p className="text-[11px] text-gray-400">{fmtDT(n.created_at)}</p>
          </div>
        ))}
      </Card>

      <Card title="সক্রিয় সতর্কতা"
        right={alerts.length > 0 ? (
          <span className="rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ background: '#dc2626' }}>{bn(alerts.length)}</span>
        ) : undefined}>
        {alerts.length === 0 && <p className="text-sm text-gray-500">এখন কোনো সতর্কতা নেই</p>}
        {alerts.map((a, i) => (
          <button key={i} onClick={() => onNav(a.tab)}
            className="w-full flex items-center gap-2 text-left text-sm border-t first:border-t-0 pt-2 first:pt-0">
            <i className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: a.tone }} />
            <span className="flex-1">{a.text}</span>
            <span className="text-gray-400">›</span>
          </button>
        ))}
      </Card>

      <Card title="ডেটা অবস্থা">
        <div className="text-sm space-y-1">
          <p className="flex items-center gap-2">
            <i className="w-2.5 h-2.5 rounded-full" style={{ background: d.errs.length ? '#dc2626' : '#16a34a' }} />
            {d.errs.length ? 'লোড হয়নি: ' + d.errs.join(', ') : 'সব তথ্য ঠিকভাবে লোড হয়েছে'}
          </p>
          <p className="text-xs text-gray-500">
            অনুদান {bn(d.don.length)} · খরচ {bn(d.exp.length)} · ফি {bn(d.fees.length)} · সদস্য {bn(d.people.length)}
          </p>
          <p className="text-xs text-gray-400">সর্বশেষ আপডেট: {stamp && fmtDT(stamp)}</p>
        </div>
      </Card>

      <Card title="সংক্ষিপ্ত বিশ্লেষণ">
        <ul className="space-y-2 text-sm">
          {M.insights.map((t, i) => (
            <li key={i} className="flex gap-2">
              <span style={{ color: accent }}>●</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
        <p className="text-[11px] text-gray-400">এই বাক্যগুলো উপরের সংখ্যা থেকে নিজে তৈরি হয়, কেউ হাতে লেখেননি।</p>
      </Card>
    </div>
  )
}
