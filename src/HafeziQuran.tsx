import { useEffect, useRef, useState } from 'react'
import { IIco } from './IslamIcons'
import { bnDigits } from './prayer'
import { SURAHS, surahAt } from './hafeziIndex'

// হাফেজি কুরআন: পেজের ছবি public/hafezi/ ফোল্ডারে থাকে। একবার "ফোনে সেভ করুন" চাপলে সব পেজ
// ফোনের IndexedDB-তে জমা হয় এবং ইন্টারনেট ছাড়াই চলে। Supabase লাগে না।

// bases: পেজের ছবি যেসব ঠিকানা থেকে আনা হবে (একটা কাজ না করলে পরেরটা)। না দিলে ./hafezi/ ফোল্ডার।
// small: ডাউনলোডের সময় ছবি ছোট করে সেভ হবে (ফোনে জায়গা কম লাগে)
type Meta = { title?: string; pages: number; ext?: string; juz?: number[]; bases?: string[]; pad?: boolean; small?: boolean }

const BASE = './hafezi/'
const bn = (n: number) => bnDigits(String(n))
const pad = (n: number) => String(n).padStart(3, '0')

function open(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open('hafezi-quran', 1)
    r.onupgradeneeded = () => {
      r.result.createObjectStore('p')
      r.result.createObjectStore('m')
    }
    r.onsuccess = () => res(r.result)
    r.onerror = () => rej(r.error)
  })
}
async function run<T>(store: string, mode: IDBTransactionMode, f: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  const d = await open()
  return new Promise((res, rej) => {
    const q = f(d.transaction(store, mode).objectStore(store))
    q.onsuccess = () => res(q.result as T)
    q.onerror = () => rej(q.error)
  })
}
const idbGet = <T,>(s: string, k: any) => run<T>(s, 'readonly', st => st.get(k))
const idbPut = (s: string, k: any, v: any) => run<any>(s, 'readwrite', st => st.put(v, k))
const idbKeys = () => run<number[]>('p', 'readonly', st => st.getAllKeys() as IDBRequest)
const idbClear = (s: string) => run<any>(s, 'readwrite', st => st.clear())

async function loadMeta(): Promise<Meta | null> {
  try {
    const r = await fetch(BASE + 'meta.json', { cache: 'no-cache' })
    if (r.ok) {
      const m = await r.json()
      if (m && m.pages > 0) {
        idbPut('m', 'meta', m).catch(() => {})
        return m
      }
    }
  } catch {}
  try {
    const m = await idbGet<Meta>('m', 'meta')
    if (m && m.pages > 0) return m
  } catch {}
  return null
}

async function shrink(b: Blob): Promise<Blob> {
  try {
    const bm = await createImageBitmap(b)
    const w = Math.min(720, bm.width)
    const c = document.createElement('canvas')
    c.width = w
    c.height = Math.round((bm.height * w) / bm.width)
    c.getContext('2d')!.drawImage(bm, 0, 0, c.width, c.height)
    const o: Blob | null = await new Promise(r => c.toBlob(r, 'image/webp', 0.55))
    return o && o.size < b.size ? o : b
  } catch { return b }
}

const rd = (k: string, d: string) => { try { return localStorage.getItem(k) || d } catch { return d } }
const wr = (k: string, v: string) => { try { localStorage.setItem(k, v) } catch {} }

const Star = ({ n, c, size = 46 }: { n: number; c: string; size?: number }) => (
  <span className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
    <svg viewBox="0 0 48 48" width={size} height={size} className="absolute inset-0" aria-hidden="true">
      <rect x="10" y="10" width="28" height="28" rx="4" fill={c + '14'} stroke={c} strokeWidth="1.4" />
      <rect x="10" y="10" width="28" height="28" rx="4" fill={c + '14'} stroke={c} strokeWidth="1.4"
        transform="rotate(45 24 24)" />
    </svg>
    <span className="relative text-[13px] font-bold" style={{ color: c }}>{bn(n)}</span>
  </span>
)

const Arrow = ({ dir }: { dir: 'l' | 'r' }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {dir === 'l' ? <path d="m15 6-6 6 6 6" /> : <path d="m9 6 6 6-6 6" />}
  </svg>
)

