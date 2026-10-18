import { useState } from 'react'
import { Avatar } from './UI'

const taka = (n: number) => '৳' + Number(n || 0).toLocaleString('bn-BD')
const bn = (n: number) => Number(n || 0).toLocaleString('bn-BD')
const COLORS = ['#16a34a', '#2563eb', '#d97706', '#7c3aed', '#0891b2', '#e11d48', '#4d7c0f']
const input = 'w-full border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-green-600'

type Cat = { id: string; name: string; amount: number }
type Plan = { cats: Cat[]; map: Record<string, string>; from: string }

function norm(p: any): Plan {
  return {
    cats: Array.isArray(p?.cats) ? p.cats : [],
    map: p?.map && typeof p.map === 'object' ? p.map : {},
    from: typeof p?.from === 'string' ? p.from : '',
  }
}

// চাঁদার ক্যাটাগরি: পেশা অনুযায়ী আলাদা মাসিক চাঁদা, কে কোন ক্যাটাগরিতে সবাই দেখতে পাবে
export default function FeePlan({ supabase, plan, people, isAdmin, onSaved }: any) {
  const saved = norm(plan)
  const [draft, setDraft] = useState<Plan>(saved)
  const [edit, setEdit] = useState(false)
  const [open, setOpen] = useState<string | null>(saved.cats[0]?.id || null)
  const [q, setQ] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const cur = edit ? draft : saved
  const catOf = (pid: string) => cur.cats.find(c => c.id === cur.map[pid])

  const groups = [
    ...cur.cats.map((c, i) => ({
      id: c.id,
      name: c.name,
      amount: c.amount,
      color: COLORS[i % COLORS.length],
      members: people.filter((p: any) => cur.map[p.id] === c.id),
    })),
    {
      id: '_none',
      name: 'ক্যাটাগরি ঠিক হয়নি',
      amount: 0,
      color: '#94a3b8',
      members: people.filter((p: any) => !catOf(p.id)),
    },
  ]

  const monthly = people.reduce((t: number, p: any) => t + Number(catOf(p.id)?.amount || 0), 0)

  const upCat = (id: string, patch: Partial<Cat>) =>
    setDraft(d => ({ ...d, cats: d.cats.map(c => (c.id === id ? { ...c, ...patch } : c)) }))

  const addCat = () =>
    setDraft(d => ({
      ...d,
      cats: [...d.cats, { id: 'c' + Date.now().toString(36), name: '', amount: 0 }],
    }))

  const delCat = (id: string) =>
    setDraft(d => {
      const map = { ...d.map }
      Object.keys(map).forEach(k => {
        if (map[k] === id) delete map[k]
      })
      return { ...d, cats: d.cats.filter(c => c.id !== id), map }
    })

  const assign = (pid: string, cid: string) =>
    setDraft(d => {
      const map = { ...d.map }
      if (cid) map[pid] = cid
      else delete map[pid]
      return { ...d, map }
    })

  async function save() {
    const cats = draft.cats
      .map(c => ({ ...c, name: c.name.trim(), amount: Number(c.amount) || 0 }))
      .filter(c => c.name)
    const ids = new Set(cats.map(c => c.id))
    const map: Record<string, string> = {}
    Object.entries(draft.map).forEach(([k, v]) => {
      if (ids.has(v)) map[k] = v
    })
    setBusy(true)
    setMsg('')
    const { error } = await supabase.from('settings').update({ fee_plan: { cats, map, from: draft.from || '' } }).eq('id', 1)
    setBusy(false)
    if (error) {
      setMsg('সংরক্ষণ হয়নি: ' + error.message)
      return
    }
    setEdit(false)
    onSaved?.()
  }

  const list = people.filter((p: any) => !q.trim() || String(p.full_name || '').includes(q.trim()))

  return (
    <div className="space-y-3">
      <div className="rounded-2xl p-4 text-white" style={{ background: 'linear-gradient(135deg,#15803d,#064e3b)' }}>
        <p className="text-xs opacity-90">মাসিক চাঁদার ক্যাটাগরি</p>
        <p className="text-2xl font-extrabold mt-1">
          {taka(monthly)} <span className="text-sm font-semibold opacity-90">প্রতি মাসে প্রত্যাশিত</span>
        </p>
        <p className="text-xs opacity-90 mt-1">
          {bn(people.filter((p: any) => catOf(p.id)).length)} জন সদস্য ক্যাটাগরিতে আছেন, {bn(cur.cats.length)}টি ক্যাটাগরি
        </p>
      </div>

      {isAdmin && !edit && (
        <button
          className="w-full border border-green-700 text-green-700 rounded-lg py-2 text-sm font-semibold"
          onClick={() => {
            setDraft(saved)
            setEdit(true)
          }}
        >
          ক্যাটাগরি ও সদস্য ঠিক করুন
        </button>
      )}

      {edit && (
        <div className="bg-white rounded-2xl p-3 shadow-sm space-y-3">
          <div className="rounded-lg bg-amber-50 p-3 space-y-1">
            <p className="text-xs font-semibold text-amber-800">ক্যাটাগরির টাকা কোন মাস থেকে চালু হবে</p>
            <input className={input} type="month" value={draft.from} onChange={e => setDraft(d => ({ ...d, from: e.target.value }))} />
            <p className="text-[11px] text-gray-600">
              এর আগের মাসগুলোতে আগের সাধারণ মাসিক চাঁদাই (আগের মতো) ধরা হবে। ফাঁকা রাখলে সব মাসে ক্যাটাগরির টাকা ধরা হবে।
            </p>
          </div>

          <p className="font-bold text-sm">ক্যাটাগরি</p>
          {draft.cats.length === 0 && (
            <p className="text-xs text-gray-500">
              এখনও কোনো ক্যাটাগরি নেই। নিচে যোগ করুন, যেমন: ব্যবসায়ী ৫০, চাকরিজীবী ১০০, শিক্ষার্থী ২০।
            </p>
          )}
          {draft.cats.map(c => (
            <div key={c.id} className="flex gap-2">
              <input
                className={input}
                placeholder="নাম (যেমন: ব্যবসায়ী)"
                value={c.name}
                onChange={e => upCat(c.id, { name: e.target.value })}
              />
              <input
                className={input + ' !w-24'}
                type="number"
                placeholder="টাকা"
                value={c.amount || ''}
                onChange={e => upCat(c.id, { amount: Number(e.target.value) })}
              />
              <button
                className="px-3 rounded-lg border border-red-300 text-red-600 text-sm shrink-0"
                onClick={() => delCat(c.id)}
              >
                মুছুন
              </button>
            </div>
          ))}
          <button className="w-full border border-dashed border-gray-400 rounded-lg py-2 text-sm" onClick={addCat}>
            + নতুন ক্যাটাগরি
          </button>

          <p className="font-bold text-sm pt-1">কোন সদস্য কোন ক্যাটাগরিতে</p>
          <input className={input} placeholder="সদস্যের নাম খুঁজুন" value={q} onChange={e => setQ(e.target.value)} />
          <div className="max-h-80 overflow-y-auto divide-y">
            {list.map((p: any) => (
              <div key={p.id} className="flex items-center gap-2 py-2">
                <Avatar src={p.photo_url} name={p.full_name} size={30} />
                <span className="flex-1 min-w-0 text-sm truncate">{p.full_name}</span>
                <select
                  className="border rounded-lg px-2 py-1.5 text-sm bg-white max-w-[45%]"
                  value={draft.map[p.id] || ''}
                  onChange={e => assign(p.id, e.target.value)}
                >
                  <option value="">নেই</option>
                  {draft.cats
                    .filter(c => c.name.trim())
                    .map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.amount || 0})
                      </option>
                    ))}
                </select>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              className="flex-1 bg-green-700 text-white font-semibold rounded-lg py-2.5 disabled:opacity-50"
              disabled={busy}
              onClick={save}
            >
              {busy ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
            </button>
            <button className="border rounded-lg px-4" onClick={() => setEdit(false)}>
              বাতিল
            </button>
          </div>
          {msg && <p className="text-sm text-center text-red-600">{msg}</p>}
        </div>
      )}

      {/* সবার জন্য দৃশ্যমান: ক্যাটাগরি ধরে সদস্যদের তালিকা */}
      {groups
        .filter(g => g.id !== '_none' || g.members.length > 0)
        .map(g => {
          const isOpen = open === g.id
          return (
            <div
              key={g.id}
              className="bg-white rounded-2xl shadow-sm overflow-hidden"
              style={{ borderLeft: '5px solid ' + g.color }}
            >
              <button
                type="button"
                className="w-full flex items-center gap-3 p-3 text-left"
                onClick={() => setOpen(isOpen ? null : g.id)}
              >
                <span className="flex-1 min-w-0">
                  <b className="block">{g.name || 'নামহীন'}</b>
                  <span className="text-[11px] text-gray-500">
                    {g.id === '_none'
                      ? bn(g.members.length) + ' জন'
                      : bn(g.members.length) + ' জন · মাসে ' + bn(g.members.length * g.amount) + ' টাকা প্রত্যাশিত'}
                  </span>
                </span>
                {g.id !== '_none' && (
                  <span className="text-white text-sm font-bold rounded-full px-3 py-1 shrink-0" style={{ background: g.color }}>
                    {taka(g.amount)}
                  </span>
                )}
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-gray-400 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .25s' }}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              <div
                className="grid"
                style={{
                  gridTemplateRows: isOpen ? '1fr' : '0fr',
                  transition: 'grid-template-rows .3s ease',
                }}
              >
                <div className="overflow-hidden">
                  <div className="px-3 pb-3 border-t pt-3">
                    {g.members.length === 0 ? (
                      <p className="text-xs text-gray-500">এই ক্যাটাগরিতে এখনও কেউ নেই</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {g.members.map((p: any) => (
                          <div key={p.id} className="flex items-center gap-2 rounded-xl bg-gray-50 px-2 py-1.5">
                            <Avatar src={p.photo_url} name={p.full_name} size={30} />
                            <span className="text-xs font-medium truncate">{p.full_name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
    </div>
  )
}
