import { useEffect, useState } from 'react'

const input =
  'w-full border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-green-600'
const btn =
  'w-full bg-green-700 text-white font-semibold rounded-lg py-2.5 active:opacity-80 disabled:opacity-50'

const taka = (n: number) => '৳' + Number(n || 0).toLocaleString('bn-BD')
const date = (s: string) => new Date(s).toLocaleDateString('bn-BD')

export default function Finance({
  supabase,
  canEdit,
  member,
}: {
  supabase: any
  canEdit: boolean
  member: any
}) {
  const [funds, setFunds] = useState<any[]>([])
  const [don, setDon] = useState<any[]>([])
  const [exp, setExp] = useState<any[]>([])
  const [view, setView] = useState('don')
  const [form, setForm] = useState('none')

  async function load() {
    const [f, d, e] = await Promise.all([
      supabase.from('funds').select('*'),
      supabase
        .from('donations')
        .select('*, members(full_name)')
        .order('created_at', { ascending: false }),
      supabase.from('expenses').select('*').order('created_at', { ascending: false }),
    ])
    setFunds(f.data || [])
    setDon(d.data || [])
    setExp(e.data || [])
  }
  useEffect(() => { load() }, [])

  const sum = (a: any[]) => a.reduce((t, x) => t + Number(x.amount), 0)
  const totalIn = sum(don)
  const totalOut = sum(exp)
  const fundName = (id: string) => funds.find(f => f.id === id)?.name || '-'

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <p className="text-xs text-gray-500">মোট অনুদান</p>
          <p className="font-bold text-green-700 text-sm">{taka(totalIn)}</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <p className="text-xs text-gray-500">মোট খরচ</p>
          <p className="font-bold text-red-600 text-sm">{taka(totalOut)}</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <p className="text-xs text-gray-500">বর্তমান উদ্বৃত্ত</p>
          <p className="font-bold text-sm">{taka(totalIn - totalOut)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-3 shadow-sm">
        <p className="font-bold text-sm mb-2">খাতভিত্তিক ব্যালেন্স</p>
        {funds.map(f => {
          const i = sum(don.filter(x => x.fund_id === f.id))
          const o = sum(exp.filter(x => x.fund_id === f.id))
          return (
            <div key={f.id} className="flex justify-between text-sm py-1 border-b last:border-0">
              <span>{f.name}</span>
              <span className="font-semibold">{taka(i - o)}</span>
            </div>
          )
        })}
      </div>

      {canEdit && (
        <div className="flex gap-2">
          <button
            className="flex-1 border border-green-700 text-green-700 rounded-lg py-2 text-sm font-semibold"
            onClick={() => setForm(form === 'don' ? 'none' : 'don')}
          >
            + অনুদান যোগ
          </button>
          <button
            className="flex-1 border border-red-500 text-red-600 rounded-lg py-2 text-sm font-semibold"
            onClick={() => setForm(form === 'exp' ? 'none' : 'exp')}
          >
            + খরচ যোগ
          </button>
        </div>
      )}

      {form === 'don' && (
        <DonForm supabase={supabase} funds={funds} onDone={() => { setForm('none'); load() }} />
      )}
      {form === 'exp' && (
        <ExpForm
          supabase={supabase}
          funds={funds}
          member={member}
          onDone={() => { setForm('none'); load() }}
        />
      )}

      <div className="flex gap-2">
        {[['don', 'অনুদানের তালিকা'], ['exp', 'খরচের ভাউচার']].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setView(k)}
            className={
              'flex-1 py-2 rounded-lg text-sm font-semibold ' +
              (view === k ? 'bg-green-700 text-white' : 'bg-white border')
            }
          >
            {l}
          </button>
        ))}
      </div>

      {view === 'don' &&
        (don.length === 0 ? (
          <p className="text-center text-sm text-gray-500">এখনও কোনো অনুদান নেই</p>
        ) : (
          don.map(d => (
            <div key={d.id} className="bg-white rounded-xl p-3 shadow-sm flex justify-between">
              <div>
                <p className="font-semibold text-sm">
                  {d.members?.full_name || d.donor_name || 'নামহীন দাতা'}
                </p>
                <p className="text-xs text-gray-500">
                  {fundName(d.fund_id)} · {d.method || '-'} · {date(d.created_at)}
                </p>
                <p className="text-xs text-gray-400">রসিদ: {d.receipt_no || '-'}</p>
              </div>
              <p className="font-bold text-green-700">{taka(d.amount)}</p>
            </div>
          ))
        ))}

      {view === 'exp' &&
        (exp.length === 0 ? (
          <p className="text-center text-sm text-gray-500">এখনও কোনো খরচ নেই</p>
        ) : (
          exp.map(x => (
            <div key={x.id} className="bg-white rounded-xl p-3 shadow-sm">
              <div className="flex justify-between">
                <p className="font-semibold text-sm">{x.category || 'খরচ'}</p>
                <p className="font-bold text-red-600">{taka(x.amount)}</p>
              </div>
              <p className="text-xs text-gray-600">{x.description}</p>
              <p className="text-xs text-gray-500">
                {fundName(x.fund_id)} · {date(x.spent_on)} · ভাউচার: {x.voucher_no}
              </p>
              {x.proof_url && (
                <a
                  className="text-xs text-green-700 underline"
                  href={x.proof_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  রশিদ/প্রুফ দেখুন
                </a>
              )}
            </div>
          ))
        ))}
    </div>
  )
}

