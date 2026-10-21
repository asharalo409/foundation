import { useEffect, useState } from 'react'
import { Vote, Plus, Trash2, Lock, Check, Clock, X } from 'lucide-react'

const BN = '০১২৩৪৫৬৭৮৯'
const bn = (v: any) => String(v).replace(/\d/g, d => BN[+d])
const field =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600'

const isOpen = (p: any) => !p.is_closed && (!p.closes_at || new Date(p.closes_at) > new Date())

const left = (p: any) => {
  if (!p.closes_at) return 'সময়সীমা নেই'
  const ms = new Date(p.closes_at).getTime() - Date.now()
  if (ms <= 0) return 'শেষ হয়েছে'
  const d = Math.floor(ms / 864e5)
  const h = Math.floor((ms % 864e5) / 36e5)
  return d > 0 ? `আর ${bn(d)} দিন বাকি` : `আর ${bn(h)} ঘণ্টা বাকি`
}

export default function Polls({ supabase, member, color = '#087a43' }: any) {
  const admin = !!member && ['admin', 'president'].includes(member.role)
  const [polls, setPolls] = useState<any[]>([])
  const [mine, setMine] = useState<Record<string, number>>({})
  const [counts, setCounts] = useState<Record<string, number[]>>({})
  const [pick, setPick] = useState<Record<string, number>>({})
  const [editing, setEditing] = useState<Record<string, boolean>>({})
  const [form, setForm] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [q, setQ] = useState('')
  const [desc, setDesc] = useState('')
  const [opts, setOpts] = useState(['হ্যাঁ', 'না'])
  const [days, setDays] = useState(3)

  async function load() {
    const [a, b] = await Promise.all([
      supabase.from('polls').select('*').order('created_at', { ascending: false }),
      member
        ? supabase.from('poll_votes').select('poll_id, option_idx').eq('member_id', member.id)
        : { data: [] },
    ])
    const ps = a.data || []
    const m: Record<string, number> = {}
    ;(b.data || []).forEach((x: any) => (m[x.poll_id] = x.option_idx))
    setPolls(ps)
    setMine(m)

    const c: Record<string, number[]> = {}
    await Promise.all(
      ps
        .filter((p: any) => m[p.id] !== undefined || !isOpen(p))
        .map(async (p: any) => {
          const r = await supabase.rpc('poll_counts', { p: p.id })
          const arr = Array((p.options || []).length).fill(0)
          ;(r.data || []).forEach((x: any) => {
            if (x.option_idx < arr.length) arr[x.option_idx] = Number(x.votes)
          })
          c[p.id] = arr
        })
    )
    setCounts(c)
  }

  useEffect(() => {
    if (member) load()
  }, [member?.id])

  async function vote(p: any) {
    const i = pick[p.id]
    if (i === undefined) return
    setBusy(true)
    setErr('')
    const had = mine[p.id] !== undefined
    const { error } = had
      ? await supabase
          .from('poll_votes')
          .update({ option_idx: i })
          .match({ poll_id: p.id, member_id: member.id })
      : await supabase
          .from('poll_votes')
          .insert({ poll_id: p.id, member_id: member.id, option_idx: i })

    setBusy(false)
    if (error) return setErr('ভোট দেওয়া যায়নি। হয়তো ভোটের সময় শেষ হয়েছে।')
    setEditing({ ...editing, [p.id]: false })
    load()
  }

  async function create() {
    const clean = opts.map(o => o.trim()).filter(Boolean)
    if (!q.trim() || clean.length < 2) return setErr('প্রশ্ন ও কমপক্ষে ২টি বিকল্প লিখুন')
    setBusy(true)
    setErr('')
    const { error } = await supabase.from('polls').insert({
      question: q.trim(),
      description: desc.trim() || null,
      options: clean,
      created_by: member.id,
      closes_at: days ? new Date(Date.now() + days * 864e5).toISOString() : null,
    })
    setBusy(false)
    if (error) return setErr('সংরক্ষণ হয়নি: ' + error.message)
    setQ('')
    setDesc('')
    setOpts(['হ্যাঁ', 'না'])
    setDays(3)
    setForm(false)
    load()
  }

  async function close(p: any) {
    if (!confirm('এই ভোট এখনই বন্ধ করবেন?')) return
    await supabase.from('polls').update({ is_closed: true }).eq('id', p.id)
    load()
  }

  async function del(p: any) {
    if (!confirm('ভোটটি ও সব ফলাফল মুছে ফেলবেন?')) return
    await supabase.from('polls').delete().eq('id', p.id)
    load()
  }

  if (!member) {
    return (
      <div className="rounded-2xl bg-white p-6 text-center text-sm text-slate-500">
        ভোট দিতে সদস্য হিসেবে লগইন করুন।
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold" style={{ color }}>
            সদস্যদের সিদ্ধান্তে অংশগ্রহণ
          </p>
          <h2 className="text-xl font-bold text-slate-900">ভোট ও মতামত</h2>
        </div>
        {admin && (
          <button
            type="button"
            onClick={() => {
              setForm(!form)
              setErr('')
            }}
            className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-white"
            style={{ background: color }}
          >
            {form ? <X size={16} /> : <Plus size={16} />}
            {form ? 'বাতিল' : 'নতুন ভোট'}
          </button>
        )}
      </div>

      {form && (
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <input
            className={field}
            placeholder="প্রশ্ন, যেমন: এই মাসের তহবিল কোথায় খরচ হবে?"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          <textarea
            className={field}
            rows={2}
            placeholder="বিস্তারিত (ঐচ্ছিক)"
            value={desc}
            onChange={e => setDesc(e.target.value)}
          />
          {opts.map((o, i) => (
            <div key={i} className="flex gap-2">
              <input
                className={field}
                placeholder={`বিকল্প ${bn(i + 1)}`}
                value={o}
                onChange={e => setOpts(opts.map((x, k) => (k === i ? e.target.value : x)))}
              />
              {opts.length > 2 && (
                <button
                  type="button"
                  onClick={() => setOpts(opts.filter((_, k) => k !== i))}
                  className="rounded-xl border border-slate-200 px-3 text-slate-500"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
          {opts.length < 6 && (
            <button
              type="button"
              onClick={() => setOpts([...opts, ''])}
              className="text-sm font-semibold"
              style={{ color }}
            >
              + আরেকটি বিকল্প
            </button>
          )}
          <select className={field} value={days} onChange={e => setDays(+e.target.value)}>
            <option value={1}>১ দিন চলবে</option>
            <option value={3}>৩ দিন চলবে</option>
            <option value={7}>৭ দিন চলবে</option>
            <option value={14}>১৪ দিন চলবে</option>
            <option value={0}>হাতে বন্ধ না করা পর্যন্ত</option>
          </select>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button
            type="button"
            onClick={create}
            disabled={busy}
            className="w-full rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: color }}
          >
            ভোট চালু করুন
          </button>
        </div>
      )}

      {!form && err && <p className="text-sm text-red-600">{err}</p>}

      {polls.length === 0 && (
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500">
          <Vote className="mx-auto mb-2 text-slate-300" size={32} />
          এখনো কোনো ভোট নেই।
        </div>
      )}

      {polls.map(p => {
        const open = isOpen(p)
        const voted = mine[p.id] !== undefined
        const show = (voted && !editing[p.id]) || !open
        const c = counts[p.id] || []
        const total = c.reduce((a, b) => a + b, 0)

        return (
          <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs">
              <span
                className="flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold"
                style={
                  open
                    ? { background: color + '18', color }
                    : { background: '#f1f5f9', color: '#64748b' }
                }
              >
                {open ? <Clock size={12} /> : <Lock size={12} />}
                {open ? left(p) : 'ভোট শেষ'}
              </span>
              {show && <span className="text-slate-500">মোট {bn(total)} ভোট</span>}
            </div>

            <h3 className="mt-2 text-base font-bold text-slate-900">{p.question}</h3>
            {p.description && <p className="mt-1 text-sm text-slate-600">{p.description}</p>}

            <div className="mt-3 space-y-2">
              {(p.options || []).map((o: string, i: number) => {
                const pc = total ? Math.round((100 * (c[i] || 0)) / total) : 0
                if (show) {
                  const win = total > 0 && (c[i] || 0) === Math.max(...c)
                  return (
                    <div
                      key={i}
                      className="relative overflow-hidden rounded-xl border border-slate-200 px-3 py-2.5"
                    >
                      <div
                        className="absolute inset-y-0 left-0 transition-all"
                        style={{ width: pc + '%', background: color + (win ? '30' : '14') }}
                      />
                      <div className="relative flex items-center justify-between gap-2 text-sm">
                        <span className="flex items-center gap-1.5 font-medium text-slate-800">
                          {mine[p.id] === i && <Check size={15} style={{ color }} />}
                          {o}
                        </span>
                        <span className="font-bold text-slate-700">
                          {bn(pc)}% <span className="font-normal text-slate-400">({bn(c[i] || 0)})</span>
                        </span>
                      </div>
                    </div>
                  )
                }

                const on = pick[p.id] === i
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPick({ ...pick, [p.id]: i })}
                    className="flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-medium"
                    style={
                      on
                        ? { borderColor: color, background: color + '12', color }
                        : { borderColor: '#e2e8f0', color: '#334155' }
                    }
                  >
                    <span
                      className="grid h-4 w-4 place-items-center rounded-full border-2"
                      style={{ borderColor: on ? color : '#cbd5e1' }}
                    >
                      {on && <span className="h-2 w-2 rounded-full" style={{ background: color }} />}
                    </span>
                    {o}
                  </button>
                )
              })}
            </div>

            {!show && (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => vote(p)}
                  disabled={busy || pick[p.id] === undefined || pick[p.id] === mine[p.id]}
                  className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-40"
                  style={{ background: color }}
                >
                  {voted ? 'ভোট বদলান' : 'ভোট দিন'}
                </button>
                {voted && (
                  <button
                    type="button"
                    onClick={() => setEditing({ ...editing, [p.id]: false })}
                    className="rounded-xl border border-slate-200 px-4 text-sm text-slate-600"
                  >
                    বাতিল
                  </button>
                )}
              </div>
            )}

            {!show && (
              <p className="mt-2 text-center text-xs text-slate-400">
                গোপন ভোট: কে কাকে ভোট দিয়েছে তা কেউ দেখতে পায় না। সময় থাকতে বদলাতে পারবেন।
              </p>
            )}

            {show && open && voted && (
              <button
                type="button"
                onClick={() => {
                  setPick({ ...pick, [p.id]: mine[p.id] })
                  setEditing({ ...editing, [p.id]: true })
                }}
                className="mt-3 w-full rounded-xl border px-3 py-2 text-sm font-semibold"
                style={{ borderColor: color, color }}
              >
                আমার ভোট বদলাতে চাই
              </button>
            )}

            {admin && (
              <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                {open && (
                  <button
                    type="button"
                    onClick={() => close(p)}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600"
                  >
                    <Lock size={13} />
                    এখনই বন্ধ করুন
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => del(p)}
                  className="flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs text-red-600"
                >
                  <Trash2 size={13} />
                  মুছুন
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
