import { useEffect, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Eye, BadgeCheck, Receipt, TrendingUp, Droplet, PhoneCall, LifeBuoy, UserPlus, Mail,
  Phone, Building2, MapPin, Clock, Users, AlertTriangle, Send,
} from 'lucide-react'
import { Social } from './Widgets'
import { fmtDT } from './time'
import DonateBox from './DonateBox'
import RequestModal from './PublicForms'
import ClockCard from './ClockCard'
import UrgentBoard from './UrgentBoard'
import Committee from './Committee'
import Transparency from './Transparency'
import Journey from './Journey'
import { Ico } from './Icons'
import { Ic } from './UI'

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
const SVC = ['#16a34a', '#2563eb', '#d97706', '#7c3aed', '#0891b2', '#e11d48']
const WHY: [LucideIcon, string, string][] = [
  [Eye, 'স্বচ্ছ হিসাব', 'প্রতিটি অনুদান ও খরচ রসিদ-ভাউচারসহ সময় ধরে লেখা থাকে, সদস্যরা পুরো হিসাব দেখতে পান।'],
  [BadgeCheck, 'যাচাইকৃত কাজ', 'মাঠের প্রতিটি কাজ ছবি ও প্রমাণসহ দায়িত্বশীলরা যাচাই করার পরই প্রকাশ পায়।'],
  [Receipt, 'রসিদসহ অনুদান', 'বিকাশ, নগদ বা ব্যাংকে পাঠিয়ে ট্রানজেকশন নম্বর জমা দিন, যাচাইয়ের পর রসিদ নম্বরসহ হিসাবে যোগ হয়।'],
  [TrendingUp, 'অগ্রগতি সরাসরি', 'প্রতিটি প্রকল্পের লক্ষ্যমাত্রা, সংগৃহীত টাকা ও আপডেট এক জায়গায়।'],
  [Droplet, 'রক্তদাতা নেটওয়ার্ক', 'জরুরি রক্তের আবেদন করুন, সদস্য রক্তদাতারা সাড়া দেন।'],
  [PhoneCall, 'বিপদে পাশে', 'আবেদন ও হটলাইনের মাধ্যমে প্রয়োজনে যোগাযোগ করুন।'],
]

// ── হোম পেজের ছোট সহায়ক অংশ ──
const reduced = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// সংখ্যা ০ থেকে বাড়তে বাড়তে আসল মানে পৌঁছায়
function CountUp({ to, fmt }: { to: number; fmt: (n: number) => string }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (reduced() || !to) { setV(to); return }
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 1100)
      setV(to * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to])
  return <>{fmt(Math.round(v))}</>
}

