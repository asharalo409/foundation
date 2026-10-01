import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Admin from './Admin'
import Finance from './Finance'
import PhotoPicker from './Upload'
import { Widgets, Social } from './Widgets'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

type Tab = 'home' | 'finance' | 'apply' | 'login' | 'me' | 'admin'

const ROLES: Record<string, string> = {
  admin: 'অ্যাডমিন',
  president: 'সভাপতি',
  general_secretary: 'সাধারণ সম্পাদক',
  cashier: 'কোষাধ্যক্ষ',
  health: 'স্বাস্থ্য ও রক্তদান সমন্বয়ক',
  sports: 'ক্রীড়া ও সাংস্কৃতিক সম্পাদক',
  publicity: 'প্রচার ও প্রকাশনা সম্পাদক',
  member: 'সদস্য',
}

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

  const color = settings?.theme_color || '#16a34a'
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

      <main className="p-4 max-w-md mx-auto">
        {tab === 'home' && <Home settings={settings} />}
        {tab === 'finance' && <Finance supabase={supabase} canEdit={canEdit} member={member} />}
        {tab === 'apply' && <Apply />}
        {tab === 'login' && <Login onDone={() => setTab('me')} />}
        {tab === 'me' && (
          <Me member={member} user={user} setMember={setMember} onOut={() => setTab('home')} />
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

function Home({ settings }: { settings: any }) {
  return (
    <div className="space-y-3">
      <Widgets />
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h2 className="font-bold mb-2">আমাদের সম্পর্কে</h2>
        <p className="text-sm text-gray-600">
          এটি একটি শতভাগ স্বচ্ছ সমাজকল্যাণ সংগঠন। প্রতিটি অনুদান ও খরচ "আয়-ব্যয়" ট্যাবে সবার জন্য উন্মুক্ত। সদস্য হতে চাইলে "সদস্য হোন" ট্যাবে আবেদন করুন।
        </p>
      </div>
      <Social settings={settings} />
      {settings?.hotline && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-bold mb-1">হটলাইন</h2>
          <a className="text-green-700 font-semibold" href={'tel:' + settings.hotline}>
            {settings.hotline}
          </a>
        </div>
      )}
      {settings?.bank_details && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-bold mb-1">অনুদান পাঠানোর মাধ্যম</h2>
          <p className="text-sm text-gray-600 whitespace-pre-line">{settings.bank_details}</p>
        </div>
      )}
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

function Me({
  member, user, setMember, onOut,
}: { member: any; user: any; setMember: (m: any) => void; onOut: () => void }) {
  if (!user) return null

  async function savePhoto(url: string) {
    if (!member) return
    const { error } = await supabase.from('members').update({ photo_url: url }).eq('id', member.id)
    if (!error) setMember({ ...member, photo_url: url })
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-3 text-center">
      {member?.photo_url ? (
        <img src={member.photo_url} className="w-24 h-24 rounded-full object-cover mx-auto" />
      ) : (
        <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto flex items-center justify-center text-3xl">👤</div>
      )}
      <h2 className="font-bold text-lg">{member?.full_name || 'প্রোফাইল তৈরি হয়নি'}</h2>
      {member ? (
        <>
          <PhotoPicker supabase={supabase} folder="members" label="প্রোফাইল ছবি দিন" onDone={savePhoto} />
          <div className="text-left space-y-1">
            <p className="text-sm">পদবী: <b>{ROLES[member.role] || member.role}</b></p>
            <p className="text-sm">রক্তের গ্রুপ: {member.blood_group || '-'}</p>
            <p className="text-sm">জেলা: {member.district || '-'}</p>
            <p className="text-sm">মোবাইল: {member.phone || '-'}</p>
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-600">অ্যাডমিন আপনাকে সদস্য হিসেবে যুক্ত করলে এখানে তথ্য আসবে।</p>
      )}
      <button
        className="w-full border border-red-300 text-red-600 rounded-lg py-2"
        onClick={async () => { await supabase.auth.signOut(); onOut() }}>
        লগআউট
      </button>
    </div>
  )
}
