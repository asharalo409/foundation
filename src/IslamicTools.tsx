import { useEffect, useState } from 'react'
import { qiblaBearing, bnDigits } from './prayer'
import type { Loc } from './prayer'

const input =
  'w-full border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-green-600'
const bn = (n: number) => bnDigits(String(n))

const load = <T,>(k: string, d: T): T => {
  try {
    const v = localStorage.getItem(k)
    return v ? JSON.parse(v) : d
  } catch { return d }
}
const save = (k: string, v: any) => {
  try { localStorage.setItem(k, JSON.stringify(v)) } catch {}
}

export function Qibla({ loc }: { loc: Loc }) {
  const bearing = qiblaBearing(loc.lat, loc.lng)
  const [on, setOn] = useState(false)
  const [heading, setHeading] = useState<number | null>(null)
  const [msg, setMsg] = useState('')

  async function start() {
    try {
      const DOE: any = (window as any).DeviceOrientationEvent
      if (DOE && typeof DOE.requestPermission === 'function') {
        const r = await DOE.requestPermission()
        if (r !== 'granted') { setMsg('সেন্সরের অনুমতি পাওয়া যায়নি'); return }
      }
      setOn(true)
      setMsg('ফোনটি সমতল রেখে ধীরে ঘোরান। সেন্সর না পেলে শুধু ডিগ্রি দেখাবে।')
    } catch { setMsg('কম্পাস চালু করা যায়নি') }
  }

  useEffect(() => {
    if (!on) return
    const h = (e: any) => {
      let v: number | null = null
      if (typeof e.webkitCompassHeading === 'number') v = e.webkitCompassHeading
      else if (e.alpha != null && (e.absolute || e.type === 'deviceorientationabsolute')) v = (360 - e.alpha) % 360
      if (v != null) setHeading(v)
    }
    window.addEventListener('deviceorientationabsolute', h, true)
    window.addEventListener('deviceorientation', h, true)
    return () => {
      window.removeEventListener('deviceorientationabsolute', h, true)
      window.removeEventListener('deviceorientation', h, true)
    }
  }, [on])

  const rot = bearing - (heading ?? 0)
  const aligned = heading != null && Math.abs(((rot + 540) % 360) - 180) < 6

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-3 text-center">
      <h3 className="font-bold">🧭 কিবলার দিক</h3>
      <p className="text-sm text-gray-600">
        {loc.name} থেকে কিবলা: উত্তর থেকে ঘড়ির কাঁটার দিকে <b>{bnDigits(bearing.toFixed(1))}°</b>
      </p>
      <svg viewBox="0 0 200 200" className="w-56 h-56 mx-auto">
        <circle cx="100" cy="100" r="94" fill="none" stroke="#16a34a" strokeWidth="3" />
        <text x="100" y="22" textAnchor="middle" fontSize="14" fontWeight="700" fill="#16a34a">N</text>
        <g transform={`rotate(${rot} 100 100)`}>
          <polygon points="100,30 88,100 112,100" fill={aligned ? '#16a34a' : '#f59e0b'} />
          <rect x="94" y="100" width="12" height="40" rx="3" fill="#94a3b8" />
          <text x="100" y="24" textAnchor="middle" fontSize="16">🕋</text>
        </g>
        <circle cx="100" cy="100" r="6" fill="#0f172a" />
      </svg>
      {heading != null && (
        <p className={'text-sm font-semibold ' + (aligned ? 'text-green-700' : 'text-gray-500')}>
          {aligned ? '✅ আপনি কিবলামুখী' : 'তীর যেদিকে, সেদিকে ঘুরুন'}
        </p>
      )}
      {!on && (
        <button className="bg-green-700 text-white font-semibold rounded-lg px-5 py-2" onClick={start}>
          🧭 কম্পাস চালু করুন
        </button>
      )}
      {msg && <p className="text-xs text-gray-500">{msg}</p>}
      <p className="text-[11px] text-gray-400">
        কম্পাসের সেন্সর ধাতব জিনিসের কাছে ভুল দিতে পারে। নিশ্চিত হতে মসজিদের মেহরাব বা পরিচিত কিবলার সাথে মিলিয়ে নিন।
      </p>
    </div>
  )
}

