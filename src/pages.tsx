import Admin from './Admin'
import Finance from './Finance'
import Dashboard from './Dashboard'
import Home from './Home'
import Chat from './Chat'
import Blood from './Blood'
import Projects from './Projects'
import Ledger from './Ledger'
import { Apply, Login } from './Auth'
import { t } from './i18n'

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
        <Dashboard supabase={supabase} member={member} user={user} settings={settings}
          setMember={setMember} onOut={() => setTab('home')} />
      )
    case 'admin':
      return <Admin supabase={supabase} />
    case 'chat':
      return <Chat supabase={supabase} member={member} user={user} onNav={go} />
    case 'blood':
      return <Blood supabase={supabase} member={member} user={user} settings={settings} onNav={go} />
    case 'projects':
      return <Projects supabase={supabase} member={member} settings={settings} />
    case 'ledger':
      return <Ledger supabase={supabase} member={member} />
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
