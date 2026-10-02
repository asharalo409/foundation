import { useEffect, useState } from 'react'
import PhotoPicker from './Upload'
import { fmtDT } from './time'

export const ROLES: Record<string, string> = {
  admin: 'অ্যাডমিন',
  president: 'সভাপতি',
  general_secretary: 'সাধারণ সম্পাদক',
  cashier: 'কোষাধ্যক্ষ',
  health: 'স্বাস্থ্য ও রক্তদান সমন্বয়ক',
  sports: 'ক্রীড়া ও সাংস্কৃতিক সম্পাদক',
  publicity: 'প্রচার ও প্রকাশনা সম্পাদক',
  member: 'সদস্য',
}
const MONTHS = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রি', 'মে', 'জুন', 'জুলা', 'আগ', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে']
const taka = (n: number) => '৳' + Number(n || 0).toLocaleString('bn-BD')
const bnd = (s: string) => new Date(s).toLocaleDateString('bn-BD')

export default function Dashboard({ supabase, member, user, settings, setMember, onOut }: any) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [don, setDon] = useState<any[]>([])
  const [fees, setFees] = useState<any[]>([])
  const [funds, setFunds] = useState<any[]>([])

  useEffect(() => {
    if (!member) return
    supabase.from('donations').select('*').eq('member_id', member.id)
      .order('donated_on', { ascending: false }).then(({ data }: any) => setDon(data || []))
    supabase.from('monthly_fees').select('*').eq('member_id', member.id)
      .then(({ data }: any) => setFees(data || []))
    supabase.from('funds').select('*').then(({ data }: any) => setFunds(data || []))
  }, [member?.id])

  if (!user) return null

  const logout = (
    <button className="w-full border border-red-300 text-red-600 rounded-lg py-2"
      onClick={async () => { await supabase.auth.signOut(); onOut() }}>
      লগআউট
    </button>
  )

  if (!member)
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
        <p className="text-sm text-gray-600">অ্যাডমিন আপনাকে সদস্য হিসেবে যুক্ত করলে এখানে তথ্য আসবে।</p>
        {logout}
      </div>
    )

  const color = settings?.theme_color || '#16a34a'
  const fee = Number(settings?.monthly_fee || 0)
  const joined = member.joined_at ? new Date(member.joined_at) : new Date(2000, 0, 1)
  const jIdx = joined.getFullYear() * 12 + joined.getMonth()
  const nIdx = now.getFullYear() * 12 + now.getMonth()

  function state(m: number) {
    if (fees.some(f => f.year === year && f.month === m && f.status === 'paid')) return 'paid'
    const idx = year * 12 + (m - 1)
    if (idx < jIdx) return 'na'
    return idx <= nIdx ? 'due' : 'future'
  }
  const states = MONTHS.map((_, i) => state(i + 1))
  const paidN = states.filter(s => s === 'paid').length
  const dueN = states.filter(s => s === 'due').length
  const totalDon = don.reduce((t, d) => t + Number(d.amount), 0)
  const fundName = (id: string) => funds.find(f => f.id === id)?.name || '-'

  async function savePhoto(url: string) {
    const { error } = await supabase.from('members').update({ photo_url: url }).eq('id', member.id)
    if (!error) setMember({ ...member, photo_url: url })
  }

  const chip: Record<string, string> = {
    paid: 'bg-green-600 text-white',
    due: 'bg-red-100 text-red-700 border border-red-300',
    future: 'bg-gray-100 text-gray-400',
    na: 'bg-gray-50 text-gray-300',
  }

  return (
    <div className="space-y-3">
      <style>{`@media print{body *{visibility:hidden}#idcard,#idcard *{visibility:visible}#idcard{position:fixed;left:10px;top:10px;width:340px}}`}</style>

      <div className="bg-white rounded-xl p-4 shadow-sm text-center space-y-2">
        {member.photo_url ? (
          <img src={member.photo_url} className="w-24 h-24 rounded-full object-cover mx-auto" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto flex items-center justify-center text-3xl">👤</div>
        )}
        <h2 className="font-bold text-lg">{member.full_name}</h2>
        <p className="text-sm text-gray-500">{ROLES[member.role] || member.role} · {member.member_code}</p>
        {member.joined_at && (
          <p className="text-[11px] text-gray-400">📅 যোগদান: {bnd(member.joined_at)}</p>
        )}
        <PhotoPicker supabase={supabase} folder="members" label="প্রোফাইল ছবি দিন" onDone={savePhoto} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <p className="text-xs text-gray-500">মোট দান</p>
          <p className="font-bold text-green-700 text-sm">{taka(totalDon)}</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <p className="text-xs text-gray-500">ফি পরিশোধ</p>
          <p className="font-bold text-sm">{paidN} মাস</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <p className="text-xs text-gray-500">বকেয়া</p>
          <p className="font-bold text-red-600 text-sm">{dueN} মাস ({taka(dueN * fee)})</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-bold">মাসিক ফি খতিয়ান</h3>
          <select className="border rounded-lg px-2 py-1 text-sm" value={year}
            onChange={e => setYear(Number(e.target.value))}>
            {[0, 1, 2].map(i => <option key={i} value={now.getFullYear() - i}>{now.getFullYear() - i}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {MONTHS.map((m, i) => {
            const paidRow = fees.find(f => f.year === year && f.month === i + 1 && f.status === 'paid')
            return (
              <div key={m} className={'rounded-lg py-2 text-center text-xs font-semibold ' + chip[states[i]]}>
                {m}
                <div className="text-[10px] font-normal">
                  {states[i] === 'paid' ? 'পেইড' : states[i] === 'due' ? 'বকেয়া' : '-'}
                </div>
                {paidRow?.paid_on && (
                  <div className="text-[9px] font-normal opacity-80">{bnd(paidRow.paid_on)}</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
        <h3 className="font-bold">আমার দানের ইতিহাস</h3>
        {don.length === 0 && <p className="text-sm text-gray-500">এখনও কোনো দান নেই</p>}
        {don.map(d => (
          <div key={d.id} className="flex justify-between border-t pt-2">
            <div>
              <p className="text-sm font-semibold">{fundName(d.fund_id)}</p>
              <p className="text-xs text-gray-500">
                {bnd(d.donated_on || d.created_at)} · রসিদ: {d.receipt_no || '-'}
              </p>
              <p className="text-[11px] text-gray-400">🕒 {fmtDT(d.created_at)}</p>
            </div>
            <p className="font-bold text-green-700">{taka(d.amount)}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
        <h3 className="font-bold">ডিজিটাল আইডি কার্ড</h3>
        <div id="idcard" className="rounded-2xl overflow-hidden border shadow-md max-w-[340px]">
          <div className="text-white p-3 flex items-center gap-2" style={{ background: color }}>
            {settings?.logo_url && <img src={settings.logo_url} className="w-9 h-9 rounded-full object-cover" />}
            <p className="font-bold text-sm">{settings?.org_name}</p>
          </div>
          <div className="p-3 flex gap-3 bg-white">
            {member.photo_url ? (
              <img src={member.photo_url} className="w-20 h-20 rounded-lg object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center text-2xl">👤</div>
            )}
            <div className="text-sm space-y-0.5">
              <p className="font-bold">{member.full_name}</p>
              <p>আইডি: {member.member_code}</p>
              <p>পদবী: {ROLES[member.role] || member.role}</p>
              <p>রক্তের গ্রুপ: {member.blood_group || '-'}</p>
              <p>মেয়াদ: {member.valid_until ? bnd(member.valid_until) : '-'}</p>
            </div>
          </div>
        </div>
        <button className="w-full border border-green-700 text-green-700 rounded-lg py-2 text-sm font-semibold"
          onClick={() => window.print()}>
          🖨️ প্রিন্ট / PDF হিসেবে সেভ
        </button>
      </div>

      {logout}
    </div>
  )
}
