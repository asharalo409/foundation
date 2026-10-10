import { useEffect, useState } from 'react'
import { fmtDT } from './time'

const input =
  'w-full border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-green-600'
const LABELS = ['দাতা', 'সদস্য', 'স্বেচ্ছাসেবক', 'উপকারভোগী', 'শুভাকাঙ্ক্ষী']
const MODS = ['admin', 'president', 'publicity']
const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n)
const bn = (n: number) => Number(n).toLocaleString('bn-BD')

const CSS = `
@keyframes w3up{from{transform:translateY(0)}to{transform:translateY(-50%)}}
@keyframes w3down{from{transform:translateY(-50%)}to{transform:translateY(0)}}
.w3-stage{position:relative;height:430px;overflow:hidden;perspective:1000px}
.w3-tilt{position:absolute;left:50%;top:50%;width:520px;height:780px;margin-left:-260px;margin-top:-390px;display:flex;gap:14px;justify-content:center;overflow:hidden;transform:rotateX(50deg) rotateZ(-22deg) scale(1.05)}
.w3-col{width:160px;flex:none;animation-timing-function:linear;animation-iteration-count:infinite;will-change:transform}
.w3-copy{display:flex;flex-direction:column;gap:14px;padding-bottom:14px}
.w3-stage:hover .w3-col,.w3-stage:active .w3-col{animation-play-state:paused}
.w3-card{background:#fff;color:#1f2937}
.dark .w3-card{background:#1b2740;color:#e5e7eb}
@media (prefers-reduced-motion:reduce){.w3-col{animation:none !important}}
`