const ZIKR: [string, string][] = [
  ['সুবহানাল্লাহ', 'سُبْحَانَ اللّٰهِ'],
  ['আলহামদুলিল্লাহ', 'الْحَمْدُ لِلّٰهِ'],
  ['আল্লাহু আকবার', 'اللّٰهُ أَكْبَرُ'],
  ['লা ইলাহা ইল্লাল্লাহ', 'لَا إِلٰهَ إِلَّا اللّٰهُ'],
  ['আস্তাগফিরুল্লাহ', 'أَسْتَغْفِرُ اللّٰهَ'],
  ['দরুদ শরীফ', ''],
]

export function Tasbih() {
  const [count, setCount] = useState<number>(() => load('tz-count', 0))
  const [rounds, setRounds] = useState<number>(() => load('tz-rounds', 0))
  const [total, setTotal] = useState<number>(() => load('tz-total', 0))
  const [target, setTarget] = useState<number>(() => load('tz-target', 33))
  const [zi, setZi] = useState<number>(() => load('tz-zikr', 0))

  function tap() {
    const n = count + 1
    const t = total + 1
    setTotal(t)
    save('tz-total', t)
    try { navigator.vibrate?.(15) } catch {}
    if (target > 0 && n >= target) {
      try { navigator.vibrate?.([200, 100, 200]) } catch {}
      setCount(0)
      save('tz-count', 0)
      setRounds(rounds + 1)
      save('tz-rounds', rounds + 1)
    } else {
      setCount(n)
      save('tz-count', n)
    }
  }
  function reset() {
    if (!confirm('গণনা শূন্য করবেন?')) return
    setCount(0); setRounds(0)
    save('tz-count', 0); save('tz-rounds', 0)
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-3 text-center">
      <h3 className="font-bold">📿 ডিজিটাল তসবিহ</h3>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {ZIKR.map(([n], i) => (
          <button key={n} onClick={() => { setZi(i); save('tz-zikr', i) }}
            className={'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ' +
              (zi === i ? 'bg-green-700 text-white' : 'bg-white border')}>
            {n}
          </button>
        ))}
      </div>
      {ZIKR[zi][1] && <p className="text-2xl" dir="rtl">{ZIKR[zi][1]}</p>}

      <button onClick={tap}
        className="w-48 h-48 rounded-full mx-auto flex flex-col items-center justify-center text-white select-none active:scale-95 transition"
        style={{ background: 'linear-gradient(135deg,#16a34a,#0b3d2e)', boxShadow: '0 10px 30px rgba(0,0,0,.25)' }}>
        <span className="text-6xl font-bold">{bn(count)}</span>
        <span className="text-xs opacity-80">{target > 0 ? '/ ' + bn(target) : 'অসীম'}</span>
      </button>

      <p className="text-sm text-gray-600">
        রাউন্ড: <b>{bn(rounds)}</b> · মোট: <b>{bn(total)}</b>
      </p>

      <div className="flex gap-2 justify-center items-center">
        {[33, 99, 100, 0].map(n => (
          <button key={n} onClick={() => { setTarget(n); save('tz-target', n) }}
            className={'px-3 py-1 rounded-lg text-sm font-semibold ' +
              (target === n ? 'bg-green-700 text-white' : 'bg-white border')}>
            {n === 0 ? 'অসীম' : bn(n)}
          </button>
        ))}
        <button className="px-3 py-1 rounded-lg text-sm border text-red-600" onClick={reset}>রিসেট</button>
      </div>
    </div>
  )
}

