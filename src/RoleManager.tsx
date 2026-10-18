import { useEffect, useState } from 'react'
import { PERMS, setRoles } from './roles'
import type { Role } from './roles'
import { Plus, Crown, ChevronDown, Trash2, Save, Users, Check } from 'lucide-react'

const input = 'border rounded-lg px-3 py-2 w-full bg-white'

// অন/অফ সুইচ
function Switch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)}
      className="relative w-11 h-6 rounded-full shrink-0 transition-colors"
      style={{ background: on ? '#15803d' : '#cbd5e1' }}>
      <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
        style={{ left: on ? 22 : 2 }} />
    </button>
  )
}

export default function RoleManager({ supabase, onChanged }: any) {
  const [list, setList] = useState<Role[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [msg, setMsg] = useState('')
  const [label, setLabel] = useState('')
  const [open, setOpen] = useState<string | null>(null)

  async function load() {
    const { data } = await supabase.from('roles').select('*').order('rank')
    setList(data || [])
    if (data) setRoles(data)
    const { data: m } = await supabase.from('members').select('role')
    const c: Record<string, number> = {}
    ;(m || []).forEach((x: any) => { c[x.role] = (c[x.role] || 0) + 1 })
    setCounts(c)
  }
  useEffect(() => { load() }, [])

  const patch = (key: string, p: Partial<Role>) =>
    setList(l => l.map(r => (r.key === key ? { ...r, ...p } : r)))

  function togglePerm(r: Role, p: string) {
    const has = r.perms.includes(p)
    patch(r.key, { perms: has ? r.perms.filter(x => x !== p) : [...r.perms, p] })
  }

  async function save(r: Role) {
    const { error } = await supabase.from('roles')
      .update({ label: r.label.trim(), rank: r.rank, perms: r.perms, show_on_home: r.show_on_home })
      .eq('key', r.key)
    setMsg(error ? 'ব্যর্থ: ' + error.message : 'সংরক্ষিত: ' + r.label)
    if (!error) { await load(); onChanged?.() }
  }

  async function add() {
    if (!label.trim()) return
    const top = Math.max(0, ...list.filter(r => r.key !== 'member').map(r => r.rank))
    const key = 'r_' + Date.now().toString(36)
    const { error } = await supabase.from('roles').insert({
      key,
      label: label.trim(),
      rank: top + 1,
      perms: [],
      show_on_home: true,
    })
    if (error) { setMsg('ব্যর্থ: ' + error.message); return }
    setLabel('')
    setMsg('নতুন পদবী যোগ হয়েছে। ক্ষমতা ঠিক করে সংরক্ষণ চাপুন')
    await load()
    setOpen(key)
    onChanged?.()
  }

  async function del(r: Role) {
    if (r.is_system) return
    if ((counts[r.key] || 0) > 0) {
      setMsg('এই পদে ' + counts[r.key] + ' জন আছেন। আগে তাঁদের পদ বদলান')
      return
    }
    if (!confirm('"' + r.label + '" পদবী মুছে ফেলবেন?')) return
    const { error } = await supabase.from('roles').delete().eq('key', r.key)
    setMsg(error ? 'ব্যর্থ: ' + error.message : 'মুছে ফেলা হয়েছে')
    if (!error) { await load(); onChanged?.() }
  }

  return (
    <div className="space-y-3">
      <div className="bg-white border rounded-xl p-3 space-y-2">
        <p className="font-bold text-sm flex items-center gap-1.5">
          <Plus size={16} />
          <span>নতুন পদবী</span>
        </p>
        <div className="flex gap-2">
          <input className={input} placeholder="যেমন: সহ-সভাপতি, অস্থায়ী সদস্য"
            value={label} onChange={e => setLabel(e.target.value)} />
          <button onClick={add} className="px-4 rounded-lg bg-green-700 text-white font-semibold shrink-0">
            যোগ
          </button>
        </div>
        <p className="text-[11px] text-gray-500">
          ছোট র‍্যাঙ্ক সংখ্যা মানে উপরের পদ। হোম পেজে র‍্যাঙ্ক অনুযায়ী ছবি সাজানো হয়।
        </p>
      </div>

      {msg && <p className="text-sm text-center bg-gray-100 rounded-lg py-2 px-3">{msg}</p>}

      {list.map(r => {
        const all = r.perms.includes('*')
        const isOpen = open === r.key
        const given = all ? PERMS.length : PERMS.filter(([k]) => r.perms.includes(k)).length
        return (
          <div key={r.key} className="bg-white border rounded-2xl overflow-hidden shadow-sm"
            style={{ borderColor: isOpen ? '#15803d' : undefined, transition: 'border-color .2s' }}>
            {/* মাথা: চাপ দিলে খোলে/বন্ধ হয় */}
            <button type="button" onClick={() => setOpen(isOpen ? null : r.key)}
              className="w-full flex items-center gap-3 p-3 text-left">
              <span className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0"
                style={{ background: all ? 'linear-gradient(135deg,#f59e0b,#b45309)' : 'linear-gradient(135deg,#16a34a,#065f46)' }}>
                {all ? <Crown size={18} /> : r.rank}
              </span>
              <span className="flex-1 min-w-0">
                <b className="block truncate">{r.label || 'নামহীন পদবী'}</b>
                <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-gray-500">
                  <span className="inline-flex items-center gap-1"><Users size={11} />{counts[r.key] || 0} জন</span>
                  <span>{all ? 'সব ক্ষমতা' : given + '/' + PERMS.length + ' ক্ষমতা'}</span>
                  {r.key !== 'member' && (
                    <span className="inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: r.show_on_home ? '#16a34a' : '#cbd5e1' }} />
                      {r.show_on_home ? 'হোম পেজে আছে' : 'হোম পেজে নেই'}
                    </span>
                  )}
                </span>
              </span>
              <ChevronDown size={20} className="shrink-0 text-gray-400"
                style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .25s' }} />
            </button>

            {/* ভেতরের অংশ */}
            <div className="grid" style={{ gridTemplateRows: isOpen ? '1fr' : '0fr', transition: 'grid-template-rows .3s ease' }}>
              <div className="overflow-hidden">
                <div className="px-3 pb-3 space-y-3 border-t pt-3">
                  <div className="flex gap-2 items-end">
                    <label className="flex-1 text-[11px] text-gray-500">
                      পদবীর নাম
                      <input className={input + ' mt-0.5'} value={r.label}
                        onChange={e => patch(r.key, { label: e.target.value })} />
                    </label>
                    <label className="text-[11px] text-gray-500 shrink-0">
                      র‍্যাঙ্ক
                      <input type="number" min={1} className="border rounded-lg px-2 py-2 w-16 block bg-white mt-0.5"
                        value={r.rank} onChange={e => patch(r.key, { rank: Number(e.target.value) || 1 })} />
                    </label>
                  </div>

                  {r.key !== 'member' && (
                    <div className="flex items-center justify-between gap-3 rounded-xl bg-green-50 px-3 py-2">
                      <span className="text-sm">
                        <b>হোম পেজে ছবি দেখান</b>
                        <span className="block text-[11px] text-gray-500">কমিটির তালিকায় এই পদের সদস্যরা আসবেন</span>
                      </span>
                      <Switch on={r.show_on_home} onChange={v => patch(r.key, { show_on_home: v })} />
                    </div>
                  )}

                  {all ? (
                    <p className="text-xs font-semibold text-amber-600 flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-2">
                      <Crown size={14} />
                      <span>সব ক্ষমতা আছে (বদলানো যায় না)</span>
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-500">কী করতে পারবেন</p>
                        <span className="flex gap-2 text-[11px]">
                          <button type="button" className="text-green-700 font-semibold"
                            onClick={() => patch(r.key, { perms: PERMS.map(([k]) => k) })}>সব দিন</button>
                          <button type="button" className="text-gray-500 font-semibold"
                            onClick={() => patch(r.key, { perms: [] })}>সব বাদ</button>
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {PERMS.map(([k, name]) => {
                          const on = r.perms.includes(k)
                          return (
                            <button key={k} type="button" onClick={() => togglePerm(r, k)}
                              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] transition-colors"
                              style={on
                                ? { background: '#15803d', borderColor: '#15803d', color: '#fff' }
                                : { background: '#fff', borderColor: '#d1d5db', color: '#4b5563' }}>
                              {on && <Check size={13} />}
                              {name}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <span className="flex-1" />
                    {!r.is_system && (
                      <button onClick={() => del(r)}
                        className="px-3 py-2 rounded-lg border border-red-300 text-red-600 text-sm inline-flex items-center gap-1.5">
                        <Trash2 size={14} />মুছুন
                      </button>
                    )}
                    <button onClick={() => save(r)}
                      className="px-4 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold inline-flex items-center gap-1.5">
                      <Save size={14} />সংরক্ষণ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
