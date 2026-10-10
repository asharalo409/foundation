import { useEffect, useState } from 'react'
import { MENU } from './menu'
import type { Tab } from './menu'
import { NAV_ALLOWED, NAV_DEFAULT, NAV_MAX, NAV_SHORT, navKeys } from './navconf'

const info = (k: string) => MENU.find(m => m[0] === k)

export default function NavEditor({ supabase }: any) {
  const [open, setOpen] = useState(false)
  const [sel, setSel] = useState<Tab[]>(NAV_DEFAULT)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    supabase.from('settings').select('nav_items').eq('id', 1).single()
      .then(({ data }: any) => setSel(navKeys(data)))
  }, [])

  function move(i: number, d: number) {
    const a = [...sel]
    const j = i + d
    if (j < 0 || j >= a.length) return
    ;[a[i], a[j]] = [a[j], a[i]]
    setSel(a)
  }
  function add(k: Tab) {
    if (sel.length >= NAV_MAX || sel.includes(k)) return
    setSel([...sel, k])
  }

  async function save() {
    if (sel.length === 0) { setMsg('অন্তত একটা আইটেম রাখুন'); return }
    setBusy(true)
    const { error } = await supabase.from('settings').update({ nav_items: sel }).eq('id', 1)
    setBusy(false)
    if (error) { setMsg('ব্যর্থ: ' + error.message); return }
    setMsg('✅ সেভ হয়েছে, পেজ রিফ্রেশ হচ্ছে...')
    setTimeout(() => window.location.reload(), 900)
  }

  const rest = NAV_ALLOWED.filter(k => !sel.includes(k))

  return (
    <div className="bg-white rounded-xl p-3 shadow-sm space-y-3">
      <button className="w-full flex justify-between items-center" onClick={() => setOpen(!open)}>
        <b className="text-sm">📱 নিচের মেনু বার সাজান</b>
        <span className="text-gray-400">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            সদস্যদের নিচের বারে যা থাকবে (সর্বোচ্চ {NAV_MAX}টি)। ডানের ☰ মেনু সবসময় থাকবে।
          </p>

          <div className="flex rounded-xl border p-1 bg-gray-50">
            {sel.map(k => (
              <div key={k} className="flex-1 flex flex-col items-center py-1">
                <span className="text-lg">{info(k)?.[1]}</span>
                <span className="text-[10px]">{NAV_SHORT[k]}</span>
              </div>
            ))}
            <div className="flex-1 flex flex-col items-center py-1">
              <span className="text-lg">☰</span>
              <span className="text-[10px]">মেনু</span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold">বারে আছে ({sel.length}/{NAV_MAX})</p>
            {sel.map((k, i) => (
              <div key={k} className="flex items-center gap-2 rounded-lg border px-2 py-1.5">
                <span className="text-lg w-7 text-center">{info(k)?.[1]}</span>
                <span className="flex-1 text-sm">{info(k)?.[2]}</span>
                <button className="px-2 py-1 border rounded disabled:opacity-30"
                  disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
                <button className="px-2 py-1 border rounded disabled:opacity-30"
                  disabled={i === sel.length - 1} onClick={() => move(i, 1)}>↓</button>
                <button className="px-2 py-1 text-red-600" onClick={() => setSel(sel.filter(x => x !== k))}>✕</button>
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold">যোগ করার মতো</p>
            <div className="flex flex-wrap gap-2">
              {rest.map(k => (
                <button key={k} onClick={() => add(k)} disabled={sel.length >= NAV_MAX}
                  className="rounded-full border px-3 py-1.5 text-xs flex items-center gap-1 disabled:opacity-40">
                  <span>{info(k)?.[1]}</span> + {NAV_SHORT[k]}
                </button>
              ))}
            </div>
            {sel.length >= NAV_MAX && (
              <p className="text-[11px] text-amber-600">জায়গা পূর্ণ। নতুন কিছু যোগ করতে আগে একটা সরান।</p>
            )}
          </div>

          <div className="flex gap-2">
            <button className="flex-1 border rounded-lg py-2 text-sm" onClick={() => setSel(NAV_DEFAULT)}>
              ↺ আগের মতো
            </button>
            <button className="flex-1 bg-green-700 text-white font-semibold rounded-lg py-2 text-sm disabled:opacity-50"
              disabled={busy} onClick={save}>
              {busy ? 'অপেক্ষা করুন...' : 'সেভ করুন'}
            </button>
          </div>
          {msg && <p className="text-xs text-center">{msg}</p>}
        </div>
      )}
    </div>
  )
}
