import { useEffect, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Shield, Crown, PenTool, Coins, Stethoscope,
  Trophy, Megaphone, Users, Star, Droplet, Check, RotateCw
} from 'lucide-react'
import { roleLabel } from './roles'
import { Ic } from './UI'

export const ROLE_COLOR: Record<string, string> = {
  admin: '#dc2626',
  president: '#7c3aed',
  general_secretary: '#2563eb',
  cashier: '#d97706',
  health: '#e11d48',
  sports: '#0891b2',
  publicity: '#db2777',
  member: '#16a34a',
}

const MONTHS = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রি', 'মে', 'জুন', 'জুলা', 'আগ', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে']
const PAL = ['#5e35b1', '#1e88e5', '#26a69a', '#ffb300', '#ef5350', '#8d6e63']

const bd = (s: string | number) => String(s).replace(/\d/g, x => '০১২৩৪৫৬৭৮৯'[Number(x)])
const bn = (n: number) => Number(n || 0).toLocaleString('bn-BD')
const taka = (n: number) => '৳' + Math.round(n || 0).toLocaleString('bn-BD')
const dOf = (x: any) => (x.donated_on || x.created_at || '').slice(0, 10)
const sum = (a: any[]) => a.reduce((t, x) => t + Number(x.amount), 0)

export function Photo({ p, size, ring, bg }: { p: any; size: number; ring: string; bg?: string }) {
  const st: any = { width: size, height: size, borderRadius: '50%', border: `3px solid ${ring}`, flex: 'none' }
  return p.photo_url ? (
    <img src={p.photo_url} style={{ ...st, objectFit: 'cover' }} />
  ) : (
    <span style={{
      ...st, background: bg || 'rgba(255,255,255,.2)', color: '#fff', display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.4,
    }}>
      {(p.full_name || '?').slice(0, 1)}
    </span>
  )
}

function BackItem({ k, v, href, wide }: { k: string; v?: string | null; href?: string; wide?: boolean }) {
  if (!v) return null
  return (
    <div className={'min-w-0 ' + (wide ? 'col-span-2' : '')}>
      <p className="text-[10px] opacity-70 leading-tight">{k}</p>
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
          className="block text-xs font-semibold underline truncate">{v}</a>
      ) : (
        <p className="text-xs font-semibold truncate">{v}</p>
      )}
    </div>
  )
}

type Theme = { a: string; b: string; acc: string; emblem: LucideIcon; tier: 1 | 2 | 3; tag: string }
const THEME: Record<string, Theme> = {
  admin: { a: '#991b1b', b: '#12060a', acc: '#fcd34d', emblem: Shield, tier: 3, tag: 'সংগঠনের প্রধান পরিচালক' },
  president: { a: '#6d28d9', b: '#0e0a2b', acc: '#fcd34d', emblem: Crown, tier: 3, tag: 'সংগঠনের নেতৃত্বে' },
  general_secretary: { a: '#1d4ed8', b: '#06122e', acc: '#fcd34d', emblem: PenTool, tier: 3, tag: 'সংগঠনের কার্যনির্বাহী' },
  cashier: { a: '#b45309', b: '#1a1004', acc: '#fde68a', emblem: Coins, tier: 2, tag: 'তহবিলের হিসাবরক্ষক' },
  health: { a: '#be123c', b: '#1a0610', acc: '#fecdd3', emblem: Stethoscope, tier: 2, tag: 'স্বাস্থ্য ও রক্তদান সমন্বয়ক' },
  sports: { a: '#0e7490', b: '#041b22', acc: '#a5f3fc', emblem: Trophy, tier: 2, tag: 'ক্রীড়া ও সংস্কৃতির প্রাণ' },
  publicity: { a: '#be185d', b: '#1c0612', acc: '#fbcfe8', emblem: Megaphone, tier: 2, tag: 'সংগঠনের কণ্ঠস্বর' },
  member: { a: '#15803d', b: '#06210f', acc: '#bbf7d0', emblem: Users, tier: 1, tag: 'সংগঠনের স্বেচ্ছাসেবী' },
}

const themeOf = (role: string, fallback: string): Theme =>
  THEME[role] || { a: fallback, b: '#0b1d2e', acc: '#e2e8f0', emblem: Star, tier: 2, tag: '' }

