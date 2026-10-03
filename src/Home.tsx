import { useEffect, useState } from 'react'
import { Widgets, Social } from './Widgets'
import PhotoPicker from './Upload'
import { fmtDT } from './time'
import { MENU } from './menu'
import { t } from './i18n'
import { feat } from './features'

const input =
  'w-full border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-green-600'
const taka = (n: number) => '৳' + Number(n || 0).toLocaleString('bn-BD')
const bnNum = (n: number) => n.toLocaleString('bn-BD')
const sum = (a: any[]) => a.reduce((t, x) => t + Number(x.amount), 0)
const KINDS: Record<string, string> = {
  notice: 'সাধারণ নোটিশ',
  resolution: 'রেজুলেশন',
  press: 'প্রেস রিলিজ',
}

const ACTS = [
  { icon: '🍲', tag: 'মানবিক সহায়তা', title: 'খাদ্য ও ত্রাণ বিতরণ', text: 'অসহায় পরিবার ও দুর্যোগে ক্ষতিগ্রস্ত মানুষের জন্য জরুরি সহায়তা কার্যক্রম।' },
  { icon: '📚', tag: 'শিক্ষা সহায়তা', title: 'শিক্ষার্থীদের পাশে', text: 'সুবিধাবঞ্চিত শিক্ষার্থীদের শিক্ষা উপকরণ, বই ও বৃত্তি সহায়তা।' },
  { icon: '🩸', tag: 'স্বাস্থ্যসেবা', title: 'রক্তদান ও স্বাস্থ্য ক্যাম্প', text: 'রক্তদাতা নেটওয়ার্ক, ফ্রি চিকিৎসা ক্যাম্প এবং সচেতনতামূলক কর্মসূচি।' },
]

function Title({ small, big }: { small: string; big: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-green-700">{small}</p>
      <h2 className="text-lg font-bold">{big}</h2>
    </div>
  )
}

