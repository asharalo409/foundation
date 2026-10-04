import { useEffect, useRef, useState } from 'react'
import { ROLES } from './Dashboard'
import { fmtDT } from './time'

const input =
  'w-full border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-green-600'
const taka = (n: number) => '৳' + Number(n || 0).toLocaleString('bn-BD')
const bn = (n: number) => Number(n || 0).toLocaleString('bn-BD')
const sum = (a: any[]) => a.reduce((t, x) => t + Number(x.amount), 0)

export default function FundGroups({ supabase, member, user, onNav }: any) {
  const isMgr = ['admin', 'cashier'].includes(member?.role)
  const [funds, setFunds] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [people, setPeople] = useState<any[]>([])
  const [don, setDon] = useState<any[]>([])
  const [exp, setExp] = useState<any[]>([])
  const [fees, setFees] = useState<any[]>([])
  const [open, setOpen] = useState('')

  async function load() {
    const [f, g, p, d, e, fe] = await Promise.all([
      supabase.from('funds').select('*').order('created_at'),
      supabase.from('fund_groups').select('*'),
      supabase.from('public_members').select('id, full_name, photo_url, role, member_code'),
      supabase.from('donations').select('amount, fund_id'),
      supabase.from('expenses').select('amount, fund_id'),
      supabase.from('monthly_fees').select('amount, status'),
    ])
    setFunds(f.data || [])
    setGroups(g.data || [])
    setPeople(p.data || [])
    setDon(d.data || [])
    setExp(e.data || [])
    setFees((fe.data || []).filter((x: any) => x.status === 'paid'))
  }
  useEffect(() => { load() }, [member?.id])

  if (!user)
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm text-center space-y-3">
        <p className="text-sm text-gray-600">তহবিল গ্রুপ দেখতে লগইন করুন।</p>
        <button className="bg-green-700 text-white font-semibold rounded-lg px-5 py-2"
          onClick={() => onNav('login')}>লগইন</button>
      </div>
    )
  if (!member)
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm text-center text-sm text-gray-600">
        অ্যাডমিন আপনাকে সদস্য হিসেবে যুক্ত করলে এখানে গ্রুপ দেখাবে।
      </div>
    )

  const mine = (fid: string) => groups.some(g => g.fund_id === fid && g.member_id === member.id)
  const visible = funds.filter(f => isMgr || mine(f.id))
  const generalId = funds.find(f => f.name.includes('সাধারণ'))?.id || funds[0]?.id
  const collected = (id: string) =>
    sum(don.filter(d => d.fund_id === id)) + (id === generalId ? sum(fees) : 0)
  const spent = (id: string) => sum(exp.filter(x => x.fund_id === id))

  const cur = funds.find(f => f.id === open)
  if (cur)
    return (
      <Group
        supabase={supabase} member={member} fund={cur} people={people} isMgr={isMgr}
        rows={groups.filter(g => g.fund_id === cur.id)}
        collected={collected(cur.id)} spent={spent(cur.id)}
        reload={load} onBack={() => { setOpen(''); load() }}
      />
    )

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-green-700">👥 তহবিলভিত্তিক সদস্য গ্রুপ</p>
        <h2 className="text-xl font-bold">তহবিল গ্রুপ ও গ্রুপ চ্যাট</h2>
        <p className="text-sm text-gray-500">
          প্রতিটি তহবিলের দায়িত্বে থাকা সদস্যদের আলাদা গ্রুপ। গ্রুপের সদস্যরা এখানে তহবিলের হিসাব দেখেন ও নিজেদের মধ্যে চ্যাট করেন।
        </p>
      </div>

      {visible.length === 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm text-center text-sm text-gray-500">
          আপনি এখনও কোনো তহবিল গ্রুপে নেই। অ্যাডমিন বা কোষাধ্যক্ষ আপনাকে যোগ করলে এখানে দেখাবে।
        </div>
      )}

      {visible.map(f => {
        const rows = groups.filter(g => g.fund_id === f.id)
        const me = rows.find(g => g.member_id === member.id)
        const c = collected(f.id)
        const s = spent(f.id)
        return (
          <div key={f.id} className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
            <div className="flex justify-between gap-2">
              <div>
                <p className="text-[11px] text-gray-400">{f.code || 'খাত'}</p>
                <h3 className="font-bold text-lg">{f.name}</h3>
              </div>
              <span className="text-xs text-gray-500 h-fit">👥 {bn(rows.length)} জন</span>
            </div>
            {f.description && <p className="text-sm text-gray-500">{f.description}</p>}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-green-50 p-2">
                <p className="text-gray-500">সংগৃহীত</p>
                <b className="text-green-700">{taka(c)}</b>
              </div>
              <div className="rounded-lg bg-red-50 p-2">
                <p className="text-gray-500">খরচ</p>
                <b className="text-red-600">{taka(s)}</b>
              </div>
              <div className="rounded-lg bg-gray-100 p-2">
                <p className="text-gray-500">উদ্বৃত্ত</p>
                <b>{taka(c - s)}</b>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              আপনি: {me ? (me.is_lead ? '⭐ গ্রুপ লিড' : 'গ্রুপ সদস্য') : 'গ্রুপে নেই (ব্যবস্থাপক হিসেবে দেখছেন)'}
            </p>
            <button className="w-full bg-green-700 text-white font-semibold rounded-lg py-2 text-sm"
              onClick={() => setOpen(f.id)}>
              গ্রুপ খুলুন
            </button>
          </div>
        )
      })}
    </div>
  )
}

