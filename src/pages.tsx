import { useEffect, useState } from 'react'
import Admin from './Admin'
import Finance from './Finance'
import Dashboard from './Dashboard'
import Home from './Home'
import Landing from './Landing'
import Inbox from './Inbox'
import NavEditor from './NavEditor'
import Overview from './Overview'
import Chat from './Chat'
import Blood from './Blood'
import Projects from './Projects'
import Ledger from './Ledger'
import FundGroups from './FundGroups'
import Islamic from './Islamic'
import ReliefMap from './ReliefMap'
import Works from './Works'
import Volunteers from './Volunteers'
import Password from './Password'
import PayRequests from './PayRequests'
import ProfileEdit from './ProfileEdit'
import RoleGuide from './RoleGuide'
import VoicesPage, { VoiceSection, VoiceMod } from './Voices'
import { Notices, Gallery } from './Board'
import { Apply, Login } from './Auth'
import { t } from './i18n'
import { feat } from './features'
import { applyBranding } from './branding'
import { setAdhanUrls } from './alarm'

function Off({ name }: { name: string }) {
  return (
    <div className="bg-white rounded-xl p-8 shadow-sm text-center space-y-2">
      <div className="text-4xl">🔒</div>
      <h2 className="font-bold">{name}</h2>
      <p className="text-sm text-gray-500">এই ফিচারটি অ্যাডমিন সাময়িকভাবে বন্ধ রেখেছেন।</p>
    </div>
  )
}

function FinanceBox({ supabase, canEdit, isAdmin, member }: any) {
  const [k, setK] = useState(0)
  return (
    <div className="space-y-3">
      {canEdit && <PayRequests supabase={supabase} member={member} onChange={() => setK(k + 1)} />}
      <Finance key={k} supabase={supabase} canEdit={canEdit} isAdmin={isAdmin} member={member} />
    </div>
  )
}

export default function Pages({ tab, ctx }: any) {
  const { supabase, settings, member, user, isAdmin, canEdit, go, setTab, setMember, soon } = ctx
  const isMember = !!member && member.is_active !== false
  const role = isMember ? member.role : ''

  useEffect(() => {
    applyBranding(settings)
  }, [settings?.logo_url, settings?.org_name, settings?.theme_color])

  useEffect(() => {
    if (settings) setAdhanUrls(settings.adhan_url, settings.adhan_fajr_url)
  }, [settings?.adhan_url, settings?.adhan_fajr_url])

  switch (tab) {
    case 'home':
      return isMember ? (
        <Home supabase={supabase} settings={settings} member={member} user={user} onNav={setTab} />
      ) : (
        <Landing supabase={supabase} settings={settings} user={user} onNav={setTab}>
          <VoiceSection supabase={supabase} color={settings?.theme_color} member={null} />
        </Landing>
      )
    case 'voices':
      return <VoicesPage supabase={supabase} member={member} color={settings?.theme_color} />
    case 'overview':
      return <Overview supabase={supabase} onNav={go} />
    case 'finance':
      return <FinanceBox supabase={supabase} canEdit={canEdit} isAdmin={isAdmin} member={member} />
    case 'apply':
      return <Apply supabase={supabase} onLogin={() => setTab('login')} />
    case 'login':
      return (
        <Login supabase={supabase} onDone={() => setTab('me')} onApply={() => setTab('apply')} />
      )
    case 'me':
      return (
        <div className="space-y-3">
          <Dashboard supabase={supabase} member={member} user={user} settings={settings}
            setMember={setMember} onOut={() => setTab('home')} />
          {member && (
            <ProfileEdit supabase={supabase} member={member} isAdmin={isAdmin} setMember={setMember} />
          )}
          {user && <Password supabase={supabase} />}
        </div>
      )
    case 'admin':
      return (
        <div className="space-y-3">
          <Inbox supabase={supabase} member={member} kinds={['blood', 'aid', 'contact']} canDelete />
          <VoiceMod supabase={supabase} member={member} />
          <NavEditor supabase={supabase} />
          <RoleGuide />
          <Admin supabase={supabase} />
        </div>
      )
    case 'chat':
      return feat('chat')
        ? <Chat supabase={supabase} member={member} user={user} onNav={go} />
        : <Off name="লাইভ চ্যাট" />
    case 'blood':
      return (
        <div className="space-y-3">
          {role === 'health' && <Inbox supabase={supabase} member={member} kinds={['blood']} />}
          <Blood supabase={supabase} member={member} user={user} settings={settings} onNav={go} />
        </div>
      )
    case 'projects':
      return <Projects supabase={supabase} member={member} settings={settings} />
    case 'ledger':
      return feat('ledger')
        ? <Ledger supabase={supabase} member={member} />
        : <Off name="খাত খতিয়ান" />
    case 'groups':
      return <FundGroups supabase={supabase} member={member} user={user} onNav={go} />
    case 'islamic':
      return <Islamic supabase={supabase} settings={settings} isAdmin={isAdmin} />
    case 'map':
      return <ReliefMap supabase={supabase} member={member} />
    case 'works':
      return <Works supabase={supabase} member={member} user={user} onNav={go} />
    case 'volunteers':
      return (
        <div className="space-y-3">
          {(role === 'president' || role === 'general_secretary') && (
            <Inbox supabase={supabase} member={member} kinds={['aid', 'contact']} />
          )}
          <Volunteers supabase={supabase} member={member} user={user} onNav={go} />
        </div>
      )
    case 'notices':
      return <Notices supabase={supabase} member={member} />
    case 'gallery':
      return <Gallery supabase={supabase} member={member} />
    default:
      return (
        <div className="bg-white rounded-xl p-8 shadow-sm text-center space-y-2">
          <div className="text-4xl">{soon?.[1]}</div>
          <h2 className="font-bold">{t(soon?.[2] || '')}</h2>
          <p className="text-sm text-gray-500">{t('এই পেজটি পরের ধাপে যুক্ত হবে।')}</p>
        </div>
      )
  }
}
