import { useEffect, useState } from 'react'
import { fmtDT } from './time'
import { t } from './i18n'

const input =
  'w-full border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-green-600'
const taka = (n: number) => '৳' + Number(n || 0).toLocaleString('bn-BD')
const METHODS = ['বিকাশ', 'নগদ', 'রকেট', 'ব্যাংক']
const ST: Record<string, [string, string]> = {
  pending: ['⏳ অপেক্ষমাণ', 'text-amber-600'],
  accepted: ['✅ গৃহীত', 'text-green-700'],
  rejected: ['❌ প্রত্যাখ্যাত', 'text-red-600'],
}

export default function DonateBox({ supabase, settings, member, isMember, onClose, onFinance, initialFund }: any) {
  const [funds, setFunds] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [mine, setMine] = useState<any[]>([])
  const [f, setF] = useState({
    fund_id: initialFund || '', amount: '', method: 'বিকাশ', trx_id: '', phone: '', name: '', note: '',
  })
  const [msg, setMsg] = useState('')
  const [ok, setOk] = useState(false)
  const [busy, setBusy] = useState(false)
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }))

  async function loadMine() {
    if (!isMember) return
    const { data } = await supabase.from('donation_requests').select('*')
      .eq('member_id', member.id).order('created_at', { ascending: false }).limit(8)
    setMine(data || [])
  }

  useEffect(() => {
    supabase.from('funds').select('id, name').order('name')
      .then(({ data }: any) => setFunds(data || []))
    supabase.from('projects').select('title, fund_id, status')
      .then(({ data }: any) => setProjects(data || []))
    loadMine()
  }, [])

  const label = (fd: any) => {
    const ps = projects.filter(p => p.fund_id === fd.id && p.status === 'active').map(p => p.title)
    return ps.length ? `${fd.name} — ${ps.join(' / ')}` : fd.name
  }
  const fundName = (id: string) => funds.find(x => x.id === id)?.name || '-'

  async function submit() {
    setOk(false)
    const amount = Number(f.amount)
    const trx = f.trx_id.trim()
    if (!f.fund_id) { setMsg('কোন বিষয়ে দান করছেন সেটা বাছাই করুন'); return }
    if (!(amount > 0)) { setMsg('টাকার পরিমাণ দিন'); return }
    if (trx.length < 4) { setMsg('ট্রানজেকশন নম্বর দিন'); return }
    if (!isMember && (!f.name.trim() || !f.phone.trim())) { setMsg('আপনার নাম ও ফোন নম্বর দিন'); return }

    setBusy(true)
    const { error } = await supabase.from('donation_requests').insert({
      member_id: isMember ? member.id : null,
      donor_name: isMember ? member.full_name : f.name.trim(),
      phone: f.phone.trim() || (isMember ? member.phone : null) || null,
      fund_id: f.fund_id,
      amount,
      method: f.method,
      trx_id: trx,
      note: f.note.trim() || null,
    })
    setBusy(false)
    if (error) {
      setMsg(error.code === '23505' ? 'এই ট্রানজেকশন নম্বর আগেই জমা হয়েছে।' : 'ব্যর্থ: ' + error.message)
      return
    }
    setOk(true)
    setMsg('✅ জমা হয়েছে। কোষাধ্যক্ষ ট্রানজেকশন মিলিয়ে গ্রহণ করলে আপনার দান নির্বাচিত খাতে যোগ হবে।')
    setF(p => ({ ...p, amount: '', trx_id: '', note: '' }))
    loadMine()
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-end sm:items-center" onClick={onClose}>
      <div className="bg-white w-full max-w-md mx-auto rounded-t-2xl sm:rounded-2xl p-5 space-y-3 max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <h3 className="font-bold">💚 {t('অনুদান পাঠানোর মাধ্যম')}</h3>
          <button className="text-xl" onClick={onClose}>✕</button>
        </div>

        {settings?.bank_details ? (
          <p className="text-sm whitespace-pre-line bg-green-50 rounded-lg p-3">{settings.bank_details}</p>
        ) : (
          <p className="text-sm text-gray-500">এখনও কোনো মাধ্যম যোগ করা হয়নি।</p>
        )}
        {settings?.hotline && (
          <p className="text-sm">📞 <a href={'tel:' + settings.hotline}>{settings.hotline}</a></p>
        )}

        <div className="border-t pt-3 space-y-2">
          <p className="font-bold text-sm">দানের তথ্য জমা দিন</p>
          <p className="text-[11px] text-gray-500">
            টাকা পাঠানোর পর নিচের ফর্মে ট্রানজেকশন নম্বরসহ জমা দিন।
          </p>

          <select className={input} value={f.fund_id} onChange={e => set('fund_id', e.target.value)}>
            <option value="">কোন বিষয়ে দান করছেন? *</option>
            {funds.map(fd => <option key={fd.id} value={fd.id}>{label(fd)}</option>)}
          </select>
          <input className={input} type="number" placeholder="টাকার পরিমাণ *" value={f.amount}
            onChange={e => set('amount', e.target.value)} />
          <select className={input} value={f.method} onChange={e => set('method', e.target.value)}>
            {METHODS.map(m => <option key={m}>{m}</option>)}
          </select>
          <input className={input} placeholder="ট্রানজেকশন নম্বর (TrxID) *" value={f.trx_id}
            onChange={e => set('trx_id', e.target.value)} />
          {!isMember && (
            <input className={input} placeholder="আপনার নাম *" value={f.name}
              onChange={e => set('name', e.target.value)} />
          )}
          <input className={input}
            placeholder={isMember ? 'যে নম্বর থেকে পাঠিয়েছেন (ঐচ্ছিক)' : 'আপনার ফোন নম্বর *'}
            value={f.phone} onChange={e => set('phone', e.target.value)} />
          <input className={input} placeholder="নোট (ঐচ্ছিক)" value={f.note}
            onChange={e => set('note', e.target.value)} />

          <button className="w-full bg-green-700 text-white font-semibold rounded-lg py-2.5 disabled:opacity-50"
            disabled={busy} onClick={submit}>
            {busy ? 'অপেক্ষা করুন...' : 'দান জমা দিন'}
          </button>
          {msg && <p className={'text-sm text-center ' + (ok ? 'text-green-700' : 'text-red-600')}>{msg}</p>}
        </div>

        {isMember && mine.length > 0 && (
          <div className="border-t pt-3 space-y-2">
            <p className="font-bold text-sm">আমার জমা দেওয়া দান</p>
            {mine.map(r => (
              <div key={r.id} className="rounded-lg bg-gray-50 p-2 text-sm">
                <div className="flex justify-between">
                  <b>{taka(r.amount)}</b>
                  <span className={'text-xs font-semibold ' + ST[r.status][1]}>{ST[r.status][0]}</span>
                </div>
                <p className="text-xs text-gray-500">{fundName(r.fund_id)} · {r.method} · {r.trx_id}</p>
                {r.reject_reason && <p className="text-xs text-red-600">কারণ: {r.reject_reason}</p>}
                <p className="text-[10px] text-gray-400">🕒 {fmtDT(r.created_at)}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          {isMember && (
            <button className="flex-1 bg-green-700 text-white font-semibold rounded-lg py-2.5" onClick={onFinance}>
              {t('আয়-ব্যয় দেখুন')}
            </button>
          )}
          <button className="flex-1 border rounded-lg py-2.5" onClick={onClose}>{t('বন্ধ করুন')}</button>
        </div>
      </div>
    </div>
  )
}
