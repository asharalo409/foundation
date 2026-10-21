import { useEffect, useState } from 'react'
import Admin from './Admin'
import Finance from './Finance'
import FinanceHead from './FinanceHead'
import Dashboard from './Dashboard'
import Landing from './Landing'
import Inbox from './Inbox'
import NavEditor from './NavEditor'
import Executive from './Executive'
import Members from './Members'
import MemberView from './MemberView'
import Badges from './Badges'
import Weather from './Weather'
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
import Polls from './Polls'
import { Notices, Gallery } from './Board'
import { AuthPair } from './Auth'
import { t } from './i18n'
import { feat } from './features'
import { applyBranding } from './branding'
import { setAdhanUrls } from './alarm'

function Off({ name }: { name: string }) {
  return (
    <div className="bg-white rounded-xl p-8 shadow-sm text-center space-y-2">
      <div className="mx-auto w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-7 h-7 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 018 0v3" />
        </svg>
      </div>
      <h2 className="font-bold">{name}</h2>
      <p className="text-sm text-gray-500">এই ফিচারটি অ্যাডমিন সাময়িকভাবে বন্ধ রেখেছেন।</p>
    </div>
  )
}

function Fold({ title, children }: { title: string; children: any }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <button className="w-full flex items-center justify-between px-4 py-3 font-bold" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <span className="text-gray-400">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="p-3 space-y-3 border-t">{children}</div>}
    </div>
  )
}

function FinanceBox({ supabase, settings, canEdit, isAdmin, member }: any) {
  const [k, setK] = useState(0)
  return (
    <div className="space-y-3">
      <FinanceHead key={'h' + k} supabase={supabase} settings={settings} />
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
        <Landing supabase={supabase} settings={settings} user={user} onNav={setTab} member={member} />
      ) : (
        <Landing supabase={supabase} settings={settings} user={user} onNav={setTab} member={null}>
          <VoiceSection supabase={supabase} color={settings?.theme_color} member={null} />
        </Landing>
      )
    case 'weather':
      return <Weather settings={settings} />
    case 'voices':
      return <VoicesPage supabase={supabase} member={member} color={settings?.theme_color} />
    case 'polls':
      return <Polls supabase={supabase} member={isMember ? member : null} color={settings?.theme_color} />
    case 'overview':
      return <Executive supabase={supabase} settings={settings} member={member} onNav={go} />
    case 'members':
      return <Members supabase={supabase} settings={settings} member={member} onNav={go} />
    case 'finance':
      return <FinanceBox supabase={supabase} settings={settings} canEdit={canEdit} isAdmin={isAdmin} member={member} />
    case 'apply':
    case 'login':
      return <AuthPair key={tab} supabase={supabase} onDone={() => setTab('me')} initial={tab} />
    case 'me':
      return member ? (
        <div className="space-y-4">
          <MemberView supabase={supabase} settings={settings} p={member} selfId={null}
            onBack={() => go('members')} onNav={go} />
          <Badges supabase={supabase} member={member} />
          <ProfileEdit supabase={supabase} member={member} isAdmin={isAdmin} setMember={setMember} />
          {user && <Password supabase={supabase} />}
          <Fold title="আইডি কার্ড ও রসিদ">
            <Dashboard supabase={supabase} member={member} user={user} settings={settings}
              setMember={setMember} onOut={() => setTab('home')} />
          </Fold>
        </div>
      ) : (
        <div className="space-y-3">
          <Dashboard supabase={supabase} member={member} user={user} settings={settings}
            setMember={setMember} onOut={() => setTab('home')} />
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