const SPARKS: number[][] = [
  [12, 62, 3, 0, 2.6], [30, 88, 2, 0.7, 3.1], [58, 74, 3, 1.4, 2.4], [80, 90, 2, 0.3, 3.4],
  [20, 30, 2, 1.9, 2.9], [70, 45, 3, 1.1, 2.7], [88, 20, 2, 2.2, 3.2], [44, 12, 2, 0.5, 2.5], [8, 40, 2, 1.6, 3.0],
]

const FX_CSS = `
@keyframes mc-spin{to{transform:rotate(360deg)}}
@keyframes mc-tw{0%,100%{opacity:.12;transform:scale(.5)}50%{opacity:1;transform:scale(1.25)}}
@keyframes mc-sweep{0%{transform:translateX(-170%) skewX(-20deg)}45%,100%{transform:translateX(480%) skewX(-20deg)}}
@keyframes mc-pulse{0%,100%{box-shadow:0 0 0 0 var(--mc-acc)}50%{box-shadow:0 0 12px 3px var(--mc-acc)}}
@keyframes mc-glow{0%,100%{box-shadow:0 8px 24px -4px var(--mc-a),0 0 10px 0 var(--mc-g)}50%{box-shadow:0 10px 34px -2px var(--mc-a),0 0 22px 2px var(--mc-g)}}
`

