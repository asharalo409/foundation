import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { IIco } from './IslamIcons'
import { Sheet } from './IslamicViews'
import { SURAH_BN } from './quranNames'
import { bnDigits } from './prayer'
import { loadQuran, downloadQuran, deleteQuran, stripDia, ayahAudio } from './quranData'
import type { Pack, Ayah } from './quranData'

const bn = (n: number) => bnDigits(String(n))
const AR = "'Amiri Quran', 'Noto Naskh Arabic', 'Scheherazade New', serif"
const TYPE_BN: Record<string, string> = { Meccan: 'মাক্কী', Medinan: 'মাদানী' }
const toAr = (n: number) => String(n).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[Number(d)])
const BISM = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ'
const MB = (b: number) => bnDigits((b / 1048576).toFixed(1)) + ' MB'

type Prefs = { ar: number; tr: number; bn: boolean; en: boolean; cont: boolean }
const DEF: Prefs = { ar: 30, tr: 16, bn: true, en: false, cont: true }

const input =
  'w-full border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-green-600'

const Ic = ({ d, size = 22 }: { d: ReactNode; size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
    strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d}
  </svg>
)
const I = {
  back: <path d="M19 12H5M11 6l-6 6 6 6" />,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4-4" /></>,
  tune: <><path d="M4 7h9M18 7h2M4 17h3M12 17h8" /><circle cx="15.5" cy="7" r="2.4" /><circle cx="9.5" cy="17" r="2.4" /></>,
  play: <path d="M8 5.5v13l11-6.5z" fill="currentColor" />,
  pause: <><rect x="6.5" y="5" width="4" height="14" rx="1" fill="currentColor" /><rect x="13.5" y="5" width="4" height="14" rx="1" fill="currentColor" /></>,
  copy: <><rect x="8.5" y="8.5" width="11" height="11" rx="2" /><path d="M5 15.5V6a2 2 0 0 1 2-2h8.5" /></>,
  mark: <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1z" />,
  hist: <><path d="M4 12a8 8 0 1 0 2.5-5.8" /><path d="M4 4v4.5h4.5" /><path d="M12 8v4l2.5 1.5" /></>,
  link: <><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></>,
  chev: <path d="m9 6 6 6-6 6" />,
}

