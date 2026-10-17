import { useEffect, useMemo, useRef, useState } from 'react'
import { ICONS } from './Icons'
import { roleLabel } from './roles'
import MemberView, { ROLE_COLOR, Photo } from './MemberView'

// মেনু ও সাইড মেনুর জন্য "members" আইকন নিবন্ধন
ICONS.members = (
  <>
    <circle cx="12" cy="12" r="3" fill="currentColor" style={{ fillOpacity: 'var(--tint, .16)' }} />
    <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-25 12 12)" />
    <circle cx="19" cy="8" r="1.4" fill="currentColor" />
    <circle cx="5" cy="16" r="1.4" fill="currentColor" />
  </>
)

const ORDER = ['admin', 'president', 'general_secretary', 'cashier', 'health', 'sports', 'publicity', 'member']
const RING_MAX = 16
const taka = (n: number) => '৳' + Math.round(n || 0).toLocaleString('bn-BD')
const bn = (n: number) => Number(n || 0).toLocaleString('bn-BD')

function IdCard({ p, paid, w }: { p: any; paid: boolean; w: number | string }) {
  const c = ROLE_COLOR[p.role] || '#16a34a'
  return (
    <div data-mid={p.id}
      style={{
        width: w, borderRadius: 16, overflow: 'hidden', background: '#fff', color: '#111827',
        boxShadow: '0 10px 26px rgba(0,0,0,.25)', border: `2px solid ${c}`, textAlign: 'center',
      }}>
      <div style={{ height: 46, background: `linear-gradient(135deg, ${c}, ${c}99)` }} />
      <div style={{ marginTop: -30, display: 'flex', justifyContent: 'center' }}>
        <Photo p={p} size={60} ring="#fff" bg={c} />
      </div>
      <div style={{ padding: '6px 8px 10px' }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {p.full_name}
        </div>
        <span style={{
          display: 'inline-block', margin: '3px 0', padding: '1px 8px', borderRadius: 99,
          fontSize: 10, fontWeight: 700, background: c + '22', color: c,
        }}>
          {roleLabel(p.role)}
        </span>
        <div style={{ fontSize: 10, color: '#6b7280', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: paid ? '#16a34a' : '#f59e0b' }} />
          {p.member_code}
        </div>
      </div>
    </div>
  )
}

function Ring({ people, paid, onOpen }: { people: any[]; paid: Set<string>; onOpen: (id: string) => void }) {
  const n = people.length
  const W = 132
  const H = 176
  const R = n < 2 ? 0 : Math.max(170, Math.round((n * (W + 20)) / (2 * Math.PI)))
  const step = n ? 360 / n : 0
  const ringEl = useRef<HTMLDivElement>(null)
  const st = useRef({ a: 0, v: 0.018, drag: false, lastX: 0, moved: 0 })

  useEffect(() => {
    const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    let raf = 0
    let last = performance.now()
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min(48, t - last)
      last = t
      const s = st.current
      if (!s.drag) {
        const auto = reduce || n < 2 ? 0 : 0.018
        s.v += (auto - s.v) * 0.04
        s.a += s.v * dt
      }
      if (ringEl.current) ringEl.current.style.transform = `translateZ(${-R}px) rotateY(${s.a}deg)`
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [n, R])

  if (n === 0) return <p className="text-center text-sm text-gray-500 py-10">কোনো সদস্য পাওয়া যায়নি</p>

  return (
    <div
      style={{ perspective: 900, height: 300, overflow: 'hidden', position: 'relative', touchAction: 'pan-y', userSelect: 'none' }}
      onPointerDown={e => {
        const s = st.current
        s.drag = true
        s.lastX = e.clientX
        s.moved = 0
        s.v = 0
      }}
      onPointerMove={e => {
        const s = st.current
        if (!s.drag) return
        const dx = e.clientX - s.lastX
        s.lastX = e.clientX
        s.moved += Math.abs(dx)
        s.a += dx * 0.35
        s.v = Math.max(-0.4, Math.min(0.4, (dx * 0.35) / 16))
      }}
      onPointerUp={e => {
        const s = st.current
        s.drag = false
        if (s.moved < 8) {
          const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
          const card = el ? (el.closest('[data-mid]') as HTMLElement | null) : null
          if (card && card.dataset.mid) onOpen(card.dataset.mid)
        }
      }}
      onPointerCancel={() => { st.current.drag = false }}
      onPointerLeave={() => { st.current.drag = false }}
    >
      <div ref={ringEl}
        style={{ position: 'absolute', left: '50%', top: '50%', width: 0, height: 0, transformStyle: 'preserve-3d' }}>
        {people.map((p, i) => (
          <div key={p.id}
            style={{
              position: 'absolute', left: 0, top: 0, width: W, marginLeft: -W / 2, marginTop: -H / 2,
              transform: `rotateY(${i * step}deg) translateZ(${R}px)`,
              backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            }}>
            <IdCard p={p} paid={paid.has(p.id)} w={W} />
          </div>
        ))}
      </div>
    </div>
  )
}

function Rise({ people, paid, onOpen }: { people: any[]; paid: Set<string>; onOpen: (id: string) => void }) {
  if (people.length === 0) return <p className="text-center text-sm text-gray-500 py-10">কোনো সদস্য পাওয়া যায়নি</p>

  const cols: any[][] = [0, 1, 2].map(c => {
    const mine = people.filter((_, i) => i % 3 === c)
    let out = [...mine]
    while (mine.length && out.length < 6) out = out.concat(mine)
    return out
  })

  return (
    <div className="ob-stage"
      style={{
        height: 440, overflow: 'hidden', display: 'flex', gap: 12, justifyContent: 'center',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, #000 12%, #000 88%, transparent)',
        maskImage: 'linear-gradient(to bottom, transparent, #000 12%, #000 88%, transparent)',
      }}>
      <style>{`
        @keyframes ob-up{from{transform:translateY(0)}to{transform:translateY(-50%)}}
        @keyframes ob-down{from{transform:translateY(-50%)}to{transform:translateY(0)}}
        .ob-col{animation-timing-function:linear;animation-iteration-count:infinite;will-change:transform}
        .ob-copy{display:flex;flex-direction:column;gap:14px;padding-bottom:14px}
        .ob-stage:hover .ob-col,.ob-stage:active .ob-col{animation-play-state:paused}
        @media (prefers-reduced-motion:reduce){.ob-col{animation:none !important}}
      `}</style>
      {cols.map((list, ci) => list.length > 0 && (
        <div key={ci} className="ob-col"
          style={{
            width: '31%',
            animationName: ci === 1 ? 'ob-down' : 'ob-up',
            animationDuration: list.length * 5 + 's',
          }}>
          {[0, 1].map(k => (
            <div key={k} className="ob-copy">
              {list.map((p, i) => (
                <div key={k + '-' + i} onClick={() => onOpen(p.id)} style={{ cursor: 'pointer' }}>
                  <IdCard p={p} paid={paid.has(p.id)} w="100%" />
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default function Members({ supabase, settings, member, onNav }: any) {
  const accent = settings?.theme_color || '#087a43'
  const [people, setPeople] = useState<any[] | null>(null)
  const [paid, setPaid] = useState<Set<string>>(new Set())
  const [totals, setTotals] = useState<Record<string, number>>({})
  const [mode, setMode] = useState<'ring' | 'rise' | 'grid'>('ring')
  const [sel, setSel] = useState<any>(null)
  const [q, setQ] = useState('')
  const [rf, setRf] = useState('all')
  const [grp, setGrp] = useState(0)

  useEffect(() => {
    const d = new Date()
    Promise.all([
      supabase.from('public_members')
        .select('id, full_name, photo_url, role, member_code, district, is_active, joined_at'),
      supabase.from('monthly_fees').select('member_id')
        .eq('year', d.getFullYear()).eq('month', d.getMonth() + 1).eq('status', 'paid'),
      supabase.from('donations').select('member_id, amount').not('member_id', 'is', null),
    ]).then(([a, b, c]: any) => {
      const list = (a.data || [])
        .filter((x: any) => x.is_active !== false)
        .sort((x: any, y: any) => {
          const dx = ORDER.indexOf(x.role) - ORDER.indexOf(y.role)
          return dx !== 0 ? dx : String(x.member_code).localeCompare(String(y.member_code))
        })
      setPeople(list)
      try {
        const want = sessionStorage.getItem('open-member')
        if (want) {
          sessionStorage.removeItem('open-member')
          const hit = list.find((x: any) => x.id === want)
          if (hit) setSel(hit)
        }
      } catch {}
      setPaid(new Set((b.data || []).map((x: any) => x.member_id)))
      const t: Record<string, number> = {}
      ;(c.data || []).forEach((x: any) => { t[x.member_id] = (t[x.member_id] || 0) + Number(x.amount) })
      setTotals(t)
    })
  }, [])

  const all = people || []

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    return all.filter(p =>
      (rf === 'all' || p.role === rf) &&
      (!t || [p.full_name, p.member_code, p.district].join(' ').toLowerCase().includes(t)))
  }, [people, q, rf])

  function open(id: string) {
    const p = all.find(x => x.id === id)
    if (p) {
      setSel(p)
      window.scrollTo(0, 0)
    }
  }

  if (sel) {
    return (
      <MemberView supabase={supabase} settings={settings} p={sel} selfId={member?.id}
        onBack={() => { setSel(null); window.scrollTo(0, 0) }} onNav={onNav} />
    )
  }

  if (people === null) return <p className="text-center text-sm text-gray-500 py-10">লোড হচ্ছে...</p>

  const groups = Math.max(1, Math.ceil(all.length / RING_MAX))
  const g = Math.min(grp, groups - 1)
  const ringPeople = all.slice(g * RING_MAX, (g + 1) * RING_MAX)
  const roleChips: [string, string][] = [['all', 'সবাই'], ...ORDER.filter(r => all.some(p => p.role === r)).map(r => [r, roleLabel(r)] as [string, string])]

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold" style={{ color: accent }}>সবার আইডি কার্ড · ছুঁলে তার ড্যাশবোর্ড</p>
        <h2 className="text-xl font-bold">সদস্য মণ্ডলী</h2>
        <p className="text-xs text-gray-500">
          মোট সদস্য {bn(all.length)} জন · এ মাসের ফি দিয়েছেন {bn(all.filter(p => paid.has(p.id)).length)} জন
        </p>
      </div>

      <div className="flex gap-2">
        {([['ring', 'ঘূর্ণি'], ['rise', 'ভাসমান'], ['grid', 'তালিকা']] as [string, string][]).map(([k, l]) => (
          <button key={k} onClick={() => setMode(k as any)}
            className={'flex-1 py-2 rounded-lg text-sm font-semibold ' + (mode === k ? 'text-white' : 'bg-white border')}
            style={mode === k ? { background: accent } : undefined}>
            {l}
          </button>
        ))}
      </div>

      {mode === 'ring' && (
        <div className="space-y-2">
          <Ring key={g} people={ringPeople} paid={paid} onOpen={open} />
          <p className="text-[11px] text-gray-500 text-center">আঙুল দিয়ে টেনে ঘোরান · কার্ডে ট্যাপ করুন</p>
          {groups > 1 && (
            <div className="flex items-center justify-between gap-2">
              <button disabled={g <= 0} className="flex-1 border rounded-lg py-2 text-sm font-semibold disabled:opacity-40 bg-white"
                onClick={() => setGrp(g - 1)}>‹ আগের দল</button>
              <span className="text-xs text-gray-500 whitespace-nowrap">দল {bn(g + 1)} / {bn(groups)}</span>
              <button disabled={g >= groups - 1} className="flex-1 border rounded-lg py-2 text-sm font-semibold disabled:opacity-40 bg-white"
                onClick={() => setGrp(g + 1)}>পরের দল ›</button>
            </div>
          )}
        </div>
      )}

      {mode === 'rise' && (
        <div className="space-y-2">
          <Rise people={all} paid={paid} onOpen={open} />
          <p className="text-[11px] text-gray-500 text-center">কার্ডে ট্যাপ করুন · ধরে রাখলে থামবে</p>
        </div>
      )}

      {mode === 'grid' && (
        <div className="space-y-3">
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-green-600"
            placeholder="নাম, আইডি বা জেলা খুঁজুন..." value={q} onChange={e => setQ(e.target.value)} />
          <div className="flex gap-2 overflow-x-auto pb-1">
            {roleChips.map(([k, l]) => (
              <button key={k} onClick={() => setRf(k)}
                className={'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ' + (rf === k ? 'text-white' : 'bg-white border')}
                style={rf === k ? { background: accent } : undefined}>
                {l}
              </button>
            ))}
          </div>
          {filtered.length === 0 && <p className="text-center text-sm text-gray-500 py-6">কোনো সদস্য পাওয়া যায়নি</p>}
          {filtered.map(p => {
            const c = ROLE_COLOR[p.role] || '#16a34a'
            return (
              <button key={p.id} onClick={() => open(p.id)}
                className="w-full bg-white rounded-2xl shadow-sm p-3 flex items-center gap-3 text-left"
                style={{ borderLeft: `4px solid ${c}` }}>
                <Photo p={p} size={52} ring={c} bg={c} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{p.full_name}</p>
                  <p className="text-[11px] text-gray-500 truncate">
                    <span style={{ color: c }} className="font-semibold">{roleLabel(p.role)}</span>
                    {' · '}{p.member_code}{p.district ? ' · ' + p.district : ''}
                  </p>
                  <p className="text-[11px] mt-0.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: paid.has(p.id) ? '#16a34a' : '#f59e0b' }} />
                    {paid.has(p.id) ? 'এ মাসের ফি দিয়েছেন' : 'এ মাসের ফি বাকি'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold" style={{ color: accent }}>{taka(totals[p.id] || 0)}</p>
                  <p className="text-[10px] text-gray-400">মোট দান</p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