function FlipHero({ p, c, onBack, due = null, blood = null, own = false }: {
  p: any; c: string; onBack: () => void; due?: number | null; blood?: any; own?: boolean
}) {
  const [flip, setFlip] = useState(false)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, x: 50, y: 30, on: false })
  const box = useRef<HTMLDivElement>(null)
  const start = useRef<{ x: number; y: number } | null>(null)
  const moved = useRef(false)
  const reduce = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const th = themeOf(p.role, c)
  const roleName = roleLabel(p.role)

  const toggle = () => {
    if (moved.current) { moved.current = false; return }
    setFlip(f => !f)
  }
  const onDown = (e: any) => { start.current = { x: e.clientX, y: e.clientY }; moved.current = false }
  const onMove = (e: any) => {
    if (reduce || !box.current) return
    const r = box.current.getBoundingClientRect()
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
    const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))
    if (start.current && Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) > 10) moved.current = true
    setTilt({ rx: (0.5 - y) * 14, ry: (x - 0.5) * 16, x: x * 100, y: y * 100, on: true })
  }
  const onEnd = () => {
    start.current = null
    setTilt(t => ({ ...t, rx: 0, ry: 0, on: false }))
  }

  const outer: any = {
    gridArea: '1 / 1', borderRadius: 28, position: 'relative', overflow: 'hidden', display: 'flex',
    padding: 2.5, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
  }
  const ring: any = th.tier === 1
    ? { position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${th.acc}99, ${th.a})` }
    : {
      position: 'absolute', inset: '-100%', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
      background: `conic-gradient(from 0deg, ${th.acc}00 0deg, ${th.acc} 55deg, ${th.a} 120deg, ${th.acc}00 200deg, ${th.acc}00 260deg, ${th.acc} 310deg, ${th.acc}00 360deg)`,
      animation: reduce ? 'none' : `mc-spin ${th.tier === 3 ? 5 : 8}s linear infinite`,
    }

  const plate: any = {
    position: 'relative', flex: 1, borderRadius: 25.5, overflow: 'hidden', color: '#fff',
    display: 'flex', flexDirection: 'column', justifyContent: 'center',
    backgroundImage: [
      `radial-gradient(120% 90% at 88% 0%, ${th.acc}26, transparent 55%)`,
      `radial-gradient(100% 90% at 0% 100%, ${th.a}, transparent 62%)`,
      th.tier === 3 ? 'repeating-linear-gradient(115deg, rgba(255,255,255,.04) 0 2px, transparent 2px 8px)' : '',
      `linear-gradient(135deg, ${th.a}, ${th.b})`,
    ].filter(Boolean).join(', '),
  }

  const shine = (mirror: boolean): any => {
    const x = mirror ? 100 - tilt.x : tilt.x
    return {
      position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 25.5,
      opacity: tilt.on && !reduce ? 1 : 0, transition: 'opacity .4s',
      backgroundImage:
        `radial-gradient(circle at ${x}% ${tilt.y}%, rgba(255,255,255,.28), rgba(255,255,255,0) 55%), ` +
        'linear-gradient(115deg, rgba(255,255,255,0) 35%, rgba(255,214,140,.16) 46%, rgba(150,220,255,.16) 54%, rgba(255,255,255,0) 65%)',
      backgroundSize: '100% 100%, 260% 100%',
      backgroundPosition: `0 0, ${x}% 0`,
    }
  }

  const fx = (
    <>
      {th.tier > 1 && SPARKS.slice(0, th.tier === 3 ? 9 : 5).map(([top, left, sz, dl, du], i) => (
        <span key={i} aria-hidden style={{
          position: 'absolute', top: top + '%', left: left + '%', width: sz, height: sz, borderRadius: '50%',
          background: th.acc, boxShadow: `0 0 6px 1px ${th.acc}`, pointerEvents: 'none',
          opacity: reduce ? 0.5 : 0.12, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          animation: reduce ? 'none' : `mc-tw ${du}s ease-in-out ${dl}s infinite`,
        }} />
      ))}
      {th.tier > 1 && !reduce && (
        <span aria-hidden style={{
          position: 'absolute', top: '-10%', bottom: '-10%', left: 0, width: '34%', pointerEvents: 'none',
          background: 'linear-gradient(100deg, transparent, rgba(255,255,255,.24), transparent)',
          backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          animation: `mc-sweep ${th.tier === 3 ? 5 : 7}s ease-in-out infinite`,
        }} />
      )}
    </>
  )

  const pill = { background: 'rgba(255,255,255,.18)' }
  const feeColor = due === null ? 'rgba(255,255,255,.85)' : due === 0 ? '#4ade80' : '#f87171'
  const hasPrivate = 'phone' in p
  const joinedFull = p.joined_at
    ? new Date(p.joined_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''
  const phone = p.phone ? bd(p.phone) : ''
  const wa = p.whatsapp ? bd(p.whatsapp) : ''
  const hint: any = { position: 'absolute', bottom: 8, right: 16, fontSize: 10, opacity: 0.7 }
  const medal: any = {
    position: 'absolute', top: -6, left: -8, width: 30, height: 30, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: `linear-gradient(135deg, ${th.acc}, #ffffff)`, border: `2px solid ${th.b}`,
    '--mc-acc': th.acc,
    animation: !reduce && th.tier === 3 ? 'mc-pulse 2.4s ease-in-out infinite' : 'none',
  }
  const glow: any = th.tier === 3 && !reduce
    ? { '--mc-a': th.a + 'aa', '--mc-g': th.acc + '55', animation: 'mc-glow 3.2s ease-in-out infinite' }
    : { boxShadow: `0 6px 18px -6px ${th.a}99` }

  return (
    <div ref={box} style={{ perspective: 1200, touchAction: 'pan-y' }}
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onEnd}
      onPointerLeave={onEnd} onPointerCancel={onEnd}>
      <style>{FX_CSS}</style>
      <div style={{
        transformStyle: 'preserve-3d', borderRadius: 28, ...glow,
        transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        transition: tilt.on ? 'transform .08s linear' : 'transform .5s ease-out',
      }}>
        <div role="button" tabIndex={0} aria-pressed={flip}
          aria-label="আইডি কার্ড। ছুঁলে উল্টে পেছনের তথ্য দেখাবে"
          onClick={toggle}
          onKeyDown={e => {
            if (e.target !== e.currentTarget) return
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFlip(f => !f) }
          }}
          style={{
            display: 'grid', transformStyle: 'preserve-3d', cursor: 'pointer',
            transition: reduce ? 'none' : 'transform .65s cubic-bezier(.4,.2,.2,1)',
            transform: flip ? 'rotateY(180deg)' : 'none', WebkitTapHighlightColor: 'transparent',
          }}>

          {/* সামনের পাশ */}
          <div style={{ ...outer, pointerEvents: flip ? 'none' : 'auto' }}>
            <div style={ring} />
            <div style={{ ...plate, padding: 18 }}>
              <span style={{ position: 'absolute', top: -40, right: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,.08)' }} />
              <span style={{ position: 'absolute', bottom: -50, left: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,.06)' }} />
              {p.joined_at && (
                <div aria-hidden="true" style={{
                  position: 'absolute', top: 10, right: 14, width: 48, height: 48, borderRadius: '50%',
                  border: `1.5px solid ${th.acc}aa`, outline: `1px dashed ${th.acc}66`, outlineOffset: 3,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  transform: 'rotate(-12deg)', fontSize: 9, lineHeight: 1.15, textAlign: 'center',
                  color: th.acc, pointerEvents: 'none',
                }}>
                  <span>সদস্য</span>
                  <b style={{ fontSize: 12 }}>{bd(new Date(p.joined_at).getFullYear())}</b>
                </div>
              )}
              <div className="relative space-y-4">
                {own ? (
                  <p className="text-xs font-bold truncate flex items-center gap-1.5" style={{ color: th.acc, maxWidth: 'calc(100% - 70px)' }}>
                    <Ic i={th.emblem} s={13} />
                    <span>{th.tag || roleName}</span>
                  </p>
                ) : (
                  <button onClick={e => { e.stopPropagation(); onBack() }}
                    className="text-sm font-semibold opacity-90">‹ সদস্য মণ্ডলী</button>
                )}
                <div className="flex items-center gap-4">
                  <div style={{
                    position: 'relative', flex: 'none', borderRadius: '50%',
                    boxShadow: due === null ? undefined : `0 0 0 5px ${feeColor}33`,
                  }}>
                    <Photo p={p} size={84} ring={feeColor} />
                    <span style={medal}>
                      <Ic i={th.emblem} s={16} className="text-[#1a1205]" />
                    </span>
                    {blood?.blood_group && (
                      <span style={{
                        position: 'absolute', right: -8, bottom: -2, background: '#fff', color: '#be123c',
                        borderRadius: 999, padding: '1px 7px', fontSize: 11, fontWeight: 700,
                        boxShadow: '0 1px 4px rgba(0,0,0,.35)',
                      }} className="inline-flex items-center gap-1">
                        <Ic i={Droplet} s={11} /> {blood.blood_group}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold leading-tight">{p.full_name}</h2>
                    <span className="inline-block rounded-full px-3 py-0.5 text-xs font-extrabold my-1"
                      style={{ background: `linear-gradient(90deg, ${th.acc}, ${th.acc}cc)`, color: '#1a1205' }}>
                      {roleName}
                    </span>
                    <p className="text-xs opacity-85">আইডি: {p.member_code}{p.district ? ' · ' + p.district : ''}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  {p.is_active === false && (
                    <span className="rounded-full px-3 py-1" style={pill}>নিষ্ক্রিয়</span>
                  )}
                  {due !== null && (
                    <span className="rounded-full px-3 py-1 font-semibold inline-flex items-center gap-1"
                      style={{ background: due === 0 ? 'rgba(74,222,128,.25)' : 'rgba(248,113,113,.3)' }}>
                      {due === 0 ? (
                        <>
                          <Ic i={Check} s={12} />
                          <span>ফি হালনাগাদ</span>
                        </>
                      ) : (
                        'বকেয়া ' + bn(due) + ' মাস'
                      )}
                    </span>
                  )}
                  {p.joined_at && (
                    <span className="rounded-full px-3 py-1" style={pill}>
                      সদস্য হয়েছেন: {new Date(p.joined_at).toLocaleDateString('bn-BD', { month: 'long', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
              <p style={hint} className="inline-flex items-center gap-1">
                <Ic i={RotateCw} s={11} />
                <span>ছুঁয়ে উল্টান</span>
              </p>
              {fx}
              <div style={shine(false)} />
            </div>
          </div>

          {/* পেছনের পাশ */}
          <div style={{ ...outer, transform: 'rotateY(180deg)', pointerEvents: flip ? 'auto' : 'none' }}>
            <div style={ring} />
            <div style={{ ...plate, padding: '14px 16px 22px' }}>
              <span style={{ position: 'absolute', top: -50, left: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,.08)' }} />
              <span style={{ position: 'absolute', bottom: -50, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,.06)' }} />
              <div className="relative">
                <div className="flex items-center justify-between gap-3 pb-2 mb-2"
                  style={{ borderBottom: `1px solid ${th.acc}40` }}>
                  <div className="min-w-0">
                    <p className="text-[10px] leading-tight flex items-center gap-1" style={{ color: th.acc }}>
                      <Ic i={th.emblem} s={11} />
                      <span>{roleName} পরিচয়পত্র</span>
                    </p>
                    <p className="font-bold leading-tight truncate">{p.full_name}</p>
                  </div>
                  <span className="rounded-full px-3 py-0.5 text-xs font-extrabold shrink-0"
                    style={{ background: th.acc, color: '#1a1205' }}>{p.member_code}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <BackItem k="পদবী" v={roleName} />
                  <BackItem k="মোবাইল" v={phone} href={p.phone ? 'tel:' + p.phone : undefined} />
                  <BackItem k="হোয়াটসঅ্যাপ" v={wa} href={p.whatsapp ? 'https://wa.me/' + String(p.whatsapp).replace(/\D/g, '') : undefined} />
                  <BackItem k="রক্তের গ্রুপ" v={p.blood_group} />
                  <BackItem k="জেলা" v={p.district} />
                  <BackItem k="থানা/উপজেলা" v={p.upazila} />
                  <BackItem k="সদস্য হয়েছেন" v={joinedFull} />
                  <BackItem k="ফেসবুক" v={p.facebook_url ? 'প্রোফাইল দেখুন' : ''} href={p.facebook_url || undefined} />
                  <BackItem k="ইমেইল" v={p.email} wide />
                </div>
                {!hasPrivate && (
                  <p className="text-[10px] opacity-70 pt-2">
                    ফোন, ইমেইল ও ব্যক্তিগত তথ্য এখানে প্রকাশ করা হয় না।
                  </p>
                )}
              </div>
              <p style={hint} className="inline-flex items-center gap-1">
                <Ic i={RotateCw} s={11} />
                <span>আবার ছুঁয়ে সামনে ফিরুন</span>
              </p>
              {fx}
              <div style={shine(true)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Card({ title, children }: { title?: string; children: any }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
      {title && <p className="font-bold">{title}</p>}
      {children}
    </div>
  )
}

export default function MemberView({ supabase, settings, p, selfId, onBack, onNav }: any) {
  const now = new Date()
  const cy = now.getFullYear()
  const cm = now.getMonth() + 1
  const [year, setYear] = useState(cy)
  const [d, setD] = useState<any>(null)
  const c = ROLE_COLOR[p.role] || '#16a34a'

  useEffect(() => {
    let off = false
    setD(null)
    Promise.all([
      supabase.from('monthly_fees').select('year, month, amount, status').eq('member_id', p.id),
      supabase.from('donations')
        .select('id, amount, fund_id, method, receipt_no, donated_on, created_at')
        .eq('member_id', p.id).order('created_at', { ascending: false }),
      supabase.from('funds').select('id, name'),
      supabase.from('attendance').select('present').eq('member_id', p.id),
      supabase.from('duties').select('status').eq('assigned_to', p.id),
      supabase.from('field_reports').select('id').eq('member_id', p.id).eq('status', 'verified'),
      supabase.from('blood_donors').select('blood_group, total_donations').eq('member_id', p.id).maybeSingle(),
    ]).then(([f, dn, fu, at, du, fr, bd2]: any) => {
      if (off) return
      setD({
        fees: f.data || [],
        don: dn.data || [],
        funds: fu.data || [],
        att: at.error ? null : at.data || [],
        duties: du.error ? null : du.data || [],
        reports: fr.error ? null : fr.data || [],
        blood: bd2.data || null,
      })
    })
    return () => { off = true }
  }, [p.id])

  const hero = <FlipHero p={p} c={c} onBack={onBack} own={selfId === null} />

  if (!d) {
    return (
      <div className="space-y-4">
        {hero}
        <p className="text-center text-sm text-gray-500 py-6">তথ্য লোড হচ্ছে...</p>
      </div>
    )
  }

  const joined = p.joined_at ? new Date(p.joined_at) : null
  const jy = joined ? joined.getFullYear() : 0
  const jm = joined ? joined.getMonth() + 1 : 0

  const paidCur = new Set(d.fees.filter((f: any) => f.status === 'paid' && f.year === cy).map((f: any) => f.month))
  let curDue = 0
  for (let m = 1; m <= cm; m++) {
    if (joined && (cy < jy || (cy === jy && m < jm))) continue
    if (!paidCur.has(m)) curDue++
  }

  const paidSet = new Set(d.fees.filter((f: any) => f.status === 'paid' && f.year === year).map((f: any) => f.month))
  const cells: string[] = MONTHS.map((_, i) => {
    const m = i + 1
    if (paidSet.has(m)) return 'paid'
    if (joined && (year < jy || (year === jy && m < jm))) return 'na'
    if (year > cy || (year === cy && m > cm)) return 'future'
    return 'due'
  })
  const paidCount = cells.filter(x => x === 'paid').length
  const dueCount = cells.filter(x => x === 'due').length
  const dueAmt = dueCount * Number(settings?.monthly_fee || 0)

  const total = sum(d.don)
  const years = Array.from(new Set([
    cy,
    ...d.fees.map((f: any) => f.year),
    ...d.don.map((x: any) => Number(dOf(x).slice(0, 4))),
  ])).filter(Boolean).sort((a: any, b: any) => b - a) as number[]

  const mon = MONTHS.map((_, i) =>
    sum(d.don.filter((x: any) => dOf(x).slice(0, 4) === String(year) && Number(dOf(x).slice(5, 7)) === i + 1)))
  const maxM = Math.max(1, ...mon)

  const byFund: Record<string, number> = {}
  d.don.forEach((x: any) => { byFund[x.fund_id] = (byFund[x.fund_id] || 0) + Number(x.amount) })
  const fundList = Object.entries(byFund).sort((a, b) => b[1] - a[1])
  const fundName = (id: string) => d.funds.find((f: any) => f.id === id)?.name || 'অন্যান্য'

  const kpi: [string, string, string][] = [
    [taka(total), 'মোট দান', '#5e35b1'],
    [bn(d.don.length) + ' বার', 'দানের সংখ্যা', '#1e88e5'],
    [bn(paidCount) + '/১২', bd(year) + ' সালে ফি', '#16a34a'],
    [bn(dueCount) + ' মাস', dueAmt > 0 ? 'বকেয়া ' + taka(dueAmt) : 'বকেয়া নেই', dueCount ? '#dc2626' : '#16a34a'],
  ]

  const attPct = d.att && d.att.length ? Math.round((d.att.filter((x: any) => x.present).length / d.att.length) * 100) : null
  const dutyDone = d.duties ? d.duties.filter((x: any) => x.status === 'done').length : null

  const act: [string, string][] = [
    [attPct === null ? '—' : bn(attPct) + '%', 'উপস্থিতির হার'],
    [dutyDone === null ? '—' : bn(dutyDone) + '/' + bn(d.duties.length), 'দায়িত্ব সম্পন্ন'],
    [d.reports === null ? '—' : bn(d.reports.length) + 'টি', 'যাচাইকৃত কাজ'],
    [d.blood ? d.blood.blood_group + ' · ' + bn(d.blood.total_donations || 0) + ' বার' : '—', 'রক্তদাতা'],
  ]

  const cell: Record<string, { bg: string; fg: string; t: string }> = {
    paid: { bg: '#16a34a', fg: '#fff', t: 'পেইড' },
    due: { bg: '#fee2e2', fg: '#dc2626', t: 'বাকি' },
    future: { bg: '#f1f5f9', fg: '#94a3b8', t: '·' },
    na: { bg: '#f8fafc', fg: '#cbd5e1', t: '—' },
  }

  return (
    <div className="space-y-4">
      <FlipHero p={p} c={c} onBack={onBack} due={curDue} blood={d.blood} own={selfId === null} />

      {selfId === p.id && (
        <button onClick={() => onNav('me')}
          className="w-full rounded-xl py-3 font-semibold text-white" style={{ background: c }}>
          এটা আপনার প্রোফাইল · আমার সম্পূর্ণ ড্যাশবোর্ড ও আইডি কার্ড ›
        </button>
      )}

      <div className="grid grid-cols-2 gap-3">
        {kpi.map(([v, l, col]) => (
          <div key={l} className="bg-white rounded-2xl p-3 shadow-sm" style={{ borderLeft: `4px solid ${col}` }}>
            <p className="text-lg font-bold" style={{ color: col }}>{v}</p>
            <p className="text-[11px] text-gray-500">{l}</p>
          </div>
        ))}
      </div>

      <Card title="মাসিক ফি">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">মাসিক ফি: {taka(Number(settings?.monthly_fee || 0))}</p>
          <select className="border rounded-lg px-2 py-1 text-sm bg-white" value={year}
            onChange={e => setYear(Number(e.target.value))}>
            {years.map(y => <option key={y} value={y}>{bd(y)}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {MONTHS.map((m, i) => {
            const k = cell[cells[i]]
            return (
              <div key={m} className="rounded-xl py-2 text-center"
                style={{ background: k.bg, color: k.fg, border: cells[i] === 'na' ? '1px dashed #cbd5e1' : undefined }}>
                <p className="text-[11px] opacity-90">{m}</p>
                <p className="text-xs font-bold">{k.t}</p>
              </div>
            )
          })}
        </div>
      </Card>

      <Card title={'মাসিক দান (' + bd(year) + ')'}>
        <div className="flex items-end gap-1" style={{ height: 110 }}>
          {mon.map((v, i) => (
            <div key={i} className="flex-1 h-full flex items-end">
              <div className="w-full rounded-t" style={{
                height: (v / maxM) * 100 + '%', minHeight: v > 0 ? 3 : 0,
                background: `linear-gradient(to top, ${c}, ${c}88)`,
              }} />
            </div>
          ))}
        </div>
        <div className="flex">
          {MONTHS.map(m => <span key={m} className="flex-1 text-center text-[8px] text-gray-400">{m}</span>)}
        </div>
        {mon.every(v => v === 0) && <p className="text-xs text-gray-400 text-center">এই বছরে কোনো দান নেই</p>}
      </Card>

      {fundList.length > 0 && (
        <Card title="খাত অনুযায়ী দান">
          <div className="flex h-3 rounded-full overflow-hidden">
            {fundList.map(([id, v], i) => (
              <div key={id} style={{ width: (v / total) * 100 + '%', background: PAL[i % PAL.length] }} />
            ))}
          </div>
          {fundList.map(([id, v], i) => (
            <div key={id} className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-sm" style={{ background: PAL[i % PAL.length] }} />
              <span className="flex-1">{fundName(id)}</span>
              <b>{taka(v)}</b>
            </div>
          ))}
        </Card>
      )}

      <Card title="সর্বশেষ দান">
        {d.don.length === 0 && <p className="text-sm text-gray-500">এখনও কোনো দান নেই</p>}
        {d.don.slice(0, 8).map((x: any) => (
          <div key={x.id} className="flex items-center gap-3 border-t pt-2 first:border-t-0 first:pt-0">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{fundName(x.fund_id)}</p>
              <p className="text-[11px] text-gray-400">
                {new Date(dOf(x)).toLocaleDateString('bn-BD')}{x.receipt_no ? ' · ' + x.receipt_no : ''}
              </p>
            </div>
            <b className="text-green-700">{taka(x.amount)}</b>
          </div>
        ))}
      </Card>

      <Card title="সংগঠনের কাজে অংশগ্রহণ">
        <div className="grid grid-cols-2 gap-2">
          {act.map(([v, l]) => (
            <div key={l} className="rounded-xl p-3 text-center" style={{ background: 'rgba(100,116,139,.1)' }}>
              <p className="font-bold">{v}</p>
              <p className="text-[11px] text-gray-500">{l}</p>
            </div>
          ))}
        </div>
      </Card>

      <p className="text-[11px] text-gray-400 text-center pb-2">
        ফি ও দানের তথ্য সংগঠনের স্বচ্ছতা নীতি অনুযায়ী সব সদস্য দেখতে পান। ফোন, ইমেইল ও ব্যক্তিগত তথ্য এখানে দেখানো হয় না।
      </p>
    </div>
  )
}