export default function HafeziQuran({ accent, onExit }: { accent: string; onExit: () => void }) {
  const [meta, setMeta] = useState<Meta | null | undefined>(undefined)
  const [saved, setSaved] = useState(0)
  const [view, setView] = useState<'home' | 'read'>('home')
  const [page, setPage] = useState(() => Math.max(1, Number(rd('hafezi-page', '1')) || 1))
  const [src, setSrc] = useState('')
  const [bad, setBad] = useState(false)
  const [night, setNight] = useState(rd('hafezi-night', '0') === '1')
  const [zoom, setZoom] = useState(false)
  const [prog, setProg] = useState<{ done: number; total: number } | null>(null)
  const [msg, setMsg] = useState('')
  const [jump, setJump] = useState('')
  const [tab, setTab] = useState<'surah' | 'para'>('surah')
  const [q, setQ] = useState('')
  const stop = useRef(false)
  const touch = useRef<[number, number] | null>(null)
  const urlRef = useRef('')

  const total = meta?.pages || 0
  const ext = meta?.ext || 'webp'
  const urlsOf = (n: number) =>
    (meta?.bases && meta.bases.length ? meta.bases : [BASE]).map(
      b => b + (meta?.pad === false ? String(n) : pad(n)) + '.' + ext)

  // একটা পেজ আনে: প্রথম ঠিকানা না চললে পরেরটা
  async function fetchPage(n: number): Promise<Blob> {
    let last: any
    for (const u of urlsOf(n)) {
      try {
        const r = await fetch(u)
        if (r.ok) {
          const bl = await r.blob()
          if (bl.type.startsWith('image/') && bl.size > 500) return bl
        }
      } catch (e) { last = e }
    }
    throw last || new Error('x')
  }
  const full = total > 0 && saved >= total

  async function refresh() {
    try { setSaved((await idbKeys()).length) } catch {}
  }

  useEffect(() => {
    loadMeta().then(m => setMeta(m))
    refresh()
  }, [])

  // বর্তমান পেজের ছবি: আগে ফোনে সেভ করা কপি, না থাকলে নেটওয়ার্ক
  useEffect(() => {
    if (view !== 'read' || !total) return
    let alive = true
    setBad(false)
    ;(async () => {
      let next = ''
      try {
        let b = await idbGet<Blob>('p', page)
        if (!b) b = await fetchPage(page)
        next = URL.createObjectURL(b)
      } catch {}
      if (!alive) { if (next) URL.revokeObjectURL(next); return }
      if (!next) { setBad(true); return }
      if (urlRef.current.startsWith('blob:')) URL.revokeObjectURL(urlRef.current)
      urlRef.current = next
      setSrc(next)
    })()
    wr('hafezi-page', String(page))
    return () => { alive = false }
  }, [view, page, total, saved])

  useEffect(() => () => { if (urlRef.current.startsWith('blob:')) URL.revokeObjectURL(urlRef.current) }, [])

  async function download() {
    if (!meta) return
    stop.current = false
    setMsg('')
    try { await (navigator as any).storage?.persist?.() } catch {}
    let have = new Set<number>()
    try { have = new Set(await idbKeys()) } catch {}
    const todo: number[] = []
    for (let n = 1; n <= meta.pages; n++) if (!have.has(n)) todo.push(n)
    let done = have.size
    let fail = 0
    setProg({ done, total: meta.pages })
    let idx = 0
    async function worker() {
      while (!stop.current) {
        const n = todo[idx++]
        if (n === undefined) return
        try {
          let b = await fetchPage(n)
          if (meta!.small) b = await shrink(b)
          await idbPut('p', n, b)
          done++
          setProg({ done, total: meta!.pages })
        } catch { fail++ }
      }
    }
    await Promise.all([worker(), worker(), worker()])
    setProg(null)
    await refresh()
    if (stop.current) setMsg('ডাউনলোড থামানো হয়েছে। আবার চাপলে বাকিটা থেকে শুরু হবে।')
    else if (fail) setMsg(bn(fail) + 'টা পেজ আনা যায়নি। ইন্টারনেট দেখে আবার চাপুন, বাকিগুলো আসবে।')
    else setMsg('সব পেজ ফোনে সেভ হয়েছে। এখন থেকে ইন্টারনেট ছাড়াই পড়তে পারবেন।')
  }

  async function wipe() {
    if (!confirm('ফোনে সেভ করা সব পেজ মুছে ফেলবেন?')) return
    try { await idbClear('p') } catch {}
    await refresh()
    setMsg('সেভ করা পেজ মুছে ফেলা হয়েছে।')
  }

  const go = (n: number) => {
    if (!total) return
    setPage(Math.min(total, Math.max(1, n)))
    setZoom(false)
  }
  const juzOf = (n: number) => {
    const j = meta?.juz
    if (!j || !j.length) return 0
    let r = 0
    j.forEach((s, i) => { if (n >= s) r = i + 1 })
    return r
  }

  function onTouchEnd(e: React.TouchEvent) {
    const s = touch.current
    touch.current = null
    if (!s || zoom) return
    const dx = e.changedTouches[0].clientX - s[0]
    const dy = e.changedTouches[0].clientY - s[1]
    if (Math.abs(dx) < 60 || Math.abs(dy) > 50) return
    // ডান থেকে বামে লেখা বই: ডানে টানলে পরের পেজ
    go(dx > 0 ? page + 1 : page - 1)
  }

  const card = 'bg-white rounded-2xl p-4 shadow-sm'

  if (meta === undefined) return <p className="text-center text-gray-400 py-10">লোড হচ্ছে...</p>

  const back = (
    <button onClick={onExit} className="flex items-center gap-1 text-sm font-semibold" style={{ color: accent }}>
      <IIco name="chev-left" size={18} /> ইসলামিক কর্নার
    </button>
  )

  if (!meta) {
    return (
      <div className="space-y-4">
        {back}
        <div className={card + ' space-y-2'}>
          <h2 className="text-xl font-bold">হাফেজি কুরআন</h2>
          <p className="text-sm text-gray-600">
            হাফেজি কুরআনের পেজ এখনো যোগ করা হয়নি। ইন্টারনেট থাকলে একটু পরে আবার চেষ্টা করুন।
          </p>
        </div>
      </div>
    )
  }

  if (view === 'read') {
    const j = juzOf(page)
    return (
      <div className="fixed inset-0 z-40 flex flex-col" style={{ background: night ? '#0b1220' : '#f8f5ec' }}>
        <div className="flex items-center gap-2 px-3 py-2 border-b"
          style={{ background: night ? '#111a2e' : '#fff', color: night ? '#e5e7eb' : '#111827',
            borderColor: night ? 'rgba(255,255,255,.1)' : '#e5e7eb' }}>
          <button onClick={() => setView('home')} className="w-9 h-9 rounded-full border flex items-center justify-center shrink-0"
            style={{ borderColor: 'currentColor', opacity: 0.8 }} aria-label="ফিরে যান">
            <IIco name="chev-left" size={18} />
          </button>
          <p className="flex-1 min-w-0 text-sm font-bold truncate">
            {surahAt(page).name} · {j ? 'পারা ' + bn(j) + ' · ' : ''}পৃষ্ঠা {bn(page)}
          </p>
          <button onClick={() => setZoom(z => !z)} className="px-2.5 h-9 rounded-full border text-xs font-semibold"
            style={{ borderColor: 'currentColor', opacity: 0.85 }}>{zoom ? 'ছোট' : 'বড়'}</button>
          <button onClick={() => { const v = !night; setNight(v); wr('hafezi-night', v ? '1' : '0') }}
            className="px-2.5 h-9 rounded-full border text-xs font-semibold"
            style={{ borderColor: 'currentColor', opacity: 0.85 }}>{night ? 'দিন' : 'রাত'}</button>
        </div>

        <div className="flex-1 overflow-auto" onTouchStart={e => { touch.current = [e.touches[0].clientX, e.touches[0].clientY] }}
          onTouchEnd={onTouchEnd}>
          <div className="min-h-full flex items-start justify-center p-2" style={{ width: zoom ? '170%' : '100%' }}>
            {bad ? (
              <p className="text-center text-sm py-16 px-6" style={{ color: night ? '#9ca3af' : '#6b7280' }}>
                এই পেজটি আনা যায়নি। ইন্টারনেট ছাড়া পড়তে হলে আগে হোম পেজ থেকে "ফোনে সেভ করুন" চাপুন।
              </p>
            ) : src && (
              <img src={src} alt={'পৃষ্ঠা ' + page} onError={() => setBad(true)}
                className="w-full h-auto select-none rounded-md shadow"
                draggable={false}
                style={{ filter: night ? 'invert(1) hue-rotate(180deg) brightness(.92)' : undefined }} />
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 border-t"
          style={{ background: night ? '#111a2e' : '#fff', borderColor: night ? 'rgba(255,255,255,.1)' : '#e5e7eb',
            color: night ? '#e5e7eb' : '#111827' }}>
          <button onClick={() => go(page - 1)} disabled={page <= 1}
            className="flex-1 h-10 rounded-xl border text-sm font-semibold flex items-center justify-center gap-1 disabled:opacity-30"
            style={{ borderColor: 'currentColor' }}>
            <Arrow dir="r" /> আগের
          </button>
          <form className="flex items-center gap-1" onSubmit={e => { e.preventDefault(); const n = Number(jump); if (n) go(n); setJump('') }}>
            <input inputMode="numeric" value={jump} onChange={e => setJump(e.target.value.replace(/\D/g, ''))}
              placeholder="পৃষ্ঠা" className="w-16 h-10 rounded-xl border text-center text-sm bg-transparent outline-none"
              style={{ borderColor: 'currentColor' }} />
            <button className="h-10 px-3 rounded-xl text-sm font-semibold text-white" style={{ background: accent }}>যান</button>
          </form>
          <button onClick={() => go(page + 1)} disabled={page >= total}
            className="flex-1 h-10 rounded-xl border text-sm font-semibold flex items-center justify-center gap-1 disabled:opacity-30"
            style={{ borderColor: 'currentColor' }}>
            পরের <Arrow dir="l" />
          </button>
        </div>
      </div>
    )
  }

  const juz = meta.juz && meta.juz.length ? meta.juz : null
  const pct = prog ? Math.round((prog.done / prog.total) * 100) : 0
  const cur = surahAt(page)
  const qq = q.trim().replace(/[\u09e6-\u09ef]/g, d => String('০১২৩৪৫৬৭৮৯'.indexOf(d)))
  const list = qq
    ? SURAHS.filter(x => String(x.n) === qq || x.name.includes(qq) || x.mean.includes(qq))
    : SURAHS
  const deep = 'color-mix(in srgb, ' + accent + ' 50%, #000)'

  return (
    <div className="space-y-4">
      {back}

      <div className="relative overflow-hidden rounded-3xl p-5 text-white shadow-lg"
        style={{ background: 'linear-gradient(135deg, ' + accent + ', ' + deep + ')' }}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true" style={{ opacity: 0.12 }}>
          <defs>
            <pattern id="hz-star" width="46" height="46" patternUnits="userSpaceOnUse">
              <rect x="13" y="13" width="20" height="20" fill="none" stroke="#fff" strokeWidth="1.2" />
              <rect x="13" y="13" width="20" height="20" fill="none" stroke="#fff" strokeWidth="1.2"
                transform="rotate(45 23 23)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hz-star)" />
        </svg>
        <div className="relative space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] tracking-wide opacity-80">মদীনা মুসহাফ · {bn(total)} পৃষ্ঠা</p>
              <h2 className="text-2xl font-bold mt-0.5">{meta.title || 'কুরআন মাজীদ'}</h2>
            </div>
            {full && (
              <span className="text-[10px] font-bold rounded-full px-2.5 py-1 shrink-0"
                style={{ background: 'rgba(255,255,255,.18)' }}>অফলাইনে সেভ আছে</span>
            )}
          </div>
          <div className="rounded-2xl p-3.5 flex items-center gap-3" style={{ background: 'rgba(255,255,255,.14)' }}>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] opacity-75">{page > 1 ? 'সর্বশেষ পড়া' : 'শুরু করুন'}</p>
              <p className="font-bold truncate">সূরা {cur.name}</p>
              <p className="text-xs opacity-80">পৃষ্ঠা {bn(page)}</p>
            </div>
            <button onClick={() => setView('read')}
              className="px-4 py-2.5 rounded-xl bg-white font-bold text-sm shrink-0 active:opacity-80"
              style={{ color: accent }}>
              {page > 1 ? 'চালিয়ে যান' : 'পড়া শুরু'}
            </button>
          </div>
        </div>
      </div>

      {!full && (
        <div className={card + ' space-y-3'}>
          <div className="flex items-center justify-between gap-2">
            <p className="font-bold text-sm">অফলাইনে পড়ার জন্য</p>
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-500">
              {bn(saved)} / {bn(total)}
            </span>
          </div>
          <p className="text-xs text-gray-600">
            একবার ফোনে সেভ করে নিলে ইন্টারনেট ছাড়াই পুরো কুরআন পড়া যাবে। লগইন বা ডাটাবেস লাগে না।
          </p>
          {prog && (
            <div className="space-y-1">
              <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: pct + '%', background: accent }} />
              </div>
              <p className="text-xs text-gray-500">{bn(prog.done)} / {bn(prog.total)} পৃষ্ঠা ({bn(pct)}%)</p>
            </div>
          )}
          <div className="flex gap-2">
            {prog ? (
              <button onClick={() => { stop.current = true }}
                className="flex-1 py-2.5 rounded-xl border font-semibold text-sm">থামান</button>
            ) : (
              <button onClick={download} className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm"
                style={{ background: accent }}>
                {saved > 0 ? 'বাকিটা সেভ করুন' : 'ফোনে সেভ করুন'}
              </button>
            )}
            {saved > 0 && !prog && (
              <button onClick={wipe} className="px-4 py-2.5 rounded-xl border border-red-300 text-red-600 font-semibold text-sm">
                মুছুন
              </button>
            )}
          </div>
          {msg && <p className="text-xs text-gray-600">{msg}</p>}
        </div>
      )}

      <div className="flex p-1 rounded-2xl bg-gray-100">
        {([['surah', 'সূরা', bn(SURAHS.length)], ['para', 'পারা', bn(30)]] as const).map(([k, label, c]) => (
          <button key={k} onClick={() => setTab(k)}
            className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
            style={tab === k ? { background: '#fff', color: accent, boxShadow: '0 1px 4px rgba(0,0,0,.12)' } : { color: '#6b7280' }}>
            {label} <span className="text-[11px] font-semibold opacity-60">{c}</span>
          </button>
        ))}
      </div>

      {tab === 'surah' && (
        <div className="space-y-2.5">
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="সূরার নাম বা নম্বর খুঁজুন"
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white outline-none text-sm focus:border-green-600" />
          {list.length === 0 && <p className="text-center text-sm text-gray-400 py-6">কোনো সূরা পাওয়া যায়নি</p>}
          {list.map(x => (
            <button key={x.n} onClick={() => { setPage(x.page); setView('read') }}
              className="w-full bg-white rounded-2xl px-3 py-2.5 shadow-sm flex items-center gap-3 text-left active:opacity-70"
              style={cur.n === x.n && page > 1 ? { boxShadow: '0 0 0 1.5px ' + accent } : undefined}>
              <Star n={x.n} c={accent} />
              <span className="flex-1 min-w-0">
                <span className="block font-bold truncate">{x.name}</span>
                <span className="block text-[11px] text-gray-500 truncate">{x.mean}</span>
                <span className="flex items-center gap-1.5 mt-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5"
                    style={{ background: x.madani ? '#eff6ff' : '#fffbeb', color: x.madani ? '#1d4ed8' : '#92400e' }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: x.madani ? '#3b82f6' : '#f59e0b' }} />
                    {x.madani ? 'মাদানী' : 'মাক্কী'}
                  </span>
                  <span className="text-[10px] text-gray-500">{bn(x.ayahs)} আয়াত</span>
                </span>
              </span>
              <span className="text-right shrink-0">
                <span className="block text-[10px] text-gray-400">পৃষ্ঠা</span>
                <span className="block text-base font-bold" style={{ color: accent }}>{bn(x.page)}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {tab === 'para' && juz && (
        <div className="grid grid-cols-2 gap-2.5">
          {juz.map((st, i) => (
            <button key={i} onClick={() => { setPage(st); setView('read') }}
              className="bg-white rounded-2xl p-3 shadow-sm flex items-center gap-3 text-left active:opacity-70">
              <Star n={i + 1} c={accent} size={44} />
              <span className="min-w-0">
                <span className="block font-bold text-sm">পারা {bn(i + 1)}</span>
                <span className="block text-[11px] text-gray-500 truncate">{surahAt(st).name}</span>
                <span className="block text-[10px] mt-0.5" style={{ color: accent }}>পৃষ্ঠা {bn(st)}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {full && saved > 0 && (
        <button onClick={wipe} className="w-full text-xs text-gray-400 py-2">ফোনে সেভ করা পেজ মুছুন</button>
      )}
    </div>
  )
}
