 import { useEffect, useState } from 'react'
import { Widgets, Social } from './Widgets'
import { fmtDT } from './time'
import { ROLES } from './Dashboard'
import DonateBox from './DonateBox'
import RequestModal from './PublicForms'

const bn = (n: number) => Number(n || 0).toLocaleString('bn-BD')
const taka = (n: number) => '৳' + Math.round(n || 0).toLocaleString('bn-BD')
const sum = (a: any[]) => a.reduce((t, x) => t + Number(x.amount), 0)
const compact = (n: number) => {
  const f = (x: number) => bn(Number(x.toFixed(1)))
  if (n >= 1e7) return '৳' + f(n / 1e7) + ' কোটি'
  if (n >= 1e5) return '৳' + f(n / 1e5) + ' লাখ'
  return taka(n)
}
const KINDS: Record<string, string> = { notice: 'সাধারণ নোটিশ', resolution: 'রেজুলেশন', press: 'প্রেস রিলিজ' }
const CATS: Record<string, string> = {
  flood: 'বন্যা ও ত্রাণ', winter: 'শীতবস্ত্র', edu: 'শিক্ষা ও এতিম', medical: 'জরুরি চিকিৎসা', other: 'অন্যান্য',
}
const WHY: [string, string, string][] = [
  ['👁️', 'স্বচ্ছ হিসাব', 'প্রতিটি অনুদান ও খরচ রসিদ-ভাউচারসহ সময় ধরে লেখা থাকে, সদস্যরা পুরো হিসাব দেখতে পান।'],
  ['✅', 'যাচাইকৃত কাজ', 'মাঠের প্রতিটি কাজ ছবি ও প্রমাণসহ দায়িত্বশীলরা যাচাই করার পরই প্রকাশ পায়।'],
  ['🧾', 'রসিদসহ অনুদান', 'বিকাশ, নগদ বা ব্যাংকে পাঠিয়ে ট্রানজেকশন নম্বর জমা দিন, যাচাইয়ের পর রসিদ নম্বরসহ হিসাবে যোগ হয়।'],
  ['📈', 'অগ্রগতি সরাসরি', 'প্রতিটি প্রকল্পের লক্ষ্যমাত্রা, সংগৃহীত টাকা ও আপডেট এক জায়গায়।'],
  ['🩸', 'রক্তদাতা নেটওয়ার্ক', 'জরুরি রক্তের আবেদন করুন, সদস্য রক্তদাতারা সাড়া দেন।'],
  ['📞', 'বিপদে পাশে', 'আবেদন ও হটলাইনের মাধ্যমে প্রয়োজনে যোগাযোগ করুন।'],
]

function Head({ tag, title, sub }: { tag: string; title: string; sub?: string }) {
  return (
    <div className="text-center space-y-2">
      <span className="inline-block rounded-full px-3 py-1 text-xs font-bold tracking-wide"
        style={{ background: '#dcfce7', color: '#166534' }}>
        {tag}
      </span>
      <h2 className="text-2xl font-bold leading-snug">{title}</h2>
      {sub && <p className="text-sm text-gray-500">{sub}</p>}
    </div>
  )
}