function DonForm({ supabase, funds, onDone }: { supabase: any; funds: any[]; onDone: () => void }) {
  const [f, setF] = useState({ donor_name: '', amount: '', fund_id: '', method: 'বিকাশ', trx_id: '' })
  const [msg, setMsg] = useState('')
  const set = (k: string, v: string) => setF({ ...f, [k]: v })

  async function save() {
    if (!f.amount || !f.fund_id) { setMsg('টাকার পরিমাণ ও খাত বাছাই করুন'); return }
    const { error } = await supabase.from('donations').insert({
      donor_name: f.donor_name || null,
      amount: Number(f.amount),
      fund_id: f.fund_id,
      method: f.method,
      trx_id: f.trx_id || null,
      receipt_no: 'RC-' + Date.now().toString().slice(-8),
    })
    if (error) setMsg('ব্যর্থ: ' + error.message)
    else onDone()
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
      <h3 className="font-bold text-sm">নতুন অনুদান</h3>
      <input className={input} placeholder="দাতার নাম" value={f.donor_name} onChange={e => set('donor_name', e.target.value)} />
      <input className={input} type="number" placeholder="টাকার পরিমাণ *" value={f.amount} onChange={e => set('amount', e.target.value)} />
      <select className={input} value={f.fund_id} onChange={e => set('fund_id', e.target.value)}>
        <option value="">খাত বাছাই করুন *</option>
        {funds.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
      </select>
      <select className={input} value={f.method} onChange={e => set('method', e.target.value)}>
        {['বিকাশ', 'নগদ', 'রকেট', 'ব্যাংক', 'হাতে হাতে'].map(m => <option key={m}>{m}</option>)}
      </select>
      <input className={input} placeholder="ট্রানজেকশন আইডি (ঐচ্ছিক)" value={f.trx_id} onChange={e => set('trx_id', e.target.value)} />
      <button className={btn} onClick={save}>সংরক্ষণ করুন</button>
      {msg && <p className="text-sm text-center text-red-600">{msg}</p>}
    </div>
  )
}

function ExpForm({ supabase, funds, member, onDone }: { supabase: any; funds: any[]; member: any; onDone: () => void }) {
  const [f, setF] = useState({ amount: '', fund_id: '', category: '', description: '', proof_url: '' })
  const [msg, setMsg] = useState('')
  const set = (k: string, v: string) => setF({ ...f, [k]: v })

  async function save() {
    if (!f.amount || !f.fund_id || !f.description) { setMsg('টাকা, খাত ও বিবরণ দিন'); return }
    const { error } = await supabase.from('expenses').insert({
      voucher_no: 'V-' + Date.now().toString().slice(-8),
      amount: Number(f.amount),
      fund_id: f.fund_id,
      category: f.category || null,
      description: f.description,
      proof_url: f.proof_url || null,
      approved_by: member?.id || null,
    })
    if (error) setMsg('ব্যর্থ: ' + error.message)
    else onDone()
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
      <h3 className="font-bold text-sm">নতুন খরচের ভাউচার</h3>
      <input className={input} type="number" placeholder="টাকার পরিমাণ *" value={f.amount} onChange={e => set('amount', e.target.value)} />
      <select className={input} value={f.fund_id} onChange={e => set('fund_id', e.target.value)}>
        <option value="">খাত বাছাই করুন *</option>
        {funds.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
      </select>
      <input className={input} placeholder="খরচের ধরন (যেমন: খাদ্য সামগ্রী)" value={f.category} onChange={e => set('category', e.target.value)} />
      <textarea className={input} rows={2} placeholder="বিবরণ *" value={f.description} onChange={e => set('description', e.target.value)} />
      <input className={input} placeholder="রশিদ/মেমোর ছবির লিংক (ঐচ্ছিক)" value={f.proof_url} onChange={e => set('proof_url', e.target.value)} />
      <button className={btn} onClick={save}>সংরক্ষণ করুন</button>
      {msg && <p className="text-sm text-center text-red-600">{msg}</p>}
    </div>
  )
}
