
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { IIco } from './IslamIcons'
import { hm } from './salat'
import { getAdj, setAdj, getAsr, setAsr, getLoc, PN, bnDigits } from './prayer'
import {
  getCfg, saveCfg, startAlarms, stopAlarms, unlock, preloadAdhan, downloadIcs, setAdhanUrls,
  eventBase, offOf, previewSound,
} from './alarm'
import type { Cfg, Sound } from './alarm'

const bn = (n: number) => bnDigits(String(n))

const PRAYERS: [string, string, string][] = [
  ['fajr', 'p-fajr', 'ফজর'],
  ['dhuhr', 'p-dhuhr', 'যোহর'],
  ['asr', 'p-asr', 'আসর'],
  ['maghrib', 'p-maghrib', 'মাগরিব'],
  ['isha', 'p-isha', 'ইশা'],
  ['sehri', 'roza', 'সাহরি শেষ'],
  ['iftar', 'roza', 'ইফতার'],
]
const PRE: [string, string, string][] = [
  ['pre_fajr', 'p-fajr', 'ফজরের আগে'],
  ['pre_dhuhr', 'p-dhuhr', 'যোহরের আগে'],
  ['pre_asr', 'p-asr', 'আসরের আগে'],
  ['pre_maghrib', 'p-maghrib', 'মাগরিবের আগে'],
  ['pre_isha', 'p-isha', 'ইশার আগে'],
]
const NAFL: [string, string, string][] = [
  ['duha', 'p-dhuhr', 'দুহা'],
  ['tahajjud', 'p-isha', 'তাহাজ্জুদ (রাতের শেষ ১/৩)'],
]
const FORB: [string, string, string][] = [
  ['f_morning', 'ban', 'সকাল (সূর্যোদয়)'],
  ['f_noon', 'ban', 'দুপুর'],
  ['f_evening', 'ban', 'সন্ধ্যা (সূর্যাস্তের আগে)'],
]
const SOUNDS: [Sound, string][] = [
  ['silent', 'নিঃশব্দ (পর্দায় দেখাবে ও ফোন কাঁপবে)'],
  ['beep', 'বিপ'],
  ['adhan', 'আজান'],
  ['notify', 'নোটিফিকেশন'],
]
const ADJ_KEYS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']