const DEF_ITEMS = [
  'ফজর নামাজ', 'যোহর নামাজ', 'আসর নামাজ', 'মাগরিব নামাজ', 'এশা নামাজ',
  'কুরআন তিলাওয়াত', 'জিকির/তসবিহ', 'দরুদ শরীফ', 'সদকা/দান', 'সকাল-সন্ধ্যার দোয়া', 'মাতা-পিতার খেদমত',
]
const dayKey = (off = 0) => new Date(Date.now() - off * 86400000).toLocaleDateString('en-CA')

export function Amol() {
  const [items, setItems] = useState<string[]>(() => load('amol-items', DEF_ITEMS))
  const [done, setDone] = useState<string[]>(() => load('amol-' + dayKey(), []))
  const [nw, setNw] = useState('')

  function toggle(it: string) {
    const n = done.includes(it) ? done.filter(x => x !== it) : [...done, it]
    setDone(n)
    save('amol-' + dayKey(), n)
  }
  function addItem() {
    const v = nw.trim()
    if (!v || items.includes(v)) return
    const n = [...items, v]
    setItems(n); save('amol-items', n); setNw('')
  }
  function removeItem(it: string) {
    if (!confirm('তালিকা থেকে সরাবেন?')) return
    const n = items.filter(x => x !== it)
    setItems(n); save('amol-items', n)
  }

  const pct = (off: number) => {
    const d: string[] = load('amol-' + dayKey(off), [])
    return items.length ? d.filter(x => items.includes(x)).length / items.length : 0
  }
  const week = [6, 5, 4, 3, 2, 1, 0].map(o => ({ o, p: pct(o) }))
  let streak = 0
  for (let o = pct(0) >= 0.5 ? 0 : 1; o < 365; o++) {
    if (pct(o) >= 0.5) streak++
    else break
  }
  const todayDone = items.filter(i => done.includes(i)).length

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
        <h3 className="font-bold">✅ আজকের আমল</h3>
        <p className="text-sm text-gray-600">
          আজ: <b>{bn(todayDone)}/{bn(items.length)}</b> · টানা ধারা: <b>🔥 {bn(streak)} দিন</b>
        </p>
        <div className="flex gap-1 items-end h-14">
          {week.map(({ o, p }) => (
            <div key={o} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded bg-gray-200 h-10 flex items-end overflow-hidden">
                <div className="w-full bg-green-600" style={{ height: Math.round(p * 100) + '%' }} />
              </div>
              <span className="text-[9px] text-gray-400">{o === 0 ? 'আজ' : bn(o) + 'দি'}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-400">অর্ধেকের বেশি আমল করা দিন ধারায় গোনা হয়। তথ্য শুধু আপনার ফোনে থাকে।</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        {items.map(it => (
          <div key={it} className="flex items-center gap-3 px-4 py-3 border-t first:border-t-0">
            <button onClick={() => toggle(it)}
              className={'w-7 h-7 rounded-lg border-2 flex items-center justify-center text-white shrink-0 ' +
                (done.includes(it) ? 'bg-green-600 border-green-600' : 'border-gray-300')}>
              {done.includes(it) ? '✓' : ''}
            </button>
            <span className={'flex-1 text-sm ' + (done.includes(it) ? 'line-through text-gray-400' : '')}>{it}</span>
            <button className="text-gray-300" onClick={() => removeItem(it)}>✕</button>
          </div>
        ))}
        <div className="flex gap-2 p-3 border-t">
          <input className={input} placeholder="নিজের আমল যোগ করুন..." value={nw}
            onChange={e => setNw(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addItem() }} />
          <button className="bg-green-700 text-white rounded-lg px-4 font-semibold" onClick={addItem}>+</button>
        </div>
      </div>
    </div>
  )
}

