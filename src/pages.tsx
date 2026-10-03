import Admin from './Admin'
import Finance from './Finance'
import Dashboard from './Dashboard'
import Home from './Home'
import Chat from './Chat'
import Blood from './Blood'
import Projects from './Projects'
import Ledger from './Ledger'
import ReliefMap from './ReliefMap'
import Works from './Works'
import Volunteers from './Volunteers'
import Password from './Password'
import { Notices, Gallery } from './Board'
import { Apply, Login } from './Auth'
import { t } from './i18n'
import { feat } from './features'

function Off({ name }: { name: string }) {
  return (
    <div className="bg-white rounded-xl p-8 shadow-sm text-center space-y-2">
      <div className="text-4xl">🔒</div>
      <h2 className="font-bold">{name}</h2>
      <p className="text-sm text-gray-500">এই ফিচারটি অ্যাডমিন সাময়িকভাবে বন্ধ রেখেছেন।</p>
    </div>
  )
}

export default function Pages({ tab, ctx }: any) {
  const { supabase, settings, member, user, isAdmin, canEdit, go, setTab, setMember, soon } = ctx

  switch (tab) {
    case 'home':
      return <Home supabase={supabase} settings={settings} member={member} user={user} onNav={setTab} />
    case 'finance':
      return <Finance supabase={supabase} canEdit={canEdit} isAdmin={isAdmin} member={member} />
    case 'apply':
      return <Apply supabase={supabase} />
    case 'login':
      return <Login supabase={supabase} onDone={() => setTab('me')} />
    case 'me':
      return (
        <div className="space-y-3">
          <Dashboard supabase={supabase} member={member} user={user} settings={settings}
            setMember={setMember} onOut={() => setTab('home')} />
          {user && <Password supabase={supabase} />}
        </div>
      )
    case 'admin':
      return <Admin supabase={supabase} />
    case 'chat':
      return feat('chat')
        ? <Chat supabase={supabase} member={member} user={user} onNav={go} />
        : <Off name="লাইভ চ্যাট" />
    case 'blood':
      return <Blood supabase={supabase} member={member} user={user} settings={settings} onNav={go} />
    case 'projects':
      return <Projects supabase={supabase} member={member} settings={settings} />
    case 'ledger':
      return feat('ledger')
        ? <Ledger supabase={supabase} member={member} />
        : <Off name="খাত খতিয়ান" />
    case 'map':
      return <ReliefMap supabase={supabase} member={member} />
    case 'works':
      return <Works supabase={supabase} member={member} user={user} onNav={go} />
    case 'volunteers':
      return <Volunteers supabase={supabase} member={member} user={user} onNav={go} />
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
