import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Admin from './Admin'
import Finance from './Finance'
import Dashboard from './Dashboard'
import Home from './Home'
import { t, getLang, setLang } from './i18n'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

type Tab =
  | 'home' | 'projects' | 'ledger' | 'finance' | 'volunteers' | 'chat' | 'map'
  | 'works' | 'blood' | 'notices' | 'gallery' | 'apply' | 'login' | 'me' | 'admin'

const MENU: [Tab, string, string][] = [
  ['home', '🏠', 'হোম'],
  ['projects', '💚', 'অনুদানের খাত'],
  ['ledger', '📚', 'খাত খতিয়ান'],
  ['finance', '🧾', 'স্বচ্ছ আয়-ব্যয়'],
  ['volunteers', '🙋', 'স্বেচ্ছাসেবক ও দায়িত্ব'],
  ['me', '👤', 'সদস্য ড্যাশবোর্ড'],
  ['chat', '💬', 'লাইভ চ্যাট'],
  ['map', '📍', 'সাহায্য ম্যাপ'],
  ['works', '✅', 'সাম্প্রতিক কাজ ও প্রমাণ'],
  ['blood', '🩸', 'রক্তদান SOS'],
  ['notices', '📢', 'নোটিশ'],
  ['gallery', '🖼️', 'গ্যালারি'],
  ['apply', '📝', 'সদস্য হওয়ার আবেদন'],
]
const SOON: Tab[] = ['projects', 'ledger', 'volunteers', 'chat', 'map', 'works', 'blood', 'notices', 'gallery']

const input =
  'w-full border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-green-600'
const btn =
  'w-full bg-green-700 text-white font-semibold rounded-lg py-2.5 active:opacity-80 disabled:opacity-50'

const read = (k: string, d: string) => {
  try { return localStorage.getItem(k) || d } catch { return d }
}
const write = (k: string, v: string) => {
  try { localStorage.setItem(k, v) } catch {}
}

