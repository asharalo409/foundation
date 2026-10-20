import { useEffect, useMemo, useRef, useState } from 'react'
import { IIco } from './IslamIcons'
import { bnDigits } from './prayer'

// হাদিস (আরবি + বাংলা অর্থ)। প্রতিটি কিতাব একবার ফোনে সেভ করলে ইন্টারনেট ছাড়াই পড়া যায়।
// ডেটা আসে খোলা (Unlicense) hadith-api থেকে। Supabase লাগে না।

type Item = { n: number; a: string; b: string; g?: string; s?: number }
type Rec = { id: string; savedAt: number; secs: Record<string, string>; items: Item[] }

const BOOKS: { id: string; name: string; sub: string }[] = [
  { id: 'nawawi', name: 'চল্লিশ হাদিস', sub: 'ইমাম নববী (রহ.)' },
  { id: 'bukhari', name: 'সহীহ বুখারী', sub: 'ইমাম বুখারী (রহ.)' },
  { id: 'muslim', name: 'সহীহ মুসলিম', sub: 'ইমাম মুসলিম (রহ.)' },
  { id: 'abudawud', name: 'সুনানে আবু দাউদ', sub: 'ইমাম আবু দাউদ (রহ.)' },
  { id: 'tirmidhi', name: 'জামে আত-তিরমিযী', sub: 'ইমাম তিরমিযী (রহ.)' },
  { id: 'nasai', name: 'সুনানে নাসায়ী', sub: 'ইমাম নাসায়ী (রহ.)' },
  { id: 'ibnmajah', name: 'সুনানে ইবনে মাজাহ', sub: 'ইমাম ইবনে মাজাহ (রহ.)' },
  { id: 'malik', name: 'মুয়াত্তা মালিক', sub: 'ইমাম মালিক (রহ.)' },
]

const CDN = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/'
const RAW = 'https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/editions/'
const AR = "'Amiri Quran', 'Noto Naskh Arabic', 'Scheherazade New', serif"
const GRADE: Record<string, string> = {
  sahih: 'সহীহ', hasan: 'হাসান', "da'if": 'যঈফ', daif: 'যঈফ', 'hasan sahih': 'হাসান সহীহ', mawdu: 'জাল',
}
const bn = (n: number) => bnDigits(String(n))
const PER = 30

function open(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open('hadith-lib', 1)
    r.onupgradeneeded = () => { r.result.createObjectStore('b') }
    r.onsuccess = () => res(r.result)
    r.onerror = () => rej(r.error)
  })
}
async function run<T>(mode: IDBTransactionMode, f: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  const d = await open()
  return new Promise((res, rej) => {
    const q = f(d.transaction('b', mode).objectStore('b'))
    q.onsuccess = () => res(q.result as T)
    q.onerror = () => rej(q.error)
  })
}
const dbGet = (k: string) => run<Rec | undefined>('readonly', s => s.get(k))
const dbPut = (k: string, v: Rec) => run<any>('readwrite', s => s.put(v, k))
const dbDel = (k: string) => run<any>('readwrite', s => s.delete(k))
const dbKeys = () => run<string[]>('readonly', s => s.getAllKeys() as IDBRequest)

const edUrls = (ed: string) => [
  CDN + ed + '.min.json', CDN + ed + '.json', RAW + ed + '.min.json', RAW + ed + '.json',
]
async function getJson(urls: string[]): Promise<any> {
  let last: any
  for (const u of urls) {
    try {
      const r = await fetch(u)
      if (r.ok) return await r.json()
    } catch (e) { last = e }
  }
  throw last || new Error('x')
}

function gradeOf(h: any): string | undefined {
  const g = Array.isArray(h?.grades) && h.grades[0]?.grade
  if (!g || typeof g !== 'string') return undefined
  return GRADE[g.trim().toLowerCase()] || undefined
}

const rd = (k: string) => { try { return localStorage.getItem(k) || '' } catch { return '' } }
const wr = (k: string, v: string) => { try { localStorage.setItem(k, v) } catch {} }
const loadBm = (): string[] => { try { return JSON.parse(rd('hadith-bm') || '[]') } catch { return [] } }

const Svg = ({ d, size = 18, fill = false }: { d: React.ReactNode; size?: number; fill?: boolean }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={fill ? 'currentColor' : 'none'} stroke="currentColor"
    strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
)
const ICON = {
  copy: <><rect x="8.5" y="8.5" width="11" height="11" rx="2" /><path d="M5 15.5V6a2 2 0 0 1 2-2h8.5" /></>,
  mark: <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1z" />,
  down: <><path d="M12 4v11" /><path d="m7 11 5 5 5-5" /><path d="M5 20h14" /></>,
  book: <><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" /><path d="M5 17a3 3 0 0 1 3-3h11" /></>,
  trash: <><path d="M5 7h14" /><path d="M9 7V5h6v2" /><path d="M7 7l1 12h8l1-12" /></>,
}