function Group({ supabase, member, fund, people, isMgr, rows, collected, spent, reload, onBack }: any) {
  const [tab, setTab] = useState('members')
  const [add, setAdd] = useState('')
  const [msgs, setMsgs] = useState<any[]>([])
  const [text, setText] = useState('')
  const [err, setErr] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  const me = rows.find((g: any) => g.member_id === member.id)
  const canManage = isMgr || !!me?.is_lead
  const who = (id: string) => people.find((p: any) => p.id === id)
  const candidates = people.filter((p: any) => !rows.some((g: any) => g.member_id === p.id))

  async function loadMsgs() {
    const { data } = await supabase.from('fund_messages').select('*').eq('fund_id', fund.id)
      .order('created_at', { ascending: false }).limit(100)
    setMsgs((data || []).reverse())
  }

  useEffect(() => {
    if (tab !== 'chat') return
    loadMsgs()
    const ch = supabase
      .channel('fg-' + fund.id + '-' + Math.random().toString(36).slice(2))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fund_messages' }, () => loadMsgs())
      .subscribe()
    const id = setInterval(loadMsgs, 6000)
    return () => {
      clearInterval(id)
      supabase.removeChannel(ch)
    }
  }, [tab, fund.id])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs.length])

  async function addMember() {
    if (!add) return
    const { error } = await supabase.from('fund_groups').insert({
      fund_id: fund.id, member_id: add, is_lead: false, added_by: member.id,
    })
    setErr(error ? 'ব্যর্থ: ' + error.message : '')
    setAdd('')
    reload()
  }
  async function removeMember(mid: string) {
    if (!confirm('গ্রুপ থেকে সরাবেন?')) return
    const { error } = await supabase.from('fund_groups').delete()
      .match({ fund_id: fund.id, member_id: mid })
    setErr(error ? 'ব্যর্থ: ' + error.message : '')
    reload()
  }
  async function toggleLead(g: any) {
    const { error } = await supabase.from('fund_groups').update({ is_lead: !g.is_lead })
      .match({ fund_id: fund.id, member_id: g.member_id })
    setErr(error ? 'ব্যর্থ: ' + error.message : '')
    reload()
  }

  async function send() {
    const body = text.trim()
    if (!body) return
    setText('')
    const { error } = await supabase.from('fund_messages').insert({
      fund_id: fund.id, sender_id: member.id, body,
    })
    setErr(error ? 'পাঠানো যায়নি: ' + error.message : '')
    loadMsgs()
  }
  async function removeMsg(id: string) {
    if (!confirm('বার্তাটি মুছবেন?')) return
    await supabase.from('fund_messages').delete().eq('id', id)
    loadMsgs()
  }

  return (
    <div className="space-y-3">
      <button className="text-sm text-green-700 underline" onClick={onBack}>← সব গ্রুপ</button>

      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
        <p className="text-[11px] text-gray-400">{fund.code || 'খাত'}</p>
        <h2 className="font-bold text-lg">{fund.name}</h2>
        {fund.description && <p className="text-sm text-gray-500">{fund.description}</p>}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg bg-green-50 p-2">
            <p className="text-gray-500">সংগৃহীত</p><b className="text-green-700">{taka(collected)}</b>
          </div>
          <div className="rounded-lg bg-red-50 p-2">
            <p className="text-gray-500">খরচ</p><b className="text-red-600">{taka(spent)}</b>
          </div>
          <div className="rounded-lg bg-gray-100 p-2">
            <p className="text-gray-500">উদ্বৃত্ত</p><b>{taka(collected - spent)}</b>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {[['members', '👥 গ্রুপ সদস্য'], ['chat', '💬 গ্রুপ চ্যাট']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={'flex-1 py-2 rounded-lg text-sm font-semibold ' +
              (tab === k ? 'bg-green-700 text-white' : 'bg-white border')}>
            {l}
          </button>
        ))}
      </div>

      {err && <p className="text-xs text-red-600 text-center">{err}</p>}

      {tab === 'members' && (
        <div className="space-y-2">
          {canManage && (
            <div className="bg-white rounded-xl p-3 shadow-sm space-y-2">
              <p className="text-sm font-semibold">সদস্য যোগ করুন</p>
              <div className="flex gap-2">
                <select className={input} value={add} onChange={e => setAdd(e.target.value)}>
                  <option value="">সদস্য বাছাই করুন</option>
                  {candidates.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.full_name} ({p.member_code})</option>
                  ))}
                </select>
                <button className="bg-green-700 text-white font-semibold rounded-lg px-4 text-sm"
                  onClick={addMember}>যোগ করুন</button>
              </div>
            </div>
          )}

          {rows.length === 0 && (
            <p className="text-center text-sm text-gray-500 py-4">এখনও কোনো সদস্য নেই</p>
          )}
          {rows.map((g: any) => {
            const p = who(g.member_id)
            return (
              <div key={g.member_id} className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3">
                {p?.photo_url ? (
                  <img src={p.photo_url} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">👤</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {p?.full_name || 'সদস্য'} {g.is_lead && <span className="text-amber-500">⭐ গ্রুপ লিড</span>}
                  </p>
                  <p className="text-[11px] text-gray-500">{ROLES[p?.role] || ''} · {p?.member_code || ''}</p>
                  <p className="text-[10px] text-gray-400">🕒 যোগ: {fmtDT(g.added_at)}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {isMgr && (
                    <button className="text-[11px] underline" onClick={() => toggleLead(g)}>
                      {g.is_lead ? 'লিড সরান' : 'লিড বানান'}
                    </button>
                  )}
                  {canManage && (
                    <button className="text-[11px] underline text-red-600" onClick={() => removeMember(g.member_id)}>
                      সরান
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'chat' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="h-[55vh] overflow-y-auto p-3 space-y-2">
            {msgs.length === 0 && (
              <p className="text-center text-sm text-gray-400 pt-10">এখনও কোনো বার্তা নেই</p>
            )}
            {msgs.map(m => {
              const mineMsg = m.sender_id === member.id
              return (
                <div key={m.id} className={'flex ' + (mineMsg ? 'justify-end' : 'justify-start')}>
                  <div className={'max-w-[80%] rounded-2xl px-3 py-2 ' +
                    (mineMsg ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-800')}>
                    {!mineMsg && (
                      <p className="text-[11px] font-semibold text-green-700">{who(m.sender_id)?.full_name || 'সদস্য'}</p>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">{m.body}</p>
                    <p className={'text-[10px] mt-0.5 flex gap-2 justify-end ' +
                      (mineMsg ? 'text-white/70' : 'text-gray-400')}>
                      {fmtDT(m.created_at)}
                      {(mineMsg || isMgr) && <button onClick={() => removeMsg(m.id)}>🗑</button>}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={endRef} />
          </div>
          <div className="p-2 border-t flex gap-2">
            <input className={input} placeholder="গ্রুপে বার্তা লিখুন..." value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') send() }} />
            <button className="bg-green-700 text-white rounded-lg px-4 font-semibold" onClick={send}>➤</button>
          </div>
        </div>
      )}
    </div>
  )
}