export default function Landing({ supabase, settings, user, onNav, children }: any) {
  const color = settings?.theme_color || '#087a43'
  const org = settings?.org_name || 'আমাদের ফাউন্ডেশন'

  const [pm, setPm] = useState<any[]>([])
  const [don, setDon] = useState<any[]>([])
  const [acts, setActs] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [works, setWorks] = useState<any[]>([])
  const [notices, setNotices] = useState<any[]>([])
  const [gallery, setGallery] = useState<any[]>([])
  const [blood, setBlood] = useState<any[]>([])
  const [donate, setDonate] = useState<string | null>(null)
  const [form, setForm] = useState('')

  useEffect(() => {
    Promise.all([
      supabase.from('public_members').select('id, full_name, photo_url, role'),
      supabase.from('donations').select('amount, fund_id'),
      supabase.from('relief_locations').select('families_helped'),
      supabase.from('projects').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(6),
      supabase.from('field_reports')
        .select('id, title, location, activity_at, photo_urls, spent, beneficiaries')
        .eq('status', 'verified').order('activity_at', { ascending: false }).limit(3),
      supabase.from('notices').select('*').neq('kind', 'gallery').order('created_at', { ascending: false }).limit(4),
      supabase.from('notices').select('*').eq('kind', 'gallery').not('media_url', 'is', null)
        .order('created_at', { ascending: false }).limit(6),
      supabase.from('blood_requests').select('id, blood_group, hospital, district, created_at')
        .order('created_at', { ascending: false }).limit(4),
    ]).then(([a, b, c, d, e, f, g, h]: any) => {
      setPm(a.data || [])
      setDon(b.data || [])
      setActs(c.data || [])
      setProjects(d.data || [])
      setWorks(e.data || [])
      setNotices(f.data || [])
      setGallery(g.data || [])
      setBlood(h.data || [])
    })
  }, [])

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  const families = acts.reduce((t, x) => t + Number(x.families_helped || 0), 0)
  const total = sum(don)
  const execs = pm.filter(p => p.role !== 'member')
  const faces = pm.filter(p => p.photo_url).slice(0, 3)
  const hotline = settings?.hotline

  const stats: [string, string][] = [
    [bn(pm.length) + '+', 'সক্রিয় সদস্য'],
    [compact(total), 'মোট অনুদান'],
    [bn(acts.length) + '+', 'সম্পন্ন কার্যক্রম'],
    [bn(families) + '+', 'সহায়তাপ্রাপ্ত পরিবার'],
  ]

  const actions: [string, string, string, () => void, string][] = [
    ['🩸', 'রক্তের জন্য আবেদন', 'জরুরি রক্ত দরকার? তথ্য দিন', () => setForm('blood'), '#dc2626'],
    ['🤝', 'সাহায্যের আবেদন', 'চিকিৎসা, শিক্ষা, খাদ্য ইত্যাদি', () => setForm('aid'), '#d97706'],
    ['📝', 'সদস্য হোন', 'আমাদের পরিবারে যুক্ত হোন', () => onNav('apply'), color],
    ['✉️', 'যোগাযোগ', 'প্রশ্ন বা পরামর্শ পাঠান', () => setForm('contact'), '#2563eb'],
  ]

  return (
    <div className="space-y-10">
      <section className="-mx-4 -mt-4 sm:mx-0 sm:mt-0">
        <div className="relative">
          <div className="h-52 w-full overflow-hidden sm:rounded-2xl"
            style={settings?.cover_url ? undefined : { background: `linear-gradient(135deg, ${color}, #0b3d2e)` }}>
            {settings?.cover_url && <img src={settings.cover_url} className="w-full h-full object-cover" />}
          </div>
          <div className="absolute left-1/2 -bottom-14 -translate-x-1/2">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-white flex items-center justify-center"
              style={{ border: `5px solid ${color}`, boxShadow: '0 0 0 4px #fff, 0 10px 30px rgba(0,0,0,.35)' }}>
              {settings?.logo_url
                ? <img src={settings.logo_url} className="w-full h-full object-cover" />
                : <span className="text-5xl">💚</span>}
            </div>
          </div>
        </div>
        <div className="pt-16 text-center px-4">
          <h2 className="text-3xl font-bold leading-tight" style={{ color }}>{org}</h2>
          {settings?.slogan && <p className="text-sm text-gray-500 mt-1">{settings.slogan}</p>}
        </div>
      </section>

      <section className="text-center space-y-3">
        <span className="inline-block rounded-full px-3 py-1 text-xs font-bold"
          style={{ background: '#dcfce7', color: '#166534' }}>
          ✨ {families > 0 ? bn(families) + '+ পরিবার আমাদের সহায়তা পেয়েছে' : 'সমাজসেবা • মানবতা • স্বেচ্ছাসেবা'}
        </span>
        <h1 className="text-3xl font-extrabold leading-tight">
          ছোট একটি দান হয়ে ওঠে{' '}
          <span style={{ color, textDecoration: 'underline', textDecorationColor: '#f59e0b', textUnderlineOffset: 6 }}>
            কারও
          </span>{' '}
          পুরো আগামীকাল।
        </h1>
        <p className="text-sm text-gray-600 max-w-md mx-auto">
          {org} অসহায়, সুবিধাবঞ্চিত ও বিপদগ্রস্ত মানুষের পাশে দাঁড়ায়। খাদ্য, শিক্ষা, চিকিৎসা, রক্তদান ও দুর্যোগ সহায়তায়, প্রতিটি টাকার হিসাবসহ।
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button className="text-white font-semibold rounded-full px-6 py-3 shadow-lg"
            style={{ background: `linear-gradient(135deg, ${color}, #16a34a)` }}
            onClick={() => setDonate('')}>
            💚 দান করুন
          </button>
          <button className="border rounded-full px-6 py-3 font-semibold bg-white text-gray-800"
            onClick={() => onNav('apply')}>
            📝 সদস্য হোন
          </button>
        </div>
        {faces.length > 0 && (
          <div className="flex items-center justify-center gap-3">
            <div className="flex">
              {faces.map((p, i) => (
                <img key={p.id} src={p.photo_url}
                  className="w-9 h-9 rounded-full object-cover border-2 border-white"
                  style={{ marginLeft: i ? -10 : 0 }} />
              ))}
            </div>
            <p className="text-xs text-left text-gray-500">
              <b className="text-gray-800 text-sm">{bn(pm.length)}+ সদস্য</b>
              <br />আমাদের সাথে আছেন
            </p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-2 text-left">
            <span className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0"
              style={{ background: color }}>💰</span>
            <div>
              <p className="font-bold text-sm">{compact(total)}</p>
              <p className="text-[11px] text-gray-500">মোট সংগৃহীত</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-2 text-left">
            <span className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0"
              style={{ background: '#f59e0b' }}>🛡️</span>
            <div>
              <p className="font-bold text-sm">যাচাইকৃত</p>
              <p className="text-[11px] text-gray-500">প্রতিটি কাজের প্রমাণ</p>
            </div>
          </div>
        </div>
      </section>

      <Widgets color={color} />

      <section className="grid grid-cols-2 rounded-2xl overflow-hidden text-white"
        style={{ background: `linear-gradient(135deg, ${color}, #15803d)` }}>
        {stats.map(([n, l], i) => (
          <div key={l} className="py-5 px-2 text-center"
            style={{
              borderRight: i % 2 === 0 ? '1px solid rgba(255,255,255,.2)' : undefined,
              borderBottom: i < 2 ? '1px solid rgba(255,255,255,.2)' : undefined,
            }}>
            <p className="text-2xl font-extrabold">{n}</p>
            <p className="text-xs opacity-85">{l}</p>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <Head tag="🆘 আবেদন করুন" title="আমরা পাশে আছি" sub="নিচের যেকোনো আবেদন সদস্য না হয়েও করতে পারবেন।" />
        <div className="grid grid-cols-2 gap-3">
          {actions.map(([icon, t, d, fn, c]) => (
            <button key={t} onClick={fn}
              className="bg-white rounded-2xl p-4 shadow-sm text-left space-y-2 active:scale-95 transition">
              <span className="w-11 h-11 rounded-xl flex items-center justify-center text-xl text-white"
                style={{ background: c }}>
                {icon}
              </span>
              <p className="font-bold text-sm">{t}</p>
              <p className="text-[11px] text-gray-500">{d}</p>
            </button>
          ))}
        </div>
        {hotline && (
          <a href={'tel:' + hotline}
            className="block text-center rounded-xl py-3 font-semibold text-white"
            style={{ background: '#dc2626' }}>
            📞 জরুরি হটলাইন: {hotline}
          </a>
        )}
      </section>

      {blood.length > 0 && (
        <section className="space-y-3">
          <Head tag="🩸 জরুরি" title="এখন যাদের রক্ত দরকার" sub="রক্ত দিতে চাইলে সদস্য হয়ে রক্তদাতা তালিকায় নাম লিখুন।" />
          {blood.map(b => (
            <div key={b.id} className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3 border border-red-200">
              <span className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shrink-0"
                style={{ background: '#dc2626' }}>
                {b.blood_group}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">🏥 {b.hospital || 'হাসপাতাল'}</p>
                <p className="text-xs text-gray-500">📍 {b.district || '-'} · 🕒 {fmtDT(b.created_at)}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      <section id="why" className="space-y-4">
        <Head tag="🏅 কেন আমরা" title="যে দান আপনি নিজে যাচাই করতে পারবেন" />
        <div className="grid grid-cols-2 gap-3">
          {WHY.map(([icon, t, d]) => (
            <div key={t} className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
              <span className="w-11 h-11 rounded-xl flex items-center justify-center text-xl text-white"
                style={{ background: color }}>{icon}</span>
              <p className="font-bold text-sm">{t}</p>
              <p className="text-xs text-gray-500">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-2xl p-5 shadow-sm space-y-5">
        <Head tag="🧭 সহজ পদ্ধতি" title="আপনার দান কীভাবে পৌঁছায়" />
        {[
          ['১', 'তহবিল বাছুন', 'যে প্রকল্প বা খাতে দিতে চান সেটা বেছে নিন।'],
          ['২', 'পাঠিয়ে জমা দিন', 'বিকাশ, নগদ বা ব্যাংকে টাকা পাঠিয়ে ট্রানজেকশন নম্বর জমা দিন।'],
          ['৩', 'হিসাবে দেখুন', 'কোষাধ্যক্ষ যাচাই করলে রসিদসহ হিসাবে যোগ হয়, কাজের অগ্রগতিও জানা যায়।'],
        ].map(([n, t, d]) => (
          <div key={n} className="flex gap-3 items-start">
            <span className="w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0"
              style={{ border: `2px solid ${color}`, color }}>{n}</span>
            <div>
              <p className="font-bold">{t}</p>
              <p className="text-sm text-gray-500">{d}</p>
            </div>
          </div>
        ))}
      </section>

      <section id="campaigns" className="space-y-4">
        <Head tag="💚 চলমান প্রকল্প" title="যাদের অপেক্ষায় প্রকল্পগুলো"
          sub="প্রতিটি প্রকল্পের অগ্রগতি নিয়মিত হালনাগাদ হয়।" />
        {projects.length === 0 && <p className="text-center text-sm text-gray-500">এখনও কোনো চলমান প্রকল্প নেই</p>}
        <div className="grid grid-cols-1 gap-4">
          {projects.map(p => {
            const c = sum(don.filter(d => p.fund_id && d.fund_id === p.fund_id))
            const goal = Number(p.goal || 0)
            const pct = goal > 0 ? Math.min(100, Math.round((c / goal) * 100)) : 0
            return (
              <div key={p.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="relative h-40" style={{ background: `linear-gradient(135deg, ${color}, #0b3d2e)` }}>
                  {p.cover_url && <img src={p.cover_url} className="absolute inset-0 w-full h-full object-cover" />}
                  <span className="absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold"
                    style={{ background: 'rgba(255,255,255,.92)', color: '#166534' }}>
                    {CATS[p.category] || 'অন্যান্য'}
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-lg leading-snug">{p.title}</h3>
                  {p.area && <p className="text-xs text-gray-500">📍 {p.area}</p>}
                  {p.description && <p className="text-sm text-gray-500 line-clamp-2">{p.description}</p>}
                  <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div className="h-full" style={{ width: pct + '%', background: 'linear-gradient(90deg,#f59e0b,#16a34a)' }} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <b className="text-green-700">{taka(c)} সংগৃহীত</b>
                    <span className="text-gray-500">লক্ষ্য {taka(goal)}</span>
                  </div>
                  <button className="w-full rounded-full py-2.5 font-semibold border-2"
                    style={{ color, borderColor: color }} onClick={() => setDonate(p.fund_id || '')}>
                    এই প্রকল্পে দান করুন
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {execs.length > 0 && (
        <section id="people" className="space-y-4">
          <Head tag="🤝 আমাদের মানুষ" title="প্রতিটি সেবার পেছনের হাত" />
          <div className="grid grid-cols-2 gap-3">
            {execs.slice(0, 8).map(p => (
              <div key={p.id} className="relative h-48 rounded-2xl overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${color}, #0b3d2e)` }}>
                {p.photo_url && <img src={p.photo_url} className="absolute inset-0 w-full h-full object-cover" />}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,.75), transparent 60%)' }} />
                <div className="absolute bottom-2 left-3 right-3 text-white">
                  <p className="font-bold text-sm leading-tight">{p.full_name}</p>
                  <p className="text-[11px] opacity-85">{ROLES[p.role] || p.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {works.length > 0 && (
        <section className="space-y-3">
          <Head tag="✅ মাঠ থেকে" title="যাচাইকৃত কাজের গল্প" />
          {works.map(w => (
            <div key={w.id} className="bg-white rounded-xl p-3 shadow-sm flex gap-3">
              {w.photo_urls?.[0]
                ? <img src={w.photo_urls[0]} className="w-24 h-24 rounded-lg object-cover shrink-0" />
                : <div className="w-24 h-24 rounded-lg bg-green-50 flex items-center justify-center text-2xl shrink-0">✅</div>}
              <div className="min-w-0">
                <p className="font-bold text-sm">{w.title}</p>
                {w.location && <p className="text-xs text-gray-500">📍 {w.location}</p>}
                <p className="text-xs text-gray-500">👥 {bn(w.beneficiaries)} জন · {taka(w.spent)}</p>
                <p className="text-[11px] text-gray-400">🕒 {fmtDT(w.activity_at)}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      {children}

      <section className="rounded-3xl text-white text-center p-7 space-y-3"
        style={{ background: 'linear-gradient(135deg,#d97706,#4d7c0f)' }}>
        <div className="text-4xl">🤍</div>
        <h2 className="text-2xl font-extrabold leading-snug">
          কেউ না কেউ আপনার উদারতার অপেক্ষায় আছে।
        </h2>
        <p className="text-sm opacity-90">যত ছোটই হোক, প্রতিটি দান আজ একটা সত্যিকারের গল্প এগিয়ে নেয়।</p>
        <button className="bg-white rounded-full px-7 py-3 font-bold shadow-lg"
          style={{ color: '#166534' }} onClick={() => setDonate('')}>
          💚 এখনই দান করুন
        </button>
      </section>

      {notices.length > 0 && (
        <section className="space-y-3">
          <Head tag="📢 ঘোষণা" title="সর্বশেষ নোটিশ" />
          {notices.map(n => (
            <div key={n.id}
              className={'bg-white rounded-xl p-4 shadow-sm space-y-1 ' + (n.is_urgent ? 'border border-red-400' : '')}>
              <p className="text-xs font-semibold text-green-700">{KINDS[n.kind] || n.kind}</p>
              <h3 className="font-bold text-sm">{n.is_urgent && '🚨 '}{n.title}</h3>
              {n.body && <p className="text-sm text-gray-600 whitespace-pre-line">{n.body}</p>}
              <p className="text-[11px] text-gray-400">🕒 {fmtDT(n.created_at)}</p>
            </div>
          ))}
        </section>
      )}

      {gallery.length > 0 && (
        <section className="space-y-3">
          <Head tag="🖼️ গ্যালারি" title="কার্যক্রমের স্মৃতি" />
          <div className="grid grid-cols-2 gap-2">
            {gallery.map(g => (
              <img key={g.id} src={g.media_url} className="w-full h-32 object-cover rounded-xl" />
            ))}
          </div>
        </section>
      )}

      <section id="contact" className="space-y-4">
        <Head tag="✉️ যোগাযোগ" title="আপনার কথা শুনতে চাই" />
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          {hotline && (
            <a href={'tel:' + hotline} className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-xl flex items-center justify-center bg-green-100 text-xl">📞</span>
              <span><b className="text-sm block">ফোন করুন</b><span className="text-sm text-gray-500">{hotline}</span></span>
            </a>
          )}
          <Social settings={settings} />
          <button className="w-full text-white font-semibold rounded-full py-3"
            style={{ background: `linear-gradient(135deg, ${color}, #16a34a)` }}
            onClick={() => setForm('contact')}>
            বার্তা পাঠান ✈️
          </button>
        </div>
      </section>

      <footer className="-mx-4 -mb-4 sm:mx-0 sm:rounded-2xl px-5 py-7 space-y-4 text-white"
        style={{ background: '#0b1d2e' }}>
        <div className="flex items-center gap-3">
          {settings?.logo_url
            ? <img src={settings.logo_url} className="w-10 h-10 rounded-xl object-cover" />
            : <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color }}>💚</span>}
          <b className="text-lg">{org}</b>
        </div>
        <p className="text-sm text-gray-400">
          মানবিকতা, স্বচ্ছতা ও দায়িত্ববোধের সঙ্গে সমাজের অসহায় মানুষের পাশে দাঁড়ানো আমাদের অঙ্গীকার।
        </p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p className="font-bold text-xs tracking-wide">দ্রুত লিংক</p>
            <button className="block text-gray-400" onClick={() => go('why')}>কেন আমরা</button>
            <button className="block text-gray-400" onClick={() => go('campaigns')}>প্রকল্পসমূহ</button>
            <button className="block text-gray-400" onClick={() => go('people')}>আমাদের মানুষ</button>
            <button className="block text-gray-400" onClick={() => go('contact')}>যোগাযোগ</button>
          </div>
          <div className="space-y-2">
            <p className="font-bold text-xs tracking-wide">অংশ নিন</p>
            <button className="block text-gray-400" onClick={() => onNav('apply')}>সদস্য হোন</button>
            <button className="block text-gray-400" onClick={() => setForm('blood')}>রক্তের আবেদন</button>
            <button className="block text-gray-400" onClick={() => setForm('aid')}>সাহায্যের আবেদন</button>
            <button className="block text-gray-400" onClick={() => onNav(user ? 'me' : 'login')}>
              {user ? 'আমার অ্যাকাউন্ট' : 'সদস্য লগইন'}
            </button>
          </div>
        </div>
        <p className="text-[11px] text-gray-500 border-t border-white/10 pt-3">
          © {org} — সর্বস্বত্ব সংরক্ষিত
        </p>
      </footer>

      {donate !== null && (
        <DonateBox supabase={supabase} settings={settings} member={null} isMember={false}
          initialFund={donate || undefined} onClose={() => setDonate(null)} onFinance={() => setDonate(null)} />
      )}
      {form && <RequestModal supabase={supabase} kind={form} settings={settings} onClose={() => setForm('')} />}
    </div>
  )
}