const Bell = ({ off, size = 24 }: { off?: boolean; size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={off ? 'none' : 'currentColor'} stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z" />
    <path d="M10 20.5a2 2 0 0 0 4 0" />
    {off && <path d="M4 4l16 16" />}
  </svg>
)

const Ban = () => (
  <svg viewBox="0 0 24 24" width={26} height={26} fill="none" stroke="currentColor" strokeWidth="1.9"
    strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="8.5" />
    <path d="m6 6 12 12" />
  </svg>
)

function Switch({ on, onClick, accent }: { on: boolean; onClick: () => void; accent: string }) {
  return (
    <button onClick={onClick} aria-label="toggle" className="w-12 h-7 rounded-full p-0.5 flex shrink-0"
      style={{ background: on ? accent : '#cbd5e1', justifyContent: on ? 'flex-end' : 'flex-start' }}>
      <span className="w-6 h-6 rounded-full bg-white" />
    </button>
  )
}

function Card({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl p-4 space-y-2" style={{ background: 'rgba(100,116,139,.09)' }}>
      <p className="font-bold">{title}</p>
      {note && <p className="text-[11px] text-gray-500">{note}</p>}
      {children}
    </div>
  )
}

function Row({
  k, icon, label, cfg, update, base, tz, accent,
}: {
  k: string
  icon: string
  label: string
  cfg: Cfg
  update: (c: Cfg) => void
  base: number
  tz: number
  accent: string
}) {
  const [open, setOpen] = useState(false)
  const on = !!cfg.items[k]
  const off = offOf(cfg, k)
  const summary = off === 0 ? 'ঠিক সময়ে' : off < 0 ? bn(-off) + ' মিনিট আগে' : bn(off) + ' মিনিট পরে'

  return (
    <div className="border-b last:border-b-0 border-gray-300/50">
      <div className="flex items-center gap-3 py-3">
        <button className="flex items-center gap-3 flex-1 min-w-0 text-left" onClick={() => setOpen(!open)}>
          <span style={{ color: on ? accent : '#94a3b8' }}>
            {icon === 'ban' ? <Ban /> : <IIco name={icon} size={26} />}
          </span>
          <span className="font-semibold flex-1 min-w-0">{label}</span>
          <span className="text-xs text-gray-500 whitespace-nowrap">{summary}</span>
        </button>
        <button aria-label="alarm" style={{ color: on ? accent : '#94a3b8' }}
          onClick={() => update({ ...cfg, items: { ...cfg.items, [k]: !on } })}>
          <Bell off={!on} />
        </button>
      </div>

      {open && (
        <div className="pb-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">অ্যালার্ম বাজবে</span>
            <span className="rounded-full px-3 py-1 text-xs font-semibold flex items-center gap-1.5"
              style={{ background: accent + '22', color: accent }}>
              <Bell size={14} /> {hm(base + off * 60000, tz)}
            </span>
          </div>
          <input type="range" min={-30} max={30} value={off} className="w-full"
            onChange={e => update({ ...cfg, off: { ...cfg.off, [k]: Number(e.target.value) } })} />
          <div className="flex justify-between text-[11px] text-gray-500">
            <span>−৩০ মিনিট</span>
            <b style={{ color: accent }}>{summary}</b>
            <span>+৩০ মিনিট</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AlarmPanel({ supabase, settings, isAdmin, onChange }: any) {
  const accent = settings?.theme_color || '#087a43'
  const [cfg, setCfgS] = useState<Cfg>(getCfg())
  const [adj, setAdjS] = useState(getAdj())
  const [asr, setAsrS] = useState(getAsr())
  const [showAdj, setShowAdj] = useState(false)
  const [msg, setMsg] = useState('')
  const [urls, setUrls] = useState<any>({})

  const base = eventBase(new Date())
  const tz = getLoc().tz

  const adhanA = urls.adhan_url ?? settings?.adhan_url
  const adhanF = urls.adhan_fajr_url ?? settings?.adhan_fajr_url
  useEffect(() => { setAdhanUrls(adhanA ?? '', adhanF ?? '') }, [adhanA, adhanF])

  function update(c: Cfg) {
    setCfgS(c)
    saveCfg(c)
    if (c.on) startAlarms()
    onChange?.()
  }

  async function toggleOn() {
    if (!cfg.on) {
      await unlock()
      try { await Notification.requestPermission() } catch {}
      const c = { ...cfg, on: true }
      setCfgS(c)
      saveCfg(c)
      startAlarms()
      preloadAdhan()
    } else {
      const c = { ...cfg, on: false }
      setCfgS(c)
      saveCfg(c)
      stopAlarms()
    }
    onChange?.()
  }

  function bump(k: string, d: number) {
    const a = { ...adj, [k]: (adj[k] || 0) + d }
    setAdjS(a)
    setAdj(a)
    onChange?.()
  }
  function pickAsr(v: number) {
    setAsrS(v)
    setAsr(v)
    onChange?.()
  }

  const rowProps = { cfg, update, tz, accent }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: accent + '14' }}>
        <span className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
          style={{ background: accent + '22', color: accent }}>
          <IIco name="alarm" size={26} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-bold">নামাজের অ্যালার্ম</p>
          <p className="text-xs text-gray-500">{cfg.on ? 'অ্যালার্ম চালু' : 'অ্যালার্ম বন্ধ'}</p>
        </div>
        <Switch on={cfg.on} onClick={toggleOn} accent={accent} />
      </div>

      <Card title="ওয়াক্ত অনুযায়ী অ্যালার্ম"
        note="নামে ট্যাপ করে কত মিনিট আগে বা পরে বাজবে ঠিক করুন, ডানের ঘণ্টায় চালু-বন্ধ।">
        {PRAYERS.map(([k, icon, label]) => (
          <Row key={k} k={k} icon={icon} label={label} base={base[k]} {...rowProps} />
        ))}
      </Card>

      <Card title="অ্যালার্মের শব্দ"
        note="আজান শুধু ফরজ ওয়াক্ত, সাহরি ও ইফতারে বাজে। নফল ও নিষিদ্ধ সময়ে সবসময় বিপ।">
        {SOUNDS.map(([s, label]) => {
          const on = cfg.sound === s
          return (
            <div key={s} className="flex items-center gap-3 rounded-xl px-2 py-2.5"
              style={on ? { background: accent + '1a' } : undefined}>
              <button className="flex items-center gap-3 flex-1 text-left"
                onClick={() => update({ ...cfg, sound: s })}>
                <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0"
                  style={on ? { background: accent, borderColor: accent, color: '#fff' } : { borderColor: '#cbd5e1' }}>
                  {on && <IIco name="check" size={14} stroke={3} />}
                </span>
                <span className="text-sm font-semibold">{label}</span>
              </button>
              <button aria-label="preview" onClick={() => previewSound(s)}
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ background: accent + '22', color: accent }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                  <path d="M8 5.5v13l11-6.5z" />
                </svg>
              </button>
            </div>
          )
        })}
        <div className="text-xs text-gray-600 pt-1">
          আজানের অডিও: {adhanA ? 'আছে' : 'আপলোড হয়নি (বিপ বাজবে)'}
          {adhanF ? ' · ফজরের আলাদা আজান' : ''}
        </div>
        <button className="border rounded-lg px-3 py-1.5 text-xs font-semibold" style={{ color: accent, borderColor: accent }}
          onClick={async () => {
            setMsg('ডাউনলোড হচ্ছে...')
            const ok = await preloadAdhan()
            setMsg(ok ? 'অফলাইনের জন্য সংরক্ষিত হয়েছে' : 'ডাউনলোড হয়নি (ইন্টারনেট বা অডিও ফাইল দেখুন)')
          }}>
          অফলাইনের জন্য আজান সংরক্ষণ
        </button>
        {msg && <p className="text-xs">{msg}</p>}
      </Card>

      <Card title="নামাজের আগে মনে করান" note="নামাজ শুরুর কিছু আগে সতর্ক করবে, যাতে ওযু ও প্রস্তুতির সময় পান। স্লাইডার দিয়ে কত মিনিট আগে চান ঠিক করুন, শুরুতে ১০ মিনিট।">
        {PRE.map(([k, icon, label]) => (
          <Row key={k} k={k} icon={icon} label={label} base={base[k]} {...rowProps} />
        ))}
      </Card>

      <Card title="নফল নামাজ">
        {NAFL.map(([k, icon, label]) => (
          <Row key={k} k={k} icon={icon} label={label} base={base[k]} {...rowProps} />
        ))}
      </Card>

      <Card title="নিষিদ্ধ সময়" note="নিষিদ্ধ সময় শুরুর সতর্কতা। আনুমানিক হিসাব, মাসআলার জন্য আলেমের কাছে নিশ্চিত হোন।">
        {FORB.map(([k, icon, label]) => (
          <Row key={k} k={k} icon={icon} label={label} base={base[k]} {...rowProps} />
        ))}
      </Card>

      <Card title="আরও">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={cfg.keepAwake}
            onChange={() => update({ ...cfg, keepAwake: !cfg.keepAwake })} />
          স্ক্রিন জাগিয়ে রাখুন (চার্জে রাখলে ভালো)
        </label>
        <button className="w-full border rounded-lg py-2 text-sm font-semibold" style={{ color: accent, borderColor: accent }}
          onClick={() => downloadIcs(cfg, 30)}>
          ক্যালেন্ডারে ৩০ দিনের রিমাইন্ডার (.ics)
        </button>
        <div className="text-[11px] text-gray-500 space-y-1">
          <p>• অ্যালার্ম বাজবে যতক্ষণ অ্যাপটি খোলা থাকে, ইন্টারনেট ছাড়াও। ফোনের স্ক্রিন বন্ধ হলে বা অ্যাপ বন্ধ করলে অনেক ফোন এটা থামিয়ে দেয়।</p>
          <p>• অ্যাপ বন্ধ থাকলেও রিমাইন্ডার পেতে উপরের ক্যালেন্ডার ফাইলটি খুলে ফোনের Calendar-এ যোগ করুন (এতে আজান বাজে না, সাধারণ নোটিফিকেশন শব্দ হয়)।</p>
        </div>
      </Card>

      <div className="rounded-2xl p-4 space-y-2" style={{ background: 'rgba(100,116,139,.09)' }}>
        <button className="w-full flex justify-between items-center" onClick={() => setShowAdj(!showAdj)}>
          <b>গণনা মেলান</b>
          <span className="text-gray-400">{showAdj ? '▲' : '▼'}</span>
        </button>
        <p className="text-[11px] text-gray-500">
          স্থানীয় মসজিদের সূচির সাথে ফারাক থাকলে নামাজের সময়ই এক-দুই মিনিট সরান। এতে সব সময়সূচি ও অ্যালার্ম একসাথে বদলায়।
        </p>
        {showAdj && (
          <div className="space-y-2">
            <div className="flex gap-2">
              {[[2, 'আসর: হানাফি'], [1, 'আসর: অন্যান্য']].map(([v, l]) => (
                <button key={v} onClick={() => pickAsr(v as number)}
                  className={'flex-1 py-2 rounded-lg text-xs font-semibold ' + (asr === v ? 'text-white' : 'bg-white border')}
                  style={asr === v ? { background: accent } : undefined}>
                  {l}
                </button>
              ))}
            </div>
            {ADJ_KEYS.map(k => (
              <div key={k} className="flex items-center justify-between">
                <span className="text-sm">{PN[k]}</span>
                <div className="flex items-center gap-3">
                  <button className="w-8 h-8 border rounded-lg bg-white" onClick={() => bump(k, -1)}>−</button>
                  <span className="w-20 text-center text-sm">
                    {(adj[k] || 0) > 0 ? '+' : ''}{bn(adj[k] || 0)} মিনিট
                  </span>
                  <button className="w-8 h-8 border rounded-lg bg-white" onClick={() => bump(k, 1)}>+</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isAdmin && (
        <AdhanUpload supabase={supabase}
          onSaved={(k: string, u: string) => setUrls((p: any) => ({ ...p, [k]: u }))} />
      )}
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
    setMsg('আপলোড হয়েছে')
    onSaved(kind, url)
  }

  return (
    <div className="rounded-2xl p-4 space-y-2 border border-amber-300">
      <p className="text-sm font-semibold">আজানের অডিও আপলোড (অ্যাডমিন)</p>
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
