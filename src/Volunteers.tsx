import { useEffect, useState } from 'react'
import { ROLES } from './Dashboard'
import { fmtDT } from './time'

const input =
  'w-full border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-green-600'
const bn = (n: number) => Number(n || 0).toLocaleString('bn-BD')
const bnd = (s: string) => new Date(s).toLocaleDateString('bn-BD')
const todayStr = () => new Date().toLocaleDateString('en-CA')
const localInput = (iso?: string) => {
  const d = iso ? new Date(iso) : new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

const STATUS: Record<string, string> = { todo: 'করণীয়', doing: 'চলমান', done: 'সম্পন্ন' }
const STCOL: Record<string, string> = {
  todo: 'bg-gray-100 text-gray-600',
  doing: 'bg-amber-100 text-amber-700',
  done: 'bg-green-100 text-green-700',
}
const ETYPES: Record<string, string> = {
  meeting: 'সভা',
  field: 'ফিল্ড ট্রিপ',
  tournament: 'টুর্নামেন্ট',
  cultural: 'সাংস্কৃতিক অনুষ্ঠান',
  other: 'অন্যান্য',
}

const ROLE_DUTIES: Record<string, string[]> = {
  admin: [
    'সদস্য যুক্ত করা, পদবী বণ্টন ও অ্যাডমিন ক্ষমতা নিয়ন্ত্রণ',
    'ফাউন্ডেশনের নাম, লোগো, থিম ও যোগাযোগের তথ্য হালনাগাদ রাখা',
    'আর্থিক ও কার্যক্রমের তথ্যের স্বচ্ছতা নিশ্চিত করা',
  ],
  president: [
    'ফাউন্ডেশনের সামাজিক নীতি নির্ধারণ ও কার্যক্রমের দিকনির্দেশনা প্রদান',
    'জাতীয় ও আন্তর্জাতিক সংস্থার সাথে যোগাযোগ ও চুক্তি সম্পাদন',
    'বার্ষিক বাজেট অনুমোদন ও বিশেষ জরুরি ত্রাণ তহবিলের চূড়ান্ত তদারকি',
  ],
  general_secretary: [
    'দৈনন্দিন সাংগঠনিক কার্যক্রম পরিচালনা ও সদস্যদের মধ্যে সমন্বয়',
    'মিটিং ও ফিল্ড ট্রিপের আয়োজন এবং ডিজিটাল হাজিরা রক্ষণ',
    'ফিল্ড রিপোর্ট যাচাই ও দায়িত্ব বণ্টন',
  ],
  cashier: [
    'অনুদান ও মাসিক ফি গ্রহণ এবং রসিদ প্রদান',
    'খরচের ভাউচার এন্ট্রি ও ক্যাশ ব্যালেন্স সংরক্ষণ',
    'আর্থিক অডিটে সহযোগিতা ও খাতভিত্তিক হিসাব হালনাগাদ',
  ],
  health: [
    'জরুরি রক্তের রিকোয়েস্ট তৈরি ও প্রচার',
    'রক্তদাতা তালিকা হালনাগাদ ও যাচাই',
    'স্বাস্থ্য ক্যাম্প ও সচেতনতামূলক কর্মসূচি সমন্বয়',
  ],
  sports: [
    'যুব কল্যাণ টুর্নামেন্ট ও সাংস্কৃতিক ইভেন্ট আয়োজন',
    'অংশগ্রহণকারী ও স্বেচ্ছাসেবকদের সমন্বয়',
  ],
  publicity: [
    'ছবি, ভিডিও গ্যালারি ও প্রেস রিলিজ প্রকাশ',
    'নোটিশ বোর্ড হালনাগাদ ও সামাজিক যোগাযোগমাধ্যম পরিচালনা',
  ],
  member: [
    'মাঠপর্যায়ের কাজের রিপোর্ট জমা দেওয়া',
    'নিয়মিত মাসিক ফি পরিশোধ করা',
    'মিটিং ও কার্যক্রমে সক্রিয় অংশগ্রহণ',
  ],
}

const TOOLS: Record<string, [string, string][]> = {
  admin: [['🛡️ অ্যাডমিন প্যানেল', 'admin'], ['🧾 আয়-ব্যয়', 'finance'], ['✅ রিপোর্ট যাচাই', 'works']],
  president: [['✅ রিপোর্ট যাচাই', 'works'], ['💚 প্রকল্প', 'projects'], ['📍 সাহায্য ম্যাপ', 'map'], ['📢 নোটিশ প্রকাশ', 'home']],
  general_secretary: [['📋 হাজিরা খাতা', '#att'], ['✅ রিপোর্ট যাচাই', 'works'], ['💚 প্রকল্প', 'projects'], ['📍 সাহায্য ম্যাপ', 'map']],
  cashier: [['🧾 আয়-ব্যয়', 'finance'], ['📚 খাত খতিয়ান', 'ledger']],
  health: [['🩸 রক্তদান SOS', 'blood']],
  sports: [['🗓️ ইভেন্ট ম্যানেজমেন্ট', '#att']],
  publicity: [['📢 নোটিশ ও গ্যালারি', 'home'], ['✅ কাজের প্রমাণ', 'works']],
  member: [['✅ রিপোর্ট জমা', 'works'], ['🩸 রক্তদাতা নিবন্ধন', 'blood']],
}

export default function Volunteers({ supabase, member, user, onNav }: any) {
  const role = member?.role
  const assigner = ['admin', 'president', 'general_secretary'].includes(role)
  const canEvent = ['admin', 'general_secretary', 'sports'].includes(role)
  const canMark = ['admin', 'general_secretary'].includes(role)

  const [view, setView] = useState('duties')
  const [people, setPeople] = useState<any[]>([])
  const [duties, setDuties] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [att, setAtt] = useState<any[]>([])

  async function load() {
    const [p, d, e, a] = await Promise.all([
      supabase.from('public_members').select('*').order('full_name'),
      user
        ? supabase.from('duties').select('*').order('created_at', { ascending: false })
        : Promise.resolve({ data: [] }),
      supabase.from('events').select('*').order('event_date', { ascending: false }),
      supabase.from('attendance').select('*'),
    ])
    setPeople(p.data || [])
    setDuties(d.data || [])
    setEvents(e.data || [])
    setAtt(a.data || [])
  }
  useEffect(() => { load() }, [user])

  const tools = TOOLS[role] || []

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-green-700">🙋 স্বেচ্ছাসেবক, দায়িত্ব ও হাজিরা</p>
        <h2 className="text-xl font-bold">স্বেচ্ছাসেবক ও দায়িত্ব বণ্টন</h2>
        <p className="text-sm text-gray-500">
          প্রতিটি পদের দায়িত্ব, কাজের অগ্রগতি, মিটিং ও ফিল্ড ট্রিপের উপস্থিতি এক জায়গায়।
        </p>
      </div>

      {member && (
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <div>
            <p className="text-[11px] text-gray-400">আপনার পদ</p>
            <h3 className="font-bold">{ROLES[role] || role}</h3>
          </div>
          <div>
            <p className="text-sm font-semibold mb-1">🏛️ পদে অর্পিত দায়িত্বসমূহ:</p>
            <ul className="space-y-1">
              {(ROLE_DUTIES[role] || ROLE_DUTIES.member).map(x => (
                <li key={x} className="text-sm text-gray-600 flex gap-2">
                  <span className="text-green-600">●</span>
                  {x}
                </li>
              ))}
            </ul>
          </div>
          {tools.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tools.map(([label, key]) => (
                <button key={label}
                  className="border border-green-700 text-green-700 rounded-lg px-3 py-1.5 text-sm font-semibold"
                  onClick={() => (key.startsWith('#') ? setView(key.slice(1)) : onNav(key))}>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto">
        {[['duties', '📌 দায়িত্ব'], ['att', '📋 হাজিরা'], ['dir', '👥 সদস্য তালিকা']].map(([k, l]) => (
          <button key={k} onClick={() => setView(k)}
            className={'px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ' +
              (view === k ? 'bg-green-700 text-white' : 'bg-white border')}>
            {l}
          </button>
        ))}
      </div>

      {view === 'duties' && (
        <Duties supabase={supabase} member={member} user={user} people={people}
          duties={duties} assigner={assigner} reload={load} onNav={onNav} />
      )}
      {view === 'att' && (
        <Attendance supabase={supabase} member={member} people={people} events={events}
          att={att} canEvent={canEvent} canMark={canMark} reload={load} />
      )}
      {view === 'dir' && <Directory people={people} />}
    </div>
  )
}

function Duties({ supabase, member, user, people, duties, assigner, reload, onNav }: any) {
  const [form, setForm] = useState<any>(null)
  const [st, setSt] = useState('all')

  if (!user)
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm text-center space-y-3">
        <p className="text-sm text-gray-600">দায়িত্ব ও কাজের অগ্রগতি দেখতে লগইন করুন।</p>
        <button className="bg-green-700 text-white font-semibold rounded-lg px-5 py-2"
          onClick={() => onNav('login')}>
          লগইন
        </button>
      </div>
    )

  const nameOf = (id: string) => people.find((p: any) => p.id === id)?.full_name

  async function setStatus(d: any, s: string) {
    await supabase.from('duties').update({
      status: s, done_at: s === 'done' ? new Date().toISOString() : null,
    }).eq('id', d.id)
    reload()
  }
  async function remove(id: string) {
    if (!confirm('দায়িত্বটি মুছে ফেলবেন?')) return
    await supabase.from('duties').delete().eq('id', id)
    reload()
  }

  const mine = duties.filter((d: any) => d.assigned_to === member?.id)
  const list = duties.filter((d: any) => st === 'all' || d.status === st)

  function Card({ d }: { d: any }) {
    const overdue = d.status !== 'done' && d.due_on && d.due_on < todayStr()
    const canAct = assigner || d.assigned_to === member?.id
    const edited = d.updated_at &&
      new Date(d.updated_at).getTime() - new Date(d.created_at).getTime() > 60000
    return (
      <div className={'bg-white rounded-xl p-3 shadow-sm space-y-1 ' + (overdue ? 'border border-red-400' : '')}>
        <div className="flex justify-between gap-2">
          <p className="font-semibold text-sm">{d.title}</p>
          <span className={'text-[11px] font-semibold rounded-full px-2 py-0.5 h-fit ' + STCOL[d.status]}>
            {STATUS[d.status] || d.status}
          </span>
        </div>
        {d.description && <p className="text-sm text-gray-600 whitespace-pre-line">{d.description}</p>}
        <p className="text-xs text-gray-500">
          👤 {nameOf(d.assigned_to) || 'কেউ নয়'}
          {d.due_on && (
            <span className={overdue ? 'text-red-600 font-semibold' : ''}>
              {' · '}⏰ শেষ তারিখ: {bnd(d.due_on)}{overdue ? ' (মেয়াদ পেরিয়েছে)' : ''}
            </span>
          )}
        </p>
        <div className="text-[11px] text-gray-400">
          <p>📅 বণ্টন: {fmtDT(d.created_at)}</p>
          {edited && <p>✏️ আপডেট: {fmtDT(d.updated_at)}</p>}
          {d.done_at && <p>✅ সম্পন্ন: {fmtDT(d.done_at)}</p>}
        </div>
        {canAct && (
          <div className="flex flex-wrap gap-2 pt-1">
            {Object.entries(STATUS).map(([k, v]) => (
              <button key={k} onClick={() => setStatus(d, k)}
                className={'text-xs rounded-lg border px-2.5 py-1 ' +
                  (d.status === k ? 'bg-green-700 text-white border-green-700' : '')}>
                {v}
              </button>
            ))}
          </div>
        )}
        {assigner && (
          <div className="flex gap-4 text-xs pt-1">
            <button className="underline" onClick={() => setForm(d)}>সম্পাদনা</button>
            <button className="underline text-red-600" onClick={() => remove(d.id)}>মুছুন</button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {assigner && (
        <button className="bg-green-700 text-white font-semibold rounded-lg px-4 py-2 text-sm"
          onClick={() => setForm({})}>
          + দায়িত্ব বণ্টন করুন
        </button>
      )}
      {form && (
        <DutyForm supabase={supabase} member={member} people={people} row={form.id ? form : null}
          onDone={() => { setForm(null); reload() }} onCancel={() => setForm(null)} />
      )}

      <div>
        <h3 className="font-bold text-sm mb-2">🎯 আমার দায়িত্ব ({bn(mine.length)})</h3>
        {mine.length === 0 && <p className="text-sm text-gray-500">আপনাকে এখনও কোনো দায়িত্ব দেওয়া হয়নি</p>}
        <div className="space-y-2">{mine.map((d: any) => <Card key={d.id} d={d} />)}</div>
      </div>

      <div>
        <h3 className="font-bold text-sm mb-2">📋 সকল দায়িত্ব</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[['all', 'সব'], ['todo', 'করণীয়'], ['doing', 'চলমান'], ['done', 'সম্পন্ন']].map(([k, l]) => (
            <button key={k} onClick={() => setSt(k)}
              className={'px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ' +
                (st === k ? 'bg-green-700 text-white' : 'bg-white border')}>
              {l}
            </button>
          ))}
        </div>
        {list.length === 0 && <p className="text-sm text-gray-500">কোনো দায়িত্ব নেই</p>}
        <div className="space-y-2">{list.map((d: any) => <Card key={d.id} d={d} />)}</div>
      </div>
    </div>
  )
}

function DutyForm({ supabase, member, people, row, onDone, onCancel }: any) {
  const [f, setF] = useState({
    title: row?.title || '',
    description: row?.description || '',
    assigned_to: row?.assigned_to || '',
    due_on: row?.due_on || '',
  })
  const [msg, setMsg] = useState('')
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }))

  async function save() {
    if (!f.title || !f.assigned_to) { setMsg('শিরোনাম দিন ও সদস্য বাছাই করুন'); return }
    const payload: any = {
      title: f.title,
      description: f.description || null,
      assigned_to: f.assigned_to,
      due_on: f.due_on || null,
    }
    const { error } = row
      ? await supabase.from('duties').update(payload).eq('id', row.id)
      : await supabase.from('duties').insert({ ...payload, created_by: member?.id || null })
    if (error) setMsg('ব্যর্থ: ' + error.message)
    else onDone()
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
      <h3 className="font-bold text-sm">{row ? 'দায়িত্ব সম্পাদনা' : 'নতুন দায়িত্ব'}</h3>
      <input className={input} placeholder="দায়িত্বের শিরোনাম *" value={f.title} onChange={e => set('title', e.target.value)} />
      <textarea className={input} rows={3} placeholder="বিবরণ" value={f.description}
        onChange={e => set('description', e.target.value)} />
      <select className={input} value={f.assigned_to} onChange={e => set('assigned_to', e.target.value)}>
        <option value="">কাকে দেবেন? *</option>
        {people.map((p: any) => (
          <option key={p.id} value={p.id}>{p.full_name} ({ROLES[p.role] || p.role})</option>
        ))}
      </select>
      <label className="text-xs text-gray-500">শেষ তারিখ (ঐচ্ছিক)</label>
      <input className={input} type="date" value={f.due_on} onChange={e => set('due_on', e.target.value)} />
      <div className="flex gap-2">
        <button className="flex-1 bg-green-700 text-white font-semibold rounded-lg py-2" onClick={save}>সংরক্ষণ</button>
        <button className="border rounded-lg px-4" onClick={onCancel}>বাতিল</button>
      </div>
      {msg && <p className="text-sm text-center text-red-600">{msg}</p>}
    </div>
  )
}

function Attendance({ supabase, member, people, events, att, canEvent, canMark, reload }: any) {
  const [form, setForm] = useState<any>(null)
  const [open, setOpen] = useState('')

  const nowMs = Date.now()
  const past = events.filter((e: any) => new Date(e.event_date).getTime() <= nowMs)
  const attended = past.filter((e: any) =>
    att.some((a: any) => a.event_id === e.id && a.member_id === member?.id && a.present)
  ).length

  async function cycle(e: any, pid: string) {
    const cur = att.find((a: any) => a.event_id === e.id && a.member_id === pid)
    if (!cur || !cur.present && false) {
      await supabase.from('attendance').upsert(
        { event_id: e.id, member_id: pid, present: true, marked_by: member.id, marked_at: new Date().toISOString() },
        { onConflict: 'event_id,member_id' })
    } else if (cur.present) {
      await supabase.from('attendance').upsert(
        { event_id: e.id, member_id: pid, present: false, marked_by: member.id, marked_at: new Date().toISOString() },
        { onConflict: 'event_id,member_id' })
    } else {
      await supabase.from('attendance').delete().match({ event_id: e.id, member_id: pid })
    }
    reload()
  }

  async function allPresent(e: any) {
    const rows = people.map((p: any) => ({
      event_id: e.id, member_id: p.id, present: true,
      marked_by: member.id, marked_at: new Date().toISOString(),
    }))
    await supabase.from('attendance').upsert(rows, { onConflict: 'event_id,member_id' })
    reload()
  }

  async function removeEvent(id: string) {
    if (!confirm('ইভেন্ট ও এর হাজিরা মুছে ফেলবেন?')) return
    await supabase.from('events').delete().eq('id', id)
    reload()
  }

  return (
    <div className="space-y-3">
      {member && past.length > 0 && (
        <div className="bg-white rounded-xl p-3 shadow-sm text-sm">
          📊 আপনার উপস্থিতি: <b className="text-green-700">{bn(attended)}/{bn(past.length)}</b> টি ইভেন্ট
        </div>
      )}

      {canEvent && (
        <button className="bg-green-700 text-white font-semibold rounded-lg px-4 py-2 text-sm"
          onClick={() => setForm({})}>
          + নতুন ইভেন্ট (সভা/ফিল্ড ট্রিপ/অনুষ্ঠান)
        </button>
      )}
      {form && (
        <EventForm supabase={supabase} member={member} row={form.id ? form : null}
          onDone={() => { setForm(null); reload() }} onCancel={() => setForm(null)} />
      )}

      {events.length === 0 && <p className="text-center text-sm text-gray-500 py-4">এখনও কোনো ইভেন্ট নেই</p>}

      {events.map((e: any) => {
        const rows = att.filter((a: any) => a.event_id === e.id)
        const pN = rows.filter((a: any) => a.present).length
        const aN = rows.filter((a: any) => !a.present).length
        const upcoming = new Date(e.event_date).getTime() > nowMs
        return (
          <div key={e.id} className="bg-white rounded-xl p-4 shadow-sm space-y-2">
            <div className="flex flex-wrap gap-2 items-center text-xs">
              <span className="bg-green-50 text-green-800 font-semibold rounded-full px-3 py-1">
                {ETYPES[e.type] || 'ইভেন্ট'}
              </span>
              {upcoming && <span className="bg-amber-100 text-amber-700 rounded-full px-3 py-1">আসন্ন</span>}
            </div>
            <h3 className="font-bold">{e.title}</h3>
            <p className="text-xs text-gray-500">
              🕒 {fmtDT(e.event_date)}{e.location ? ' · 📍 ' + e.location : ''}
            </p>
            {e.description && <p className="text-sm text-gray-600 whitespace-pre-line">{e.description}</p>}
            <p className="text-xs">
              ✅ উপস্থিত: <b className="text-green-700">{bn(pN)}</b> · ❌ অনুপস্থিত: <b className="text-red-600">{bn(aN)}</b>
            </p>

            <div className="flex flex-wrap gap-4 text-xs">
              <button className="font-semibold text-green-700 underline"
                onClick={() => setOpen(open === e.id ? '' : e.id)}>
                {open === e.id ? 'বন্ধ করুন' : canMark ? 'হাজিরা নিন' : 'উপস্থিতি দেখুন'}
              </button>
              {canEvent && <button className="underline" onClick={() => setForm(e)}>সম্পাদনা</button>}
              {canEvent && <button className="underline text-red-600" onClick={() => removeEvent(e.id)}>মুছুন</button>}
            </div>

            {open === e.id && (
              <div className="border-t pt-2 space-y-1">
                {canMark && (
                  <button className="text-xs border border-green-700 text-green-700 rounded-lg px-3 py-1 mb-1"
                    onClick={() => allPresent(e)}>
                    ✓ সবাই উপস্থিত
                  </button>
                )}
                {people.map((p: any) => {
                  const cur = rows.find((a: any) => a.member_id === p.id)
                  const label = !cur ? '—' : cur.present ? '✅ উপস্থিত' : '❌ অনুপস্থিত'
                  const cls = !cur
                    ? 'bg-gray-100 text-gray-500'
                    : cur.present ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  return (
                    <div key={p.id} className="flex justify-between items-center py-1 border-t first:border-t-0">
                      <div className="min-w-0">
                        <p className="text-sm truncate">{p.full_name}</p>
                        {cur?.marked_at && (
                          <p className="text-[10px] text-gray-400">🕒 {fmtDT(cur.marked_at)}</p>
                        )}
                      </div>
                      {canMark ? (
                        <button className={'text-xs rounded-lg px-3 py-1.5 font-semibold ' + cls}
                          onClick={() => cycle(e, p.id)}>
                          {label}
                        </button>
                      ) : (
                        <span className={'text-xs rounded-lg px-3 py-1.5 font-semibold ' + cls}>{label}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function EventForm({ supabase, member, row, onDone, onCancel }: any) {
  const [f, setF] = useState({
    title: row?.title || '',
    type: row?.type || 'meeting',
    event_date: localInput(row?.event_date),
    location: row?.location || '',
    description: row?.description || '',
  })
  const [msg, setMsg] = useState('')
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }))

  async function save() {
    if (!f.title) { setMsg('ইভেন্টের নাম দিন'); return }
    const payload: any = {
      title: f.title,
      type: f.type,
      event_date: new Date(f.event_date).toISOString(),
      location: f.location || null,
      description: f.description || null,
    }
    const { error } = row
      ? await supabase.from('events').update(payload).eq('id', row.id)
      : await supabase.from('events').insert({ ...payload, created_by: member?.id || null })
    if (error) setMsg('ব্যর্থ: ' + error.message)
    else onDone()
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
      <h3 className="font-bold text-sm">{row ? 'ইভেন্ট সম্পাদনা' : 'নতুন ইভেন্ট'}</h3>
      <input className={input} placeholder="ইভেন্টের নাম *" value={f.title} onChange={e => set('title', e.target.value)} />
      <select className={input} value={f.type} onChange={e => set('type', e.target.value)}>
        {Object.entries(ETYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
      <label className="text-xs text-gray-500">তারিখ ও সময়</label>
      <input className={input} type="datetime-local" value={f.event_date}
        onChange={e => set('event_date', e.target.value)} />
      <input className={input} placeholder="স্থান" value={f.location} onChange={e => set('location', e.target.value)} />
      <textarea className={input} rows={2} placeholder="বিবরণ" value={f.description}
        onChange={e => set('description', e.target.value)} />
      <div className="flex gap-2">
        <button className="flex-1 bg-green-700 text-white font-semibold rounded-lg py-2" onClick={save}>সংরক্ষণ</button>
        <button className="border rounded-lg px-4" onClick={onCancel}>বাতিল</button>
      </div>
      {msg && <p className="text-sm text-center text-red-600">{msg}</p>}
    </div>
  )
}

function Directory({ people }: any) {
  const [q, setQ] = useState('')
  const [r, setR] = useState('all')

  const list = people
    .filter((p: any) => r === 'all' || (r === 'exec' ? p.role !== 'member' : p.role === 'member'))
    .filter((p: any) => !q || [p.full_name, p.district, p.member_code].join(' ').includes(q))
    .sort((a: any, b: any) => Number(b.role !== 'member') - Number(a.role !== 'member'))

  return (
    <div className="space-y-3">
      <input className={input} placeholder="🔍 নাম, জেলা বা আইডি খুঁজুন..." value={q}
        onChange={e => setQ(e.target.value)} />
      <div className="flex gap-2">
        {[['all', 'সবাই'], ['exec', 'কার্যনির্বাহী পরিষদ'], ['vol', 'স্বেচ্ছাসেবক/সদস্য']].map(([k, l]) => (
          <button key={k} onClick={() => setR(k)}
            className={'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ' +
              (r === k ? 'bg-green-700 text-white' : 'bg-white border')}>
            {l}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500">মোট: {bn(list.length)} জন</p>
      {list.map((p: any) => (
        <div key={p.id} className="bg-white rounded-xl p-3 shadow-sm flex gap-3 items-center">
          {p.photo_url ? (
            <img src={p.photo_url} className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-xl">👤</div>
          )}
          <div className="min-w-0">
            <p className="font-bold text-sm truncate">{p.full_name}</p>
            <span className="text-[11px] bg-green-100 text-green-800 rounded px-2 py-0.5">
              {ROLES[p.role] || p.role}
            </span>
            <p className="text-[11px] text-gray-400">
              🪪 {p.member_code || '-'}{p.district ? ' · 📍 ' + p.district : ''}
              {p.joined_at ? ' · 📅 যোগদান: ' + bnd(p.joined_at) : ''}
            </p>
          </div>
        </div>
      ))}
      {list.length === 0 && <p className="text-center text-sm text-gray-500 py-3">কাউকে পাওয়া যায়নি</p>}
    </div>
  )
}