export function Zakat() {
  const [f, setF] = useState<Record<string, string>>(() => load('zakat-f', {}))
  const [basis, setBasis] = useState<string>(() => load('zakat-basis', 'silver'))
  const set = (k: string, v: string) => {
    const n = { ...f, [k]: v }
    setF(n)
    save('zakat-f', n)
  }
  const n = (k: string) => Number(f[k]) || 0

  const gp = n('gp')
  const sp = n('sp')
  const wealth = n('cash') + n('gold') * gp + n('silver') * sp + n('trade') + n('other')
  const net = Math.max(0, wealth - n('debt'))
  const nisab = basis === 'silver' ? 52.5 * sp : 7.5 * gp
  const ready = nisab > 0
  const due = ready && net >= nisab ? net * 0.025 : 0
  const money = (x: number) => '৳' + bnDigits(Math.round(x).toLocaleString('en-US'))

  const fields: [string, string][] = [
    ['cash', 'নগদ টাকা ও ব্যাংকে জমা'],
    ['gold', 'সোনা (ভরি)'],
    ['silver', 'রূপা (ভরি)'],
    ['trade', 'ব্যবসার পণ্যের মূল্য'],
    ['other', 'অন্যান্য সম্পদ (পাওনা ইত্যাদি)'],
    ['debt', 'দেনা (বিয়োগ হবে)'],
  ]

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
      <h3 className="font-bold">💰 জাকাত ক্যালকুলেটর</h3>
      <p className="text-xs text-gray-500">
        এক ভরি = ১১.৬৬৪ গ্রাম। সোনার নিসাব ৭.৫ ভরি, রূপার নিসাব ৫২.৫ ভরি।
      </p>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-500">১ ভরি সোনার বর্তমান দাম (৳)</label>
          <input className={input} type="number" value={f.gp || ''} onChange={e => set('gp', e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-gray-500">১ ভরি রূপার বর্তমান দাম (৳)</label>
          <input className={input} type="number" value={f.sp || ''} onChange={e => set('sp', e.target.value)} />
        </div>
      </div>

      <div className="flex gap-2">
        {[['silver', 'রূপার নিসাব ধরে'], ['gold', 'সোনার নিসাব ধরে']].map(([k, l]) => (
          <button key={k} onClick={() => { setBasis(k); save('zakat-basis', k) }}
            className={'flex-1 py-2 rounded-lg text-sm font-semibold ' +
              (basis === k ? 'bg-green-700 text-white' : 'bg-white border')}>
            {l}
          </button>
        ))}
      </div>

      {fields.map(([k, l]) => (
        <div key={k}>
          <label className="text-xs text-gray-500">{l}</label>
          <input className={input} type="number" value={f[k] || ''} onChange={e => set(k, e.target.value)} />
        </div>
      ))}

      <div className="rounded-xl bg-green-50 p-3 space-y-1 text-sm">
        <div className="flex justify-between"><span>মোট সম্পদ</span><b>{money(wealth)}</b></div>
        <div className="flex justify-between"><span>দেনা বাদে</span><b>{money(net)}</b></div>
        <div className="flex justify-between">
          <span>নিসাব ({basis === 'silver' ? 'রূপা' : 'সোনা'})</span>
          <b>{ready ? money(nisab) : 'দাম দিন'}</b>
        </div>
        <div className="flex justify-between border-t pt-1 text-base">
          <span>প্রদেয় জাকাত (২.৫%)</span>
          <b className="text-green-700">{ready ? money(due) : '-'}</b>
        </div>
        {ready && due === 0 && <p className="text-xs text-gray-500">সম্পদ নিসাবের কম, তাই জাকাত ফরজ নয়।</p>}
      </div>

      <p className="text-[11px] text-gray-400">
        এটি আনুমানিক হিসাব। সম্পদের বছর পূর্তি ও জটিল ক্ষেত্রে (শেয়ার, কৃষিজ ফসল ইত্যাদি) আলেমের পরামর্শ নিন।
        জাকাত ফাউন্ডেশনে দিতে চাইলে উপরের 💚 দান করুন বাটন ব্যবহার করুন।
      </p>
    </div>
  )
}
