import { useEffect, useState } from 'react'
import { fmtDT } from './time'

const bn = (n: number) => Number(n).toLocaleString('bn-BD')
const MONTHS = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রি', 'মে', 'জুন', 'জুলা', 'আগ', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে']
const PAL = ['#5e35b1', '#1e88e5', '#90caf9', '#b39ddb', '#26a69a', '#ffb300', '#ef5350', '#8d6e63']
const sum = (a: any[]) => a.reduce((t, x) => t + Number(x.amount), 0)
const yearOf = (s: string) => Number(s.slice(0, 4))
const monthOf = (s: string) => Number(s.slice(5, 7))
const taka = (n: number) => '৳' + Math.round(n).toLocaleString('bn-BD')

const compact = (n: number) => {
  const a = Math.abs(n)
  const f = (x: number) => bn(Number(x.toFixed(2)))
  if (a >= 1e7) return '৳' + f(n / 1e7) + ' কোটি'
  if (a >= 1e5) return '৳' + f(n / 1e5) + ' লাখ'
  return taka(n)
}
const axis = (n: number) => {
  if (n >= 1e5) return bn(Number((n / 1e5).toFixed(1))) + 'ল'
  if (n >= 1e3) return bn(Number((n / 1e3).toFixed(1))) + 'হা'
  return bn(n)
}

function Spark({ vals, fill }: { vals: number[]; fill?: boolean }) {
  const W = 100
  const H = 36
  const max = Math.max(1, ...vals)
  const pts = vals.map((v, i) => [(i / (vals.length - 1)) * W, H - 3 - (v / max) * (H - 8)])
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
      {fill && <path d={d + ` L${W} ${H} L0 ${H} Z`} fill="currentColor" opacity=".2" />}
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

function Ava({ src, name, size = 36 }: { src?: string; name?: string; size?: number }) {
  const st: any = { width: size, height: size, fontSize: size * 0.4 }
  return src ? (
    <img src={src} style={st} className="rounded-full object-cover shrink-0" />
  ) : (
    <span style={{ ...st, background: '#cbd5e1', color: '#334155' }}
      className="rounded-full font-semibold flex items-center justify-center shrink-0">
      {(name || '?').slice(0, 1)}
    </span>
  )
}

function BigCard({ bg, icon, value, label, vals }: any) {
  return (
    <div className="relative overflow-hidden rounded-2xl p-4 text-white min-h-[150px]" style={{ background: bg }}>
      <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full" style={{ background: 'rgba(255,255,255,.12)' }} />
      <div className="absolute -top-16 right-8 w-36 h-36 rounded-full" style={{ background: 'rgba(255,255,255,.08)' }} />
      <div className="relative">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: 'rgba(255,255,255,.22)' }}>{icon}</div>
        <p className="text-xl font-bold mt-3 leading-tight">{value}</p>
        <p className="text-xs opacity-85">{label}</p>
      </div>
      <div className="absolute bottom-2 right-3 w-24 h-9 text-white">
        <Spark vals={vals} />
      </div>
    </div>
  )
}

