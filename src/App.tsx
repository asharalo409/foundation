import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Admin from './Admin'
import Finance from './Finance'
import Dashboard from './Dashboard'
import Home from './Home'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

type Tab = 'home' | 'finance' | 'apply' | 'login' | 'me' | 'admin'

const input =
  'w-full border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-green-600'
const btn =
  'w-full bg-green-700 text-white font-semibold rounded-lg py-2.5 active:opacity-80 disabled:opacity-50'

export default function App() {
  const [tab, setTab] = useState<Tab>('home')
  const [settings, setSettings] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [member, setMember] = useState<any>(null)

  useEffect(() => {
    supabase.from('settings').select('*').eq('id', 1).single()
      .then(({ data }) => setSettings(data))

    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      setUser(s?.user ?? null)
    )
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) { setMember(null); return }
    supabase.from('members').select('*').eq('auth_user_id', user.id).maybeSingle()
      .then(({ data }) => setMember(data))
  }, [user])

  const color = settings?.theme_color || '#087a43'
  const canEdit = member?.role === 'admin' || member?.role === 'cashier'

  const tabs: [Tab, string][] = [
    ['home', 'হোম'],
    ['finance', 'আয়-ব্যয়'],
    ['apply', 'সদস্য হোন'],
    user ? ['me', 'প্রোফাইল'] : ['login', 'লগইন'],
  ]
  if (member?.role === 'admin') tabs.push(['admin', 'অ্যাডমিন'])

  return (
    <div className="min-h-screen pb-20">
      <div className="text-xs text-white px-3 py-1.5 flex justify-between" style={{ background: '#0b3d2e' }}>
        <span>📍 বাংলাদেশ</span>
        <span className="flex gap-3">
          {settings?.hotline && <a href={'tel:' + settings.hotline}>📞 {settings.hotline}</a>}
          {settings?.facebook_page && (
            <a href={settings.facebook_page} target="_blank" rel="noreferrer">Facebook</a>
          )}
        </span>
      </div>

      <header className="relative text-white text-center overflow-hidden" style={{ background: color }}>
        {settings?.cover_url && (
          <>
            <img src={settings.cover_url} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40" />
          </>
        )}
        <div className="relative p-5">
          {settings?.logo_url && (
            <img src={settings.logo_url}
              className="w-16 h-16 rounded-full mx-auto mb-2 object-cover border-2 border-white" />
          )}
          <h1 className="text-xl font-bold">{settings?.org_name || 'লোড হচ্ছে...'}</h1>
          {settings?.slogan && <p className="text-sm opacity-90 mt-1">{settings.slogan}</p>}
        </div>
      </header>

      <main className="p-4 max-w-2xl mx-auto">
        {tab === 'home' && (
          <Home supabase={supabase} settings={settings} member={member} user={user} onNav={setTab} />
        )}
        {tab === 'finance' && (
          <Finance supabase={supabase} canEdit={canEdit} isAdmin={member?.role === 'admin'} member={member} />
        )}
        {tab === 'apply' && <Apply />}
        {tab === 'login' && <Login onDone={() => setTab('me')} />}
        {tab === 'me' && (
          <Dashboard supabase={supabase} member={member} user={user} settings={settings}
            setMember={setMember} onOut={() => setTab('home')} />
        )}
        {tab === 'admin' && <Admin supabase={supabase} />}
      </main>

      <nav className="fixed bottom-0 inset-x-0 bg-white border-t flex">
        {tabs.map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className="flex-1 py-3 text-xs font-semibold"
            style={{ color: tab === key ? color : '#6b7280' }}>
            {label}
          </button>
        ))}
      </nav>
    </div>
  )
}

function Apply() {
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

function Login({ onDone }: { onDone: () => void }) {
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
