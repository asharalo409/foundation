import { useEffect, useState } from 'react'

const toBn = (s: string | number) => String(s).replace(/\d/g, x => '০১২৩৪৫৬৭৮৯'[Number(x)])
const compact = (n: number) => {
  const a = Math.abs(n)
  const sg = n < 0 ? '−' : ''
  const f = (x: number) => toBn(Number(x.toFixed(1)))
  if (a >= 1e7) return sg + '৳' + f(a / 1e7) + ' কোটি'
  if (a >= 1e5) return sg + '৳' + f(a / 1e5) + ' লাখ'
  if (a >= 1e3) return sg + '৳' + f(a / 1e3) + ' হাজার'
  return sg + '৳' + toBn(Math.round(a))
}
const MON = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রি', 'মে', 'জুন', 'জুলা', 'আগ', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে']
const ymOf = (y: number, m: number) => y * 12 + (m - 1)
const ymS = (s: string) => {
  const t = (s || '').slice(0, 10)
  return t.length >= 7 ? ymOf(Number(t.slice(0, 4)), Number(t.slice(5, 7))) : NaN
}
const pct = (a: number, b: number) => (b > 0 ? ((a - b) / b) * 100 : null)

function Delta({ v, bad }: { v: number | null; bad?: boolean }) {
  if (v === null || !isFinite(v)) return <span className="text-[11px] text-gray-400">—</span>
  const up = v > 0.05
  const down = v < -0.05
  const good = bad ? down : up
  const worse = bad ? up : down
  return (
    <span className="rounded-md px-1.5 py-0.5 text-[10px] font-bold whitespace-nowrap"
      style={{ background: good ? '#dcfce7' : worse ? '#fee2e2' : '#f1f5f9', color: good ? '#15803d' : worse ? '#b91c1c' : '#64748b' }}>
      {up ? '▲' : down ? '▼' : '–'} {toBn(Math.abs(v).toFixed(0))}%
    </span>
  )
}

