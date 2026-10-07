import { useEffect, useState } from 'react'
import { fmtDT } from './time'
import { Avatar, Badge, Table, THead, TBody, TR, TH, TD } from './UI'

const input =
  'w-full border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-green-600'
const btn =
  'w-full bg-green-700 text-white font-semibold rounded-lg py-2.5 active:opacity-80 disabled:opacity-50'

const taka = (n: number) => '৳' + Number(n || 0).toLocaleString('bn-BD')
const bnd = (s: string) => new Date(s).toLocaleDateString('bn-BD')
const MONTHS = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রি', 'মে', 'জুন', 'জুলা', 'আগ', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে']
const sum = (a: any[]) => a.reduce((t, x) => t + Number(x.amount), 0)
const yearOf = (s: string) => Number(s.slice(0, 4))
const monthOf = (s: string) => Number(s.slice(5, 7))
const today = () => new Date().toLocaleDateString('en-CA')

function embedUrl(u: string) {
  if (!u) return ''
  if (u.includes('/pub')) return u
  const m = u.match(/\/d\/([a-zA-Z0-9_-]+)/)
  return m ? 'https://docs.google.com/spreadsheets/d/' + m[1] + '/preview' : u
}

export default function Finance({ supabase, canEdit, isAdmin, member }: any) {
  const thisYear = new Date().getFullYear()
  const [funds, setFunds] = useState<any[]>([])
  const [don, setDon] = useState<any[]>([])
  const [exp, setExp] = useState<any[]>([])
  const [fees, setFees] = useState<any[]>([])
  const [people, setPeople] = useState<any[]>([])
  const [cfg, setCfg] = useState<any>({})
  const [view, setView] = useState('don')
  const [form, setForm] = useState<any>(null)
  const [year, setYear] = useState('all')
  const [month, setMonth] = useState('all')
  const [fundF, setFundF] = useState('all')
  const [sheetIn, setSheetIn] = useState('')
  const [feeIn, setFeeIn] = useState('')

  async function load() {
    const [f, d, e, fe, p, s] = await Promise.all([
      supabase.from('funds').select('*').order('name'),
      supabase.from('donations').select('*').order('donated_on', { ascending: false }),
      supabase.from('expenses').select('*').order('spent_on', { ascending: false }),
      supabase.from('monthly_fees').select('*'),
      supabase.from('public_members').select('*').order('full_name'),
      supabase.from('settings').select('monthly_fee, sheet_url').eq('id', 1).single(),
    ])
    setFunds(f.data || [])
    setDon(d.data || [])
    setExp(e.data || [])
    setFees(fe.data || [])
    setPeople(p.data || [])
    setCfg(s.data || {})
    setSheetIn(s.data?.sheet_url || '')
    setFeeIn(String(s.data?.monthly_fee ?? ''))
  }
  useEffect(() => { load() }, [])

  const generalId = funds.find(f => f.name.includes('সাধারণ'))?.id || funds[0]?.id
  const dDate = (d: any) => d.donated_on || d.created_at.slice(0, 10)
  const personOf = (id: string) => people.find(p => p.id === id)
  const fundName = (id: string) => funds.find(f => f.id === id)?.name || '-'

  const incomes = [
    ...don.map(d => ({ amount: d.amount, fund_id: d.fund_id, date: dDate(d) })),
    ...fees.filter(f => f.status === 'paid').map(f => ({
      amount: f.amount,
      fund_id: generalId,
      date: f.paid_on || f.year + '-' + String(f.month).padStart(2, '0') + '-01',
    })),
  ]
  const outs = exp.map(x => ({ amount: x.amount, fund_id: x.fund_id, date: x.spent_on }))

  const ok = (date: string, fund: string) =>
    (year === 'all' || yearOf(date) === Number(year)) &&
    (month === 'all' || monthOf(date) === Number(month)) &&
    (fundF === 'all' || fund === fundF)

  const inF = incomes.filter(x => ok(x.date, x.fund_id))
  const outF = outs.filter(x => ok(x.date, x.fund_id))
  const donF = don.filter(d => ok(dDate(d), d.fund_id))
  const expF = exp.filter(x => ok(x.spent_on, x.fund_id))

  const years = Array.from(new Set([
    thisYear,
    ...incomes.map(x => yearOf(x.date)),
    ...outs.map(x => yearOf(x.date)),
  ])).sort((a, b) => b - a)

  const feeYear = year === 'all' ? thisYear : Number(year)

  async function remove(table: string, id: string) {
    if (!confirm('মুছে ফেলবেন?')) return
    await supabase.from(table).delete().eq('id', id)
    load()
  }

  async function toggleFee(pid: string, m: number) {
    const ex = fees.find(f => f.member_id === pid && f.year === feeYear && f.month === m)
    if (ex) await supabase.from('monthly_fees').delete().eq('id', ex.id)
    else
      await supabase.from('monthly_fees').insert({
        member_id: pid, year: feeYear, month: m,
        amount: Number(cfg.monthly_fee || 0), status: 'paid', paid_on: today(),
      })
    load()
  }

  async function saveSetting(patch: any) {
    await supabase.from('settings').update(patch).eq('id', 1)
    load()
  }

  const tabs = [['don', 'অনুদান'], ['exp', 'খরচ'], ['mem', 'সদস্য'],
    ...(canEdit ? [['fee', 'ফি']] : []), ['sheet', 'শিট']]

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <select className={input} value={year} onChange={e => setYear(e.target.value)}>
          <option value="all">সব বছর</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select className={input} value={month} onChange={e => setMonth(e.target.value)}>
          <option value="all">সব মাস</option>
          {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
        <select className={input} value={fundF} onChange={e => setFundF(e.target.value)}>
          <option value="all">সব খাত</option>
          {funds.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <p className="text-xs text-gray-500">আয়</p>
          <p className="font-bold text-green-700 text-sm">{taka(sum(inF))}</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <p className="text-xs text-gray-500">ব্যয়</p>
          <p className="font-bold text-red-600 text-sm">{taka(sum(outF))}</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <p className="text-xs text-gray-500">সর্বমোট উদ্বৃত্ত</p>
          <p className="font-bold text-sm">{taka(sum(incomes) - sum(outs))}</p>
        </div>
      </div>
      <p className="text-[10px] text-gray-400 text-center">আয়ের মধ্যে অনুদান ও মাসিক ফি দুটোই ধরা হয়েছে</p>

      <div className="space-y-1">
        <p className="font-bold text-sm">খাতভিত্তিক হিসাব (নির্বাচিত সময়)</p>
        <Table min={420}>
          <THead>
            <TR><TH>খাত</TH><TH>আয়</TH><TH>ব্যয়</TH><TH>নিট</TH></TR>
          </THead>
          <TBody>
            {funds.map(f => {
              const i = sum(inF.filter(x => x.fund_id === f.id))
              const o = sum(outF.filter(x => x.fund_id === f.id))
              return (
                <TR key={f.id}>
                  <TD className="font-medium">{f.name}</TD>
                  <TD className="text-green-700 whitespace-nowrap">{taka(i)}</TD>
                  <TD className="text-red-600 whitespace-nowrap">{taka(o)}</TD>
                  <TD className="font-semibold whitespace-nowrap">{taka(i - o)}</TD>
                </TR>
              )
            })}
          </TBody>
        </Table>
      </div>

      <div className="space-y-1">
        <p className="font-bold text-sm">বাৎসরিক তুলনা</p>
        <Table min={420}>
          <THead>
            <TR><TH>বছর</TH><TH>আয়</TH><TH>ব্যয়</TH><TH>উদ্বৃত্ত</TH></TR>
          </THead>
          <TBody>
            {years.map(y => {
              const i = sum(incomes.filter(x => yearOf(x.date) === y))
              const o = sum(outs.filter(x => yearOf(x.date) === y))
              return (
                <TR key={y}>
                  <TD className="font-medium">{y}</TD>
                  <TD className="text-green-700 whitespace-nowrap">{taka(i)}</TD>
                  <TD className="text-red-600 whitespace-nowrap">{taka(o)}</TD>
                  <TD className="font-semibold whitespace-nowrap">{taka(i - o)}</TD>
                </TR>
              )
            })}
          </TBody>
        </Table>
      </div>

      {canEdit && (
        <div className="flex gap-2">
          <button className="flex-1 border border-green-700 text-green-700 rounded-lg py-2 text-sm font-semibold"
            onClick={() => setForm({ type: 'don' })}>+ অনুদান যোগ</button>
          <button className="flex-1 border border-red-500 text-red-600 rounded-lg py-2 text-sm font-semibold"
            onClick={() => setForm({ type: 'exp' })}>+ খরচ যোগ</button>
        </div>
      )}

      {form?.type === 'don' && (
        <DonForm supabase={supabase} funds={funds} people={people} row={form.row}
          onDone={() => { setForm(null); load() }} onCancel={() => setForm(null)} />
      )}
      {form?.type === 'exp' && (
        <ExpForm supabase={supabase} funds={funds} member={member} row={form.row}
          onDone={() => { setForm(null); load() }} onCancel={() => setForm(null)} />
      )}

      <div className="flex gap-2 overflow-x-auto">
        {tabs.map(([k, l]) => (
          <button key={k} onClick={() => setView(k)}
            className={'px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ' +
              (view === k ? 'bg-green-700 text-white' : 'bg-white border')}>
            {l}
          </button>
        ))}
      </div>

      {view === 'don' && (donF.length === 0
        ? <p className="text-center text-sm text-gray-500">কোনো অনুদান নেই</p>
        : (
          <Table min={780}>
            <THead>
              <TR>
                <TH>রসিদ</TH><TH>দাতা</TH><TH>খাত</TH><TH>পরিমাণ</TH>
                <TH>মাধ্যম</TH><TH>অবস্থা</TH><TH>তারিখ</TH>
                {canEdit && <TH>অ্যাকশন</TH>}
              </TR>
            </THead>
            <TBody>
              {donF.map(d => {
                const p = personOf(d.member_id)
                const nm = p?.full_name || d.donor_name || 'নামহীন দাতা'
                return (
                  <TR key={d.id}>
                    <TD className="font-mono text-xs">{d.receipt_no || '-'}</TD>
                    <TD>
                      <div className="flex items-center gap-2">
                        <Avatar src={p?.photo_url} name={nm} />
                        <span className="font-medium">{nm}</span>
                      </div>
                    </TD>
                    <TD>{fundName(d.fund_id)}</TD>
                    <TD className="font-bold text-green-700 whitespace-nowrap">{taka(d.amount)}</TD>
                    <TD>{d.method || '-'}</TD>
                    <TD><Badge tone="green">গৃহীত</Badge></TD>
                    <TD className="text-xs whitespace-nowrap">
                      {bnd(dDate(d))}
                      <div className="text-[10px] text-gray-400">🕒 {fmtDT(d.created_at)}</div>
                    </TD>
                    {canEdit && (
                      <TD>
                        <div className="flex gap-3 text-xs whitespace-nowrap">
                          <button className="underline" onClick={() => setForm({ type: 'don', row: d })}>সম্পাদনা</button>
                          <button className="underline text-red-600" onClick={() => remove('donations', d.id)}>মুছুন</button>
                        </div>
                      </TD>
                    )}
                  </TR>
                )
              })}
            </TBody>
          </Table>
        ))}

      {view === 'exp' && (expF.length === 0
        ? <p className="text-center text-sm text-gray-500">কোনো খরচ নেই</p>
        : (
          <Table min={860}>
            <THead>
              <TR>
                <TH>ভাউচার</TH><TH>বিবরণ</TH><TH>খাত</TH><TH>পরিমাণ</TH>
                <TH>অনুমোদক</TH><TH>তারিখ</TH><TH>প্রুফ</TH>
                {canEdit && <TH>অ্যাকশন</TH>}
              </TR>
            </THead>
            <TBody>
              {expF.map(x => {
                const p = personOf(x.approved_by)
                return (
                  <TR key={x.id}>
                    <TD className="font-mono text-xs">{x.voucher_no}</TD>
                    <TD>
                      <div className="font-medium">{x.category || 'খরচ'}</div>
                      <div className="text-xs text-gray-500 max-w-[220px]">{x.description}</div>
                    </TD>
                    <TD>{fundName(x.fund_id)}</TD>
                    <TD className="font-bold text-red-600 whitespace-nowrap">{taka(x.amount)}</TD>
                    <TD>
                      {p ? (
                        <div className="flex items-center gap-2">
                          <Avatar src={p.photo_url} name={p.full_name} size={28} />
                          <span className="text-xs">{p.full_name}</span>
                        </div>
                      ) : '-'}
                    </TD>
                    <TD className="text-xs whitespace-nowrap">
                      {bnd(x.spent_on)}
                      <div className="text-[10px] text-gray-400">🕒 {fmtDT(x.created_at)}</div>
                    </TD>
                    <TD>
                      {x.proof_url ? (
                        <a className="text-xs text-green-700 underline" href={x.proof_url} target="_blank" rel="noreferrer">
                          প্রুফ দেখুন
                        </a>
                      ) : '-'}
                    </TD>
                    {canEdit && (
                      <TD>
                        <div className="flex gap-3 text-xs whitespace-nowrap">
                          <button className="underline" onClick={() => setForm({ type: 'exp', row: x })}>সম্পাদনা</button>
                          <button className="underline text-red-600" onClick={() => remove('expenses', x.id)}>মুছুন</button>
                        </div>
                      </TD>
                    )}
                  </TR>
                )
              })}
            </TBody>
          </Table>
        ))}

      {view === 'mem' && (
        <div className="space-y-1">
          <p className="font-bold text-sm">সকল সদস্য (ফি: {feeYear} সাল)</p>
          <Table min={460}>
            <THead>
              <TR><TH>সদস্য</TH><TH>মোট দান</TH><TH>ফি</TH></TR>
            </THead>
            <TBody>
              {people.map(p => {
                const n = fees.filter(f => f.member_id === p.id && f.year === feeYear && f.status === 'paid').length
                return (
                  <TR key={p.id}>
                    <TD>
                      <div className="flex items-center gap-2">
                        <Avatar src={p.photo_url} name={p.full_name} />
                        <div>
                          <div className="font-medium">{p.full_name}</div>
                          <div className="text-[10px] text-gray-400">{p.member_code}</div>
                        </div>
                      </div>
                    </TD>
                    <TD className="whitespace-nowrap">{taka(sum(don.filter(d => d.member_id === p.id)))}</TD>
                    <TD>
                      <Badge tone={n >= 12 ? 'green' : n > 0 ? 'amber' : 'red'}>
                        {n.toLocaleString('bn-BD')}/১২
                      </Badge>
                    </TD>
                  </TR>
                )
              })}
            </TBody>
          </Table>
        </div>
      )}

      {view === 'fee' && canEdit && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            {feeYear} সাল। মাসের ঘরে ট্যাপ করলে পরিশোধ হবে, আবার ট্যাপ করলে বাতিল। প্রতি মাসের ফি: {taka(cfg.monthly_fee)}
          </p>
          {isAdmin && (
            <div className="flex gap-2">
              <input className={input} type="number" value={feeIn} onChange={e => setFeeIn(e.target.value)}
                placeholder="মাসিক ফির পরিমাণ" />
              <button className="bg-green-700 text-white rounded-lg px-4 text-sm"
                onClick={() => saveSetting({ monthly_fee: Number(feeIn) })}>সেভ</button>
            </div>
          )}
          {people.map(p => (
            <div key={p.id} className="bg-white rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Avatar src={p.photo_url} name={p.full_name} size={28} />
                <p className="font-semibold text-sm">{p.full_name}</p>
              </div>
              <div className="grid grid-cols-6 gap-1">
                {MONTHS.map((m, i) => {
                  const paid = fees.some(f => f.member_id === p.id && f.year === feeYear && f.month === i + 1)
                  return (
                    <button key={m} onClick={() => toggleFee(p.id, i + 1)}
                      className={'rounded py-1.5 text-[11px] font-semibold ' +
                        (paid ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500')}>
                      {m}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'sheet' && (
        <div className="space-y-2">
          {isAdmin && (
            <div className="bg-white rounded-xl p-3 shadow-sm space-y-2">
              <p className="text-xs text-gray-500">গুগল শিটের লিংক (শেয়ার: "লিংক আছে এমন যে কেউ - ভিউয়ার")</p>
              <input className={input} value={sheetIn} onChange={e => setSheetIn(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..." />
              <button className={btn} onClick={() => saveSetting({ sheet_url: sheetIn || null })}>সেভ করুন</button>
            </div>
          )}
          {cfg.sheet_url ? (
            <>
              <iframe src={embedUrl(cfg.sheet_url)} className="w-full rounded-xl border bg-white" style={{ height: '65vh' }} />
              <a href={cfg.sheet_url} target="_blank" rel="noreferrer"
                className="block text-center text-sm text-green-700 underline">নতুন ট্যাবে খুলুন</a>
            </>
          ) : (
            <p className="text-center text-sm text-gray-500">এখনও কোনো শিট যুক্ত করা হয়নি</p>
          )}
        </div>
      )}
    </div>
  )
}

function DonForm({ supabase, funds, people, row, onDone, onCancel }: any) {
  const [f, setF] = useState({
    member_id: row?.member_id || '',
    donor_name: row?.donor_name || '',
    amount: row ? String(row.amount) : '',
    fund_id: row?.fund_id || '',
    method: row?.method || 'বিকাশ',
    trx_id: row?.trx_id || '',
    donated_on: row?.donated_on || today(),
  })
  const [msg, setMsg] = useState('')
  const set = (k: string, v: string) => setF({ ...f, [k]: v })

  async function save() {
    if (!f.amount || !f.fund_id) { setMsg('টাকার পরিমাণ ও খাত বাছাই করুন'); return }
    const payload: any = {
      member_id: f.member_id || null,
      donor_name: f.member_id ? null : f.donor_name || null,
      amount: Number(f.amount),
      fund_id: f.fund_id,
      method: f.method,
      trx_id: f.trx_id || null,
      donated_on: f.donated_on,
    }
    const { error } = row
      ? await supabase.from('donations').update(payload).eq('id', row.id)
      : await supabase.from('donations').insert({
          ...payload, receipt_no: 'RC-' + Date.now().toString().slice(-8),
        })
    if (error) setMsg('ব্যর্থ: ' + error.message)
    else onDone()
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
      <h3 className="font-bold text-sm">{row ? 'অনুদান সম্পাদনা' : 'নতুন অনুদান'}</h3>
      <select className={input} value={f.member_id} onChange={e => set('member_id', e.target.value)}>
        <option value="">সদস্য নন (নাম লিখুন)</option>
        {people.map((p: any) => <option key={p.id} value={p.id}>{p.full_name} ({p.member_code})</option>)}
      </select>
      {!f.member_id && (
        <input className={input} placeholder="দাতার নাম" value={f.donor_name}
          onChange={e => set('donor_name', e.target.value)} />
      )}
      <input className={input} type="number" placeholder="টাকার পরিমাণ *" value={f.amount}
        onChange={e => set('amount', e.target.value)} />
      <select className={input} value={f.fund_id} onChange={e => set('fund_id', e.target.value)}>
        <option value="">খাত বাছাই করুন *</option>
        {funds.map((x: any) => <option key={x.id} value={x.id}>{x.name}</option>)}
      </select>
      <select className={input} value={f.method} onChange={e => set('method', e.target.value)}>
        {['বিকাশ', 'নগদ', 'রকেট', 'ব্যাংক', 'হাতে হাতে'].map(m => <option key={m}>{m}</option>)}
      </select>
      <input className={input} placeholder="ট্রানজেকশন আইডি (ঐচ্ছিক)" value={f.trx_id}
        onChange={e => set('trx_id', e.target.value)} />
      <input className={input} type="date" value={f.donated_on} onChange={e => set('donated_on', e.target.value)} />
      <div className="flex gap-2">
        <button className={btn} onClick={save}>সংরক্ষণ</button>
        <button className="border rounded-lg px-4" onClick={onCancel}>বাতিল</button>
      </div>
      {msg && <p className="text-sm text-center text-red-600">{msg}</p>}
    </div>
  )
}

function ExpForm({ supabase, funds, member, row, onDone, onCancel }: any) {
  const [f, setF] = useState({
    amount: row ? String(row.amount) : '',
    fund_id: row?.fund_id || '',
    category: row?.category || '',
    description: row?.description || '',
    proof_url: row?.proof_url || '',
    spent_on: row?.spent_on || today(),
  })
  const [msg, setMsg] = useState('')
  const set = (k: string, v: string) => setF({ ...f, [k]: v })

  async function save() {
    if (!f.amount || !f.fund_id || !f.description) { setMsg('টাকা, খাত ও বিবরণ দিন'); return }
    const payload: any = {
      amount: Number(f.amount),
      fund_id: f.fund_id,
      category: f.category || null,
      description: f.description,
      proof_url: f.proof_url || null,
      spent_on: f.spent_on,
    }
    const { error } = row
      ? await supabase.from('expenses').update(payload).eq('id', row.id)
      : await supabase.from('expenses').insert({
          ...payload,
          voucher_no: 'V-' + Date.now().toString().slice(-8),
          approved_by: member?.id || null,
        })
    if (error) setMsg('ব্যর্থ: ' + error.message)
    else onDone()
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
      <h3 className="font-bold text-sm">{row ? 'খরচ সম্পাদনা' : 'নতুন খরচের ভাউচার'}</h3>
      <input className={input} type="number" placeholder="টাকার পরিমাণ *" value={f.amount}
        onChange={e => set('amount', e.target.value)} />
      <select className={input} value={f.fund_id} onChange={e => set('fund_id', e.target.value)}>
        <option value="">খাত বাছাই করুন *</option>
        {funds.map((x: any) => <option key={x.id} value={x.id}>{x.name}</option>)}
      </select>
      <input className={input} placeholder="খরচের ধরন (যেমন: খাদ্য সামগ্রী)" value={f.category}
        onChange={e => set('category', e.target.value)} />
      <textarea className={input} rows={2} placeholder="বিবরণ *" value={f.description}
        onChange={e => set('description', e.target.value)} />
      <input className={input} placeholder="রশিদ/মেমোর ছবির লিংক (ঐচ্ছিক)" value={f.proof_url}
        onChange={e => set('proof_url', e.target.value)} />
      <input className={input} type="date" value={f.spent_on} onChange={e => set('spent_on', e.target.value)} />
      <div className="flex gap-2">
        <button className={btn} onClick={save}>সংরক্ষণ</button>
        <button className="border rounded-lg px-4" onClick={onCancel}>বাতিল</button>
      </div>
      {msg && <p className="text-sm text-center text-red-600">{msg}</p>}
    </div>
  )
}
