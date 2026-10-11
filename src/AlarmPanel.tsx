import { useEffect, useState } from 'react'
import { getAdj, setAdj, getAsr, setAsr, PN, bnDigits } from './prayer'
import {
  getCfg, saveCfg, startAlarms, stopAlarms, unlock, testRing, preloadAdhan, downloadIcs, setAdhanUrls,
} from './alarm'
import type { Cfg } from './alarm'

const bn = (n: number) => bnDigits(String(n))
const ADJ_KEYS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']
const ITEMS: [string, string][] = [
  ['fajr', 'ফজর'], ['dhuhr', 'যোহর'], ['asr', 'আসর'], ['maghrib', 'মাগরিব'], ['isha', 'এশা'],
  ['sehri', 'সাহরি'], ['iftar', 'ইফতার'],
]

export default function AlarmPanel({ supabase, settings, isAdmin, onChange }: any) {
  const [cfg, setCfgS] = useState<Cfg>(getCfg())
  const [adj, setAdjS] = useState(getAdj())
  const [asr, setAsrS] = useState(getAsr())
  const [msg, setMsg] = useState('')
  const [urls, setUrls] = useState<any>({})

  const adhanA = urls.adhan_url ?? settings?.adhan_url
  const adhanF = urls.adhan_fajr_url ?? settings?.adhan_fajr_url
  useEffect(() => { setAdhanUrls(adhanA ?? '', adhanF ?? '') }, [adhanA, adhanF])

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
      setCfgS(c); saveCfg(c); startAlarms()
      preloadAdhan()
    } else {
      const c = { ...cfg, on: false }
      setCfgS(c); saveCfg(c); stopAlarms()
    }
    onChange?.()
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <button onClick={toggleOn}
          className={'w-full rounded-lg py-3 font-bold text-white ' + (cfg.on ? 'bg-red-600' : 'bg-green-700')}>
          {cfg.on ? 'অ্যালার্ম বন্ধ করুন' : 'অ্যালার্ম চালু করুন'}
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
            <select className="border rounded-lg px-2 py-1 bg-white" value={cfg.sehriBefore}
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
      </div>

      <div className="border-t pt-3 space-y-2">
        <p className="font-bold text-sm">সময় মিলান</p>
        <p className="text-[11px] text-gray-500">স্থানীয় মসজিদের সূচির সাথে ফারাক থাকলে মিনিট কমান বা বাড়ান।</p>
        <div className="flex gap-2">
          {[[2, 'আসর: হানাফি'], [1, 'আসর: অন্যান্য']].map(([v, l]) => (
            <button key={v} onClick={() => pickAsr(v as number)}
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
              <span className="w-20 text-center text-sm">
                {(adj[k] || 0) > 0 ? '+' : ''}{bn(adj[k] || 0)} মিনিট
              </span>
              <button className="w-8 h-8 border rounded-lg" onClick={() => bump(k, 1)}>+</button>
            </div>
          </div>
        ))}
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
