import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Pages from './pages'
import DonateBox from './DonateBox'
import Sidebar from './Sidebar'
import ProfilePanel from './ProfilePanel'
import Backdrop from './Backdrop'
import ThemeStudio from './ThemeStudio'
import Splash from './Splash'
import { startFx } from './fx'
import { resolveTheme, accentOf, applyTheme } from './theme'
import { t, getLang, setLang } from './i18n'
import { fmtDT } from './time'
import { setFeatures, feat } from './features'
import { MENU } from './menu'
import type { Tab } from './menu'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const PUBLIC: Tab[] = ['home', 'apply', 'login', 'islamic']

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
  const [side, setSide] = useState(false)
  const [panel, setPanel] = useState(false)
  const [studio, setStudio] = useState(false)
  const [bell, setBell] = useState(false)
  const [donate, setDonate] = useState(false)
  const [notes, setNotes] = useState<any[]>([])
  const [seen, setSeen] = useState(read('seen', '2000-01-01T00:00:00Z'))
  const [toast, setToast] = useState('')
  const [hideTicker, setHideTickerS] = useState(read('hideTicker', '0') === '1')
  const [dismissed, setDismissed] = useState<string[]>(() => {
    try { return JSON.parse(read('dismissed', '[]')) } catch { return [] }
  })
  const [ui, setUiS] = useState<any>(() => {
    try { return JSON.parse(read('ui-v1', '{}')) } catch { return {} }
  })
  const pageRef = useRef<HTMLDivElement>(null)

  setFeatures(settings?.features)

  const eff = resolveTheme(ui, settings)
  const color = accentOf(eff, settings?.theme_color || '#087a43')
  const S = settings ? { ...settings, theme_color: color } : settings
  const bg = settings?.theme_bg_url

  function setUi(v: any) {
    setUiS(v)
    write('ui-v1', JSON.stringify(v))
  }
  function loadSettings() {
    return supabase.from('settings').select('*').eq('id', 1).single()
      .then(({ data }) => setSettings(data))
  }

  useEffect(() => startFx(), [])

  useEffect(() => {
    loadSettings()
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      setUser(s?.user ?? null)
    )
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    applyTheme(eff)
  }, [eff.font, eff.palette, eff.glass])

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

  function allowed(k: Tab) {
    if (k === 'admin') return isAdmin
    if (isMember) return true
    if (PUBLIC.includes(k)) return true
    return k === 'me' && !!user
  }
  const cur: Tab = allowed(tab) ? tab : 'home'

  useLayoutEffect(() => {
    const el = pageRef.current
    if (!el) return
    el.classList.remove('fx-page')
    void el.offsetWidth
    el.classList.add('fx-page')
  }, [cur])

  const shown = notes.filter(n => !dismissed.includes(n.id))
  const unread = shown.filter(n => new Date(n.created_at) > new Date(seen)).length

  function setHideTicker(v: boolean) {
    setHideTickerS(v)
    write('hideTicker', v ? '1' : '0')
  }
  function dismiss(ids: string[]) {
    const next = Array.from(new Set([...dismissed, ...ids])).slice(-200)
    setDismissed(next)
    write('dismissed', JSON.stringify(next))
  }
  function openBell() {
    setPanel(false)
    setBell(true)
    const now = new Date().toISOString()
    setSeen(now)
    write('seen', now)
  }
  function toggleLang() {
    const next = lang === 'bn' ? 'en' : 'bn'
    setLang(next)
    setL(next)
    setPanel(false)
  }
  async function share() {
    setPanel(false)
    const data = { title: settings?.org_name || '', url: window.location.href }
    if ((navigator as any).share) {
      try { await (navigator as any).share(data) } catch {}
    } else {
      try { await navigator.clipboard.writeText(data.url); alert(t('লিংক কপি হয়েছে')) } catch {}
    }
  }
  async function logout() {
    await supabase.auth.signOut()
    setPanel(false)
    setTab('home')
  }
  function go(k: Tab) {
    setSide(false)
    setPanel(false)
    if (k === 'me' && !user) { setTab('login'); return }
    if (!allowed(k)) {
      setToast('এই অংশ শুধু সদস্যদের জন্য। লগইন করুন বা সদস্য হতে আবেদন করুন।')
      setTab(user ? 'home' : 'login')
      return
    }
    setTab(k)
    window.scrollTo(0, 0)
  }

  const flagOff = (k: Tab) => (k === 'chat' && !feat('chat')) || (k === 'ledger' && !feat('ledger'))
  const sideItems: [Tab, string, string, string][] = MENU.filter(
    m => !flagOff(m[0]) && allowed(m[0]) && !(isMember && m[0] === 'apply')
  )
  if (!user) sideItems.push(['login', '🔑', 'লগইন', ''])
  if (isAdmin) sideItems.push(['admin', '🛡️', 'অ্যাডমিন প্যানেল', ''])

  let nav: [Tab | 'menu', string, string][]
  if (isMember) {
    nav = [['home', '🏠', 'হোম'], ['overview', '📊', 'ওভারভিউ'], ['finance', '🧾', 'আয়-ব্যয়']]
    if (feat('chat')) nav.push(['chat', '💬', 'চ্যাট'])
    nav.push(['menu', '☰', 'মেনু'])
  } else if (user) {
    nav = [['home', '🏠', 'হোম'], ['islamic', '🕌', 'ইসলামিক'], ['apply', '📝', 'সদস্য হোন'], ['me', '👤', 'প্রোফাইল']]
  } else {
    nav = [['home', '🏠', 'হোম'], ['islamic', '🕌', 'ইসলামিক'], ['apply', '📝', 'সদস্য হোন'], ['login', '🔑', 'লগইন']]
  }

  const soon = MENU.find(m => m[0] === cur)
  const iconBtn =
    'w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-lg active:opacity-70 shrink-0'

  const tickLen = notes.reduce((s, n) => s + (n.title || '').length + 6, 0)
  const dur = Math.max(14, Math.round(tickLen * 0.28))

  return (
    <div
      className="min-h-screen pb-28"
      key={lang}
      style={bg ? {
        backgroundImage: `url(${bg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      } : undefined}
    >
      <style>{`@keyframes tick{from{transform:translateX(100vw)}to{transform:translateX(-100%)}}.ticker{animation:tick linear infinite;white-space:nowrap}.ticker:hover{animation-play-state:paused}`}</style>

      <Backdrop kind={eff.bg} dark={dark} accent={color} transparent={!!bg} />

      {bg && (
        <div className="fixed inset-0 pointer-events-none"
          style={{ background: dark ? 'rgba(11,18,32,.88)' : 'rgba(248,250,252,.84)' }} />
      )}

      <header className="sticky top-0 z-30 bg-white border-b px-3 py-2 flex items-center gap-2">
        <button className={iconBtn} onClick={() => setSide(true)}>☰</button>
        {settings?.logo_url ? (
          <img src={settings.logo_url} className="w-9 h-9 rounded-xl object-cover shrink-0" />
        ) : (
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
            style={{ background: color }}>💚</div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-bold leading-tight truncate text-sm">{settings?.org_name || '...'}</p>
          <p className="text-[10px] text-gray-500 truncate">{settings?.slogan}</p>
        </div>
        <button className={iconBtn + ' fx-glow'}
          style={{ background: color, color: '#fff', borderColor: color, ['--glow' as any]: color + '99' }}
          onClick={() => setDonate(true)}>💚</button>
        <button className={iconBtn + ' relative'} onClick={openBell}>
          🔔
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>
        <button className="w-10 h-10 rounded-full overflow-hidden border-2 flex items-center justify-center bg-gray-100 shrink-0"
          style={{ borderColor: color }} onClick={() => setPanel(true)}>
          {member?.photo_url ? (
            <img src={member.photo_url} className="w-full h-full object-cover" />
          ) : (
            <span className="text-base">{user ? (member?.full_name || user.email || '👤').slice(0, 1) : '👤'}</span>
          )}
        </button>
        <span className="fx-shimmer absolute left-0 right-0 bottom-0 h-[2px] pointer-events-none"
          style={{ backgroundImage: `linear-gradient(90deg, transparent, ${color}, #f59e0b, ${color}, transparent)` }} />
      </header>

      {notes.length > 0 && !hideTicker && (
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
        <div ref={pageRef} className="fx-page">
          <Pages tab={cur}
            ctx={{ supabase, settings: S, member, user, isAdmin, canEdit, go, setTab, setMember, soon }} />
        </div>
      </main>

      <nav
        className="fixed bottom-3 inset-x-3 z-30 rounded-2xl flex px-1 py-1 border shadow-2xl"
        style={{
          background: dark ? 'rgba(15,23,42,.82)' : 'rgba(255,255,255,.86)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderColor: dark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.06)',
        }}
      >
        {nav.map(([key, icon, label]) => {
          const on = cur === key
          return (
            <button key={key}
              onClick={() => (key === 'menu' ? setSide(true) : go(key as Tab))}
              className="flex-1 py-1.5 rounded-xl flex flex-col items-center transition-all duration-300"
              style={{
                color: on ? color : dark ? '#94a3b8' : '#6b7280',
                background: on ? color + '22' : 'transparent',
              }}>
              <span className="text-xl leading-none transition-transform duration-300"
                style={{ transform: on ? 'translateY(-2px) scale(1.18)' : 'none' }}>
                {icon}
              </span>
              <span className="text-[10px] font-semibold mt-0.5">{t(label)}</span>
              <span className="h-1 mt-0.5 rounded-full transition-all duration-300"
                style={{ width: on ? 16 : 0, background: color }} />
            </button>
          )
        })}
      </nav>

      {toast && (
        <div className="fixed inset-x-4 bottom-28 z-50 bg-gray-900 text-white text-sm rounded-xl px-4 py-3 text-center shadow-lg">
          {toast}
        </div>
      )}

      <Sidebar open={side} onClose={() => setSide(false)} items={sideItems} cur={cur} go={go}
        color={color} settings={S} supabase={supabase} isMember={isMember} />

      {panel && (
        <ProfilePanel
          onClose={() => setPanel(false)} member={member} user={user} isAdmin={isAdmin} color={color}
          dark={dark} setDark={setDark} lang={lang} toggleLang={toggleLang} share={share}
          hideTicker={hideTicker} setHideTicker={setHideTicker} unread={unread}
          openBell={openBell} openDonate={() => { setPanel(false); setDonate(true) }}
          openTheme={() => { setPanel(false); setStudio(true) }}
          go={go} logout={logout}
        />
      )}

      {studio && (
        <ThemeStudio ui={ui} setUi={setUi} eff={eff} isAdmin={isAdmin} supabase={supabase}
          color={color} onClose={() => setStudio(false)} onSaved={loadSettings} />
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
          settings={S}
          member={member}
          isMember={isMember}
          onClose={() => setDonate(false)}
          onFinance={() => { setDonate(false); go('finance') }}
        />
      )}

      <Splash ready={!!settings} />
    </div>
  )
}