function HadithCard({ it, book, accent, marked, onMark }: {
  it: Item; book: string; accent: string; marked: boolean; onMark: () => void
}) {
  const [ok, setOk] = useState(false)
  async function copy() {
    const t = [it.a, it.b, '— ' + book + ', হাদিস ' + bn(it.n)].filter(Boolean).join('\n\n')
    try { await navigator.clipboard.writeText(t); setOk(true); setTimeout(() => setOk(false), 1500) } catch {}
  }
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold rounded-full px-2.5 py-1" style={{ background: accent + '18', color: accent }}>
          হাদিস {bn(it.n)}
        </span>
        {it.g && (
          <span className="text-[10px] font-semibold rounded-full px-2 py-0.5 bg-emerald-50 text-emerald-700">{it.g}</span>
        )}
        <span className="flex-1" />
        <button onClick={copy} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 active:opacity-60"
          aria-label="কপি">{ok ? <span className="text-[10px] font-bold" style={{ color: accent }}>কপি</span> : <Svg d={ICON.copy} size={17} />}</button>
        <button onClick={onMark} className="w-8 h-8 rounded-full flex items-center justify-center active:opacity-60"
          style={{ color: marked ? accent : '#6b7280' }} aria-label="প্রিয়">
          <Svg d={ICON.mark} size={17} fill={marked} />
        </button>
      </div>
      {it.a && (
        <p dir="rtl" className="text-[22px] leading-[2.1] text-gray-900" style={{ fontFamily: AR }}>{it.a}</p>
      )}
      <p className="text-[15px] leading-relaxed text-gray-800 whitespace-pre-line">{it.b}</p>
    </div>
  )
}

