import { useEffect, useState } from 'react'
import { fmtDT } from './time'

const taka = (n: number) => '৳' + Number(n || 0).toLocaleString('bn-BD')
const bn = (n: number) => n.toLocaleString('bn-BD')
const ST: Record<string, [string, string]> = {
  accepted: ['✅ গৃহীত', 'text-green-700'],
  rejected: ['❌ প্রত্যাখ্যাত', 'text-red-600'],
}

export default function PayRequests({ supabase, member, onChange }: any) {
  const [rows, setRows] = useState<any[]>([])
  const [funds, setFunds] = useState<any[]>([])
  const [people, setPeople] = useState<any[]>([])
  const [show, setShow] = useState(true)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState('')

  async function load() {
    const [r, f, p] = await Promise.all([
      supabase.from('donation_requests').select('*').order('created_at', { ascending: false }).limit(60),
      supabase.from('funds').select('id, name'),
      supabase.from('public_members').select('id, full_name'),
    ])
    setRows(r.data || [])
    setFunds(f.data || [])
    setPeople(p.data || [])
  }
  useEffect(() => { load() }, [])

  const fundName = (id: string) => funds.find(x => x.id === id)?.name || '-'
  const who = (r: any) => people.find(p => p.id === r.member_id)?.full_name || r.donor_name || 'নামহীন'
  const pending = rows.filter(r => r.status === 'pending')
  const done = rows.filter(r => r.status !== 'pending').slice(0, 8)

  async function accept(r: any) {
    setBusy(r.id)
    setMsg('')
    const { error } = await supabase.rpc('accept_donation_request', { p_id: r.id })
    setBusy('')
    if (error) { setMsg('ব্যর্থ: ' + error.message); return }
    setMsg('✅ গ্রহণ করা হয়েছে, টাকা খাতে যোগ হয়েছে')
    await load()
    onChange?.()
  }

  async function reject(r: any) {
    const reason = window.prompt('প্রত্যাখ্যানের কারণ লিখুন:')
    if (reason === null) return
    const { error } = await supabase.from('donation_requests').update({
      status: 'rejected',
      reject_reason: reason || null,
      decided_by: member?.id || null,
      decided_at: new Date().toISOString(),
    }).eq('id', r.id).eq('status', 'pending')
    setMsg(error ? 'ব্যর্থ: ' + error.message : '')
    load()
  }

  async function changeAmount(r: any) {
    const v = window.prompt('নতুন টাকার পরিমাণ লিখুন:', String(r.amount))
    if (v === null) return
    const n = Number(v)
    if (!(n > 0)) { setMsg('সঠিক পরিমাণ দিন'); return }
    const { error } = await supabase.from('donation_requests').update({ amount: n })
      .eq('id', r.id).eq('status', 'pending')
    setMsg(error ? 'ব্যর্থ: ' + error.message : '')
    load()
  }

  return (
    <div className="bg-white rounded-xl p-3 shadow-sm space-y-2 border border-amber-300">
      <button className="w-full flex justify-between items-center" onClick={() => setShow(!show)}>
        <b className="text-sm">💸 অপেক্ষমাণ দানের অনুরোধ</b>
        <span className="bg-amber-500 text-white text-xs rounded-full px-2 py-0.5">{bn(pending.length)}</span>
      </button>

      {show && (
        <div className="space-y-2">
          <p className="text-[11px] text-gray-500">
            ট্রানজেকশন মিলিয়ে গ্রহণ করুন। গ্রহণ করলে টাকা সাথে সাথে নির্বাচিত খাতে যোগ হয়ে যাবে।
          </p>
          {msg && <p className="text-xs text-center">{msg}</p>}
          {pending.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-2">কোনো অপেক্ষমাণ অনুরোধ নেই</p>
          )}

          {pending.map(r => (
            <div key={r.id} className="rounded-lg bg-amber-50 p-3 space-y-1">
              <div className="flex justify-between">
                <p className="font-semibold text-sm">{who(r)}</p>
                <b className="text-green-700">{taka(r.amount)}</b>
              </div>
              {r.phone && <p className="text-xs text-gray-600">📞 {r.phone}</p>}
              <p className="text-xs text-gray-600">খাত: {fundName(r.fund_id)}</p>
              <p className="text-xs text-gray-600">মাধ্যম: {r.method} · ট্রানজেকশন নম্বর: <b>{r.trx_id}</b></p>
              {r.note && <p className="text-xs text-gray-500">"{r.note}"</p>}
              <p className="text-[11px] text-gray-400">🕒 জমার সময়: {fmtDT(r.created_at)}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button className="bg-green-700 text-white text-sm font-semibold rounded-lg px-3 py-1.5 disabled:opacity-50"
                  disabled={busy === r.id} onClick={() => accept(r)}>
                  ✓ গ্রহণ করুন
                </button>
                <button className="border border-red-300 text-red-600 text-sm rounded-lg px-3 py-1.5"
                  onClick={() => reject(r)}>
                  প্রত্যাখ্যান করুন
                </button>
                <button className="text-xs underline text-gray-600" onClick={() => changeAmount(r)}>
                  পরিমাণ বদলান
                </button>
              </div>
            </div>
          ))}

          {done.length > 0 && (
            <div className="border-t pt-2 space-y-1">
              <p className="text-xs font-semibold text-gray-500">সিদ্ধান্ত হয়েছে এমন (সর্বশেষ)</p>
              {done.map(r => (
                <div key={r.id} className="text-xs flex justify-between gap-2">
                  <span className="min-w-0 truncate">
                    {who(r)} · {taka(r.amount)} · {r.trx_id}
                  </span>
                  <span className={'shrink-0 font-semibold ' + ST[r.status][1]}>{ST[r.status][0]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
