import { useEffect, useRef, useState } from 'react'
import { ROLES } from './Dashboard'

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

// ইসলামিক জ্যামিতিক নকশা (৮ কোণা তারা), কার্ডের ব্যাকগ্রাউন্ডে খুব হালকা করে বসে
const PATTERN = (() => {
  const svg =
    "<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'>" +
    "<g fill='none' stroke='white' stroke-opacity='.12' stroke-width='1'>" +
    "<rect x='10' y='10' width='28' height='28'/>" +
    "<rect x='10' y='10' width='28' height='28' transform='rotate(45 24 24)'/>" +
    "<circle cx='24' cy='24' r='3'/></g></svg>"
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
})()

// আইডি কার্ড: ছুঁলে (বা Enter/Space চাপলে) ৩ডি ফ্লিপ হয়ে পেছনের তথ্য দেখায়।
// আঙুল/মাউস সরালে কার্ড সামান্য হেলে যায় ও হলোগ্রামের মতো আলো খেলে।
// ছবির রিং: ফি হালনাগাদ থাকলে সবুজ, বকেয়া থাকলে লাল। রক্তদাতা তালিকায় থাকলে রক্তের গ্রুপের ব্যাজ।
// ব্যক্তিগত তথ্য (ফোন, ইমেইল ইত্যাদি) শুধু তখনই দেখায় যখন সেই তথ্য p-তে আছে,
// অর্থাৎ নিজের প্রোফাইল। অন্যের কার্ডে public_members ভিউ থেকে শুধু প্রকাশযোগ্য তথ্য আসে।
function FlipHero({ p, c, onBack, due = null, blood = null }: {
  p: any; c: string; onBack: () => void; due?: number | null; blood?: any
}) {
  const [flip, setFlip] = useState(false)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, x: 50, y: 30, on: false })
  const box = useRef<HTMLDivElement>(null)
  const start = useRef<{ x: number; y: number } | null>(null)
  const moved = useRef(false)
  const reduce = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

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

  const bg = `linear-gradient(135deg, ${c}, #0b1d2e)`
  const face: any = {
    gridArea: '1 / 1', borderRadius: 28, color: '#fff', position: 'relative',
    backgroundImage: `${PATTERN}, ${bg}`, backgroundSize: '48px 48px, 100% 100%',
    backgroundRepeat: 'repeat, no-repeat',
    overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center',
    backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
  }
  // হলোগ্রাম আলো: পেছনের পিঠ আয়নার মতো উল্টো, তাই x উল্টে নিই
  const shine = (mirror: boolean): any => {
    const x = mirror ? 100 - tilt.x : tilt.x
    return {
      position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 28,
      opacity: tilt.on && !reduce ? 1 : 0, transition: 'opacity .4s',
      backgroundImage:
        `radial-gradient(circle at ${x}% ${tilt.y}%, rgba(255,255,255,.28), rgba(255,255,255,0) 55%), ` +
        'linear-gradient(115deg, rgba(255,255,255,0) 35%, rgba(255,214,140,.16) 46%, rgba(150,220,255,.16) 54%, rgba(255,255,255,0) 65%)',
      backgroundSize: '100% 100%, 260% 100%',
      backgroundPosition: `0 0, ${x}% 0`,
    }
  }

  const pill = { background: 'rgba(255,255,255,.18)' }
  const feeColor = due === null ? 'rgba(255,255,255,.85)' : due === 0 ? '#4ade80' : '#f87171'
  const hasPrivate = 'phone' in p
  const joinedFull = p.joined_at
    ? new Date(p.joined_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''
  const phone = p.phone ? bd(p.phone) : ''
  const wa = p.whatsapp ? bd(p.whatsapp) : ''
  const hint: any = { position: 'absolute', bottom: 8, right: 16, fontSize: 10, opacity: 0.7 }

  return (
    <div ref={box} style={{ perspective: 1200, touchAction: 'pan-y' }}
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onEnd}
      onPointerLeave={onEnd} onPointerCancel={onEnd}>
      <div style={{
        transformStyle: 'preserve-3d',
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
          <div style={{ ...face, padding: 20, pointerEvents: flip ? 'none' : 'auto' }}>
            <span style={{ position: 'absolute', top: -40, right: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,.1)' }} />
            <span style={{ position: 'absolute', bottom: -50, left: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,.07)' }} />
            {p.joined_at && (
              <div aria-hidden="true" style={{
                position: 'absolute', top: 10, right: 14, width: 48, height: 48, borderRadius: '50%',
                border: '1.5px solid rgba(255,255,255,.55)', outline: '1px dashed rgba(255,255,255,.35)', outlineOffset: 3,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                transform: 'rotate(-12deg)', fontSize: 9, lineHeight: 1.15, textAlign: 'center',
                color: 'rgba(255,255,255,.85)', pointerEvents: 'none',
              }}>
                <span>সদস্য</span>
                <b style={{ fontSize: 12 }}>{bd(new Date(p.joined_at).getFullYear())}</b>
              </div>
            )}
            <div className="relative space-y-4">
              <button onClick={e => { e.stopPropagation(); onBack() }}
                className="text-sm font-semibold opacity-90">‹ সদস্য মণ্ডলী</button>
              <div className="flex items-center gap-4">
                <div style={{
                  position: 'relative', flex: 'none', borderRadius: '50%',
                  boxShadow: due === null ? undefined : `0 0 0 5px ${feeColor}33`,
                }}>
                  <Photo p={p} size={84} ring={feeColor} />
                  {blood?.blood_group && (
                    <span style={{
                      position: 'absolute', right: -8, bottom: -2, background: '#fff', color: '#be123c',
                      borderRadius: 999, padding: '1px 7px', fontSize: 11, fontWeight: 700,
                      boxShadow: '0 1px 4px rgba(0,0,0,.35)',
                    }}>🩸 {blood.blood_group}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-bold leading-tight">{p.full_name}</h2>
                  <span className="inline-block rounded-full px-3 py-0.5 text-xs font-bold my-1" style={pill}>
                    {ROLES[p.role] || p.role}
                  </span>
                  <p className="text-xs opacity-85">আইডি: {p.member_code}{p.district ? ' · ' + p.district : ''}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-full px-3 py-1" style={pill}>
                  {p.is_active === false ? 'নিষ্ক্রিয়' : '● সক্রিয় সদস্য'}
                </span>
                {due !== null && (
                  <span className="rounded-full px-3 py-1 font-semibold"
                    style={{ background: due === 0 ? 'rgba(74,222,128,.25)' : 'rgba(248,113,113,.3)' }}>
                    {due === 0 ? '✓ ফি হালনাগাদ' : 'বকেয়া ' + bn(due) + ' মাস'}
                  </span>
                )}
              </div>
            </div>
            <p style={hint}>↻ ছুঁয়ে উল্টান</p>
            <div style={shine(false)} />
          </div>

          {/* পেছনের পাশ */}
          <div style={{ ...face, padding: '16px 18px 22px', transform: 'rotateY(180deg)', pointerEvents: flip ? 'auto' : 'none' }}>
            <span style={{ position: 'absolute', top: -50, left: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,.1)' }} />
            <span style={{ position: 'absolute', bottom: -50, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,.07)' }} />
            <div className="relative">
              <div className="flex items-center justify-between gap-3 pb-2 mb-2"
                style={{ borderBottom: '1px solid rgba(255,255,255,.16)' }}>
                <div className="min-w-0">
                  <p className="text-[10px] opacity-70 leading-tight">সদস্য পরিচয়পত্র</p>
                  <p className="font-bold leading-tight truncate">{p.full_name}</p>
                </div>
                <span className="rounded-full px-3 py-0.5 text-xs font-bold shrink-0" style={pill}>{p.member_code}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <BackItem k="পদবী" v={ROLES[p.role] || p.role} />
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
            <p style={hint}>↻ আবার ছুঁয়ে সামনে ফিরুন</p>
            <div style={shine(true)} />
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

  const hero = <FlipHero p={p} c={c} onBack={onBack} />

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

  // কার্ডের রিংয়ের জন্য: চলতি বছরে এ পর্যন্ত কত মাসের ফি বকেয়া
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
    paid: { bg: '#16a34a', fg: '#fff', t: '✓' },
    due: { bg: '#fee2e2', fg: '#dc2626', t: 'বাকি' },
    future: { bg: '#f1f5f9', fg: '#94a3b8', t: '·' },
    na: { bg: '#f8fafc', fg: '#cbd5e1', t: '—' },
  }

  return (
    <div className="space-y-4">
      <FlipHero p={p} c={c} onBack={onBack} due={curDue} blood={d.blood} />

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
