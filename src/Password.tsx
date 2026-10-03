import { useState } from 'react'

const input =
  'w-full border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-green-600'

export default function Password({ supabase }: any) {
  const [p1, setP1] = useState('')
  const [p2, setP2] = useState('')
  const [msg, setMsg] = useState('')
  const [ok, setOk] = useState(false)
  const [busy, setBusy] = useState(false)

  async function save() {
    setOk(false)
    if (p1.length < 8) { setMsg('পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে'); return }
    if (p1 !== p2) { setMsg('দুই ঘরের পাসওয়ার্ড মিলছে না'); return }
    setBusy(true)
    const { error } = await supabase.auth.updateUser({ password: p1 })
    setBusy(false)
    if (error) setMsg('ব্যর্থ: ' + error.message)
    else { setOk(true); setMsg('✅ পাসওয়ার্ড বদলানো হয়েছে'); setP1(''); setP2('') }
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
      <h3 className="font-bold">🔑 পাসওয়ার্ড পরিবর্তন</h3>
      <p className="text-xs text-gray-500">
        অ্যাডমিন যে পাসওয়ার্ড দিয়েছেন, সেটা বদলে নিজের পছন্দের একটা দিন।
      </p>
      <input className={input} type="password" placeholder="নতুন পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)"
        value={p1} onChange={e => setP1(e.target.value)} />
      <input className={input} type="password" placeholder="আবার লিখুন"
        value={p2} onChange={e => setP2(e.target.value)} />
      <button className="w-full bg-green-700 text-white font-semibold rounded-lg py-2 disabled:opacity-50"
        disabled={busy} onClick={save}>
        {busy ? 'অপেক্ষা করুন...' : 'পাসওয়ার্ড বদলান'}
      </button>
      {msg && <p className={'text-sm text-center ' + (ok ? 'text-green-700' : 'text-red-600')}>{msg}</p>}
    </div>
  )
}
