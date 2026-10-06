import { useEffect, useState } from 'react'
import { DISTRICTS } from './districts'
import {
  DEFAULT_LOC, getLoc, setLoc, getAdj, setAdj, getAsr, setAsr, prayerTimes, PN,
  fmtClock, fmtLeft, hijri, HIJRI_BN, nextRamadan, districtLoc, bnDigits,
} from './prayer'
import type { Loc } from './prayer'
import {
  getCfg, saveCfg, startAlarms, stopAlarms, unlock, testRing, preloadAdhan, downloadIcs, setAdhanUrls,
} from './alarm'
import type { Cfg } from './alarm'
import { Qibla, Tasbih, Amol, Zakat } from './IslamicTools'

const input =
  'w-full border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-green-600'
const bn = (n: number) => bnDigits(String(n))

const TABS: [string, string][] = [
  ['salat', '🕌 নামাজ ও অ্যালার্ম'],
  ['roza', '🌙 রোজা'],
  ['qibla', '🧭 কিবলা'],
  ['tasbih', '📿 তসবিহ'],
  ['amol', '✅ আমল'],
  ['zakat', '💰 জাকাত'],
]

export default function Islamic({ supabase, settings, isAdmin }: any) {
  const [tab, setTab] = useState('salat')
  const [loc, setL] = useState<Loc>(getLoc())

  function change(l: Loc) {
    setL(l)
    setLoc(l)
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-green-700">🕌 সবার জন্য উন্মুক্ত · অফলাইনেও চলে</p>
        <h2 className="text-xl font-bold">ইসলামিক কর্নার</h2>
      </div>

      <LocBar loc={loc} onChange={change} />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={'px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ' +
              (tab === k ? 'bg-green-700 text-white' : 'bg-white border')}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'salat' && <Salat loc={loc} supabase={supabase} settings={settings} isAdmin={isAdmin} />}
      {tab === 'roza' && <Roza loc={loc} />}
      {tab === 'qibla' && <Qibla loc={loc} />}
      {tab === 'tasbih' && <Tasbih />}
      {tab === 'amol' && <Amol />}
      {tab === 'zakat' && <Zakat />}
    </div>
  )
}

function LocBar({ loc, onChange }: { loc: Loc; onChange: (l: Loc) => void }) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  function gps() {
    if (!navigator.geolocation) { setMsg('এই ফোনে লোকেশন সুবিধা নেই'); return }
    setBusy(true)
    setMsg('')
    navigator.geolocation.getCurrentPosition(
      p => {
        setBusy(false)
        onChange({
          name: 'আমার অবস্থান',
          lat: p.coords.latitude,
          lng: p.coords.longitude,
          tz: -new Date().getTimezoneOffset() / 60,
        })
      },
      () => { setBusy(false); setMsg('অবস্থান পাওয়া যায়নি, জেলা বাছাই করুন') },
      { timeout: 10000 }
    )
  }

  const inList = DISTRICTS.some(d => d[1] === loc.name)

  return (
    <div className="bg-white rounded-xl p-3 shadow-sm space-y-2">
      <div className="flex gap-2">
        <select className={input} value={inList ? loc.name : ''}
          onChange={e => e.target.value && onChange(districtLoc(e.target.value))}>
          {!inList && <option value="">{loc.name}</option>}
          {DISTRICTS.map(d => <option key={d[1]} value={d[1]}>{d[1]}</option>)}
        </select>
        <button className="border border-green-700 text-green-700 rounded-lg px-3 text-sm font-semibold whitespace-nowrap disabled:opacity-50"
          disabled={busy} onClick={gps}>
          {busy ? '...' : '📍 আমার অবস্থান'}
        </button>
      </div>
      {msg && <p className="text-xs text-red-600">{msg}</p>}
    </div>
  )
}