export default function App() {
  const [tab, setTab] = useState<Tab>('home')
  const [settings, setSettings] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [member, setMember] = useState<any>(null)
  const [lang, setL] = useState(getLang())
  const [dark, setDark] = useState(read('dark', '0') === '1')
  const [menu, setMenu] = useState(false)
  const [bell, setBell] = useState(false)
  const [donate, setDonate] = useState(false)
  const [notes, setNotes] = useState<any[]>([])
  const [seen, setSeen] = useState(read('seen', '2000-01-01T00:00:00Z'))

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

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    write('dark', dark ? '1' : '0')
  }, [dark])

  useEffect(() => {
    const load = () =>
      supabase.from('notices').select('id,title,kind,is_urgent,created_at')
        .neq('kind', 'gallery').order('created_at', { ascending: false }).limit(10)
        .then(({ data }) => setNotes(data || []))
    load()
    const id = setInterval(load, 60000)
    return () => clearInterval(id)
  }, [])

  const unread = notes.filter(n => new Date(n.created_at) > new Date(seen)).length
  const color = settings?.theme_color || '#087a43'
  const isAdmin = member?.role === 'admin'
  const canEdit = isAdmin || member?.role === 'cashier'

  function openBell() {
    setBell(true)
    const now = new Date().toISOString()
    setSeen(now)
    write('seen', now)
  }
  function toggleLang() {
    const next = lang === 'bn' ? 'en' : 'bn'
    setLang(next)
    setL(next)
  }
  async function share() {
    const data = { title: settings?.org_name || '', url: window.location.href }
    if ((navigator as any).share) {
      try { await (navigator as any).share(data) } catch {}
    } else {
      try { await navigator.clipboard.writeText(data.url); alert(t('লিংক কপি হয়েছে')) } catch {}
    }
  }
  function go(k: Tab) {
    setTab(k === 'me' && !user ? 'login' : k)
    setMenu(false)
    window.scrollTo(0, 0)
  }

  const nav: [Tab | 'menu', string, string][] = [
    ['home', '🏠', 'হোম'],
    ['finance', '🧾', 'আয়-ব্যয়'],
    ['chat', '💬', 'চ্যাট'],
    user ? ['me', '👤', 'ড্যাশবোর্ড'] : ['login', '👤', 'লগইন'],
  ]
  if (isAdmin) nav.push(['admin', '🛡️', 'অ্যাডমিন'])
  nav.push(['menu', '☰', 'মেনু'])

  const soonItem = MENU.find(m => m[0] === tab)
  const iconBtn =
    'w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-base active:opacity-70'

  return (
    <div className="min-h-screen pb-20" key={lang}>
      <header className="sticky top-0 z-30 bg-white border-b px-3 py-2 space-y-2">
        <div className="flex items-center gap-2">
          {settings?.logo_url ? (
            <img src={settings.logo_url} className="w-10 h-10 rounded-xl object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg"
              style={{ background: color }}>💚</div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold leading-tight truncate">{settings?.org_name || '...'}</p>
            <p className="text-[11px] text-gray-500 truncate">{settings?.slogan}</p>
          </div>
          <button className="text-white text-sm font-semibold rounded-lg px-3 py-2"
            style={{ background: color }} onClick={() => setDonate(true)}>
            💚 {t('দান করুন')}
          </button>
        </div>
        <div className="flex items-center justify-end gap-2">
          <button className={iconBtn + ' text-xs font-bold'} onClick={toggleLang}>
            {lang === 'bn' ? 'EN' : 'বাং'}
          </button>
          <button className={iconBtn} onClick={share}>🔗</button>
          <button className={iconBtn + ' relative'} onClick={openBell}>
            🔔
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>
          <button className={iconBtn} onClick={() => setDark(!dark)}>{dark ? '☀️' : '🌙'}</button>
          {isAdmin && <button className={iconBtn} onClick={() => go('admin')}>⚙️</button>}
          {user && (
            <button className={iconBtn}
              onClick={async () => { await supabase.auth.signOut(); setTab('home') }}>
              ⎋
            </button>
          )}
        </div>
      </header>

      <main className="p-4 max-w-2xl mx-auto">
        {tab === 'home' && (
          <Home supabase={supabase} settings={settings} member={member} user={user} onNav={setTab} />
        )}
        {tab === 'finance' && (
          <Finance supabase={supabase} canEdit={canEdit} isAdmin={isAdmin} member={member} />
        )}
        {tab === 'apply' && <Apply />}
        {tab === 'login' && <Login onDone={() => setTab('me')} />}
        {tab === 'me' && (
          <Dashboard supabase={supabase} member={member} user={user} settings={settings}
            setMember={setMember} onOut={() => setTab('home')} />
        )}
        {tab === 'admin' && <Admin supabase={supabase} />}
        {SOON.includes(tab) && (
          <div className="bg-white rounded-xl p-8 shadow-sm text-center space-y-2">
            <div className="text-4xl">{soonItem?.[1]}</div>
            <h2 className="font-bold">{t(soonItem?.[2] || '')}</h2>
            <p className="text-sm text-gray-500">{t('এই পেজটি পরের ধাপে যুক্ত হবে।')}</p>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 inset-x-0 bg-white border-t flex z-30">
        {nav.map(([key, icon, label]) => (
          <button key={key}
            onClick={() => (key === 'menu' ? setMenu(true) : go(key as Tab))}
            className="flex-1 py-2 text-[11px] font-semibold flex flex-col items-center"
            style={{ color: tab === key ? color : '#6b7280' }}>
            <span className="text-lg leading-none">{icon}</span>
            {t(label)}
          </button>
        ))}
      </nav>

      {menu && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setMenu(false)}>
          <div className="absolute inset-x-3 bottom-20 top-16 bg-white rounded-2xl p-4 overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold">✨ {t('সব পেজ ও ফিচার')}</h3>
              <button className="text-xl" onClick={() => setMenu(false)}>✕</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {MENU.map(([k, icon, label]) => (
                <button key={k} onClick={() => go(k)}
                  className="border rounded-xl py-3 px-2 text-sm font-semibold flex flex-col items-center gap-1"
                  style={tab === k ? { borderColor: color, color } : {}}>
                  <span className="text-xl">{icon}</span>
                  {t(k === 'me' && !user ? 'লগইন' : label)}
                </button>
              ))}
              {isAdmin && (
                <button onClick={() => go('admin')}
                  className="border rounded-xl py-3 px-2 text-sm font-semibold flex flex-col items-center gap-1 col-span-2"
                  style={{ borderColor: color, color }}>
                  <span className="text-xl">🛡️</span>
                  {t('অ্যাডমিন প্যানেল')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {bell && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setBell(false)}>
          <div className="mx-3 mt-24 bg-white rounded-2xl p-4 max-h-[70vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold">🔔 {t('নোটিফিকেশন')}</h3>
              <button className="text-xl" onClick={() => setBell(false)}>✕</button>
            </div>
            {notes.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">{t('কোনো নোটিফিকেশন নেই')}</p>
            )}
            {notes.map(n => (
              <div key={n.id} className="border-t py-2">
                <p className="text-sm font-semibold">
                  {n.is_urgent && <span className="text-red-600">🚨 </span>}
                  {n.title}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(n.created_at).toLocaleDateString(lang === 'en' ? 'en-GB' : 'bn-BD')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {donate && (
        <div className="fixed inset-0 z-40 bg-black/50 flex items-end sm:items-center"
          onClick={() => setDonate(false)}>
          <div className="bg-white w-full max-w-md mx-auto rounded-t-2xl sm:rounded-2xl p-5 space-y-3"
            onClick={e => e.stopPropagation()}>
            <h3 className="font-bold">💚 {t('অনুদান পাঠানোর মাধ্যম')}</h3>
            {settings?.bank_details ? (
              <p className="text-sm whitespace-pre-line">{settings.bank_details}</p>
            ) : (
              <p className="text-sm text-gray-500">এখনও কোনো মাধ্যম যোগ করা হয়নি।</p>
            )}
            {settings?.hotline && (
              <p className="text-sm">📞 <a href={'tel:' + settings.hotline}>{settings.hotline}</a></p>
            )}
            <div className="flex gap-2">
              <button className={btn} onClick={() => { setDonate(false); go('finance') }}>
                {t('আয়-ব্যয় দেখুন')}
              </button>
              <button className="border rounded-lg px-4" onClick={() => setDonate(false)}>
                {t('বন্ধ করুন')}
              </button>
            </div>
          </div>
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