export default function Overview({ supabase, onNav }: any) {
  const thisYear = new Date().getFullYear()
  const [funds, setFunds] = useState<any[]>([])
  const [don, setDon] = useState<any[]>([])
  const [exp, setExp] = useState<any[]>([])
  const [fees, setFees] = useState<any[]>([])
  const [people, setPeople] = useState<any[]>([])
  const [year, setYear] = useState(thisYear)
  const [mode, setMode] = useState<'in' | 'out'>('in')

  useEffect(() => {
    Promise.all([
      supabase.from('funds').select('*').order('created_at'),
      supabase.from('donations').select('*'),
      supabase.from('expenses').select('*'),
      supabase.from('monthly_fees').select('*'),
      supabase.from('public_members').select('id, full_name, photo_url'),
    ]).then(([f, d, e, fe, p]: any) => {
      setFunds(f.data || [])
      setDon(d.data || [])
      setExp(e.data || [])
      setFees((fe.data || []).filter((x: any) => x.status === 'paid'))
      setPeople(p.data || [])
    })
  }, [])

  const generalId = funds.find(f => f.name.includes('সাধারণ'))?.id || funds[0]?.id
  const dDate = (d: any) => d.donated_on || d.created_at.slice(0, 10)

  const incomes = [
    ...don.map(d => ({ amount: d.amount, fund_id: d.fund_id, date: dDate(d) })),
    ...fees.map(f => ({
      amount: f.amount,
      fund_id: generalId,
      date: f.paid_on || f.year + '-' + String(f.month).padStart(2, '0') + '-01',
    })),
  ]
  const outs = exp.map(x => ({ amount: x.amount, fund_id: x.fund_id, date: x.spent_on }))

  const years = Array.from(new Set([
    thisYear, ...incomes.map(x => yearOf(x.date)), ...outs.map(x => yearOf(x.date)),
  ])).sort((a, b) => b - a)

  const monthly = (list: any[]) =>
    Array.from({ length: 12 }, (_, i) => {
      const o: Record<string, number> = {}
      list.filter(x => yearOf(x.date) === year && monthOf(x.date) === i + 1)
        .forEach(x => { o[x.fund_id] = (o[x.fund_id] || 0) + Number(x.amount) })
      return o
    })
  const tot = (o: Record<string, number>) => Object.values(o).reduce((a, b) => a + b, 0)

  const inM = monthly(incomes)
  const outM = monthly(outs)
  const data = mode === 'in' ? inM : outM
  const totals = data.map(tot)
  const max = Math.max(1, ...totals)

  const raw = max / 4
  const p10 = Math.pow(10, Math.floor(Math.log10(raw)))
  const fr = raw / p10
  const step = (fr <= 1 ? 1 : fr <= 2 ? 2 : fr <= 5 ? 5 : 10) * p10
  const topV = Math.max(step, Math.ceil(max / step) * step)
  const ticks = Array.from({ length: Math.round(topV / step) + 1 }, (_, i) => i * step)

  const colorOf: Record<string, string> = {}
  funds.forEach((f, i) => { colorOf[f.id] = PAL[i % PAL.length] })

  const totalIn = sum(incomes)
  const totalOut = sum(outs)

  const now = Date.now()
  const D30 = 30 * 86400000
  const dm: Record<string, any> = {}
  don.forEach(d => {
    const key = d.member_id || 'n:' + (d.donor_name || 'নামহীন দাতা')
    const ts = new Date(dDate(d)).getTime()
    const r = dm[key] || (dm[key] = {
      key, member_id: d.member_id, name: d.donor_name || 'নামহীন দাতা', total: 0, count: 0, l30: 0, p30: 0,
    })
    r.total += Number(d.amount)
    r.count += 1
    if (now - ts <= D30) r.l30 += Number(d.amount)
    else if (now - ts <= 2 * D30) r.p30 += Number(d.amount)
  })
  const top: any[] = Object.values(dm).sort((a: any, b: any) => b.total - a.total).slice(0, 5)
  const allDon = sum(don) || 1
  const donMonthly = Array.from({ length: 12 }, (_, i) =>
    sum(don.filter(d => yearOf(dDate(d)) === year && monthOf(dDate(d)) === i + 1)))
  const recent = [...don].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5)
  const personOf = (id: string) => people.find(p => p.id === id)

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-green-700">📊 সংগঠনের সারসংক্ষেপ</p>
        <h2 className="text-xl font-bold">ওভারভিউ</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <BigCard bg="linear-gradient(135deg,#5e35b1,#4527a0)" icon="💰" value={compact(totalIn)}
          label="মোট আয়" vals={inM.map(tot)} />
        <BigCard bg="linear-gradient(135deg,#1e88e5,#1565c0)" icon="🧾" value={compact(totalOut)}
          label="মোট ব্যয়" vals={outM.map(tot)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-3 flex items-center gap-3 text-white" style={{ background: '#1e88e5' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: 'rgba(255,255,255,.22)' }}>🏦</div>
          <div className="min-w-0">
            <p className="font-bold text-sm truncate">{compact(totalIn - totalOut)}</p>
            <p className="text-[11px] opacity-85">বর্তমান উদ্বৃত্ত</p>
          </div>
        </div>
        <div className="rounded-2xl p-3 flex items-center gap-3" style={{ background: '#fff8e1', color: '#5d4037' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: '#ffe082' }}>👥</div>
          <div className="min-w-0">
            <p className="font-bold text-sm">{bn(people.length)} জন</p>
            <p className="text-[11px] opacity-80">সদস্য সংখ্যা</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex justify-between items-start gap-2">
          <div>
            <p className="text-xs text-gray-500">মোট প্রবৃদ্ধি</p>
            <p className="text-xl font-bold">{taka(tot(data.reduce((a, o) => {
              Object.entries(o).forEach(([k, v]) => { a[k] = (a[k] || 0) + v })
              return a
            }, {} as Record<string, number>)))}</p>
          </div>
          <select className="border rounded-lg px-2 py-1 text-sm bg-white" value={year}
            onChange={e => setYear(Number(e.target.value))}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div className="flex gap-2">
          {[['in', 'আয়'], ['out', 'ব্যয়']].map(([k, l]) => (
            <button key={k} onClick={() => setMode(k as any)}
              className={'px-4 py-1.5 rounded-lg text-sm font-semibold ' +
                (mode === k ? 'bg-green-700 text-white' : 'bg-white border')}>
              {l}
            </button>
          ))}
        </div>

        <div className="flex gap-1">
          <div className="relative w-9 shrink-0" style={{ height: 176 }}>
            {ticks.map(v => (
              <span key={v} className="absolute right-0 text-[10px] text-gray-400 -translate-y-1/2"
                style={{ bottom: (v / topV) * 100 + '%' }}>
                {axis(v)}
              </span>
            ))}
          </div>
          <div className="flex-1">
            <div className="relative flex items-end" style={{ height: 176 }}>
              {ticks.map(v => (
                <div key={v} className="absolute left-0 right-0 border-t border-gray-200"
                  style={{ bottom: (v / topV) * 100 + '%' }} />
              ))}
              {data.map((o, i) => {
                const t = totals[i]
                return (
                  <div key={i} className="relative flex-1 h-full flex items-end justify-center">
                    {t > 0 && (
                      <div className="w-[70%] flex flex-col-reverse rounded-t overflow-hidden"
                        style={{ height: (t / topV) * 100 + '%' }}>
                        {funds.filter(f => o[f.id] > 0).map(f => (
                          <div key={f.id} style={{ height: (o[f.id] / t) * 100 + '%', background: colorOf[f.id] }} />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="flex">
              {MONTHS.map(m => (
                <span key={m} className="flex-1 text-center text-[9px] text-gray-400 pt-1">{m}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {funds.map(f => (
            <span key={f.id} className="flex items-center gap-1 text-[11px] text-gray-500">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: colorOf[f.id] }} />
              {f.name}
            </span>
          ))}
        </div>
        {totals.every(t => t === 0) && (
          <p className="text-xs text-gray-400 text-center">এই বছরে কোনো লেনদেন নেই</p>
        )}
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <p className="font-bold">🏆 সর্বোচ্চ দাতা</p>
        <div className="rounded-xl p-3 relative overflow-hidden" style={{ background: '#ede7f6', color: '#5e35b1' }}>
          <p className="text-xs opacity-80">মাসিক অনুদান ({year})</p>
          <p className="font-bold">{taka(sum(don.filter(d => yearOf(dDate(d)) === year)))}</p>
          <div className="h-12 mt-1"><Spark vals={donMonthly} fill /></div>
        </div>

        {top.length === 0 && <p className="text-sm text-gray-500 text-center">এখনও কোনো অনুদান নেই</p>}
        {top.map(r => {
          const p = r.member_id ? personOf(r.member_id) : null
          const nm = p?.full_name || r.name
          const up = r.l30 >= r.p30 && r.l30 > 0
          const down = r.l30 < r.p30
          return (
            <div key={r.key} className="flex items-center gap-3 border-t pt-2">
              <Ava src={p?.photo_url} name={nm} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{nm}</p>
                <p className="text-[11px] text-green-600">
                  {bn(r.count)} বার · মোট অনুদানের {bn(Math.round((r.total / allDon) * 100))}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{taka(r.total)}</p>
                <span className="inline-flex w-5 h-5 rounded text-[11px] items-center justify-center font-bold"
                  style={{
                    background: up ? '#dcfce7' : down ? '#fee2e2' : '#f1f5f9',
                    color: up ? '#16a34a' : down ? '#dc2626' : '#64748b',
                  }}>
                  {up ? '▲' : down ? '▼' : '–'}
                </span>
              </div>
            </div>
          )
        })}

        <button className="text-sm font-semibold text-green-700 underline" onClick={() => onNav('finance')}>
          সব দেখুন →
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
        <p className="font-bold">🕒 সর্বশেষ অনুদান</p>
        {recent.length === 0 && <p className="text-sm text-gray-500">এখনও কোনো অনুদান নেই</p>}
        {recent.map(d => {
          const p = d.member_id ? personOf(d.member_id) : null
          const nm = p?.full_name || d.donor_name || 'নামহীন দাতা'
          return (
            <div key={d.id} className="flex items-center gap-3 border-t pt-2">
              <Ava src={p?.photo_url} name={nm} size={32} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{nm}</p>
                <p className="text-[10px] text-gray-400">{fmtDT(d.created_at)}</p>
              </div>
              <b className="text-sm text-green-700">{taka(d.amount)}</b>
            </div>
          )
        })}
      </div>
    </div>
  )
}
