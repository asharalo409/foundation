import { useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'

const bn = (n: number) => Number(n || 0).toLocaleString('bn-BD')
const taka = (n: number) => '৳' + Math.round(n || 0).toLocaleString('bn-BD')

function monthKey(d?: string | null) {
  if (!d) return ''
  return String(d).slice(0, 7) // YYYY-MM
}
function nowKey() {
  const t = new Date()
  return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0')
}
function dayLabel(d?: string | null) {
  if (!d) return ''
  const t = new Date(d)
  return isNaN(+t) ? '' : t.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })
}

// হোম পেজের স্বচ্ছতার মিটার: আয়, ব্যয়, উদ্বৃত্ত ও সর্বশেষ খরচ
export default function Transparency({ supabase, color }: { supabase: any; color: string }) {
  const [don, setDon] = useState<any[]>([])
  const [exp, setExp] = useState<any[]>([])
  const [ok, setOk] = useState(false)
  const [tab, setTab] = useState<'month' | 'all'>('month')
  const [go, setGo] = useState(false)

  useEffect(() => {
    Promise.all([
      supabase.from('donations').select('amount, donated_on, created_at'),
      supabase.from('expenses').select('amount, spent_on, description, category, proof_url')
        .order('spent_on', { ascending: false }).limit(1000),
    ]).then(([a, b]: any) => {
      // খরচের হিসাব পড়া না গেলে অর্ধেক তথ্য দেখিয়ে বিভ্রান্ত করব না
      if (b.error || a.error) return
      setDon(a.data || [])
      setExp(b.data || [])
      setOk(true)
      setTimeout(() => setGo(true), 150)
    }).catch(() => {})
  }, [])

  if (!ok) return null

  const key = nowKey()
  const inTab = (d?: string | null) => tab === 'all' || monthKey(d) === key
  const income = don.filter(x => inTab(x.donated_on || x.created_at)).reduce((t, x) => t + Number(x.amount || 0), 0)
  const spent = exp.filter(x => inTab(x.spent_on)).reduce((t, x) => t + Number(x.amount || 0), 0)
  const left = income - spent
  const pct = income > 0 ? Math.min(100, Math.round((spent / income) * 100)) : 0
  const recent = exp.slice(0, 4)

  return (
    <section className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold" style={{ color }}>স্বচ্ছতার মিটার</p>
          <h2 className="text-xl font-bold leading-snug">টাকা এসেছে, কোথায় গেল</h2>
        </div>
        <div className="flex rounded-full bg-gray-100 p-0.5 text-xs shrink-0">
          {([['month', 'এ মাস'], ['all', 'সব সময়']] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)}
              className="px-3 py-1 rounded-full font-semibold transition-colors"
              style={tab === k ? { background: color, color: '#fff' } : { color: '#6b7280' }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-green-50 py-2.5">
          <p className="text-[11px] text-gray-500">এসেছে</p>
          <b className="text-green-700 text-base">{taka(income)}</b>
        </div>
        <div className="rounded-xl bg-rose-50 py-2.5">
          <p className="text-[11px] text-gray-500">খরচ</p>
          <b className="text-rose-600 text-base">{taka(spent)}</b>
        </div>
        <div className="rounded-xl bg-amber-50 py-2.5">
          <p className="text-[11px] text-gray-500">{tab === 'month' ? 'এ মাসের উদ্বৃত্ত' : 'জমা আছে'}</p>
          <b className="text-amber-700 text-base">{left < 0 ? '-' : ''}{taka(Math.abs(left))}</b>
        </div>
      </div>

      {/* আয়ের তুলনায় কতটা খরচ হয়েছে */}
      <div>
        <div className="h-3.5 rounded-full bg-green-100 overflow-hidden">
          <div className="h-full rounded-full"
            style={{
              width: go ? pct + '%' : '0%',
              background: 'linear-gradient(90deg,#fb7185,#e11d48)',
              transition: 'width 1.2s cubic-bezier(.2,.8,.2,1)',
            }} />
        </div>
        <div className="flex justify-between text-[11px] text-gray-500 mt-1">
          <span>{income > 0 ? 'আয়ের ' + bn(pct) + '% খরচ হয়েছে' : 'এই সময়ে এখনও অনুদান আসেনি'}</span>
          <span>{income > 0 ? 'বাকি ' + bn(Math.max(0, 100 - pct)) + '%' : ''}</span>
        </div>
      </div>

      {recent.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">সর্বশেষ খরচ</p>
          <ul className="divide-y">
            {recent.map((x, i) => (
              <li key={i} className="flex items-center gap-3 py-2">
                <span className="w-1.5 self-stretch rounded-full bg-rose-300 shrink-0" />
                <span className="flex-1 min-w-0">
                  <b className="block text-sm truncate">{x.description || x.category || 'খরচ'}</b>
                  <span className="text-[11px] text-gray-400">{dayLabel(x.spent_on)}</span>
                </span>
                <b className="text-sm text-rose-600 shrink-0">{taka(x.amount)}</b>
                {x.proof_url ? (
                  <a href={x.proof_url} target="_blank" rel="noreferrer"
                    className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold rounded-full px-2.5 py-1 border"
                    style={{ color, borderColor: color }}>
                    রসিদ <ExternalLink size={11} />
                  </a>
                ) : (
                  <span className="shrink-0 w-[54px]" />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