export default function Quran({ accent, onExit }: { accent: string; onExit: () => void }) {
  const [pack, setPack] = useState<Pack | null | undefined>(undefined)
  const [prog, setProg] = useState<{ n: number; label: string } | null>(null)
  const [err, setErr] = useState('')
  const [view, setView] = useState<'list' | 'reader'>('list')
  const [tab, setTab] = useState<'surah' | 'juz'>('surah')
  const [mode, setMode] = useState<'ayah' | 'page'>('ayah')
  const [cur, setCur] = useState({ s: 1, i: 1 })
  const [page, setPage] = useState(1)
  const [visible, setVisible] = useState(30)
  const [jump, setJump] = useState(0)
  const [sheet, setSheet] = useState('')
  const [q, setQ] = useState('')
  const [qs, setQs] = useState('')
  const [qi, setQi] = useState('')
  const [qp, setQp] = useState('')
  const [note, setNote] = useState('')
  const [playing, setPlaying] = useState<number | null>(null)
  const [prefs, setPrefs] = useState<Prefs>(() => {
    try { return { ...DEF, ...JSON.parse(localStorage.getItem('quran-prefs') || '{}') } } catch { return DEF }
  })
  const [last, setLast] = useState<{ s: number; i: number } | null>(() => {
    try {
      const v = localStorage.getItem('quran-last')
      return v ? JSON.parse(v) : null
    } catch { return null }
  })
  const audio = useRef<HTMLAudioElement | null>(null)
  const playRef = useRef<number | null>(null)
  const sentinel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!document.getElementById('gf-amiri-quran')) {
      const l = document.createElement('link')
      l.id = 'gf-amiri-quran'
      l.rel = 'stylesheet'
      l.href = 'https://fonts.googleapis.com/css2?family=Amiri+Quran&display=swap'
      document.head.appendChild(l)
    }
    loadQuran().then(p => setPack(p || null)).catch(() => setPack(null))
    return () => { audio.current?.pause() }
  }, [])

  useEffect(() => {
    try { localStorage.setItem('quran-prefs', JSON.stringify(prefs)) } catch {}
  }, [prefs])

  useEffect(() => {
    if (!note) return
    const id = setTimeout(() => setNote(''), 3500)
    return () => clearTimeout(id)
  }, [note])

  const ayahs: Ayah[] = pack ? pack.ayahs : []

  const starts = useMemo(() => {
    const st: number[] = []
    ayahs.forEach((a, idx) => { if (a.i === 1) st[a.s] = idx })
    return st
  }, [pack])

  const juzStart = useMemo(() => {
    const m: Ayah[] = []
    ayahs.forEach(a => { if (!m[a.j]) m[a.j] = a })
    return m
  }, [pack])

  const list = useMemo(() => (pack ? ayahs.filter(a => a.s === cur.s) : []), [pack, cur.s])
  const pageAyahs = useMemo(() => (pack ? ayahs.filter(a => a.p === page) : []), [pack, page])

  const results = useMemo(() => {
    const t = q.trim()
    if (!pack || t.length < 2) return []
    const low = t.toLowerCase()
    const hasAr = /[\u0600-\u06FF]/.test(t)
    const qa = hasAr ? stripDia(t) : ''
    const out: Ayah[] = []
    for (const a of ayahs) {
      if (
        (a.b && a.b.includes(t)) ||
        (a.e && a.e.toLowerCase().includes(low)) ||
        (hasAr && stripDia(a.t).includes(qa))
      ) {
        out.push(a)
        if (out.length >= 40) break
      }
    }
    return out
  }, [q, pack])

  useEffect(() => {
    if (view !== 'reader' || mode !== 'ayah') return
    const el = sentinel.current
    if (!el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(es => {
      if (es[0].isIntersecting) setVisible(v => v + 25)
    }, { rootMargin: '400px' })
    io.observe(el)
    return () => io.disconnect()
  }, [view, mode, cur.s, visible])

  useEffect(() => {
    if (!jump) return
    const t = setTimeout(() => {
      const a = ayahs[(starts[cur.s] ?? 0) + cur.i - 1]
      const el = a ? document.getElementById('ay-' + a.n) : null
      if (el) el.scrollIntoView({ block: 'start' })
      else window.scrollTo(0, 0)
    }, 80)
    return () => clearTimeout(t)
  }, [jump])

  function saveLast(s: number, i: number) {
    const v = { s, i }
    setLast(v)
    try { localStorage.setItem('quran-last', JSON.stringify(v)) } catch {}
  }

  function openAyah(s: number, i = 1) {
    setCur({ s, i })
    setMode('ayah')
    setView('reader')
    setVisible(Math.max(30, i + 20))
    setJump(j => j + 1)
    saveLast(s, i)
  }

  function openPage(p: number) {
    setPage(Math.min(604, Math.max(1, p)))
    setMode('page')
    setView('reader')
    window.scrollTo(0, 0)
  }

  function toPageMode() {
    const a = ayahs[(starts[cur.s] ?? 0) + cur.i - 1]
    openPage(a ? a.p : 1)
  }

  function goLink() {
    if (!pack) return
    const s = Number(qs)
    if (!(s >= 1 && s <= 114)) { setNote('সূরা নম্বর ১ থেকে ১১৪ এর মধ্যে দিন'); return }
    const cnt = pack.surahs[s - 1].count
    const i = Math.min(Math.max(Number(qi) || 1, 1), cnt)
    setSheet('')
    openAyah(s, i)
  }

  function goPage() {
    const p = Number(qp)
    if (!(p >= 1 && p <= 604)) { setNote('পাতা নম্বর ১ থেকে ৬০৪ এর মধ্যে দিন'); return }
    setSheet('')
    openPage(p)
  }

  async function startDownload() {
    setErr('')
    if (!navigator.onLine) { setErr('ইন্টারনেট সংযোগ নেই। সংযোগ থাকলে আবার চেষ্টা করুন।'); return }
    setProg({ n: 0, label: 'শুরু হচ্ছে...' })
    try {
      const p = await downloadQuran((n, label) => setProg({ n, label }))
      setPack(p)
      setProg(null)
    } catch (e: any) {
      setProg(null)
      setErr('ডাউনলোড হয়নি: ' + (e?.message || 'ইন্টারনেট দেখুন'))
    }
  }

  async function removePack() {
    if (!confirm('ফোন থেকে কুরআনের ডেটা মুছবেন? আবার ইন্টারনেটে নামাতে হবে।')) return
    audio.current?.pause()
    await deleteQuran()
    setPack(null)
    setPlaying(null)
    setSheet('')
    setView('list')
  }

  function startAudio(a: Ayah) {
    if (!navigator.onLine) { setNote('তিলাওয়াত শুনতে ইন্টারনেট লাগবে'); return }
    if (!audio.current) audio.current = new Audio()
    const el = audio.current
    el.onended = () => {
      const nx = ayahs[a.n]
      if (prefs.cont && nx && nx.s === a.s) {
        setVisible(v => Math.max(v, nx.i + 5))
        startAudio(nx)
        setTimeout(() => {
          document.getElementById('ay-' + nx.n)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 150)
      } else {
        playRef.current = null
        setPlaying(null)
      }
    }
    el.onerror = () => {
      playRef.current = null
      setPlaying(null)
      setNote('তিলাওয়াত চালানো যায়নি')
    }
    el.src = ayahAudio(a.n)
    playRef.current = a.n
    setPlaying(a.n)
    el.play().catch(() => {
      playRef.current = null
      setPlaying(null)
    })
  }

  function togglePlay(a: Ayah) {
    if (playRef.current === a.n) {
      audio.current?.pause()
      playRef.current = null
      setPlaying(null)
      return
    }
    startAudio(a)
  }

  async function copyAyah(a: Ayah) {
    const txt = a.t + '\n' + (a.b || '') + '\n(' + SURAH_BN[a.s - 1][0] + ' ' + bn(a.s) + ':' + bn(a.i) + ')'
    try {
      await navigator.clipboard.writeText(txt)
      setNote('কপি হয়েছে')
    } catch {
      setNote('কপি করা যায়নি')
    }
  }

  const iconBtn = 'p-2 rounded-full active:opacity-60'
  const chip = 'rounded-full px-3 py-1 text-[11px] font-semibold'

  if (pack === undefined) {
    return <p className="text-center text-sm text-gray-500 py-10">লোড হচ্ছে...</p>
  }

  if (pack === null) {
    return (
      <div className="space-y-4">
        <button onClick={onExit} className="flex items-center gap-1 text-sm font-semibold" style={{ color: accent }}>
          <Ic d={I.back} size={18} /> ইসলামিক কর্নার
        </button>
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center space-y-3">
          <span className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
            style={{ background: accent + '1f', color: accent }}>
            <IIco name="quran" size={32} />
          </span>
          <h2 className="text-xl font-bold">আল কুরআন</h2>
          <p className="text-sm text-gray-600">
            পুরো কুরআন (আরবি পাঠ, বাংলা অনুবাদ ও ইংরেজি অনুবাদ) এক ক্লিকে আপনার ফোনের স্টোরেজে জমা হবে।
            আনুমানিক ৪–৬ MB। একবার নামালে ইন্টারনেট ছাড়াই পড়তে ও খুঁজতে পারবেন। আমাদের ডাটাবেজে কিছুই জমা হবে না।
          </p>
          {prog ? (
            <div className="space-y-2">
              <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                <div className="h-full" style={{ width: (prog.n / 3) * 100 + '%', background: accent }} />
              </div>
              <p className="text-sm">{prog.label} ({bn(prog.n)}/৩)</p>
            </div>
          ) : (
            <button className="w-full text-white font-semibold rounded-lg py-3" style={{ background: accent }}
              onClick={startDownload}>
              ডাউনলোড করুন
            </button>
          )}
          {err && <p className="text-sm text-red-600">{err}</p>}
          <p className="text-[11px] text-gray-400">
            তিলাওয়াত শুনতে (▶) ইন্টারনেট লাগবে, অডিও ফোনে জমা হয় না।
          </p>
        </div>
      </div>
    )
  }

  const surah = pack.surahs[cur.s - 1]
  const sbn = SURAH_BN[cur.s - 1]
  const shown = list.slice(0, visible)

  const sheets = (
    <>
      {note && (
        <div className="fixed inset-x-4 bottom-8 z-50 bg-gray-900 text-white text-sm rounded-xl px-4 py-3 text-center shadow-lg">
          {note}
        </div>
      )}

      {sheet === 'search' && (
        <Sheet title="কুরআনে খুঁজুন" wide onClose={() => setSheet('')}>
          <input className={input} autoFocus placeholder="আরবি, বাংলা বা ইংরেজি শব্দ লিখুন..." value={q}
            onChange={e => setQ(e.target.value)} />
          {q.trim().length >= 2 && results.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">কিছু পাওয়া যায়নি</p>
          )}
          {results.map(a => (
            <button key={a.n} className="w-full text-left border rounded-lg p-3 space-y-1"
              onClick={() => { setSheet(''); openAyah(a.s, a.i) }}>
              <p className="text-xs font-bold" style={{ color: accent }}>
                {SURAH_BN[a.s - 1][0]} · {bn(a.s)}:{bn(a.i)}
              </p>
              <p className="text-sm text-gray-700 line-clamp-3">{a.b || a.e}</p>
            </button>
          ))}
          {results.length >= 40 && <p className="text-[11px] text-gray-400 text-center">প্রথম ৪০টি ফলাফল দেখানো হলো</p>}
        </Sheet>
      )}

      {sheet === 'link' && (
        <Sheet title="কুইক লিংক" onClose={() => setSheet('')}>
          <p className="text-xs text-gray-500">সূরা ও আয়াত নম্বর দিন</p>
          <div className="flex gap-2">
            <input className={input} type="number" placeholder="সূরা (১–১১৪)" value={qs}
              onChange={e => setQs(e.target.value)} />
            <input className={input} type="number" placeholder="আয়াত" value={qi}
              onChange={e => setQi(e.target.value)} />
          </div>
          <button className="w-full text-white font-semibold rounded-lg py-2.5" style={{ background: accent }}
            onClick={goLink}>
            যান
          </button>
          <p className="text-xs text-gray-500 pt-2">অথবা পাতা নম্বর (১–৬০৪)</p>
          <div className="flex gap-2">
            <input className={input} type="number" placeholder="পাতা" value={qp}
              onChange={e => setQp(e.target.value)} />
            <button className="rounded-lg px-5 font-semibold border" style={{ color: accent, borderColor: accent }}
              onClick={goPage}>
              যান
            </button>
          </div>
        </Sheet>
      )}

      {sheet === 'prefs' && (
        <Sheet title="কুরআন সেটিংস" onClose={() => setSheet('')}>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold">আরবি লেখার সাইজ ({bn(prefs.ar)})</p>
              <input type="range" min={22} max={48} value={prefs.ar} className="w-full"
                onChange={e => setPrefs({ ...prefs, ar: Number(e.target.value) })} />
            </div>
            <div>
              <p className="text-sm font-semibold">অনুবাদের সাইজ ({bn(prefs.tr)})</p>
              <input type="range" min={13} max={24} value={prefs.tr} className="w-full"
                onChange={e => setPrefs({ ...prefs, tr: Number(e.target.value) })} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={prefs.bn} onChange={() => setPrefs({ ...prefs, bn: !prefs.bn })} />
              বাংলা অনুবাদ ({pack.bnLabel})
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={prefs.en} onChange={() => setPrefs({ ...prefs, en: !prefs.en })} />
              ইংরেজি অনুবাদ (Sahih International)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={prefs.cont} onChange={() => setPrefs({ ...prefs, cont: !prefs.cont })} />
              তিলাওয়াত শেষ হলে নিজে পরের আয়াত চলুক
            </label>
            <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600 space-y-1">
              <p>ফোনে জমা: <b>{MB(pack.bytes)}</b> · {new Date(pack.savedAt).toLocaleDateString('bn-BD')} তারিখে নামানো</p>
              <p>এই ডেটা শুধু আপনার ফোনে আছে, ডাটাবেজে নয়।</p>
            </div>
            <button className="w-full border border-red-300 text-red-600 rounded-lg py-2 text-sm"
              onClick={removePack}>
              ফোন থেকে কুরআনের ডেটা মুছুন
            </button>
          </div>
        </Sheet>
      )}
    </>
  )

  if (view === 'list') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-1">
          <button onClick={onExit} className={iconBtn + ' -ml-2'} aria-label="back"><Ic d={I.back} /></button>
          <h2 className="text-xl font-bold flex-1">আল কুরআন</h2>
          <button onClick={() => setSheet('search')} className={iconBtn} aria-label="search"><Ic d={I.search} /></button>
          <button onClick={() => setSheet('prefs')} className={iconBtn} aria-label="settings"><Ic d={I.tune} /></button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button disabled={!last} onClick={() => last && openAyah(last.s, last.i)}
            className="flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold disabled:opacity-40">
            <Ic d={I.hist} size={18} /> সর্বশেষ পঠিত
          </button>
          <button onClick={() => setSheet('link')}
            className="flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold">
            <Ic d={I.link} size={18} /> কুইক লিংক
          </button>
          <button onClick={() => openPage(1)}
            className="flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold">
            <IIco name="quran" size={18} /> পাতা অনুযায়ী
          </button>
        </div>

        {last && (
          <button onClick={() => openAyah(last.s, last.i)}
            className="flex items-center gap-3 bg-white rounded-xl shadow-sm px-4 py-3 text-left">
            <span style={{ color: accent }}><Ic d={I.mark} /></span>
            <span>
              <b className="block text-sm">{SURAH_BN[last.s - 1][0]}</b>
              <span className="text-xs text-gray-500">{bn(last.s)}:{bn(last.i)}</span>
            </span>
          </button>
        )}

        <div className="flex gap-2">
          {[['surah', 'সূরা'], ['juz', 'পারা']].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k as any)}
              className={'px-5 py-2 rounded-lg text-sm font-semibold ' + (tab === k ? 'text-white' : 'bg-white border')}
              style={tab === k ? { background: accent } : undefined}>
              {l}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {tab === 'surah' && pack.surahs.map(s => (
            <button key={s.n} onClick={() => openAyah(s.n, 1)}
              className="w-full flex items-center gap-3 px-3 py-3 border-b last:border-b-0 text-left">
              <span className="w-10 h-10 shrink-0 flex items-center justify-center"
                style={{ background: accent + '1f', color: accent, borderRadius: 9, transform: 'rotate(45deg)' }}>
                <span style={{ transform: 'rotate(-45deg)' }} className="text-sm font-bold">{bn(s.n)}</span>
              </span>
              <span className="flex-1 min-w-0">
                <span className="flex items-center gap-2">
                  <b className="text-sm">{SURAH_BN[s.n - 1][0]}</b>
                  <span className="rounded-full px-2 py-0.5 text-[10px] bg-gray-100">{TYPE_BN[s.type] || s.type}</span>
                </span>
                <span className="block text-xs text-gray-500">
                  {SURAH_BN[s.n - 1][1]} ({bn(s.count)} আয়াত)
                </span>
              </span>
              <span dir="rtl" style={{ fontFamily: AR, fontSize: 22, color: accent }}>{s.ar}</span>
              <span className="text-gray-400"><Ic d={I.chev} size={18} /></span>
            </button>
          ))}
          {tab === 'juz' && Array.from({ length: 30 }, (_, k) => k + 1).map(j => {
            const a = juzStart[j]
            if (!a) return null
            return (
              <button key={j} onClick={() => openAyah(a.s, a.i)}
                className="w-full flex items-center gap-3 px-3 py-3 border-b last:border-b-0 text-left">
                <span className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: accent + '1f', color: accent }}>
                  {bn(j)}
                </span>
                <span className="flex-1">
                  <b className="text-sm block">পারা {bn(j)}</b>
                  <span className="text-xs text-gray-500">
                    শুরু: {SURAH_BN[a.s - 1][0]} {bn(a.s)}:{bn(a.i)}
                  </span>
                </span>
                <span className="text-gray-400"><Ic d={I.chev} size={18} /></span>
              </button>
            )
          })}
        </div>
        {sheets}
      </div>
    )
  }

  const bar = (title: string, sub: string) => (
    <div className="flex items-center gap-1">
      <button onClick={() => { setView('list'); window.scrollTo(0, 0) }} className={iconBtn + ' -ml-2'} aria-label="back">
        <Ic d={I.back} />
      </button>
      <div className="flex-1 min-w-0">
        <h2 className="text-lg font-bold leading-tight truncate">{title}</h2>
        <p className="text-[11px] text-gray-500">{sub}</p>
      </div>
      <button onClick={() => setSheet('search')} className={iconBtn} aria-label="search"><Ic d={I.search} /></button>
      <button onClick={mode === 'ayah' ? toPageMode : () => openAyah(cur.s, 1)} className={iconBtn} aria-label="mode">
        <IIco name="quran" size={22} tint={mode === 'page' ? 0.4 : 0.16} />
      </button>
      <button onClick={() => setSheet('prefs')} className={iconBtn} aria-label="settings"><Ic d={I.tune} /></button>
    </div>
  )

  if (mode === 'page') {
    const blocks: ReactNode[] = []
    let run: ReactNode[] = []
    const flush = (k: string) => {
      if (run.length) {
        blocks.push(
          <p key={k} dir="rtl"
            style={{ fontFamily: AR, fontSize: prefs.ar, lineHeight: 2.4, textAlign: 'justify', margin: 0 }}>
            {run}
          </p>
        )
        run = []
      }
    }
    pageAyahs.forEach(a => {
      if (a.i === 1) {
        flush('r' + a.n)
        blocks.push(
          <div key={'h' + a.n} className="text-center py-2 space-y-1">
            <p className="inline-block rounded-full px-5 py-1 text-sm font-bold"
              style={{ background: accent + '22', color: accent }}>
              {SURAH_BN[a.s - 1][0]} · {pack.surahs[a.s - 1].ar}
            </p>
            {a.s !== 1 && a.s !== 9 && (
              <p dir="rtl" style={{ fontFamily: AR, fontSize: prefs.ar, margin: 0 }}>{BISM}</p>
            )}
          </div>
        )
      }
      run.push(
        <span key={a.n}>
          {a.t}{' '}
          <span style={{ color: accent }}>{'\u06DD' + toAr(a.i)}</span>{' '}
        </span>
      )
    })
    flush('end')
    const juz = pageAyahs[0] ? pageAyahs[0].j : 1

    return (
      <div className="space-y-3">
        {bar('পাতা ' + bn(page), 'পারা ' + bn(juz) + ' · মাদানী ৬০৪ পৃষ্ঠার বিন্যাস')}
        <div className="bg-white rounded-lg shadow-sm p-4 border-2" style={{ borderColor: accent + '55' }}>
          {blocks}
        </div>
        <div className="flex items-center justify-between gap-2">
          <button disabled={page <= 1} className="flex-1 border rounded-lg py-2.5 font-semibold disabled:opacity-40"
            onClick={() => openPage(page - 1)}>
            ‹ আগের পাতা
          </button>
          <span className="text-sm text-gray-500 whitespace-nowrap">{bn(page)} / ৬০৪</span>
          <button disabled={page >= 604} className="flex-1 border rounded-lg py-2.5 font-semibold disabled:opacity-40"
            onClick={() => openPage(page + 1)}>
            পরের পাতা ›
          </button>
        </div>
        {sheets}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {bar(sbn[0], sbn[1] + ' · ' + bn(surah.count) + ' আয়াত · ' + (TYPE_BN[surah.type] || surah.type))}

      {cur.s !== 1 && cur.s !== 9 && (
        <p dir="rtl" className="text-center py-2"
          style={{ fontFamily: AR, fontSize: prefs.ar + 2, color: accent, margin: 0 }}>
          {BISM}
        </p>
      )}

      {shown.map(a => (
        <div key={a.n} id={'ay-' + a.n} className="bg-white rounded-lg shadow-sm p-3 space-y-2"
          style={playing === a.n ? { boxShadow: '0 0 0 2px ' + accent } : undefined}>
          <div className="flex items-center gap-2">
            <button onClick={() => { saveLast(a.s, a.i); setNote('শেষ পঠিত হিসেবে চিহ্নিত হয়েছে') }}
              className="min-w-9 h-9 px-2 rounded-lg font-bold text-sm flex items-center justify-center"
              style={{ background: accent + '1f', color: accent }}>
              {bn(a.i)}
            </button>
            <span className={chip + ' bg-gray-100'}>পারা {bn(a.j)}</span>
            <span className={chip + ' bg-gray-100'}>পাতা {bn(a.p)}</span>
            <span className="flex-1" />
            {last && last.s === a.s && last.i === a.i && (
              <span style={{ color: accent }}><Ic d={I.mark} size={18} /></span>
            )}
            <button onClick={() => togglePlay(a)} className={iconBtn} aria-label="play" style={{ color: accent }}>
              <Ic d={playing === a.n ? I.pause : I.play} size={20} />
            </button>
            <button onClick={() => copyAyah(a)} className={iconBtn} aria-label="copy" style={{ color: '#64748b' }}>
              <Ic d={I.copy} size={19} />
            </button>
          </div>

          <p dir="rtl" style={{ fontFamily: AR, fontSize: prefs.ar, lineHeight: 2.2, textAlign: 'right', margin: 0 }}>
            {a.t}
          </p>

          {prefs.bn && a.b && (
            <div>
              <p className="text-[11px] text-gray-400">{pack.bnLabel}</p>
              <p style={{ fontSize: prefs.tr, lineHeight: 1.7, margin: 0 }}>{a.b}</p>
            </div>
          )}
          {prefs.en && a.e && (
            <div>
              <p className="text-[11px] text-gray-400">Sahih International</p>
              <p style={{ fontSize: prefs.tr, lineHeight: 1.6, margin: 0 }}>{a.e}</p>
            </div>
          )}
        </div>
      ))}

      {visible < list.length && <div ref={sentinel} className="h-10 text-center text-xs text-gray-400">লোড হচ্ছে...</div>}

      <div className="flex gap-2 pt-2">
        <button disabled={cur.s <= 1} className="flex-1 border rounded-lg py-2.5 font-semibold disabled:opacity-40"
          onClick={() => openAyah(cur.s - 1, 1)}>
          ‹ আগের সূরা
        </button>
        <button disabled={cur.s >= 114} className="flex-1 border rounded-lg py-2.5 font-semibold disabled:opacity-40"
          onClick={() => openAyah(cur.s + 1, 1)}>
          পরের সূরা ›
        </button>
      </div>
      {sheets}
    </div>
  )
}
