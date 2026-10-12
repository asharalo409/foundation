import { useEffect, useState } from 'react'
import { Ico } from './Icons'
import './Icons2'

const bn = (n: number) => Math.round(n || 0).toLocaleString('bn-BD')
const ymOf = (y: number, m: number) => y * 12 + (m - 1)

type Badge = { id: string; icon: string; title: string; desc: string; ok: boolean; hint: string; c1: string; c2: string }

export default function Badges({ supabase, member }: any) {
  const [d, setD] = useState<any>(null)

  useEffect(() => {
    Promise.all([
      supabase.from('donations').select('amount, donated_on, created_at').eq('member_id', member.id),
      supabase.from('monthly_fees').select('year, month, status').eq('member_id', member.id),
      supabase.from('blood_donors').select('total_donations').eq('member_id', member.id).maybeSingle(),
      supabase.from('field_reports').select('id').eq('member_id', member.id).eq('status', 'verified'),
    ]).then(([a, b, c, e]: any) => setD({
      don: a.data || [],
      fees: (b.data || []).filter((x: any) => x.status === 'paid'),
      blood: c.data || null,
      reports: e.error ? [] : e.data || [],
    }))
  }, [member.id])

  if (!d) return null

  const total = d.don.reduce((t: number, x: any) => t + Number(x.amount), 0)
  const donMonths = new Set(d.don.map((x: any) => (x.donated_on || x.created_at || '').slice(0, 7))).size

  const paid = new Set<number>(d.fees.map((f: any) => ymOf(f.year, f.month)))
  const now = new Date()
  const nowYM = ymOf(now.getFullYear(), now.getMonth() + 1)
  let streak = 0
  for (let m = paid.has(nowYM) ? nowYM : nowYM - 1; paid.has(m); m--) streak++
  const sorted = Array.from(paid).sort((a, b) => a - b)
  let longest = 0
  let run = 0
  sorted.forEach((m, i) => {
    run = i > 0 && m === sorted[i - 1] + 1 ? run + 1 : 1
    if (run > longest) longest = run
  })

  const tenure = member.joined_at ? (Date.now() - new Date(member.joined_at).getTime()) / 86400000 : 0
  const bloodN = d.blood ? Number(d.blood.total_donations || 0) : 0

  const tier = total >= 25000 ? 'সোনা' : total >= 5000 ? 'রুপা' : total >= 500 ? 'ব্রোঞ্জ' : ''
  const nextTier = total >= 25000 ? '' : total >= 5000 ? '২৫,০০০' : total >= 500 ? '৫,০০০' : '৫০০'

  const badges: Badge[] = [
    {
      id: 'first', icon: 'heart', title: 'প্রথম হাত', desc: 'প্রথম অনুদান',
      ok: d.don.length >= 1, hint: 'একবার অনুদান দিলেই পাবেন', c1: '#f472b6', c2: '#be185d',
    },
    {
      id: 'regular', icon: 'spark', title: 'নিয়মিত দাতা', desc: '৩টি আলাদা মাসে অনুদান',
      ok: donMonths >= 3, hint: bn(donMonths) + '/৩ মাস', c1: '#60a5fa', c2: '#1d4ed8',
    },
    {
      id: 'tier', icon: 'medal', title: tier ? 'দানবীর ' + tier : 'দানবীর', desc: 'মোট অনুদান',
      ok: !!tier, hint: nextTier ? 'পরের স্তর ৳' + nextTier : 'সর্বোচ্চ স্তর', c1: '#fbbf24', c2: '#b45309',
    },
    {
      id: 'fee12', icon: 'bolt', title: 'সময়নিষ্ঠ', desc: 'টানা ১২ মাস ফি',
      ok: longest >= 12, hint: bn(longest) + '/১২ মাস', c1: '#34d399', c2: '#047857',
    },
    {
      id: 'blood', icon: 'blood', title: 'জীবনরক্ষী', desc: 'রক্তদাতা তালিকায় আছেন',
      ok: !!d.blood, hint: 'রক্তদান SOS পেজে নাম লিখুন', c1: '#f87171', c2: '#991b1b',
    },
    {
      id: 'bloodhero', icon: 'medal', title: 'রক্তবীর', desc: '৩ বার রক্তদান',
      ok: bloodN >= 3, hint: bn(bloodN) + '/৩ বার', c1: '#fb7185', c2: '#9f1239',
    },
    {
      id: 'proof', icon: 'works', title: 'প্রমাণ-বীর', desc: 'যাচাইকৃত কাজের রিপোর্ট',
      ok: d.reports.length >= 1, hint: 'একটা কাজ জমা দিন ও যাচাই করান', c1: '#22d3ee', c2: '#0e7490',
    },
    {
      id: 'old', icon: 'groups', title: 'পুরোনো সঙ্গী', desc: '১ বছর সদস্য',
      ok: tenure >= 365, hint: bn(Math.floor(tenure)) + '/৩৬৫ দিন', c1: '#a78bfa', c2: '#5b21b6',
    },
  ]
  const got = badges.filter(b => b.ok).length

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-3xl p-4 text-white flex items-center gap-4"
        style={{ background: 'linear-gradient(135deg,#f97316,#b91c1c)' }}>
        <span style={{ position: 'absolute', right: -30, bottom: -40, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,.12)' }} />
        <span className="relative w-16 h-16 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,.22)' }}>
          <Ico name="flame" size={38} tint={0.55} />
        </span>
        <div className="relative">
          <p className="text-3xl font-extrabold leading-none">{bn(streak)} মাস</p>
          <p className="text-sm opacity-95 mt-1">টানা ফি-ধারা</p>
          <p className="text-[11px] opacity-80">কোনো মাস বাদ না দিলে ধারা বাড়তেই থাকে</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-bold">আমার অর্জন</p>
          <span className="text-xs font-bold rounded-full px-3 py-1" style={{ background: '#fef3c7', color: '#92400e' }}>
            {bn(got)}/{bn(badges.length)} অর্জিত
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {badges.map(b => (
            <div key={b.id} className="rounded-2xl p-3 flex items-center gap-3"
              style={{ background: b.ok ? 'rgba(251,191,36,.12)' : 'rgba(100,116,139,.09)', opacity: b.ok ? 1 : 0.85 }}>
              <span className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-white"
                style={b.ok
                  ? { background: `linear-gradient(135deg, ${b.c1}, ${b.c2})`, boxShadow: `0 4px 12px ${b.c2}66` }
                  : { background: '#cbd5e1' }}>
                <Ico name={b.ok ? b.icon : 'lock'} size={24} tint={b.ok ? 0.5 : 0.2} />
              </span>
              <div className="min-w-0">
                <p className="font-bold text-sm leading-tight">{b.title}</p>
                <p className="text-[10px] text-gray-500 leading-snug">{b.ok ? b.desc : b.hint}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-gray-400">অর্জনগুলো আপনার ফি, দান ও কাজের তথ্য থেকে নিজে হিসাব হয়।</p>
      </div>
    </div>
  )
}