function Ava({ src, name, size = 26 }: { src?: string; name: string; size?: number }) {
  const st: any = { width: size, height: size, fontSize: size * 0.42, flex: 'none' }
  return src ? (
    <img src={src} style={{ ...st, borderRadius: '50%', objectFit: 'cover' }} />
  ) : (
    <span style={{ ...st, borderRadius: '50%', background: '#16a34a', color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
      {(name || '?').trim().slice(0, 1)}
    </span>
  )
}

function Card({ v, photo, wide }: { v: any; photo?: string; wide?: boolean }) {
  return (
    <div className="w3-card"
      style={{ width: wide ? '100%' : 160, padding: 12, borderRadius: 14, boxShadow: '0 6px 18px rgba(0,0,0,.18)' }}>
      <div style={{ color: '#f59e0b', fontSize: 13, letterSpacing: 1 }}>{stars(v.rating)}</div>
      <p style={{
        fontSize: 12, lineHeight: 1.5, margin: '6px 0 8px',
        display: '-webkit-box', WebkitLineClamp: wide ? 8 : 5, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>“{v.body}”</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Ava src={photo} name={v.name} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {v.name}
          </div>
          <div style={{ fontSize: 10, opacity: 0.6 }}>{v.label || 'শুভাকাঙ্ক্ষী'}</div>
        </div>
      </div>
    </div>
  )
}

export function Wall({ items, photos }: { items: any[]; photos: Record<string, string> }) {
  if (items.length === 0)
    return (
      <p className="text-center text-sm py-10" style={{ color: 'rgba(255,255,255,.8)' }}>
        এখনও কোনো মতামত নেই। প্রথম মতামতটি আপনার হোক!
      </p>
    )

  if (items.length < 3)
    return (
      <div className="space-y-3 px-1">
        {items.map(v => <Card key={v.id} v={v} photo={v.member_id ? photos[v.member_id] : undefined} wide />)}
      </div>
    )

  const n = Math.max(15, Math.ceil(items.length / 3) * 3)
  const pool = Array.from({ length: n }, (_, i) => items[i % items.length])
  const cols: any[][] = [[], [], []]
  pool.forEach((v, i) => cols[i % 3].push(v))
  const per = n / 3
  const mult = [1, 1.18, 0.9]

  return (
    <div className="w3-stage">
      <style>{CSS}</style>
      <div className="w3-tilt">
        {cols.map((c, ci) => (
          <div key={ci} className="w3-col"
            style={{ animationName: ci % 2 ? 'w3down' : 'w3up', animationDuration: per * 6.5 * mult[ci] + 's' }}>
            {[0, 1].map(k => (
              <div key={k} className="w3-copy">
                {c.map((v, i) => (
                  <Card key={k + '-' + i} v={v} photo={v.member_id ? photos[v.member_id] : undefined} />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="absolute inset-x-0 top-0 h-16 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(6,40,24,.95), transparent)' }} />
      <div className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(6,40,24,.95), transparent)' }} />
    </div>
  )
}

export function VoiceModal({ supabase, member, onClose }: any) {
  const [f, setF] = useState({
    name: member?.full_name || '',
    label: member ? 'সদস্য' : 'শুভাকাঙ্ক্ষী',
    rating: 5,
    body: '',
    website: '',
  })
  const [msg, setMsg] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)
  const set = (k: string, v: any) => setF(p => ({ ...p, [k]: v }))

  async function submit() {
    setMsg('')
    if (f.website) { setDone(true); return }
    let last = 0
    try { last = Number(localStorage.getItem('voice-last') || 0) } catch {}
    if (Date.now() - last < 120000) { setMsg('একটু অপেক্ষা করে আবার চেষ্টা করুন'); return }
    const name = f.name.trim()
    const body = f.body.trim()
    if (name.length < 2) { setMsg('আপনার নাম লিখুন'); return }
    if (body.length < 10) { setMsg('মতামত কমপক্ষে ১০ অক্ষরের হতে হবে'); return }

    setBusy(true)
    const { error } = await supabase.from('testimonials').insert({
      name, label: f.label, body, rating: f.rating, member_id: member?.id || null,
    })
    setBusy(false)
    if (error) { setMsg('জমা হয়নি: ' + error.message); return }
    try { localStorage.setItem('voice-last', String(Date.now())) } catch {}
    setDone(true)
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-end sm:items-center" onClick={onClose}>
      <div className="bg-white w-full max-w-md mx-auto rounded-t-2xl sm:rounded-2xl p-5 space-y-3 max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="font-bold text-lg">✍️ আপনার মতামত লিখুন</h3>
            <p className="text-xs text-gray-500">অনুমোদনের পর দেওয়ালে সবার সামনে দেখা যাবে।</p>
          </div>
          <button className="text-xl" onClick={onClose}>✕</button>
        </div>

        {done ? (
          <div className="text-center space-y-3 py-4">
            <div className="text-5xl">💚</div>
            <p className="font-bold">ধন্যবাদ!</p>
            <p className="text-sm text-gray-600">
              আপনার মতামত জমা হয়েছে। অনুমোদন পেলে মতামত দেওয়ালে দেখা যাবে।
            </p>
            <button className="w-full border rounded-lg py-2" onClick={onClose}>বন্ধ করুন</button>
          </div>
        ) : (
          <div className="space-y-2">
            <input className={input} placeholder="আপনার নাম *" value={f.name}
              onChange={e => set('name', e.target.value)} />
            <select className={input} value={f.label} onChange={e => set('label', e.target.value)}>
              {LABELS.map(l => <option key={l}>{l}</option>)}
            </select>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => set('rating', n)} className="text-3xl leading-none"
                  style={{ color: n <= f.rating ? '#f59e0b' : '#d1d5db' }}>
                  ★
                </button>
              ))}
              <span className="text-xs text-gray-500 ml-2">{bn(f.rating)}/৫</span>
            </div>
            <textarea className={input} rows={4} maxLength={400}
              placeholder="আপনার অভিজ্ঞতা বা কথা লিখুন *" value={f.body}
              onChange={e => set('body', e.target.value)} />
            <p className="text-[10px] text-gray-400 text-right">{bn(f.body.length)}/৪০০</p>

            <input tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website}
              onChange={e => set('website', e.target.value)}
              style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />

            <button className="w-full bg-green-700 text-white font-semibold rounded-lg py-2.5 disabled:opacity-50"
              disabled={busy} onClick={submit}>
              {busy ? 'জমা হচ্ছে...' : 'মতামত জমা দিন'}
            </button>
            {msg && <p className="text-sm text-center text-red-600">{msg}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

export function VoiceSection({ supabase, color, member }: any) {
  const [items, setItems] = useState<any[]>([])
  const [photos, setPhotos] = useState<Record<string, string>>({})
  const [open, setOpen] = useState(false)
  const c = color || '#087a43'

  useEffect(() => {
    Promise.all([
      supabase.from('testimonials').select('*').eq('status', 'approved')
        .order('created_at', { ascending: false }).limit(18),
      supabase.from('public_members').select('id, photo_url'),
    ]).then(([a, b]: any) => {
      setItems(a.data || [])
      const m: Record<string, string> = {}
      ;(b.data || []).forEach((x: any) => { if (x.photo_url) m[x.id] = x.photo_url })
      setPhotos(m)
    })
  }, [])

  return (
    <section style={{ background: `linear-gradient(160deg, ${c}, #0a3d24)`, borderRadius: 28 }}
      className="text-white p-4 space-y-3 overflow-hidden">
      <div className="text-center space-y-2">
        <span className="inline-block rounded-full px-3 py-1 text-xs font-bold"
          style={{ background: 'rgba(255,255,255,.18)' }}>
          💬 দাতা ও সদস্যদের মতামত
        </span>
        <h2 className="text-2xl font-bold leading-snug">আমাদের পরিবারের কথা</h2>
      </div>
      <Wall items={items} photos={photos} />
      <div className="text-center">
        <button className="rounded-full px-6 py-2.5 font-bold shadow-lg"
          style={{ background: '#fff', color: '#166534' }} onClick={() => setOpen(true)}>
          ✍️ আপনার মতামত লিখুন
        </button>
      </div>
      {open && <VoiceModal supabase={supabase} member={member} onClose={() => setOpen(false)} />}
    </section>
  )
}

export function VoiceMod({ supabase, member }: any) {
  const [rows, setRows] = useState<any[]>([])
  const [st, setSt] = useState('pending')
  const [open, setOpen] = useState(true)
  const [msg, setMsg] = useState('')

  async function load() {
    const { data } = await supabase.from('testimonials').select('*')
      .order('created_at', { ascending: false }).limit(150)
    setRows(data || [])
  }
  useEffect(() => { load() }, [])

  const pending = rows.filter(r => r.status === 'pending').length
  const list = rows.filter(r => st === 'all' || r.status === st)

  async function decide(r: any, status: string) {
    const { error } = await supabase.from('testimonials').update({
      status, decided_by: member?.id || null, decided_at: new Date().toISOString(),
    }).eq('id', r.id)
    setMsg(error ? 'ব্যর্থ: ' + error.message : '')
    load()
  }
  async function remove(id: string) {
    if (!confirm('মুছে ফেলবেন?')) return
    await supabase.from('testimonials').delete().eq('id', id)
    load()
  }

  const SL: Record<string, [string, string]> = {
    pending: ['⏳ অপেক্ষমাণ', '#d97706'],
    approved: ['✅ প্রকাশিত', '#16a34a'],
    rejected: ['❌ প্রত্যাখ্যাত', '#dc2626'],
  }

  return (
    <div className="bg-white rounded-xl p-3 shadow-sm space-y-3 border border-amber-300">
      <button className="w-full flex justify-between items-center" onClick={() => setOpen(!open)}>
        <b className="text-sm">💬 মতামত যাচাই</b>
        <span className="flex items-center gap-2">
          {pending > 0 && <span className="bg-red-600 text-white text-xs rounded-full px-2 py-0.5">{bn(pending)}</span>}
          <span className="text-gray-400">{open ? '▲' : '▼'}</span>
        </span>
      </button>

      {open && (
        <div className="space-y-2">
          <div className="flex gap-2">
            {[['pending', 'অপেক্ষমাণ'], ['approved', 'প্রকাশিত'], ['all', 'সব']].map(([k, l]) => (
              <button key={k} onClick={() => setSt(k)}
                className={'px-3 py-1 rounded-lg text-xs font-semibold ' +
                  (st === k ? 'bg-gray-800 text-white' : 'bg-white border')}>
                {l}
              </button>
            ))}
          </div>
          {msg && <p className="text-xs text-center text-red-600">{msg}</p>}
          {list.length === 0 && <p className="text-sm text-gray-500 text-center py-3">কোনো মতামত নেই</p>}
          {list.map(r => (
            <div key={r.id} className="rounded-xl border p-3 space-y-1">
              <div className="flex justify-between gap-2">
                <p className="font-bold text-sm">{r.name} <span className="text-xs font-normal text-gray-500">· {r.label}</span></p>
                <span className="text-[11px] font-semibold" style={{ color: SL[r.status][1] }}>{SL[r.status][0]}</span>
              </div>
              <p className="text-amber-500 text-sm">{stars(r.rating)}</p>
              <p className="text-sm text-gray-700 whitespace-pre-line">{r.body}</p>
              <p className="text-[10px] text-gray-400">🕒 {fmtDT(r.created_at)}{r.member_id ? ' · সদস্য' : ''}</p>
              <div className="flex gap-2 pt-1">
                {r.status !== 'approved' && (
                  <button className="bg-green-700 text-white text-xs font-semibold rounded-lg px-3 py-1.5"
                    onClick={() => decide(r, 'approved')}>✓ প্রকাশ করুন</button>
                )}
                {r.status === 'pending' && (
                  <button className="border border-red-300 text-red-600 text-xs rounded-lg px-3 py-1.5"
                    onClick={() => decide(r, 'rejected')}>প্রত্যাখ্যান</button>
                )}
                {r.status === 'approved' && (
                  <button className="border text-xs rounded-lg px-3 py-1.5" onClick={() => decide(r, 'rejected')}>
                    লুকান
                  </button>
                )}
                <button className="text-xs underline text-red-600" onClick={() => remove(r.id)}>মুছুন</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function VoicesPage({ supabase, member, color }: any) {
  const mod = !!member && MODS.includes(member.role)
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-green-700">💬 দাতা ও সদস্যদের মতামত</p>
        <h2 className="text-xl font-bold">মতামত দেওয়াল</h2>
      </div>
      {mod && <VoiceMod supabase={supabase} member={member} />}
      <VoiceSection supabase={supabase} color={color} member={member} />
    </div>
  )
}