export default function FinanceHead({ supabase, settings }: any) {
  const accent = settings?.theme_color || '#087a43'
  const [d, setD] = useState<any>(null)

  useEffect(() => {
    Promise.all([
      supabase.from('donations').select('amount, fund_id, donated_on, created_at'),
      supabase.from('expenses').select('amount, fund_id, spent_on'),
      supabase.from('monthly_fees').select('amount, year, month, status, paid_on'),
      supabase.from('funds').select('id, name'),
    ]).then(([a, b, c, f]: any) => setD({
      don: a.data || [],
      exp: b.data || [],
      fees: (c.data || []).filter((x: any) => x.status === 'paid'),
      funds: f.data || [],
    }))
  }, [])

  if (!d) return null

  const now = new Date()
  const nowYM = ymOf(now.getFullYear(), now.getMonth() + 1)
  const generalId = d.funds.find((f: any) => (f.name || '').includes('সাধারণ'))?.id || d.funds[0]?.id

  const inc: { a: number; ym: number; f: string }[] = []
  d.don.forEach((x: any) => {
    const ym = ymS(x.donated_on || x.created_at)
    if (!isNaN(ym)) inc.push({ a: Number(x.amount), ym, f: x.fund_id })
  })
  d.fees.forEach((x: any) => {
    const p = x.paid_on ? ymS(x.paid_on) : NaN
    inc.push({ a: Number(x.amount), ym: isNaN(p) ? ymOf(x.year, x.month) : p, f: generalId })
  })
  const out: { a: number; ym: number; f: string }[] = []
  d.exp.forEach((x: any) => {
    const ym = ymS(x.spent_on)
    if (!isNaN(ym)) out.push({ a: Number(x.amount), ym, f: x.fund_id })
  })

  const months = Array.from({ length: 6 }, (_, i) => nowYM - 5 + i)
  const at = (l: typeof inc, ym: number) => l.reduce((t, x) => (x.ym === ym ? t + x.a : t), 0)
  const incM = months.map(m => at(inc, m))
  const outM = months.map(m => at(out, m))
  const balance = inc.reduce((t, x) => t + x.a, 0) - out.reduce((t, x) => t + x.a, 0)
  const cum = months.map(m =>
    inc.reduce((t, x) => (x.ym <= m ? t + x.a : t), 0) - out.reduce((t, x) => (x.ym <= m ? t + x.a : t), 0))

  const iNow = incM[5]
  const oNow = outM[5]

  const mx = Math.max(1, ...incM, ...outM)
  const W = 320
  const H = 110
  const cw = W / 6
  const bw = 13

  const byFund: Record<string, { i: number; o: number }> = {}
  inc.forEach(x => { (byFund[x.f] = byFund[x.f] || { i: 0, o: 0 }).i += x.a })
  out.forEach(x => { (byFund[x.f] = byFund[x.f] || { i: 0, o: 0 }).o += x.a })
  const rows = Object.entries(byFund).sort((a, b) => b[1].i - a[1].i).slice(0, 4)
  const rmax = Math.max(1, ...rows.map(([, v]) => Math.max(v.i, v.o)))
  const fname = (id: string) => d.funds.find((f: any) => f.id === id)?.name || 'অন্যান্য'

  const spark = (vals: number[], color: string) => {
    const mn = Math.min(...vals)
    const rg = Math.max(...vals) - mn || 1
    const pts = vals.map((v, i) => `${(i / 5) * 60},${24 - ((v - mn) / rg) * 20}`).join(' ')
    return (
      <svg viewBox="0 0 60 26" width="60" height="26">
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  const kpi = (label: string, v: string, color: string, vals: number[], delta: any) => (
    <div className="rounded-2xl p-3 bg-white shadow-sm flex-1 min-w-0" style={{ borderTop: `3px solid ${color}` }}>
      <p className="text-[10px] text-gray-500 truncate">{label}</p>
      <p className="font-bold text-sm leading-tight mt-0.5 truncate" style={{ color }}>{v}</p>
      <div className="flex items-center justify-between mt-1">{delta}{spark(vals, color)}</div>
    </div>
  )

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {kpi('এ মাসের আয়', compact(iNow), '#2563eb', incM, <Delta v={pct(iNow, incM[4])} />)}
        {kpi('এ মাসের ব্যয়', compact(oNow), '#f59e0b', outM, <Delta v={pct(oNow, outM[4])} bad />)}
        {kpi('মোট উদ্বৃত্ত', compact(balance), '#16a34a', cum, <span className="text-[10px] text-gray-400">সর্বমোট</span>)}
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
        <p className="font-bold text-sm">শেষ ৬ মাসের আয় বনাম ব্যয়</p>
        <svg viewBox={`0 0 ${W} ${H + 18}`} className="w-full">
          {months.map((ym, i) => {
            const x = cw * i + cw / 2
            const hi = (incM[i] / mx) * H
            const ho = (outM[i] / mx) * H
            return (
              <g key={ym}>
                <rect x={x - bw - 1} y={H - hi} width={bw} height={hi} rx="3" fill="#2563eb" />
                <rect x={x + 1} y={H - ho} width={bw} height={ho} rx="3" fill="#f59e0b" />
                <text x={x} y={H + 13} textAnchor="middle" fontSize="9" fill="currentColor" fillOpacity=".55">{MON[ym % 12]}</text>
              </g>
            )
          })}
        </svg>
        <div className="flex gap-4 text-[11px] text-gray-500">
          <span className="flex items-center gap-1"><i className="w-3 h-3 rounded-sm" style={{ background: '#2563eb' }} /> আয়</span>
          <span className="flex items-center gap-1"><i className="w-3 h-3 rounded-sm" style={{ background: '#f59e0b' }} /> ব্যয়</span>
        </div>
      </div>

      {rows.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <p className="font-bold text-sm">খাত অনুযায়ী আয় ও ব্যয় (সর্বমোট)</p>
          {rows.map(([id, v]) => (
            <div key={id} className="space-y-1">
              <div className="flex justify-between text-xs">
                <b className="truncate pr-2">{fname(id)}</b>
                <span style={{ color: v.i - v.o >= 0 ? '#15803d' : '#b91c1c' }} className="font-bold whitespace-nowrap">
                  উদ্বৃত্ত {compact(v.i - v.o)}
                </span>
              </div>
              <div className="h-2 rounded-full" style={{ background: 'rgba(100,116,139,.12)' }}>
                <div className="h-full rounded-full" style={{ width: (v.i / rmax) * 100 + '%', background: accent }} />
              </div>
              <div className="h-2 rounded-full" style={{ background: 'rgba(100,116,139,.12)' }}>
                <div className="h-full rounded-full" style={{ width: (v.o / rmax) * 100 + '%', background: '#f59e0b' }} />
              </div>
            </div>
          ))}
          <p className="text-[11px] text-gray-400">উপরের বার আয়, নিচের বার ব্যয়।</p>
        </div>
      )}
    </div>
  )
}