export default function Home({ supabase, settings, member, user, onNav }: any) {
  const color = settings?.theme_color || '#087a43'
  const org = settings?.org_name || 'আমাদের ফাউন্ডেশন'
  const isMember = !!member && member.is_active !== false
  const editor = isMember && ['admin', 'president', 'publicity'].includes(member?.role)

  const [stats, setStats] = useState({ members: 0, donated: 0, acts: 0, families: 0 })
  const [dons, setDons] = useState<any[]>([])
  const [notices, setNotices] = useState<any[]>([])
  const [gallery, setGallery] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [works, setWorks] = useState<any[]>([])
  const [form, setForm] = useState(false)
  const [nf, setNf] = useState({ title: '', body: '', kind: 'notice', urgent: false })
  const [msg, setMsg] = useState('')

  const nav = (tab: string) =>
    !isMember && !['home', 'apply', 'login'].includes(tab) ? onNav('login') : onNav(tab)

  async function load() {
    const [m, d, r, n, g, p, w] = await Promise.all([
      supabase.from('public_members').select('id'),
      supabase.from('donations').select('amount, fund_id'),
      supabase.from('relief_locations').select('families_helped'),
      supabase.from('notices').select('*').neq('kind', 'gallery')
        .order('created_at', { ascending: false }).limit(4),
      supabase.from('notices').select('*').eq('kind', 'gallery').not('media_url', 'is', null)
        .order('created_at', { ascending: false }).limit(6),
      supabase.from('projects').select('*').eq('status', 'active')
        .order('created_at', { ascending: false }).limit(3),
      supabase.from('field_reports')
        .select('id, title, location, activity_at, photo_urls, spent, beneficiaries')
        .eq('status', 'verified').order('activity_at', { ascending: false }).limit(3),
    ])
    setDons(d.data || [])
    setStats({
      members: (m.data || []).length,
      donated: sum(d.data || []),
      acts: (r.data || []).length,
      families: (r.data || []).reduce((t: number, x: any) => t + Number(x.families_helped || 0), 0),
    })
    setNotices(n.data || [])
    setGallery(g.data || [])
    setProjects(p.data || [])
    setWorks(w.data || [])
  }
  useEffect(() => { load() }, [])

  async function addNotice() {
    if (!nf.title) { setMsg('শিরোনাম দিন'); return }
    const { error } = await supabase.from('notices').insert({
      kind: nf.kind,
      title: nf.title,
      body: nf.body || null,
      is_urgent: nf.urgent,
      created_by: member?.id || null,
    })
    if (error) setMsg('ব্যর্থ: ' + error.message)
    else {
      setForm(false)
      setMsg('')
      setNf({ title: '', body: '', kind: 'notice', urgent: false })
      load()
    }
  }

  async function addPhoto(url: string) {
    await supabase.from('notices').insert({
      kind: 'gallery', title: 'ছবি', media_url: url, created_by: member?.id || null,
    })
    load()
  }

  async function del(id: string) {
    if (!confirm('মুছে ফেলবেন?')) return
    await supabase.from('notices').delete().eq('id', id)
    load()
  }

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  const statCards: [string, string][] = [
    [bnNum(stats.members) + '+', 'সক্রিয় সদস্য'],
    [taka(stats.donated), 'মোট অনুদান'],
    [bnNum(stats.acts) + '+', 'সম্পন্ন কার্যক্রম'],
    [bnNum(stats.families) + '+', 'সহায়তাপ্রাপ্ত পরিবার'],
  ]

  const tasks = MENU.filter(m => !['home', 'apply'].includes(m[0])).filter(
    m => !((m[0] === 'chat' && !feat('chat')) || (m[0] === 'ledger' && !feat('ledger')))
  )

  const link = 'text-sm font-semibold underline'

  return (
    <div className="space-y-5">
      <section className="relative rounded-2xl overflow-hidden text-white" style={{ minHeight: 260 }}>
        {settings?.cover_url ? (
          <img src={settings.cover_url} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${color}, #0b3d2e)` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/25" />
        <div className="relative px-5 py-7 flex flex-col items-center text-center gap-2">
          {settings?.logo_url ? (
            <img src={settings.logo_url}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-white/90 flex items-center justify-center text-4xl border-4 border-white shadow-lg">
              💚
            </div>
          )}
          <h2 className="text-2xl font-bold leading-snug drop-shadow">{org}</h2>
          {settings?.slogan && <p className="text-sm opacity-95 drop-shadow">{settings.slogan}</p>}
          <span className="inline-block bg-white/20 rounded-full px-3 py-1 text-xs">
            🤝 সমাজসেবা • মানবতা • স্বেচ্ছাসেবা
          </span>
          <p className="text-lg font-semibold leading-snug">মানবতার পাশে দাঁড়ানোই আমাদের অঙ্গীকার</p>
          <p className="text-sm opacity-90 max-w-md">
            {org} অসহায়, সুবিধাবঞ্চিত এবং বিপদগ্রস্ত মানুষের পাশে দাঁড়াতে কাজ করে। শিক্ষা, স্বাস্থ্য, খাদ্য, রক্তদান ও দুর্যোগ সহায়তায় আমাদের স্বেচ্ছাসেবকেরা একসাথে কাজ করছেন।
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            <button className="bg-white rounded-lg px-4 py-2 text-sm font-semibold"
              style={{ color }} onClick={() => go('activities')}>
              আমাদের কার্যক্রম
            </button>
            {!isMember && (
              <button className="border border-white rounded-lg px-4 py-2 text-sm font-semibold"
                onClick={() => nav('apply')}>
                সদস্য হোন
              </button>
            )}
            {!user && (
              <button className="border border-white/60 rounded-lg px-4 py-2 text-sm"
                onClick={() => nav('login')}>
                সদস্য লগইন
              </button>
            )}
          </div>
        </div>
      </section>

      {!isMember && (
        <section className="bg-white rounded-xl p-4 shadow-sm space-y-2 border border-green-300">
          <p className="font-bold">🔒 সদস্যদের জন্য</p>
          <p className="text-sm text-gray-600">
            বাকি সব সেবা (আয়-ব্যয়, চ্যাট, রক্তদান, ম্যাপ ইত্যাদি) শুধু সদস্যরা দেখতে পারবেন। সদস্য হতে আবেদন করুন অথবা আগে থেকে সদস্য হলে লগইন করুন।
          </p>
          {user && (
            <p className="text-xs text-amber-600">আপনি লগইন করেছেন, কিন্তু এখনও সদস্য হিসেবে যুক্ত হননি।</p>
          )}
          <div className="flex gap-2">
            <button className="flex-1 bg-green-700 text-white font-semibold rounded-lg py-2 text-sm"
              onClick={() => nav('apply')}>
              সদস্য হওয়ার আবেদন
            </button>
            {!user && (
              <button className="flex-1 border border-green-700 text-green-700 font-semibold rounded-lg py-2 text-sm"
                onClick={() => nav('login')}>
                সদস্য লগইন
              </button>
            )}
          </div>
        </section>
      )}

      {isMember && (
        <section className="space-y-2">
          <Title small="আপনার জন্য" big="সব সেবা ও কার্যক্রম" />
          {tasks.map(([k, icon, label, desc]) => (
            <button key={k} onClick={() => onNav(k)}
              className="w-full text-left bg-white rounded-xl p-3 shadow-sm flex items-center gap-3 active:opacity-80">
              <span className="text-2xl w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: color + '22' }}>
                {icon}
              </span>
              <span className="flex-1 min-w-0">
                <b className="text-sm block">{t(label)}</b>
                <span className="text-xs text-gray-500">{desc}</span>
              </span>
              <span className="text-gray-400 text-lg">›</span>
            </button>
          ))}
        </section>
      )}

      <Widgets />

      <div className="grid grid-cols-2 gap-3">
        {statCards.map(([n, l]) => (
          <div key={l} className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-xl font-bold" style={{ color }}>{n}</p>
            <p className="text-xs text-gray-500">{l}</p>
          </div>
        ))}
      </div>

      {projects.length > 0 && (
        <section className="space-y-3">
          <Title small="💚 অনুদানের খাত" big="সক্রিয় প্রকল্প" />
          {projects.map(p => {
            const c = sum(dons.filter(d => p.fund_id && d.fund_id === p.fund_id))
            const goal = Number(p.goal || 0)
            const pct = goal > 0 ? Math.min(100, Math.round((c / goal) * 100)) : 0
            return (
              <button key={p.id} onClick={() => nav('projects')}
                className="w-full text-left bg-white rounded-xl shadow-sm overflow-hidden">
                {p.cover_url && <img src={p.cover_url} className="w-full h-28 object-cover" />}
                <div className="p-3 space-y-1">
                  <p className="font-bold text-sm">{p.title}</p>
                  {p.area && <p className="text-xs text-gray-500">📍 {p.area}</p>}
                  <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div className="h-full bg-green-600" style={{ width: pct + '%' }} />
                  </div>
                  <p className="text-xs text-gray-500">
                    {taka(c)} / {taka(goal)} · {bnNum(pct)}%
                  </p>
                </div>
              </button>
            )
          })}
          <button className={link} style={{ color }} onClick={() => nav('projects')}>
            সব প্রকল্প দেখুন →
          </button>
        </section>
      )}

      {works.length > 0 && (
        <section className="space-y-3">
          <Title small="✅ ফিল্ড কার্যক্রম" big="সাম্প্রতিক যাচাইকৃত কাজ" />
          {works.map(w => (
            <button key={w.id} onClick={() => nav('works')}
              className="w-full text-left bg-white rounded-xl p-3 shadow-sm flex gap-3">
              {w.photo_urls?.[0] ? (
                <img src={w.photo_urls[0]} className="w-20 h-20 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-green-50 flex items-center justify-center text-2xl shrink-0">✅</div>
              )}
              <div className="min-w-0">
                <p className="font-bold text-sm">{w.title}</p>
                {w.location && <p className="text-xs text-gray-500">📍 {w.location}</p>}
                <p className="text-xs text-gray-500">
                  👥 {bnNum(w.beneficiaries || 0)} জন · {taka(w.spent)}
                </p>
                <p className="text-[11px] text-gray-400">🕒 {fmtDT(w.activity_at)}</p>
              </div>
            </button>
          ))}
          <button className={link} style={{ color }} onClick={() => nav('works')}>
            সব কার্যক্রম ও প্রমাণ দেখুন →
          </button>
        </section>
      )}

      <section className="bg-white rounded-xl p-4 shadow-sm space-y-3">
        <Title small="আমাদের পরিচিতি" big="মানবসেবার মাধ্যমে একটি সুন্দর সমাজ গড়ার স্বপ্ন" />
        <p className="text-sm text-gray-600">
          আমরা একটি স্বেচ্ছাসেবী সামাজিক সংগঠন। মানুষের মৌলিক প্রয়োজন, শিক্ষা সহায়তা, স্বাস্থ্যসেবা, রক্তদান এবং দুর্যোগকালীন সহায়তায় কাজ করছি। স্বচ্ছতা, দায়িত্ববোধ ও মানবিকতা আমাদের কাজের মূল নীতি, তাই প্রতিটি অনুদান ও খরচ "আয়-ব্যয়" ট্যাবে সবার জন্য উন্মুক্ত।
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {['মানবিক সহায়তা', 'শিক্ষা সহায়তা', 'রক্তদান কর্মসূচি', 'দুর্যোগকালীন সেবা'].map(x => (
            <div key={x} className="rounded-lg bg-green-50 px-3 py-2 font-semibold text-green-800">✓ {x}</div>
          ))}
        </div>
        {!isMember && (
          <button className={link} style={{ color }} onClick={() => nav('apply')}>
            আমাদের সঙ্গে যুক্ত হোন
          </button>
        )}
      </section>

      <section id="activities" className="space-y-3">
        <Title small="আমাদের উদ্যোগ" big="প্রধান কার্যক্রমসমূহ" />
        {ACTS.map(a => (
          <div key={a.title} className="bg-white rounded-xl p-4 shadow-sm flex gap-3">
            <div className="text-3xl">{a.icon}</div>
            <div>
              <p className="text-xs font-semibold text-green-700">{a.tag}</p>
              <h3 className="font-bold">{a.title}</h3>
              <p className="text-sm text-gray-600">{a.text}</p>
            </div>
          </div>
        ))}
      </section>

      <section id="notices" className="space-y-3">
        <div className="flex justify-between items-end">
          <Title small="ঘোষণা ও সংবাদ" big="সর্বশেষ নোটিশ" />
          {editor && (
            <button className="text-sm font-semibold border rounded-lg px-3 py-1"
              style={{ color, borderColor: color }} onClick={() => setForm(!form)}>
              + নোটিশ
            </button>
          )}
        </div>

        {form && (
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
            <select className={input} value={nf.kind} onChange={e => setNf({ ...nf, kind: e.target.value })}>
              {Object.entries(KINDS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input className={input} placeholder="শিরোনাম *" value={nf.title}
              onChange={e => setNf({ ...nf, title: e.target.value })} />
            <textarea className={input} rows={3} placeholder="বিস্তারিত" value={nf.body}
              onChange={e => setNf({ ...nf, body: e.target.value })} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={nf.urgent}
                onChange={e => setNf({ ...nf, urgent: e.target.checked })} />
              জরুরি নোটিশ
            </label>
            <div className="flex gap-2">
              <button className="flex-1 bg-green-700 text-white font-semibold rounded-lg py-2"
                onClick={addNotice}>প্রকাশ করুন</button>
              <button className="border rounded-lg px-4" onClick={() => setForm(false)}>বাতিল</button>
            </div>
            {msg && <p className="text-sm text-red-600 text-center">{msg}</p>}
          </div>
        )}

        {notices.length === 0 && (
          <p className="text-sm text-gray-500 text-center">এখনও কোনো নোটিশ নেই</p>
        )}
        {notices.map(n => {
          const dt = new Date(n.created_at)
          return (
            <div key={n.id}
              className={'bg-white rounded-xl p-4 shadow-sm flex gap-3 ' +
                (n.is_urgent ? 'border border-red-400' : '')}>
              <div className="text-center text-white rounded-lg px-3 py-2 h-fit shrink-0"
                style={{ background: color }}>
                <p className="font-bold text-lg leading-none">{bnNum(dt.getDate())}</p>
                <p className="text-[10px]">{dt.toLocaleDateString('bn-BD', { month: 'long' })}</p>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm">
                  {n.is_urgent && <span className="text-red-600">🚨 </span>}
                  {n.title}
                </h3>
                {n.body && <p className="text-sm text-gray-600 whitespace-pre-line">{n.body}</p>}
                <p className="text-xs text-green-700 mt-1">{KINDS[n.kind] || n.kind}</p>
                <p className="text-[11px] text-gray-400">🕒 {fmtDT(n.created_at)}</p>
                {editor && (
                  <button className="text-xs text-red-600 underline mt-1" onClick={() => del(n.id)}>মুছুন</button>
                )}
              </div>
            </div>
          )
        })}
        {isMember && (
          <button className={link} style={{ color }} onClick={() => nav('notices')}>
            সব নোটিশ দেখুন →
          </button>
        )}
      </section>

      <section id="gallery" className="space-y-3">
        <Title small="স্মৃতির ফ্রেমে" big="কার্যক্রমের গ্যালারি" />
        {editor && (
          <PhotoPicker supabase={supabase} folder="gallery" label="+ ছবি যোগ করুন" onDone={addPhoto} />
        )}
        {gallery.length === 0 && (
          <p className="text-sm text-gray-500 text-center">এখনও কোনো ছবি নেই</p>
        )}
        <div className="grid grid-cols-2 gap-2">
          {gallery.map(g => (
            <div key={g.id} className="relative">
              <img src={g.media_url} className="w-full h-32 object-cover rounded-lg" />
              <p className="text-[10px] text-gray-400 mt-0.5">🕒 {fmtDT(g.created_at)}</p>
              {editor && (
                <button className="absolute top-1 right-1 bg-black/60 text-white text-xs rounded px-2 py-0.5"
                  onClick={() => del(g.id)}>✕</button>
              )}
            </div>
          ))}
        </div>
        {isMember && (
          <button className={link} style={{ color }} onClick={() => nav('gallery')}>
            সব ছবি ও ভিডিও দেখুন →
          </button>
        )}
      </section>

      {!isMember && (
        <section
          className="rounded-2xl text-white p-6 text-center space-y-3"
          style={{ background: `linear-gradient(135deg, ${color}, #0b3d2e)` }}
        >
          <h2 className="text-lg font-bold">মানবতার কল্যাণে আমাদের সঙ্গে যুক্ত হোন</h2>
          <p className="text-sm opacity-90">
            সদস্য, স্বেচ্ছাসেবক বা শুভাকাঙ্ক্ষী হিসেবে আপনার সামর্থ্য ও সময় দিয়ে অসহায় মানুষের মুখে হাসি ফোটাতে পাশে দাঁড়ান।
          </p>
          <button className="bg-white rounded-lg px-5 py-2 text-sm font-semibold"
            style={{ color }} onClick={() => nav('apply')}>
            সদস্য হওয়ার আবেদন
          </button>
        </section>
      )}

      <Social settings={settings} />

      {settings?.bank_details && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-bold mb-1">অনুদান পাঠানোর মাধ্যম</h2>
          <p className="text-sm text-gray-600 whitespace-pre-line">{settings.bank_details}</p>
        </div>
      )}

      <footer className="text-center text-xs text-gray-500 space-y-1 pb-2">
        <p className="font-semibold text-sm text-gray-700">{org}</p>
        <p>মানবিকতা, স্বচ্ছতা ও দায়িত্ববোধের সঙ্গে সমাজের অসহায় মানুষের পাশে দাঁড়ানো আমাদের অঙ্গীকার।</p>
        {settings?.hotline && (
          <p>📞 <a href={'tel:' + settings.hotline}>{settings.hotline}</a></p>
        )}
        <p>© {org} — সর্বস্বত্ব সংরক্ষিত</p>
      </footer>
    </div>
  )
}