// স্ক্রল করলে নিচ থেকে হালকা ভেসে ওঠে
function Reveal({ children, className = '' }: { children: any; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(reduced() || typeof IntersectionObserver === 'undefined')
  useEffect(() => {
    if (on || !ref.current) return
    const io = new IntersectionObserver(es => {
      if (es.some(e => e.isIntersecting)) { setOn(true); io.disconnect() }
    }, { rootMargin: '0px 0px -8% 0px' })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [on])
  return <div ref={ref} className={'lp-rv ' + (on ? 'lp-in ' : '') + className}>{children}</div>
}

function Skel({ h = 'h-40' }: { h?: string }) {
  return <div className={'lp-sk rounded-2xl ' + h} />
}

// খাত অনুযায়ী অনুদানের ডোনাট চার্ট
function Donut({ rows, total }: { rows: [string, number][]; total: number }) {
  const R = 52, C = 2 * Math.PI * R
  let off = 0
  return (
    <svg viewBox="0 0 140 140" className="w-36 h-36 shrink-0 -rotate-90" role="img" aria-label="খাত অনুযায়ী অনুদান">
      <circle cx="70" cy="70" r={R} fill="none" stroke="#e5e7eb" strokeWidth="18" />
      {rows.map(([n, v], i) => {
        const len = total > 0 ? (v / total) * C : 0
        const el = (
          <circle key={n} cx="70" cy="70" r={R} fill="none" stroke={SVC[i % SVC.length]} strokeWidth="18"
            strokeDasharray={`${Math.max(0, len - 1.5)} ${C}`} strokeDashoffset={-off} />
        )
        off += len
        return el
      })}
    </svg>
  )
}

const LP_CSS = `
.lp-rv{opacity:0;transform:translateY(18px);transition:opacity .6s ease,transform .6s ease}
.lp-rv.lp-in{opacity:1;transform:none}
.lp-sk{background:linear-gradient(90deg,#eef0f2 25%,#f8f9fa 50%,#eef0f2 75%);background-size:200% 100%;animation:lpsk 1.3s linear infinite}
@keyframes lpsk{to{background-position:-200% 0}}
@media (prefers-reduced-motion:reduce){.lp-rv{opacity:1;transform:none;transition:none}.lp-sk{animation:none}}
`

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

export default function Landing({ supabase, settings, user, onNav, member, children }: any) {
  const color = settings?.theme_color || '#087a43'
  const org = settings?.org_name || 'আমাদের ফাউন্ডেশন'
  const isMem = !!member && member.is_active !== false

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
  const [funds, setFunds] = useState<any[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    Promise.all([
      supabase.from('public_members').select('id, full_name, photo_url, role'),
      supabase.from('donations').select('amount, fund_id'),
      supabase.from('relief_locations').select('families_helped'),
      supabase.from('projects').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(6),
      supabase.from('field_reports')
        .select('id, title, location, activity_at, photo_urls, spent, beneficiaries')
        .eq('status', 'verified').order('activity_at', { ascending: false }).limit(6),
      supabase.from('notices').select('*').neq('kind', 'gallery').order('created_at', { ascending: false }).limit(4),
      supabase.from('notices').select('*').eq('kind', 'gallery').not('media_url', 'is', null)
        .order('created_at', { ascending: false }).limit(6),
      supabase.from('blood_requests').select('id, blood_group, hospital, district, created_at')
        .order('created_at', { ascending: false }).limit(4),
      supabase.from('funds').select('id, name'),
    ]).then(([a, b, c, d, e, f, g, h, i]: any) => {
      setPm(a.data || [])
      setDon(b.data || [])
      setActs(c.data || [])
      setProjects(d.data || [])
      setWorks(e.data || [])
      setNotices(f.data || [])
      setGallery(g.data || [])
      setBlood(h.data || [])
      setFunds(i?.data || [])
      setReady(true)
    }).catch(() => setReady(true))
  }, [])

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  const families = acts.reduce((t, x) => t + Number(x.families_helped || 0), 0)
  const total = sum(don)
  const faces = pm.filter(p => p.photo_url).slice(0, 3)
  const hotline = settings?.hotline

  const stats: [number, (n: number) => string, string][] = [
    [pm.length, n => bn(n) + '+', 'সক্রিয় সদস্য'],
    [total, compact, 'মোট অনুদান'],
    [acts.length, n => bn(n) + '+', 'সম্পন্ন কার্যক্রম'],
    [families, n => bn(n) + '+', 'সহায়তাপ্রাপ্ত পরিবার'],
  ]

  // খাত অনুযায়ী অনুদান (সর্বোচ্চ ৫টি, বাকি "অন্যান্য")
  const byFund: Record<string, number> = {}
  don.forEach(d => {
    const nm = funds.find(f => f.id === d.fund_id)?.name || 'অন্যান্য'
    byFund[nm] = (byFund[nm] || 0) + Number(d.amount || 0)
  })
  const fundRows = Object.entries(byFund).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1])
  const topRows: [string, number][] = fundRows.slice(0, 5)
  const restSum = fundRows.slice(5).reduce((t, x) => t + x[1], 0)
  if (restSum > 0) topRows.push(['অন্যান্য', restSum])

  const actions: [LucideIcon, string, string, () => void, string][] = [
    [Droplet, 'রক্তের জন্য আবেদন', 'জরুরি রক্ত দরকার? তথ্য দিন', () => setForm('blood'), '#dc2626'],
    [LifeBuoy, 'সাহায্যের আবেদন', 'চিকিৎসা, শিক্ষা, খাদ্য ইত্যাদি', () => setForm('aid'), '#d97706'],
    [UserPlus, 'সদস্য হোন', 'আমাদের পরিবারে যুক্ত হোন', () => onNav('apply'), color],
    [Mail, 'যোগাযোগ', 'প্রশ্ন বা পরামর্শ পাঠান', () => setForm('contact'), '#2563eb'],
  ]

  return (
    <div className="space-y-10">
      <style>{LP_CSS}</style>

      <div className="-mt-4">
        <ClockCard settings={settings} onNav={onNav} />
      </div>

      <section className="-mx-4 sm:mx-0">
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
                : <Ico name="heart" size={56} tint={0.4} />}
            </div>
          </div>
        </div>
        <div className="pt-16 text-center px-4">
          <h2 className="text-3xl font-bold leading-tight" style={{ color }}>{org}</h2>
          {settings?.slogan && <p className="text-sm text-gray-500 mt-1">{settings.slogan}</p>}
        </div>
      </section>

      {isMem ? (
        <UrgentBoard supabase={supabase} settings={settings} member={member} />
      ) : (
        <>
          <section className="space-y-4">
            <Head tag="আবেদন করুন" title="আমরা পাশে আছি" sub="নিচের যেকোনো আবেদন সদস্য না হয়েও করতে পারবেন।" />
            <div className="grid grid-cols-2 gap-3">
              {actions.map(([Icon, t, d, fn, c]) => (
                <button key={t} onClick={fn}
                  className="bg-white rounded-2xl p-4 shadow-sm text-left space-y-2 active:scale-95 transition">
                  <span className="w-11 h-11 rounded-xl flex items-center justify-center text-white"
                    style={{ background: c }}>
                    <Ic i={Icon} s={22} />
                  </span>
                  <p className="font-bold text-sm">{t}</p>
                  <p className="text-[11px] text-gray-500">{d}</p>
                </button>
              ))}
            </div>
            {hotline && (
              <a href={'tel:' + hotline}
                className="flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white"
                style={{ background: '#dc2626' }}>
                <Ic i={Phone} s={16} /> জরুরি হটলাইন: {hotline}
              </a>
            )}
          </section>

          {blood.length > 0 && (
            <section className="space-y-3">
              <Head tag="জরুরি" title="এখন যাদের রক্ত দরকার" sub="রক্ত দিতে চাইলে সদস্য হয়ে রক্তদাতা তালিকায় নাম লিখুন।" />
              {blood.map(b => (
                <div key={b.id} className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3 border border-red-200">
                  <span className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shrink-0"
                    style={{ background: '#dc2626' }}>
                    {b.blood_group}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate"><Ic i={Building2} /> {b.hospital || 'হাসপাতাল'}</p>
                    <p className="text-xs text-gray-500">
                      <Ic i={MapPin} s={12} /> {b.district || '-'} · <Ic i={Clock} s={12} /> {fmtDT(b.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </section>
          )}

          <section className="text-center space-y-3">
            <span className="inline-block rounded-full px-3 py-1 text-xs font-bold"
              style={{ background: '#dcfce7', color: '#166534' }}>
              {families > 0 ? bn(families) + '+ পরিবার আমাদের সহায়তা পেয়েছে' : 'সমাজসেবা • মানবতা • স্বেচ্ছাসেবা'}
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
                দান করুন
              </button>
              <button className="border rounded-full px-6 py-3 font-semibold bg-white text-gray-800"
                onClick={() => onNav('apply')}>
                সদস্য হোন
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
          </section>
        </>
      )}

      {isMem && (
        <button className="w-full text-white font-semibold rounded-2xl py-3.5 flex items-center justify-center gap-2 shadow-lg"
          style={{ background: `linear-gradient(135deg, ${color}, #16a34a)` }}
          onClick={() => setDonate('')}>
          <Ico name="heart" size={20} tint={0.5} /> দান করুন
        </button>
      )}

      <section className="grid grid-cols-2 rounded-2xl overflow-hidden text-white"
        style={{ background: `linear-gradient(135deg, ${color}, #15803d)` }}>
        {stats.map(([n, fm, l], i) => (
          <div key={l} className="py-5 px-2 text-center"
            style={{
              borderRight: i % 2 === 0 ? '1px solid rgba(255,255,255,.2)' : undefined,
              borderBottom: i < 2 ? '1px solid rgba(255,255,255,.2)' : undefined,
            }}>
            <p className="text-2xl font-extrabold"><CountUp to={n} fmt={fm} /></p>
            <p className="text-xs opacity-85">{l}</p>
          </div>
        ))}
      </section>

      {topRows.length > 0 && (
        <Reveal>
          <section className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <Head tag="স্বচ্ছতা" title="অনুদান কোন খাতে এসেছে" sub="সবার জন্য উন্মুক্ত হিসাবের সারাংশ।" />
            <div className="flex items-center gap-4">
              <div className="relative">
                <Donut rows={topRows} total={total} />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <b className="text-sm leading-tight">{compact(total)}</b>
                  <span className="text-[10px] text-gray-500">মোট</span>
                </div>
              </div>
              <ul className="flex-1 space-y-1.5 min-w-0">
                {topRows.map(([n, v], i) => (
                  <li key={n} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: SVC[i % SVC.length] }} />
                    <span className="flex-1 truncate">{n}</span>
                    <b>{bn(Math.round((v / total) * 100))}%</b>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </Reveal>
      )}

      <Reveal><Transparency supabase={supabase} color={color} /></Reveal>

      {!isMem && (
        <>
          <section id="why" className="space-y-4">
            <Head tag="কেন আমরা" title="যে দান আপনি নিজে যাচাই করতে পারবেন" />
            <div className="grid grid-cols-2 gap-3">
              {WHY.map(([Icon, t, d]) => (
                <div key={t} className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
                  <span className="w-11 h-11 rounded-xl flex items-center justify-center text-white"
                    style={{ background: color }}>
                    <Ic i={Icon} s={22} />
                  </span>
                  <p className="font-bold text-sm">{t}</p>
                  <p className="text-xs text-gray-500">{d}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-2xl p-5 shadow-sm space-y-5">
            <Head tag="সহজ পদ্ধতি" title="আপনার দান কীভাবে পৌঁছায়" />
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
        </>
      )}

      <section id="campaigns" className="space-y-4">
        <Head tag="চলমান প্রকল্প" title="যাদের অপেক্ষায় প্রকল্পগুলো"
          sub="প্রতিটি প্রকল্পের অগ্রগতি নিয়মিত হালনাগাদ হয়।" />
        {!ready && <div className="space-y-4"><Skel /><Skel /></div>}
        {ready && projects.length === 0 && <p className="text-center text-sm text-gray-500">এখনও কোনো চলমান প্রকল্প নেই</p>}
        <div className="grid grid-cols-1 gap-4">
          {projects.map(p => {
            const c = sum(don.filter(d => p.fund_id && d.fund_id === p.fund_id))
            const goal = Number(p.goal || 0)
            const pct = goal > 0 ? Math.min(100, Math.round((c / goal) * 100)) : 0
            return (
              <Reveal key={p.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="relative h-40" style={{ background: `linear-gradient(135deg, ${color}, #0b3d2e)` }}>
                  {p.cover_url && <img src={p.cover_url} className="absolute inset-0 w-full h-full object-cover" />}
                  <span className="absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold"
                    style={{ background: 'rgba(255,255,255,.92)', color: '#166534' }}>
                    {CATS[p.category] || 'অন্যান্য'}
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-lg leading-snug">{p.title}</h3>
                  {p.area && <p className="text-xs text-gray-500"><Ic i={MapPin} s={12} /> {p.area}</p>}
                  {p.description && <p className="text-sm text-gray-500 line-clamp-2">{p.description}</p>}
                  <div className="flex items-center gap-2">
                    <div className="h-3 flex-1 rounded-full bg-gray-200 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000"
                        style={{ width: Math.max(pct, c > 0 ? 3 : 0) + '%', background: 'linear-gradient(90deg,#f59e0b,#16a34a)' }} />
                    </div>
                    <b className="text-sm w-12 text-right" style={{ color }}>{bn(pct)}%</b>
                  </div>
                  <div className="flex justify-between text-sm">
                    <b className="text-green-700">{taka(c)} সংগৃহীত</b>
                    <span className="text-gray-500">লক্ষ্য {taka(goal)}</span>
                  </div>
                  {goal > c && c > 0 && (
                    <p className="text-xs text-amber-700">আরও {taka(goal - c)} হলে লক্ষ্য পূর্ণ হবে</p>
                  )}
                  <button className="w-full rounded-full py-2.5 font-semibold border-2"
                    style={{ color, borderColor: color }} onClick={() => setDonate(p.fund_id || '')}>
                    এই প্রকল্পে দান করুন
                  </button>
                </div>
              </Reveal>
            )
          })}
        </div>
      </section>

      <div id="people">
        <Reveal><Committee supabase={supabase} color={color} onNav={onNav} isMem={isMem} /></Reveal>
      </div>

      {works.length > 0 && (
        <Reveal className="space-y-3">
          <Head tag="মাঠ থেকে" title="যাচাইকৃত কাজের গল্প" sub="প্রতিটি কাজ ছবি ও প্রমাণসহ দায়িত্বশীলরা যাচাই করেছেন।" />
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2">
            {works.map(w => (
              <div key={w.id} className="snap-center shrink-0 w-[78%] max-w-[300px] bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="relative h-44" style={{ background: `linear-gradient(135deg, ${color}, #0b3d2e)` }}>
                  {w.photo_urls?.[0] ? (
                    <img src={w.photo_urls[0]} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-60"><Ico name="works" size={48} /></div>
                  )}
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-2 py-0.5 bg-white/90 text-green-700">
                    <BadgeCheck size={11} /> যাচাইকৃত
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-3 pt-10 text-white" style={{ background: 'linear-gradient(0deg, rgba(0,0,0,.75), transparent)' }}>
                    <p className="font-bold text-sm leading-snug">{w.title}</p>
                  </div>
                </div>
                <div className="p-3 text-xs text-gray-500 space-y-1">
                  {w.location && <p><Ic i={MapPin} s={12} /> {w.location}</p>}
                  <p><Ic i={Users} s={12} /> {bn(w.beneficiaries)} জন উপকৃত &middot; {taka(w.spent)} খরচ</p>
                  <p className="text-[11px] text-gray-400"><Ic i={Clock} s={12} /> {fmtDT(w.activity_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      )}
      <Reveal>
        <Journey color={color} tail={families > 0 ? bn(families) + ' পরিবারের পাশে দাঁড়িয়েছি, মোট ' + compact(total) + ' অনুদান এসেছে' : undefined} />
      </Reveal>

      {children}

      {!isMem && (
        <section className="rounded-3xl text-white text-center p-7 space-y-3"
          style={{ background: 'linear-gradient(135deg,#d97706,#4d7c0f)' }}>
          <div className="flex justify-center"><Ico name="heart" size={44} tint={0.5} /></div>
          <h2 className="text-2xl font-extrabold leading-snug">
            কেউ না কেউ আপনার উদারতার অপেক্ষায় আছে।
          </h2>
          <p className="text-sm opacity-90">যত ছোটই হোক, প্রতিটি দান আজ একটা সত্যিকারের গল্প এগিয়ে নেয়।</p>
          <button className="bg-white rounded-full px-7 py-3 font-bold shadow-lg"
            style={{ color: '#166534' }} onClick={() => setDonate('')}>
            এখনই দান করুন
          </button>
        </section>
      )}

      {notices.length > 0 && (
        <section className="space-y-3">
          <Head tag="ঘোষণা" title="সর্বশেষ নোটিশ" />
          {notices.map(n => (
            <div key={n.id}
              className={'bg-white rounded-xl p-4 shadow-sm flex gap-3 ' + (n.is_urgent ? 'border border-red-400' : '')}>
              <div className="text-center text-white rounded-xl px-3 py-2 h-fit shrink-0"
                style={{ background: n.is_urgent ? '#dc2626' : color }}>
                <p className="font-bold text-lg leading-none">{bn(new Date(n.created_at).getDate())}</p>
                <p className="text-[10px] mt-0.5">{new Date(n.created_at).toLocaleDateString('bn-BD', { month: 'short' })}</p>
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-xs font-semibold" style={{ color: n.is_urgent ? '#dc2626' : '#15803d' }}>
                  {n.is_urgent ? 'জরুরি · ' : ''}{KINDS[n.kind] || n.kind}
                </p>
                <h3 className="font-bold text-sm">
                  {n.is_urgent && <Ic i={AlertTriangle} s={14} className="text-red-600 mr-1" />}
                  {n.title}
                </h3>
                {n.body && <p className="text-sm text-gray-600 whitespace-pre-line">{n.body}</p>}
                <p className="text-[11px] text-gray-400"><Ic i={Clock} s={12} /> {fmtDT(n.created_at)}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      {gallery.length > 0 && (
        <section className="space-y-3">
          <Head tag="গ্যালারি" title="কার্যক্রমের স্মৃতি" />
          <div className="grid grid-cols-2 gap-2">
            {gallery.map(g => (
              <img key={g.id} src={g.media_url} className="w-full h-32 object-cover rounded-xl" />
            ))}
          </div>
        </section>
      )}

      {isMem ? (
        <section className="space-y-3">
          <Head tag="সংযুক্ত থাকুন" title="মিটিং ও যোগাযোগ" />
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
            {hotline && (
              <a href={'tel:' + hotline} className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-xl flex items-center justify-center bg-green-100">
                  <Phone className="w-5 h-5 text-green-700" />
                </span>
                <span><b className="text-sm block">হটলাইন</b><span className="text-sm text-gray-500">{hotline}</span></span>
              </a>
            )}
            <Social settings={settings} />
          </div>
        </section>
      ) : (
        <section id="contact" className="space-y-4">
          <Head tag="যোগাযোগ" title="আপনার কথা শুনতে চাই" />
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
            {hotline && (
              <a href={'tel:' + hotline} className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-xl flex items-center justify-center bg-green-100">
                  <Phone className="w-5 h-5 text-green-700" />
                </span>
                <span><b className="text-sm block">ফোন করুন</b><span className="text-sm text-gray-500">{hotline}</span></span>
              </a>
            )}
            <Social settings={settings} />
            <button className="w-full text-white font-semibold rounded-full py-3"
              style={{ background: `linear-gradient(135deg, ${color}, #16a34a)` }}
              onClick={() => setForm('contact')}>
              <Ic i={Send} s={16} /> বার্তা পাঠান
            </button>
          </div>
        </section>
      )}

      <footer className="-mx-4 -mb-4 sm:mx-0 sm:rounded-2xl px-5 py-7 space-y-4 text-white"
        style={{ background: '#0b1d2e' }}>
        <div className="flex items-center gap-3">
          {settings?.logo_url
            ? <img src={settings.logo_url} className="w-10 h-10 rounded-xl object-cover" />
            : <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color }}><Ico name="heart" size={20} tint={0.5} /></span>}
          <b className="text-lg">{org}</b>
        </div>
        <p className="text-sm text-gray-400">
          মানবিকতা, স্বচ্ছতা ও দায়িত্ববোধের সঙ্গে সমাজের অসহায় মানুষের পাশে দাঁড়ানো আমাদের অঙ্গীকার।
        </p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p className="font-bold text-xs tracking-wide">দ্রুত লিংক</p>
            <button className="block text-gray-400" onClick={() => go('campaigns')}>প্রকল্পসমূহ</button>
            <button className="block text-gray-400" onClick={() => go('people')}>আমাদের মানুষ</button>
            <button className="block text-gray-400" onClick={() => onNav('weather')}>আবহাওয়া</button>
            <button className="block text-gray-400" onClick={() => onNav('islamic')}>ইসলামিক কর্নার</button>
          </div>
          <div className="space-y-2">
            <p className="font-bold text-xs tracking-wide">অংশ নিন</p>
            {isMem ? (
              <>
                <button className="block text-gray-400" onClick={() => onNav('finance')}>স্বচ্ছ আয়-ব্যয়</button>
                <button className="block text-gray-400" onClick={() => onNav('members')}>সদস্য মণ্ডলী</button>
                <button className="block text-gray-400" onClick={() => onNav('me')}>আমার অ্যাকাউন্ট</button>
              </>
            ) : (
              <>
                <button className="block text-gray-400" onClick={() => onNav('apply')}>সদস্য হোন</button>
                <button className="block text-gray-400" onClick={() => setForm('blood')}>রক্তের আবেদন</button>
                <button className="block text-gray-400" onClick={() => setForm('aid')}>সাহায্যের আবেদন</button>
                <button className="block text-gray-400" onClick={() => onNav(user ? 'me' : 'login')}>
                  {user ? 'আমার অ্যাকাউন্ট' : 'সদস্য লগইন'}
                </button>
              </>
            )}
          </div>
        </div>
        <p className="text-[11px] text-gray-500 border-t border-white/10 pt-3">
          © {org} — সর্বস্বত্ব সংরক্ষিত
        </p>
      </footer>

      {donate !== null && (
        <DonateBox supabase={supabase} settings={settings} member={isMem ? member : null} isMember={isMem}
          initialFund={donate || undefined} onClose={() => setDonate(null)} onFinance={() => setDonate(null)} />
      )}
      {form && <RequestModal supabase={supabase} kind={form} settings={settings} onClose={() => setForm('')} />}
    </div>
  )
}