const ADJ_KEYS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']
const ITEMS: [string, string][] = [
  ['fajr', 'ফজর'], ['dhuhr', 'যোহর'], ['asr', 'আসর'], ['maghrib', 'মাগরিব'], ['isha', 'এশা'],
  ['sehri', 'সাহরি'], ['iftar', 'ইফতার'],
]

function Salat({ loc, supabase, settings, isAdmin }: any) {
  const [now, setNow] = useState(Date.now())
  const [off, setOff] = useState(0)
  const [cfg, setCfgS] = useState<Cfg>(getCfg())
  const [adj, setAdjS] = useState(getAdj())
  const [asr, setAsrS] = useState(getAsr())
  const [open, setOpen] = useState(false)
  const [msg, setMsg] = useState('')
  const [urls, setUrls] = useState<any>({})

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const adhanA = urls.adhan_url ?? settings?.adhan_url
  const adhanF = urls.adhan_fajr_url ?? settings?.adhan_fajr_url
  useEffect(() => { setAdhanUrls(adhanA ?? '', adhanF ?? '') }, [adhanA, adhanF])

  const date = new Date(now + off * 86400000)
  const t: any = prayerTimes(date, loc, asr, adj)
  const rows: [string, number][] = [
    ['fajr', t.fajr], ['sunrise', t.sunrise], ['dhuhr', t.dhuhr],
    ['asr', t.asr], ['maghrib', t.maghrib], ['isha', t.isha],
  ]
  const nextToday = rows.find(r => r[0] !== 'sunrise' && r[1] > now)
  const tomorrow: any = prayerTimes(new Date(now + 86400000), loc, asr, adj)
  const nextKey = nextToday ? nextToday[0] : 'fajr'
  const nextAt = nextToday ? nextToday[1] : tomorrow.fajr

  function bump(k: string, d: number) {
    const a = { ...adj, [k]: (adj[k] || 0) + d }
    setAdjS(a)
    setAdj(a)
  }
  function update(c: Cfg) {
    setCfgS(c)
    saveCfg(c)
    if (c.on) startAlarms()
  }
  async function toggleOn() {
    if (!cfg.on) {
      await unlock()
      try { await Notification.requestPermission() } catch {}
      const c = { ...cfg, on: true }
      setCfgS(c); saveCfg(c); startAlarms()
      preloadAdhan()
    } else {
      const c = { ...cfg, on: false }
      setCfgS(c); saveCfg(c); stopAlarms()
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl p-4 text-white space-y-1"
        style={{ background: 'linear-gradient(135deg,#16a34a,#0b3d2e)' }}>
        {off === 0 ? (
          <>
            <p className="text-xs opacity-80">পরের নামাজ</p>
            <p className="text-2xl font-bold">{PN[nextKey]} · {fmtClock(nextAt, loc.tz)}</p>
            <p className="text-sm">{fmtLeft(nextAt - now)} বাকি</p>
          </>
        ) : (
          <p className="text-sm">অন্য দিনের সময়সূচি দেখছেন</p>
        )}
      </div>

      <div className="bg-white rounded-xl p-3 shadow-sm space-y-2">
        <div className="flex justify-between items-center">
          <button className="px-3 py-1 border rounded-lg" onClick={() => setOff(off - 1)}>‹</button>
          <div className="text-center">
            <p className="font-semibold text-sm">
              {date.toLocaleDateString('bn-BD', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <p className="text-[11px] text-gray-400">
              {(() => { const h = hijri(date); return bnDigits(h.d + ' ') + HIJRI_BN[h.m - 1] + ' ' + bnDigits(String(h.y)) + ' হিজরি' })()}
            </p>
          </div>
          <button className="px-3 py-1 border rounded-lg" onClick={() => setOff(off + 1)}>›</button>
        </div>
        {off !== 0 && (
          <button className="text-xs text-green-700 underline" onClick={() => setOff(0)}>আজকে ফিরুন</button>
        )}
        {rows.map(([k, v]) => (
          <div key={k}
            className={'flex justify-between rounded-lg px-3 py-2 ' +
              (off === 0 && k === nextKey ? 'bg-green-50 font-bold' : '')}>
            <span>{PN[k]}</span>
            <span>{fmtClock(v, loc.tz)}</span>
          </div>
        ))}
        <p className="text-[11px] text-gray-400">
          সময় গাণিতিক হিসাবে (ফজর ও এশা ১৮°)। স্থানীয় মসজিদের সূচির সাথে মিলিয়ে নিন, দরকারে নিচে "সময় মিলান"।
        </p>
      </div>

      <div className="bg-white rounded-xl p-3 shadow-sm space-y-2">
        <button className="w-full flex justify-between items-center" onClick={() => setOpen(!open)}>
          <b className="text-sm">⚙️ সময় মিলান</b>
          <span className="text-gray-400">{open ? '▲' : '▼'}</span>
        </button>
        {open && (
          <div className="space-y-2">
            <div className="flex gap-2">
              {[[2, 'আসর: হানাফি'], [1, 'আসর: অন্যান্য']].map(([v, l]) => (
                <button key={v} onClick={() => { setAsrS(v as number); setAsr(v as number) }}
                  className={'flex-1 py-2 rounded-lg text-xs font-semibold ' +
                    (asr === v ? 'bg-green-700 text-white' : 'bg-white border')}>
                  {l}
                </button>
              ))}
            </div>
            {ADJ_KEYS.map(k => (
              <div key={k} className="flex items-center justify-between">
                <span className="text-sm">{PN[k]}</span>
                <div className="flex items-center gap-3">
                  <button className="w-8 h-8 border rounded-lg" onClick={() => bump(k, -1)}>−</button>
                  <span className="w-14 text-center text-sm">
                    {(adj[k] || 0) > 0 ? '+' : ''}{bn(adj[k] || 0)} মিনিট
                  </span>
                  <button className="w-8 h-8 border rounded-lg" onClick={() => bump(k, 1)}>+</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm space-y-3 border border-green-300">
        <h3 className="font-bold">🔔 আজান অ্যালার্ম</h3>

        <button onClick={toggleOn}
          className={'w-full rounded-lg py-3 font-bold text-white ' + (cfg.on ? 'bg-red-600' : 'bg-green-700')}>
          {cfg.on ? '🔕 অ্যালার্ম বন্ধ করুন' : '🔔 অ্যালার্ম চালু করুন'}
        </button>

        <div className="grid grid-cols-2 gap-2">
          {ITEMS.map(([k, l]) => (
            <label key={k} className="flex items-center gap-2 text-sm border rounded-lg px-3 py-2">
              <input type="checkbox" checked={!!cfg.items[k]}
                onChange={() => update({ ...cfg, items: { ...cfg.items, [k]: !cfg.items[k] } })} />
              {l}
            </label>
          ))}
        </div>

        {cfg.items.sehri && (
          <div className="flex items-center gap-2 text-sm">
            <span>সাহরির অ্যালার্ম ফজরের</span>
            <select className="border rounded-lg px-2 py-1" value={cfg.sehriBefore}
              onChange={e => update({ ...cfg, sehriBefore: Number(e.target.value) })}>
              {[10, 15, 20, 30, 45, 60].map(m => <option key={m} value={m}>{bn(m)}</option>)}
            </select>
            <span>মিনিট আগে</span>
          </div>
        )}

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={cfg.keepAwake}
            onChange={() => update({ ...cfg, keepAwake: !cfg.keepAwake })} />
          স্ক্রিন জাগিয়ে রাখুন (চার্জে রাখলে ভালো)
        </label>

        <div className="rounded-lg bg-gray-50 p-3 space-y-2 text-sm">
          <p>
            আজানের অডিও: {adhanA ? '✅ আছে' : '❌ এখনও আপলোড হয়নি (বিপ শব্দ বাজবে)'}
            {adhanF ? ' · ফজরের আলাদা আজান ✅' : ''}
          </p>
          <div className="flex gap-2 flex-wrap">
            <button className="border border-green-700 text-green-700 rounded-lg px-3 py-1.5 text-xs font-semibold"
              onClick={async () => {
                setMsg('ডাউনলোড হচ্ছে...')
                const ok = await preloadAdhan()
                setMsg(ok ? '✅ অফলাইনের জন্য সংরক্ষিত হয়েছে' : 'ডাউনলোড হয়নি (ইন্টারনেট বা অডিও ফাইল দেখুন)')
              }}>
              📥 অফলাইনের জন্য আজান সংরক্ষণ
            </button>
            <button className="border rounded-lg px-3 py-1.5 text-xs font-semibold"
              onClick={async () => { await unlock(); testRing() }}>
              ▶ আজান পরীক্ষা
            </button>
          </div>
          {msg && <p className="text-xs">{msg}</p>}
        </div>

        <button className="w-full border border-green-700 text-green-700 rounded-lg py-2 text-sm font-semibold"
          onClick={() => downloadIcs(cfg, 30)}>
          📅 ক্যালেন্ডারে ৩০ দিনের রিমাইন্ডার (.ics)
        </button>

        <div className="text-[11px] text-gray-500 space-y-1">
          <p>• অ্যালার্ম বাজবে যতক্ষণ অ্যাপটি খোলা থাকে, ইন্টারনেট ছাড়াও। ফোনের স্ক্রিন বন্ধ হলে বা অ্যাপ বন্ধ করলে অনেক ফোন এটা থামিয়ে দেয়।</p>
          <p>• অ্যাপ বন্ধ থাকলেও রিমাইন্ডার পেতে উপরের ক্যালেন্ডার ফাইলটি খুলে ফোনের Calendar-এ যোগ করুন (এতে আজান বাজে না, সাধারণ নোটিফিকেশন শব্দ হয়)।</p>
        </div>

        {isAdmin && (
          <AdhanUpload supabase={supabase} onSaved={(k: string, u: string) => setUrls((p: any) => ({ ...p, [k]: u }))} />
        )}
      </div>
    </div>
  )
}

function AdhanUpload({ supabase, onSaved }: any) {
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState('')

  async function up(kind: string, file?: File) {
    if (!file) return
    if (file.size > 15 * 1024 * 1024) { setMsg('ফাইল ১৫ MB-এর বেশি হতে পারবে না'); return }
    setBusy(kind)
    setMsg('')
    const ext = (file.name.split('.').pop() || 'mp3').toLowerCase()
    const path = `adhan/${kind}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('photos')
      .upload(path, file, { contentType: file.type || 'audio/mpeg' })
    if (error) { setBusy(''); setMsg('আপলোড ব্যর্থ: ' + error.message); return }
    const url = supabase.storage.from('photos').getPublicUrl(path).data.publicUrl
    const { error: e2 } = await supabase.from('settings').update({ [kind]: url }).eq('id', 1)
    setBusy('')
    if (e2) { setMsg('ব্যর্থ: ' + e2.message); return }
    setMsg('✅ আপলোড হয়েছে')
    onSaved(kind, url)
  }

  return (
    <div className="border-t pt-3 space-y-2">
      <p className="text-sm font-semibold">⚙️ আজানের অডিও আপলোড (অ্যাডমিন)</p>
      {[['adhan_url', 'সাধারণ আজান (MP3)'], ['adhan_fajr_url', 'ফজরের আজান (ঐচ্ছিক)']].map(([k, l]) => (
        <label key={k} className="block text-xs">
          <span className="text-gray-500">{l}</span>
          <input type="file" accept="audio/*" className="block w-full text-sm mt-1"
            disabled={busy === k} onChange={e => up(k, e.target.files?.[0])} />
          {busy === k && <span className="text-amber-600">আপলোড হচ্ছে...</span>}
        </label>
      ))}
      {msg && <p className="text-xs">{msg}</p>}
      <p className="text-[11px] text-gray-400">
        শুধু লাইসেন্স-অনুমোদিত ফাইল দিন। ফজর ও সাহরির অ্যালার্মে ফজরের আজান (থাকলে) বাজবে।
      </p>
    </div>
  )
}

function Roza({ loc }: { loc: Loc }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const adj = getAdj()
  const asr = getAsr()
  const today = new Date(now)
  const t = prayerTimes(today, loc, asr, adj)
  const tom = prayerTimes(new Date(now + 86400000), loc, asr, adj)
  const h = hijri(today)

  let label = 'সাহরি শেষ হতে'
  let at = t.fajr
  if (now >= t.fajr && now < t.maghrib) { label = 'ইফতারের বাকি'; at = t.maghrib }
  else if (now >= t.maghrib) { label = 'পরের সাহরি শেষ হতে'; at = tom.fajr }

  const dow = today.getDay()
  const nafl: string[] = []
  if (dow === 1 || dow === 4) nafl.push('আজ ' + (dow === 1 ? 'সোমবার' : 'বৃহস্পতিবার') + ' (নফল রোজার দিন)')
  if ([13, 14, 15].includes(h.d) && h.m !== 12 && h.m !== 9) nafl.push('আজ আইয়ামে বীজের রোজার দিন (আনুমানিক)')

  const start = nextRamadan(today)
  const days = start ? Array.from({ length: 30 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)) : []
  const inRamadan = h.m === 9
  const daysTo = start ? Math.ceil((start.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / 86400000) : 0

  return (
    <div className="space-y-3">
      <div className="rounded-2xl p-4 text-white space-y-1"
        style={{ background: 'linear-gradient(135deg,#0f766e,#064e3b)' }}>
        <p className="text-xs opacity-80">{label}</p>
        <p className="text-2xl font-bold">{fmtLeft(at - now)}</p>
        <p className="text-sm">
          সাহরি শেষ: <b>{fmtClock(t.fajr, loc.tz)}</b> · ইফতার: <b>{fmtClock(t.maghrib, loc.tz)}</b>
        </p>
      </div>

      <div className="bg-white rounded-xl p-3 shadow-sm space-y-1 text-sm">
        <p>
          আজকের হিজরি তারিখ: <b>{bnDigits(h.d + ' ') + HIJRI_BN[h.m - 1] + ' ' + bnDigits(String(h.y))}</b>
        </p>
        {nafl.length === 0 && <p className="text-gray-500">আজ বিশেষ নফল রোজার দিন নয়।</p>}
        {nafl.map(n => <p key={n} className="text-green-700">🌙 {n}</p>)}
        <p className="text-[11px] text-gray-400">
          হিজরি তারিখ গাণিতিক হিসাবে, চাঁদ দেখার ওপর ১ দিন আগে-পিছে হতে পারে।
        </p>
      </div>

      {start && (
        <div className="bg-white rounded-xl p-3 shadow-sm space-y-2">
          <h3 className="font-bold text-sm">📅 রমজানের সময়সূচি (আনুমানিক)</h3>
          {!inRamadan && (
            <p className="text-xs text-gray-600">
              রমজান শুরু প্রায় {start.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}, আর {bn(daysTo)} দিন বাকি
            </p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 text-left">
                  <th className="py-1">রোজা</th><th>তারিখ</th><th>সাহরি শেষ</th><th>ইফতার</th>
                </tr>
              </thead>
              <tbody>
                {days.map((d, i) => {
                  const p: any = prayerTimes(d, loc, asr, adj)
                  const isToday = d.toDateString() === today.toDateString()
                  return (
                    <tr key={i} className={'border-t ' + (isToday ? 'bg-green-50 font-semibold' : '')}>
                      <td className="py-1">{bn(i + 1)}</td>
                      <td>{d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })}</td>
                      <td>{fmtClock(p.fajr, loc.tz)}</td>
                      <td>{fmtClock(p.maghrib, loc.tz)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
