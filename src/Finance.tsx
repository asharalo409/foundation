import { useEffect, useState } from 'react'
import { fmtDT } from './time'
import { ReceiptBtn } from './Receipt'
import BulkImport from './BulkImport'
import FeePlan from './FeePlan'
import { feeFor } from './feeRate'
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

export default function Finance({ supabase, canEdit, isAdmin, member, settings }: any) {
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
  const [fyr, setFyr] = useState(0)

  async function load() {
    const [f, d, e, fe, p, s] = await Promise.all([
      supabase.from('funds').select('*').order('name'),
      supabase.from('donations').select('*').order('donated_on', { ascending: false }),
      supabase.from('expenses').select('*').order('spent_on', { ascending: false }),
      supabase.from('monthly_fees').select('*'),
      supabase.from('public_members').select('*').order('full_name'),
      supabase.from('settings').select('monthly_fee, sheet_url, fee_plan').eq('id', 1).single(),
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

  const feeYear = fyr || (year === 'all' ? thisYear : Number(year))

  async function remove(table: string, id: string) {
    if (!confirm('মুছে ফেলবেন?')) return
    await supabase.from(table).delete().eq('id', id)
    load()
  }

  async function toggleFee(pid: string, m: number) {
    const feeOf = () => feeFor(cfg, pid, feeYear, m)
    const ex = fees.find(f => f.member_id === pid && f.year === feeYear && f.month === m)
    if (ex) await supabase.from('monthly_fees').delete().eq('id', ex.id)
    else
      await supabase.from('monthly_fees').insert({
        member_id: pid, year: feeYear, month: m,
        amount: feeOf(), status: 'paid', paid_on: today(),
      })
    load()
  }

  async function saveSetting(patch: any) {
    await supabase.from('settings').update(patch).eq('id', 1)
    load()
  }

  const tabs = [['don', 'অনুদান'], ['exp', 'খরচ'], ['mem', 'সদস্য'], ['cat', 'চাঁদার ক্যাটাগরি'],
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