export default function Hadith({ accent, onExit }: { accent: string; onExit: () => void }) {
  const [saved, setSaved] = useState<string[]>([])
  const [busy, setBusy] = useState<Record<string, string>>({})
  const [err, setErr] = useState('')
  const [view, setView] = useState<string>('home') // home | fav | কিতাবের id
  const [rec, setRec] = useState<Rec | null>(null)
  const [q, setQ] = useState('')
  const [sec, setSec] = useState('')
  const [shown, setShown] = useState(PER)
  const [bm, setBm] = useState<string[]>(loadBm)
  const [daily, setDaily] = useState<{ it: Item; book: string } | null>(null)
  const [favItems, setFavItems] = useState<{ it: Item; book: string; id: string }[]>([])
  const top = useRef<HTMLDivElement>(null)

  async function refresh() {
    try { setSaved(await dbKeys()) } catch {}
  }
  useEffect(() => { refresh() }, [])

  // আজকের হাদিস: যে কিতাব সেভ আছে তা থেকে, দিনের হিসাবে
  useEffect(() => {
    if (!saved.length) { setDaily(null); return }
    const pick = saved.includes('nawawi') ? 'nawawi' : saved[0]
    dbGet(pick).then(r => {
      if (!r || !r.items.length) return
      const day = Math.floor(Date.now() / 86400000)
      const b = BOOKS.find(x => x.id === pick)
      const short = r.items.filter(i => i.b.length < 420)
      const pool = short.length ? short : r.items
      setDaily({ it: pool[day % pool.length], book: b?.name || '' })
    }).catch(() => {})
  }, [saved.join(',')])

  useEffect(() => {
    if (view === 'home' || view === 'fav') { setRec(null); return }
    dbGet(view).then(r => { setRec(r || null); setQ(''); setSec(''); setShown(PER) })
  }, [view])

  useEffect(() => {
    if (view !== 'fav') return
    ;(async () => {
      const out: { it: Item; book: string; id: string }[] = []
      const cache: Record<string, Rec | undefined> = {}
      for (const k of bm) {
        const [id, n] = k.split(':')
        if (!(id in cache)) cache[id] = await dbGet(id).catch(() => undefined)
        const it = cache[id]?.items.find(x => String(x.n) === n)
        if (it) out.push({ it, book: BOOKS.find(b => b.id === id)?.name || '', id })
      }
      setFavItems(out)
    })()
  }, [view, bm.join(',')])

  function toggleBm(id: string, n: number) {
    const k = id + ':' + n
    const next = bm.includes(k) ? bm.filter(x => x !== k) : [k, ...bm]
    setBm(next)
    wr('hadith-bm', JSON.stringify(next))
  }

  async function download(id: string) {
    setErr('')
    const set = (m: string) => setBusy(b => ({ ...b, [id]: m }))
    try {
      set('বাংলা অর্থ আনছি...')
      const ben = await getJson(edUrls('ben-' + id))
      const list: any[] = Array.isArray(ben?.hadiths) ? ben.hadiths : []
      if (!list.length) throw new Error('empty')
      let ara: Map<number, string> = new Map()
      try {
        set('আরবি আনছি...')
        const aj = await getJson(edUrls('ara-' + id))
        for (const h of Array.isArray(aj?.hadiths) ? aj.hadiths : []) {
          if (h && typeof h.text === 'string' && h.text.trim()) ara.set(Number(h.hadithnumber), h.text.trim())
        }
      } catch {}
      set('সেভ হচ্ছে...')
      const items: Item[] = []
      for (const h of list) {
        const t = typeof h?.text === 'string' ? h.text.trim() : ''
        if (!t) continue
        const n = Number(h.hadithnumber)
        items.push({ n, a: ara.get(n) || '', b: t, g: gradeOf(h), s: Number(h?.reference?.book) || undefined })
      }
      if (!items.length) throw new Error('empty')
      const secs: Record<string, string> = {}
      const m = ben?.metadata?.section
      if (m && typeof m === 'object') {
        for (const [k, v] of Object.entries(m)) if (k !== '0' && typeof v === 'string' && v.trim()) secs[k] = v.trim()
      }
      await dbPut(id, { id, savedAt: Date.now(), secs, items })
      await refresh()
    } catch {
      setErr('ডাউনলোড করা যায়নি। ইন্টারনেট ঠিক আছে কিনা দেখে আবার চেষ্টা করুন।')
    }
    setBusy(b => { const c = { ...b }; delete c[id]; return c })
  }

  async function remove(id: string) {
    if (!confirm('এই কিতাব ফোন থেকে মুছে ফেলবেন?')) return
    await dbDel(id).catch(() => {})
    await refresh()
    if (view === id) setView('home')
  }

  const list = useMemo(() => {
    if (!rec) return []
    const t = q.trim().replace(/[\u09e6-\u09ef]/g, d => String('০১২৩৪৫৬৭৮৯'.indexOf(d)))
    return rec.items.filter(i => {
      if (sec && String(i.s) !== sec) return false
      if (!t) return true
      return String(i.n) === t || i.b.includes(t)
    })
  }, [rec, q, sec])

  const back = (label: string, to: string) => (
    <button onClick={() => (to === '' ? onExit() : setView(to))} className="flex items-center gap-1 text-sm font-semibold"
      style={{ color: accent }}>
      <IIco name="chev-left" size={18} /> {label}
    </button>
  )
  const deep = 'color-mix(in srgb, ' + accent + ' 50%, #000)'
  const bookName = (id: string) => BOOKS.find(b => b.id === id)?.name || ''

  // প্রিয় হাদিস
  if (view === 'fav') {
    return (
      <div className="space-y-3">
        {back('হাদিস', 'home')}
        <h2 className="text-xl font-bold">প্রিয় হাদিস</h2>
        {favItems.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-10">এখনো কোনো হাদিস প্রিয় করা হয়নি।</p>
        )}
        {favItems.map(f => (
          <div key={f.id + f.it.n} className="space-y-1">
            <p className="text-[11px] text-gray-500 px-1">{f.book}</p>
            <HadithCard it={f.it} book={f.book} accent={accent} marked onMark={() => toggleBm(f.id, f.it.n)} />
          </div>
        ))}
      </div>
    )
  }

  // কিতাব পড়া
  if (view !== 'home') {
    const secEntries = rec ? Object.entries(rec.secs).sort((a, b) => Number(a[0]) - Number(b[0])) : []
    return (
      <div className="space-y-3" ref={top}>
        {back('হাদিস', 'home')}
        <div className="rounded-2xl p-4 text-white" style={{ background: 'linear-gradient(135deg, ' + accent + ', ' + deep + ')' }}>
          <p className="text-[11px] opacity-80">{BOOKS.find(b => b.id === view)?.sub}</p>
          <h2 className="text-xl font-bold">{bookName(view)}</h2>
          {rec && <p className="text-xs opacity-80 mt-0.5">{bn(rec.items.length)}টি হাদিস · বাংলা অর্থসহ</p>}
        </div>

        {!rec ? (
          <p className="text-center text-sm text-gray-400 py-10">লোড হচ্ছে...</p>
        ) : (
          <>
            <input value={q} onChange={e => { setQ(e.target.value); setShown(PER) }}
              placeholder="নম্বর বা বাংলা শব্দ দিয়ে খুঁজুন"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white outline-none text-sm focus:border-green-600" />
            {secEntries.length > 0 && (
              <select value={sec} onChange={e => { setSec(e.target.value); setShown(PER) }}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-white text-sm outline-none">
                <option value="">সব অধ্যায় ({bn(secEntries.length)})</option>
                {secEntries.map(([k, v]) => <option key={k} value={k}>{bn(Number(k))}. {v}</option>)}
              </select>
            )}
            <p className="text-xs text-gray-500">{bn(list.length)}টি হাদিস পাওয়া গেছে</p>
            {list.slice(0, shown).map(it => (
              <HadithCard key={it.n} it={it} book={bookName(view)} accent={accent}
                marked={bm.includes(view + ':' + it.n)} onMark={() => toggleBm(view, it.n)} />
            ))}
            {shown < list.length && (
              <button onClick={() => setShown(s => s + PER)}
                className="w-full py-3 rounded-xl border font-semibold text-sm" style={{ color: accent, borderColor: accent + '66' }}>
                আরও দেখান ({bn(list.length - shown)}টি বাকি)
              </button>
            )}
            <button onClick={() => remove(view)} className="w-full text-xs text-gray-400 py-3">এই কিতাব ফোন থেকে মুছুন</button>
          </>
        )}
      </div>
    )
  }

  // হোম
  return (
    <div className="space-y-4">
      {back('ইসলামিক কর্নার', '')}

      <div className="relative overflow-hidden rounded-3xl p-5 text-white shadow-lg"
        style={{ background: 'linear-gradient(135deg, ' + accent + ', ' + deep + ')' }}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true" style={{ opacity: 0.1 }}>
          <defs>
            <pattern id="hd-p" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M20 4 36 20 20 36 4 20Z" fill="none" stroke="#fff" strokeWidth="1.2" />
              <circle cx="20" cy="20" r="3" fill="none" stroke="#fff" strokeWidth="1.2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hd-p)" />
        </svg>
        <div className="relative space-y-3">
          <div>
            <p className="text-[11px] opacity-80">আরবি ও বাংলা অর্থসহ</p>
            <h2 className="text-2xl font-bold">হাদিস</h2>
          </div>
          {daily ? (
            <div className="rounded-2xl p-3.5" style={{ background: 'rgba(255,255,255,.14)' }}>
              <p className="text-[11px] opacity-75 mb-1">আজকের হাদিস · {daily.book} {bn(daily.it.n)}</p>
              <p className="text-sm leading-relaxed">{daily.it.b.length > 260 ? daily.it.b.slice(0, 260) + '...' : daily.it.b}</p>
            </div>
          ) : (
            <p className="text-xs opacity-85 leading-relaxed">
              নিচের যেকোনো কিতাব একবার ফোনে সেভ করুন। এরপর ইন্টারনেট ছাড়াই পড়তে পারবেন।
            </p>
          )}
        </div>
      </div>

      <button onClick={() => setView('fav')}
        className="w-full bg-white rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3 active:opacity-70">
        <span className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: accent + '18', color: accent }}>
          <Svg d={ICON.mark} size={20} />
        </span>
        <span className="flex-1 text-left">
          <span className="block font-bold text-sm">প্রিয় হাদিস</span>
          <span className="block text-[11px] text-gray-500">{bn(bm.length)}টি সংরক্ষিত</span>
        </span>
      </button>

      {err && <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{err}</p>}

      <div className="space-y-2.5">
        {BOOKS.map((b, i) => {
          const have = saved.includes(b.id)
          const doing = busy[b.id]
          return (
            <div key={b.id} className="bg-white rounded-2xl shadow-sm overflow-hidden flex">
              <span className="w-1.5 shrink-0" style={{ background: accent, opacity: 1 - (i % 4) * 0.18 }} />
              <div className="flex-1 min-w-0 p-3.5 flex items-center gap-3">
                <button disabled={!have} onClick={() => setView(b.id)} className="flex-1 min-w-0 text-left">
                  <span className="block font-bold truncate">{b.name}</span>
                  <span className="block text-[11px] text-gray-500 truncate">{b.sub}</span>
                  <span className="block text-[10px] mt-1 font-semibold" style={{ color: have ? accent : '#9ca3af' }}>
                    {doing || (have ? 'ফোনে সেভ আছে · পড়ুন' : 'সেভ করা হয়নি')}
                  </span>
                </button>
                {have ? (
                  <button onClick={() => setView(b.id)}
                    className="px-3.5 py-2 rounded-xl text-white text-xs font-bold shrink-0" style={{ background: accent }}>
                    পড়ুন
                  </button>
                ) : (
                  <button disabled={!!doing} onClick={() => download(b.id)}
                    className="px-3.5 py-2 rounded-xl border text-xs font-bold shrink-0 flex items-center gap-1 disabled:opacity-50"
                    style={{ color: accent, borderColor: accent + '66' }}>
                    <Svg d={ICON.down} size={15} /> {doing ? 'চলছে' : 'সেভ'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-[11px] text-gray-400 text-center leading-relaxed px-4">
        হাদিসের বাংলা অর্থ খোলা হাদিস ডেটাবেস থেকে নেওয়া। গুরুত্বপূর্ণ বিষয়ে আলেমদের কাছ থেকে জেনে নেবেন।
      </p>
    </div>
  )
}
