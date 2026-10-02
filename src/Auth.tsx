import { useState } from 'react'

const input =
  'w-full border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-green-600'
const btn =
  'w-full bg-green-700 text-white font-semibold rounded-lg py-2.5 active:opacity-80 disabled:opacity-50'

export function Apply({ supabase }: any) {
  const [f, setF] = useState({
    full_name: '', phone: '', email: '', blood_group: '', district: '', message: '',
  })
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k: string, v: string) => setF({ ...f, [k]: v })

  async function submit() {
    if (!f.full_name || !f.phone) { setMsg('নাম ও মোবাইল নম্বর দিন'); return }
    setBusy(true)
    const { error } = await supabase.from('applications').insert(f)
    setBusy(false)
    if (error) setMsg('ব্যর্থ: ' + error.message)
    else {
      setMsg('✅ আবেদন জমা হয়েছে। অ্যাডমিন অনুমোদন করলে আপনি সদস্য হবেন।')
      setF({ full_name: '', phone: '', email: '', blood_group: '', district: '', message: '' })
    }
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
      <h2 className="font-bold">সদস্য হওয়ার আবেদন</h2>
      <input className={input} placeholder="পূর্ণ নাম *" value={f.full_name} onChange={e => set('full_name', e.target.value)} />
      <input className={input} placeholder="মোবাইল নম্বর *" value={f.phone} onChange={e => set('phone', e.target.value)} />
      <input className={input} placeholder="ইমেইল (ঐচ্ছিক)" value={f.email} onChange={e => set('email', e.target.value)} />
      <select className={input} value={f.blood_group} onChange={e => set('blood_group', e.target.value)}>
        <option value="">রক্তের গ্রুপ</option>
        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => <option key={g}>{g}</option>)}
      </select>
      <input className={input} placeholder="জেলা" value={f.district} onChange={e => set('district', e.target.value)} />
      <textarea className={input} rows={3} placeholder="কেন সদস্য হতে চান?" value={f.message} onChange={e => set('message', e.target.value)} />
      <button className={btn} disabled={busy} onClick={submit}>
        {busy ? 'জমা হচ্ছে...' : 'আবেদন জমা দিন'}
      </button>
      {msg && <p className="text-sm text-center">{msg}</p>}
    </div>
  )
}

export function Login({ supabase, onDone }: any) {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function go() {
    setBusy(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass })
    setBusy(false)
    if (error) setMsg('লগইন ব্যর্থ: ইমেইল বা পাসওয়ার্ড ভুল')
    else onDone()
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
      <h2 className="font-bold">সদস্য লগইন</h2>
      <input className={input} type="email" placeholder="ইমেইল" value={email} onChange={e => setEmail(e.target.value)} />
      <input className={input} type="password" placeholder="পাসওয়ার্ড" value={pass} onChange={e => setPass(e.target.value)} />
      <button className={btn} disabled={busy} onClick={go}>
        {busy ? 'অপেক্ষা করুন...' : 'লগইন'}
      </button>
      {msg && <p className="text-sm text-center text-red-600">{msg}</p>}
    </div>
  )
}
