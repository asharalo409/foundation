import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Pages from './pages'
import DonateBox from './DonateBox'
import { t, getLang, setLang } from './i18n'
import { fmtDT } from './time'
import { setFeatures, feat } from './features'
import { MENU } from './menu'
import type { Tab } from './menu'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const PUBLIC: Tab[] = ['home', 'apply', 'login']

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
  const [toast, setToast] = useState('')
  const [dismissed, setDismissed] = useState<string[]>(() => {
    try { return JSON.parse(read('dismissed', '[]')) } catch { return [] }
  })

  setFeatures(settings?.features)

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

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(''), 4000)
    return () => clearTimeout(id)
  }, [toast])

  const isMember = !!member && member.is_active !== false
  const isAdmin = isMember && member?.role === 'admin'
  const canEdit = isMember && (isAdmin || member?.role === 'cashier')
  const color = settings?.theme_color || '#087a43'
  const bg = settings?.theme_bg_url

  function allowed(k: Tab) {
    if (k === 'admin') return isAdmin
    if (isMember) return true
    if (PUBLIC.includes(k)) return true
    return k === 'me' && !!user
  }
  const cur: Tab = allowed(tab) ? tab : 'home'

  const shown = notes.filter(n => !dismissed.includes(n.id))
  const unread = shown.filter(n => new Date(n.created_at) > new Date(seen)).length

  function dismiss(ids: string[]) {
    const next = Array.from(new Set([...dismissed, ...ids])).slice(-200)
    setDismissed(next)
    write('dismissed', JSON.stringify(next))
  }
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
    setMenu(false)
    if (k === 'me' && !user) { setTab('login'); return }
    if (!allowed(k)) {
      setToast('এই অংশ শুধু সদস্যদের জন্য। লগইন করুন বা সদস্য হতে আবেদন করুন।')
      setTab(user ? 'home' : 'login')
      return
    }
    setTab(k)
    window.scrollTo(0, 0)
  }

  const menuItems = MENU.filter(
    m => m[0] !== 'apply' &&
      !((m[0] === 'chat' && !feat('chat')) || (m[0] === 'ledger' && !feat('ledger')))
  )

  let nav: [Tab | 'menu', string, string][]
  if (isMember) {
    nav = [['home', '🏠', 'হোম'], ['finance', '🧾', 'আয়-ব্যয়']]
    if (feat('chat')) nav.push(['chat', '💬', 'চ্যাট'])
    nav.push(['me', '👤', 'ড্যাশবোর্ড'])
    if (isAdmin) nav.push(['admin', '🛡️', 'অ্যাডমিন'])
    nav.push(['menu', '☰', 'মেনু'])
  } else if (user) {
    nav = [['home', '🏠', 'হোম'], ['apply', '📝', 'সদস্য হোন'], ['me', '👤', 'প্রোফাইল']]
  } else {
    nav = [['home', '🏠', 'হোম'], ['apply', '📝', 'সদস্য হোন'], ['login', '🔑', 'লগইন']]
  }

  const soon = MENU.find(m => m[0] === cur)
  const iconBtn =
    'w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-base active:opacity-70'

  const tickLen = notes.reduce((s, n) => s + (n.title || '').length + 6, 0)
  const dur = Math.max(14, Math.round(tickLen * 0.28))

  return (
    <div
      className="min-h-screen pb-20"
      key={lang}
      style={bg ? {
        backgroundImage: `url(${bg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      } : undefined}
    >
      <style>{`@keyframes tick{from{transform:translateX(100vw)}to{transform:translateX(-100%)}}.ticker{animation:tick linear infinite;white-space:nowrap}.ticker:hover{animation-play-state:paused}`}</style>

      {bg && (
        <div className="fixed inset-0 pointer-events-none"
          style={{ background: dark ? 'rgba(11,18,32,.88)' : 'rgba(248,250,252,.84)' }} />
      )}

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

      {notes.length > 0 && (
        <div className="relative z-20 overflow-hidden py-1.5 text-sm border-b cursor-pointer"
          style={{ background: color + '18' }}
          onClick={() => go(isMember ? 'notices' : 'home')}>
          <div className="ticker inline-block" style={{ animationDuration: dur + 's' }}>
            {notes.map(n => (
              <span key={n.id}
                className={'mx-6 ' + (n.is_urgent ? 'text-red-500 font-semibold' : '')}>
                {n.is_urgent ? '🚨 ' : '📢 '}
                {n.title}
              </span>
            ))}
          </div>
        </div>
      )}

      <main className="relative z-10 p-4 max-w-2xl mx-auto">
        <Pages tab={cur}
          ctx={{ supabase, settings, member, user, isAdmin, canEdit, go, setTab, setMember, soon }} />
      </main>

      <nav className="fixed bottom-0 inset-x-0 bg-white border-t flex z-30">
        {nav.map(([key, icon, label]) => (
          <button key={key}
            onClick={() => (key === 'menu' ? setMenu(true) : go(key as Tab))}
            className="flex-1 py-2 text-[11px] font-semibold flex flex-col items-center"
            style={{ color: cur === key ? color : '#6b7280' }}>
            <span className="text-lg leading-none">{icon}</span>
            {t(label)}
          </button>
        ))}
      </nav>

      {toast && (
        <div className="fixed inset-x-4 bottom-24 z-50 bg-gray-900 text-white text-sm rounded-xl px-4 py-3 text-center shadow-lg">
          {toast}
        </div>
      )}

      {menu && isMember && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setMenu(false)}>
          <div className="absolute inset-x-3 bottom-20 top-16 bg-white rounded-2xl p-4 overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold">✨ {t('সব পেজ ও ফিচার')}</h3>
              <button className="text-xl" onClick={() => setMenu(false)}>✕</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {menuItems.map(([k, icon, label]) => (
                <button key={k} onClick={() => go(k)}
                  className="border rounded-xl py-3 px-2 text-sm font-semibold flex flex-col items-center gap-1"
                  style={cur === k ? { borderColor: color, color } : {}}>
                  <span className="text-xl">{icon}</span>
                  {t(label)}
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
            <div className="flex justify-between items-center mb-2 gap-2">
              <h3 className="font-bold">🔔 {t('নোটিফিকেশন')}</h3>
              <div className="flex items-center gap-3">
                {shown.length > 0 && (
                  <button className="text-xs text-red-600 underline"
                    onClick={() => dismiss(shown.map(n => n.id))}>
                    সব মুছুন
                  </button>
                )}
                <button className="text-xl" onClick={() => setBell(false)}>✕</button>
              </div>
            </div>
            {shown.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">{t('কোনো নোটিফিকেশন নেই')}</p>
            )}
            {shown.map(n => (
              <div key={n.id} className="border-t py-2 flex gap-2 items-start">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">
                    {n.is_urgent && <span className="text-red-600">🚨 </span>}
                    {n.title}
                  </p>
                  <p className="text-xs text-gray-500">🕒 {fmtDT(n.created_at)}</p>
                </div>
                <button className="text-gray-400 text-lg px-1" onClick={() => dismiss([n.id])}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {donate && (
        <DonateBox
          supabase={supabase}
          settings={settings}
          member={member}
          isMember={isMember}
          onClose={() => setDonate(false)}
          onFinance={() => { setDonate(false); go('finance') }}
        />
      )}
    </div>
  )
}
