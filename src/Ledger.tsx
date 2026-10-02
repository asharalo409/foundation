import { useEffect, useState } from 'react'
import { fmtDT } from './time'

const input =
  'w-full border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-green-600'
const MONTHS = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রি', 'মে', 'জুন', 'জুলা', 'আগ', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে']
const taka = (n: number) => '৳' + Number(n || 0).toLocaleString('bn-BD')
const bn = (n: number) => n.toLocaleString('bn-BD')
const bnd = (s: string) => new Date(s).toLocaleDateString('bn-BD')
const sum = (a: any[]) => a.reduce((t, x) => t + Number(x.amount), 0)

export default function Ledger({ supabase, member }: any) {
  const canEdit = ['admin', 'cashier'].includes(member?.role)
  const [funds, setFunds] = useState<any[]>([])
  const [don, setDon] = useState<any[]>([])
  const [exp, setExp] = useState<any[]>([])
  const [fees, setFees] = useState<any[]>([])
  const [people, setPeople] = useState<any[]>([])
  const [sel, setSel] = useState('all')
  const [form, setForm] = useState<any>(null)
  const [msg, setMsg] = useState('')

  async function load() {
    const [f, d, e, fe, p] = await Promise.all([
      supabase.from('funds').select('*').order('created_at'),
      supabase.from('donations').select('*'),
      supabase.from('expenses').select('*'),
      supabase.from('monthly_fees').select('*'),
      supabase.from('public_members').select('id, full_name'),
    ])
    setFunds(f.data || [])
    setDon(d.data || [])
    setExp(e.data || [])
    setFees((fe.data || []).filter((x: any) => x.status === 'paid'))
    setPeople(p.data || [])
  }
  useEffect(() => { load() }, [])

  const generalId = funds.find(f => f.name.includes('সাধারণ'))?.id || funds[0]?.id
  const nameOf = (id: string) => people.find(p => p.id === id)?.full_name
  const fundName = (id: string) => funds.find(f => f.id === id)?.name || '-'

  const collected = (id: string) =>
    sum(don.filter(d => d.fund_id === id)) + (id === generalId ? sum(fees) : 0)
  const spent = (id: string) => sum(exp.filter(x => x.fund_id === id))

  const lastAt = (id: string) => {
    const all = [...don, ...exp].filter(x => x.fund_id === id).map(x => x.created_at).sort()
    return all[all.length - 1]
  }

  const entries = [
    ...don.map(d => ({
      id: 'd' + d.id, kind: 'in', fund_id: d.fund_id,
      title: nameOf(d.member_id) || d.donor_name || 'নামহীন দাতা',
      sub: 'অনুদান · ' + (d.method || '-') + ' · রসিদ ' + (d.receipt_no || '-'),
      date: d.donated_on || d.created_at.slice(0, 10), at: d.created_at, amount: d.amount,
    })),
    ...fees.map(f => ({
      id: 'f' + f.id, kind: 'in', fund_id: generalId,
      title: (nameOf(f.member_id) || 'সদস্য') + ' — মাসিক ফি',
      sub: MONTHS[f.month - 1] + ' ' + f.year,
      date: f.paid_on || f.year + '-' + String(f.month).padStart(2, '0') + '-01', at: '', amount: f.amount,
    })),
    ...exp.map(x => ({
      id: 'x' + x.id, kind: 'out', fund_id: x.fund_id,
      title: x.description || x.category || 'খরচ',
      sub: 'ভাউচার ' + x.voucher_no + ' · অনুমোদক ' + (nameOf(x.approved_by) || '-'),
      date: x.spent_on, at: x.created_at, amount: x.amount,
    })),
  ]
    .filter(e => sel === 'all' || e.fund_id === sel)
    .sort((a, b) => (b.date + (b.at || '')).localeCompare(a.date + (a.at || '')))

  const totalIn = sum(entries.filter(e => e.kind === 'in'))
  const totalOut = sum(entries.filter(e => e.kind === 'out'))
  const nIn = entries.filter(e => e.kind === 'in').length
  const nOut = entries.filter(e => e.kind === 'out').length

  async function removeFund(f: any) {
    const used = don.some(d => d.fund_id === f.id) || exp.some(x => x.fund_id === f.id)
    if (used) {
      setMsg('এই খাতে লেনদেন আছে, তাই মোছা যাবে না। চাইলে নাম বা বিবরণ সম্পাদনা করুন।')
      return
    }
    if (!confirm('খাতটি মুছে ফেলবেন?')) return
    const { error } = await supabase.from('funds').delete().eq('id', f.id)
    setMsg(error ? 'মোছা যায়নি: ' + error.message : '')
    load()
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-green-700">📚 খাতভিত্তিক স্বচ্ছতা ও ফান্ড লেজার</p>
        <h2 className="text-xl font-bold">আলাদা আলাদা খাত অনুযায়ী আয়-ব্যয়ের হিসাব</h2>
        <p className="text-sm text-gray-500">
          প্রতিটি তহবিলের আলাদা ব্যালেন্স ও খরচের হিসাব, সময়সহ।
        </p>
      </div>

      {canEdit && (
        <button className="bg-green-700 text-white font-semibold rounded-lg px-4 py-2 text-sm"
          onClick={() => setForm({})}>
          + নতুন খাত তৈরি করুন
        </button>
      )}
      {form && (
        <FundForm supabase={supabase} row={form.id ? form : null}
          onDone={() => { setForm(null); load() }} onCancel={() => setForm(null)} />
      )}
      {msg && <p className="text-sm text-red-600">{msg}</p>}

      {funds.map(f => {
        const c = collected(f.id)
        const s = spent(f.id)
        const pct = c > 0 ? Math.min(100, Math.round((s / c) * 100)) : 0
        const edited = f.updated_at && f.created_at &&
          new Date(f.updated_at).getTime() - new Date(f.created_at).getTime() > 60000
        return (
          <div key={f.id} className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
            <p className="text-[11px] text-gray-400 tracking-wide">{f.code || 'খাত'}</p>
            <h3 className="font-bold text-lg">{f.name}</h3>
            {f.description && <p className="text-sm text-gray-500">{f.description}</p>}
            <div className="text-sm space-y-1 pt-1">
              <div className="flex justify-between">
                <span className="text-gray-500">মোট সংগৃহীত:</span>
                <b className="text-green-700">{taka(c)}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">মোট খরচ:</span>
                <b className="text-red-600">{taka(s)}</b>
              </div>
              <div className="flex justify-between border-t pt-1">
                <b>খাত উদ্বৃত্ত (Balance):</b>
                <b>{taka(c - s)}</b>
              </div>
            </div>
            <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
              <div className="h-full bg-green-600" style={{ width: pct + '%' }} />
            </div>
            <p className="text-[11px] text-gray-400">খরচের অনুপাত: {bn(pct)}%</p>
            <div className="text-[11px] text-gray-400 space-y-0.5">
              <p>📅 খাত তৈরি: {fmtDT(f.created_at) || '-'}</p>
              {edited && <p>✏️ সম্পাদিত: {fmtDT(f.updated_at)}</p>}
              <p>🕒 সর্বশেষ লেনদেন: {fmtDT(lastAt(f.id)) || 'এখনও কোনো লেনদেন নেই'}</p>
            </div>
            {canEdit && (
              <div className="flex gap-4 text-xs pt-1">
                <button className="underline" onClick={() => setForm(f)}>সম্পাদনা</button>
                <button className="underline text-red-600" onClick={() => removeFund(f)}>মুছুন</button>
              </div>
            )}
          </div>
        )
      })}

      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <div>
          <h3 className="font-bold">সকল খাতের যৌথ আর্থিক বিবরণ</h3>
          <p className="text-xs text-gray-500">
            {bn(nIn)}টি অনুদান/ফি জমা এবং {bn(nOut)}টি খরচের ভাউচার
          </p>
        </div>

        <select className={input} value={sel} onChange={e => setSel(e.target.value)}>
          <option value="all">সব খাত</option>
          {funds.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-green-50 p-2">
            <p className="text-[11px] text-gray-500">আয়</p>
            <p className="font-bold text-green-700 text-sm">{taka(totalIn)}</p>
          </div>
          <div className="rounded-lg bg-red-50 p-2">
            <p className="text-[11px] text-gray-500">ব্যয়</p>
            <p className="font-bold text-red-600 text-sm">{taka(totalOut)}</p>
          </div>
          <div className="rounded-lg bg-gray-100 p-2">
            <p className="text-[11px] text-gray-500">উদ্বৃত্ত</p>
            <p className="font-bold text-sm">{taka(totalIn - totalOut)}</p>
          </div>
        </div>

        {entries.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-3">কোনো লেনদেন নেই</p>
        )}
        {entries.map(e => (
          <div key={e.id}
            className={'border-l-4 pl-3 py-1 flex justify-between gap-2 ' +
              (e.kind === 'in' ? 'border-green-600' : 'border-red-500')}>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{e.title}</p>
              <p className="text-xs text-gray-500">{e.sub}</p>
              <p className="text-[11px] text-gray-400">
                {fundName(e.fund_id)} · {bnd(e.date)}{e.at ? ' · 🕒 ' + fmtDT(e.at) : ''}
              </p>
            </div>
            <p className={'font-bold text-sm whitespace-nowrap ' +
              (e.kind === 'in' ? 'text-green-700' : 'text-red-600')}>
              {e.kind === 'in' ? '+' : '−'} {taka(e.amount)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function FundForm({ supabase, row, onDone, onCancel }: any) {
  const [f, setF] = useState({
    code: row?.code || '',
    name: row?.name || '',
    description: row?.description || '',
    budget: row ? String(row.budget || 0) : '',
  })
  const [msg, setMsg] = useState('')
  const set = (k: string, v: string) => setF({ ...f, [k]: v })

  async function save() {
    if (!f.name) { setMsg('খাতের নাম দিন'); return }
    const payload: any = {
      code: f.code || 'SEC-' + String(Date.now()).slice(-4),
      name: f.name,
      description: f.description || null,
      budget: Number(f.budget) || 0,
    }
    const { error } = row
      ? await supabase.from('funds').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', row.id)
      : await supabase.from('funds').insert(payload)
    if (error) setMsg('ব্যর্থ: ' + error.message)
    else onDone()
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
      <h3 className="font-bold text-sm">{row ? 'খাত সম্পাদনা' : 'নতুন খাত'}</h3>
      <input className={input} placeholder="খাতের নাম *" value={f.name} onChange={e => set('name', e.target.value)} />
      <input className={input} placeholder="কোড (যেমন: SEC-FLOOD, খালি রাখলে নিজে হবে)" value={f.code}
        onChange={e => set('code', e.target.value)} />
      <textarea className={input} rows={2} placeholder="বিবরণ" value={f.description}
        onChange={e => set('description', e.target.value)} />
      <input className={input} type="number" placeholder="বাজেট (ঐচ্ছিক)" value={f.budget}
        onChange={e => set('budget', e.target.value)} />
      <div className="flex gap-2">
        <button className="flex-1 bg-green-700 text-white font-semibold rounded-lg py-2" onClick={save}>সংরক্ষণ</button>
        <button className="border rounded-lg px-4" onClick={onCancel}>বাতিল</button>
      </div>
      {msg && <p className="text-sm text-center text-red-600">{msg}</p>}
    </div>
  )
}
