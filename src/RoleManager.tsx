import { useEffect, useState } from 'react'
import { PERMS, setRoles } from './roles'
import type { Role } from './roles'

const input = 'border rounded-lg px-3 py-2 w-full bg-white'

export default function RoleManager({ supabase, onChanged }: any) {
  const [list, setList] = useState<Role[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [msg, setMsg] = useState('')
  const [label, setLabel] = useState('')

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
    setMsg(error ? 'ব্যর্থ: ' + error.message : '✅ সংরক্ষিত: ' + r.label)
    if (!error) { await load(); onChanged?.() }
  }

  async function add() {
    if (!label.trim()) return
    const top = Math.max(0, ...list.filter(r => r.key !== 'member').map(r => r.rank))
    const { error } = await supabase.from('roles').insert({
      key: 'r_' + Date.now().toString(36),
      label: label.trim(),
      rank: top + 1,
      perms: [],
      show_on_home: true,
    })
    if (error) { setMsg('ব্যর্থ: ' + error.message); return }
    setLabel('')
    setMsg('✅ নতুন পদবী যোগ হয়েছে। নিচে ক্ষমতা ঠিক করে সংরক্ষণ চাপুন')
    await load()
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
    setMsg(error ? 'ব্যর্থ: ' + error.message : '🗑️ মুছে ফেলা হয়েছে')
    if (!error) { await load(); onChanged?.() }
  }

  return (
    <div className="space-y-3">
      <div className="bg-white border rounded-xl p-3 space-y-2">
        <p className="font-bold text-sm">➕ নতুন পদবী</p>
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
        return (
          <div key={r.key} className="bg-white border rounded-xl p-3 space-y-3">
            <div className="flex gap-2 items-center">
              <input className={input} value={r.label}
                onChange={e => patch(r.key, { label: e.target.value })} />
              <label className="text-[11px] text-gray-500 shrink-0 text-center">
                র‍্যাঙ্ক
                <input type="number" min={1} className="border rounded-lg px-2 py-2 w-16 block bg-white"
                  value={r.rank} onChange={e => patch(r.key, { rank: Number(e.target.value) || 1 })} />
              </label>
            </div>

            {r.key !== 'member' && (
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={r.show_on_home}
                  onChange={e => patch(r.key, { show_on_home: e.target.checked })} />
                হোম পেজে ছবি দেখান
              </label>
            )}

            {all ? (
              <p className="text-xs font-semibold text-amber-600">👑 সব ক্ষমতা আছে (বদলানো যায় না)</p>
            ) : (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-gray-500">কী করতে পারবেন</p>
                {PERMS.map(([k, name]) => (
                  <label key={k} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={r.perms.includes(k)} onChange={() => togglePerm(r, k)} />
                    {name}
                  </label>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-500 flex-1">{counts[r.key] || 0} জন সদস্য</span>
              {!r.is_system && (
                <button onClick={() => del(r)}
                  className="px-3 py-1.5 rounded-lg border border-red-300 text-red-600 text-sm">
                  মুছুন
                </button>
              )}
              <button onClick={() => save(r)}
                className="px-4 py-1.5 rounded-lg bg-green-700 text-white text-sm font-semibold">
                সংরক্ষণ
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
