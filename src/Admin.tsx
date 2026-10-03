import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import PhotoPicker from './Upload'
import { fmtDT } from './time'

const ROLES: Record<string, string> = {
  admin: 'অ্যাডমিন',
  president: 'সভাপতি',
  general_secretary: 'সাধারণ সম্পাদক',
  cashier: 'কোষাধ্যক্ষ',
  health: 'স্বাস্থ্য ও রক্তদান সমন্বয়ক',
  sports: 'ক্রীড়া ও সাংস্কৃতিক সম্পাদক',
  publicity: 'প্রচার ও প্রকাশনা সম্পাদক',
  member: 'সদস্য',
}

const input =
  'w-full border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-green-600'
const btn =
  'bg-green-700 text-white font-semibold rounded-lg px-4 py-2 active:opacity-80 disabled:opacity-50'

const bnd = (s: string) => new Date(s).toLocaleDateString('bn-BD')
const bn = (n: number) => n.toLocaleString('bn-BD')

function genPass() {
  const c = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const a = new Uint32Array(10)
  crypto.getRandomValues(a)
  let s = ''
  a.forEach(n => { s += c[n % c.length] })
  return s
}

async function copy(s: string) {
  try { await navigator.clipboard.writeText(s); alert('কপি হয়েছে') }
  catch { window.prompt('কপি করুন:', s) }
}

async function createLogin(supabase: any, memberId: string, email: string, password: string) {
  await supabase.from('members').update({ email }).eq('id', memberId)

  const tmp = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
  )
  const { data, error } = await tmp.auth.signUp({ email, password })
  if (error) return { ok: false, msg: error.message }

  if (!data.user || (data.user.identities && data.user.identities.length === 0)) {
    const { data: linked, error: e2 } = await supabase.rpc('link_member_login', { p_member: memberId })
    if (!e2 && linked) return { ok: true, linked: true }
    return { ok: false, msg: 'এই ইমেইলে আগে থেকেই অ্যাকাউন্ট আছে, কিন্তু যুক্ত করা যায়নি' }
  }
  const { error: e3 } = await supabase.from('members')
    .update({ auth_user_id: data.user.id }).eq('id', memberId)
  if (e3) return { ok: false, msg: e3.message }
  return { ok: true, needConfirm: !data.session }
}

function CredCard({ cred, onClose }: any) {
  const text =
    `${cred.name}, আপনার সদস্য লগইন তৈরি হয়েছে।\nসাইট: ${window.location.origin}${window.location.pathname}\nইমেইল: ${cred.email}\nপাসওয়ার্ড: ${cred.pass}`
  return (
    <div className="bg-green-50 border border-green-400 rounded-xl p-4 space-y-2">
      <p className="font-bold text-sm">✅ লগইন তৈরি হয়েছে: {cred.name}</p>
      <p className="text-sm">ইমেইল: <b>{cred.email}</b></p>
      <p className="text-sm">পাসওয়ার্ড: <b>{cred.pass}</b></p>
      {cred.confirm && (
        <p className="text-xs text-amber-700">
          ⚠️ Supabase-এ "Confirm email" চালু আছে, তাই সদস্যকে আগে ইমেইলের লিংকে ক্লিক করতে হবে। এড়াতে ওটা বন্ধ করুন।
        </p>
      )}
      <p className="text-[11px] text-gray-500">এই পাসওয়ার্ড শুধু এখন একবারই দেখা যাবে। সদস্যকে পাঠিয়ে দিন।</p>
      <div className="flex gap-2">
        <button className={btn} onClick={() => copy(text)}>📋 বার্তা কপি করুন</button>
        <button className="border rounded-lg px-4" onClick={onClose}>বন্ধ</button>
      </div>
    </div>
  )
}

export default function Admin({ supabase }: { supabase: any }) {
  const [sec, setSec] = useState('apps')
  const secs = [['apps', 'আবেদন'], ['members', 'সদস্য'], ['features', 'ফিচার'], ['settings', 'সেটিংস']]
  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto">
        {secs.map(([k, l]) => (
          <button key={k} onClick={() => setSec(k)}
            className={'flex-1 py-2 px-3 rounded-lg text-sm font-semibold whitespace-nowrap ' +
              (sec === k ? 'bg-green-700 text-white' : 'bg-white border')}>
            {l}
          </button>
        ))}
      </div>
      {sec === 'apps' && <Apps supabase={supabase} />}
      {sec === 'members' && <Members supabase={supabase} />}
      {sec === 'features' && <Features supabase={supabase} />}
      {sec === 'settings' && <SettingsForm supabase={supabase} />}
    </div>
  )
}

function Apps({ supabase }: { supabase: any }) {
  const [list, setList] = useState<any[]>([])
  const [msg, setMsg] = useState('')
  const [ap, setAp] = useState<any>(null)
  const [cred, setCred] = useState<any>(null)
  const [busy, setBusy] = useState(false)

  async function load() {
    const { data } = await supabase.from('applications').select('*')
      .eq('status', 'pending').order('created_at', { ascending: false })
    setList(data || [])
  }
  useEffect(() => { load() }, [])

  function start(a: any) {
    setAp({ a, email: a.email || '', pass: genPass(), make: true })
    setMsg('')
  }

  async function approve() {
    const a = ap.a
    setBusy(true)
    const email = (ap.email || '').trim()
    const { data: m, error } = await supabase.from('members').insert({
      full_name: a.full_name, phone: a.phone, email: email || null,
      blood_group: a.blood_group, district: a.district, role: 'member',
    }).select().single()
    if (error) { setBusy(false); setMsg('ব্যর্থ: ' + error.message); return }
    await supabase.from('applications').update({ status: 'approved' }).eq('id', a.id)

    let note = '✅ সদস্য যুক্ত হয়েছে'
    if (ap.make && email) {
      const r: any = await createLogin(supabase, m.id, email, ap.pass)
      if (r.ok)
        setCred({
          name: a.full_name, email,
          pass: r.linked ? '(আগের পাসওয়ার্ডই চলবে)' : ap.pass,
          confirm: r.needConfirm,
        })
      else note = '⚠️ সদস্য যুক্ত হয়েছে, কিন্তু লগইন তৈরি হয়নি: ' + r.msg
    }
    setBusy(false)
    setAp(null)
    setMsg(note)
    load()
  }

  async function reject(a: any) {
    await supabase.from('applications').update({ status: 'rejected' }).eq('id', a.id)
    load()
  }

  return (
    <div className="space-y-3">
      {cred && <CredCard cred={cred} onClose={() => setCred(null)} />}
      {msg && <p className="text-sm text-center">{msg}</p>}
      {list.length === 0 && <p className="text-center text-gray-500 text-sm">কোনো নতুন আবেদন নেই</p>}
      {list.map(a => (
        <div key={a.id} className="bg-white rounded-xl p-4 shadow-sm space-y-1">
          <p className="font-bold">{a.full_name}</p>
          <p className="text-[11px] text-gray-400">🕒 আবেদনের সময়: {fmtDT(a.created_at)}</p>
          <p className="text-sm">📞 {a.phone}</p>
          {a.email && <p className="text-sm">✉️ {a.email}</p>}
          <p className="text-sm">🩸 {a.blood_group || '-'} · 📍 {a.district || '-'}</p>
          {a.message && <p className="text-sm text-gray-600">"{a.message}"</p>}

          {ap?.a.id === a.id ? (
            <div className="border-t pt-2 space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={ap.make}
                  onChange={e => setAp({ ...ap, make: e.target.checked })} />
                সদস্যের জন্য লগইন অ্যাকাউন্ট তৈরি করুন
              </label>
              {ap.make && (
                <>
                  <input className={input} type="email" placeholder="ইমেইল (লগইনের জন্য)" value={ap.email}
                    onChange={e => setAp({ ...ap, email: e.target.value })} />
                  <div className="flex gap-2">
                    <input className={input} value={ap.pass} onChange={e => setAp({ ...ap, pass: e.target.value })} />
                    <button className="border rounded-lg px-3 text-sm"
                      onClick={() => setAp({ ...ap, pass: genPass() })}>🔄</button>
                  </div>
                </>
              )}
              <div className="flex gap-2">
                <button className={btn} disabled={busy} onClick={approve}>
                  {busy ? 'অপেক্ষা করুন...' : 'অনুমোদন নিশ্চিত করুন'}
                </button>
                <button className="border rounded-lg px-4" onClick={() => setAp(null)}>বাতিল</button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 pt-2">
              <button className={btn} onClick={() => start(a)}>অনুমোদন</button>
              <button className="border border-red-300 text-red-600 rounded-lg px-4 py-2"
                onClick={() => reject(a)}>বাতিল</button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function Members({ supabase }: { supabase: any }) {
  const [list, setList] = useState<any[]>([])
  const [lg, setLg] = useState<any>(null)
  const [cred, setCred] = useState<any>(null)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    const { data } = await supabase.from('members').select('*')
      .order('joined_at', { ascending: false })
    setList(data || [])
  }
  useEffect(() => { load() }, [])

  async function setRole(id: string, role: string) {
    await supabase.from('members').update({ role }).eq('id', id)
    load()
  }
  async function toggle(m: any) {
    await supabase.from('members').update({ is_active: !m.is_active }).eq('id', m.id)
    load()
  }

  async function makeLogin() {
    const email = (lg.email || '').trim()
    if (!email || !lg.pass) { setMsg('ইমেইল ও পাসওয়ার্ড দিন'); return }
    setBusy(true)
    const r: any = await createLogin(supabase, lg.m.id, email, lg.pass)
    setBusy(false)
    if (r.ok) {
      setCred({
        name: lg.m.full_name, email,
        pass: r.linked ? '(আগের পাসওয়ার্ডই চলবে)' : lg.pass,
        confirm: r.needConfirm,
      })
      setLg(null)
      setMsg('')
      load()
    } else setMsg('ব্যর্থ: ' + r.msg)
  }

  const total = list.length
  const admins = list.filter(m => m.role === 'admin').length
  const exec = list.filter(m => m.role !== 'member').length
  const vol = list.filter(m => m.role === 'member').length

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {[['মোট সদস্য', total, 'text-gray-800'], ['সক্রিয় অ্যাডমিন', admins, 'text-green-700'],
          ['কার্যনির্বাহী পরিষদ', exec, 'text-blue-700'], ['মাঠের স্বেচ্ছাসেবক', vol, 'text-amber-600']
        ].map(([l, n, c]: any) => (
          <div key={l} className="bg-white rounded-xl p-3 shadow-sm">
            <p className="text-xs text-gray-500">{l}:</p>
            <p className={'text-lg font-bold ' + c}>{bn(n)} জন</p>
          </div>
        ))}
      </div>

      {cred && <CredCard cred={cred} onClose={() => setCred(null)} />}
      {msg && <p className="text-sm text-center text-red-600">{msg}</p>}

      {list.map(m => (
        <div key={m.id} className="bg-white rounded-xl p-4 shadow-sm space-y-2">
          <div className="flex justify-between">
            <p className="font-bold">{m.full_name}</p>
            <span className={'text-xs ' + (m.is_active ? 'text-green-700' : 'text-red-600')}>
              {m.is_active ? 'সক্রিয়' : 'বন্ধ'}
            </span>
          </div>
          <p className="text-xs text-gray-500">{m.phone || '-'} · {m.email || '-'}</p>
          <p className="text-[11px] text-gray-400">
            🪪 {m.member_code || '-'}
            {m.joined_at && ' · 📅 যোগদান: ' + bnd(m.joined_at)}
          </p>
          <select className={input} value={m.role} onChange={e => setRole(m.id, e.target.value)}>
            {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>

          {m.auth_user_id ? (
            <p className="text-xs text-green-700">✓ লগইন আছে</p>
          ) : lg?.m.id === m.id ? (
            <div className="border-t pt-2 space-y-2">
              <input className={input} type="email" placeholder="ইমেইল" value={lg.email}
                onChange={e => setLg({ ...lg, email: e.target.value })} />
              <div className="flex gap-2">
                <input className={input} value={lg.pass} onChange={e => setLg({ ...lg, pass: e.target.value })} />
                <button className="border rounded-lg px-3 text-sm" onClick={() => setLg({ ...lg, pass: genPass() })}>🔄</button>
              </div>
              <div className="flex gap-2">
                <button className={btn} disabled={busy} onClick={makeLogin}>
                  {busy ? 'অপেক্ষা করুন...' : 'লগইন তৈরি করুন'}
                </button>
                <button className="border rounded-lg px-4" onClick={() => setLg(null)}>বাতিল</button>
              </div>
            </div>
          ) : (
            <button className="text-sm underline text-green-700"
              onClick={() => { setMsg(''); setLg({ m, email: m.email || '', pass: genPass() }) }}>
              🔑 লগইন তৈরি করুন
            </button>
          )}

          <button className="text-sm underline text-gray-600 block" onClick={() => toggle(m)}>
            {m.is_active ? 'সদস্যপদ বন্ধ করুন' : 'আবার চালু করুন'}
          </button>
        </div>
      ))}
    </div>
  )
}

const FEATS: [string, string, string][] = [
  ['clock', 'লাইভ ঘড়ি ও ৩টি ক্যালেন্ডার', 'ইংরেজি, বাংলা ও ইসলামিক হিজরি ক্যালেন্ডার উইজেট'],
  ['chat', 'লাইভ চ্যাট রুম ও ১-অন-১ মেসেজিং', 'সদস্যদের যৌথ কমিউনিটি চ্যাট ও ব্যক্তিগত বার্তা'],
  ['ledger', 'খাতভিত্তিক পৃথক আয়-ব্যয় খতিয়ান', 'বন্যা, শীতবস্ত্র, শিক্ষা ও চিকিৎসা খাতের আলাদা হিসাব'],
  ['meet', 'ভার্চুয়াল মিটিং হাব ও সোশ্যাল লিংক', 'জুম, গুগল মিট, হোয়াটসঅ্যাপ ও ফেসবুক যোগদানের বাটন'],
]

function Features({ supabase }: { supabase: any }) {
  const [f, setF] = useState<any>(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    supabase.from('settings').select('features').eq('id', 1).single()
      .then(({ data }: any) => setF(data?.features || {}))
  }, [])

  if (!f) return <p className="text-center text-sm">লোড হচ্ছে...</p>

  async function flip(k: string) {
    const next = { ...f, [k]: f[k] === false }
    setF(next)
    const { error } = await supabase.from('settings').update({ features: next }).eq('id', 1)
    setMsg(error ? 'ব্যর্থ: ' + error.message
      : '✅ সেভ হয়েছে (' + fmtDT(new Date().toISOString()) + ')। পেজ রিফ্রেশ করলে সবার কাছে বদলে যাবে।')
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
      <h3 className="font-bold text-sm">⚙️ অ্যাপের ফিচার ও মডিউল অন/অফ</h3>
      {FEATS.map(([k, t, d]) => {
        const on = f[k] !== false
        return (
          <button key={k} onClick={() => flip(k)}
            className={'w-full text-left rounded-xl border p-3 flex items-center gap-3 ' +
              (on ? 'border-green-600' : 'border-gray-300 opacity-70')}>
            <div className="flex-1">
              <p className="text-sm font-semibold">{t}</p>
              <p className="text-xs text-gray-500">{d}</p>
            </div>
            <span className={'w-12 h-7 rounded-full p-0.5 flex ' + (on ? 'bg-green-600 justify-end' : 'bg-gray-300 justify-start')}>
              <span className="w-6 h-6 rounded-full bg-white" />
            </span>
          </button>
        )
      })}
      {msg && <p className="text-xs text-center">{msg}</p>}
    </div>
  )
}

const COLORS = ['#16a34a', '#087a43', '#2563eb', '#dc2626', '#9333ea', '#ea580c', '#0d9488', '#be185d', '#334155']

function SettingsForm({ supabase }: { supabase: any }) {
  const [f, setF] = useState<any>(null)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    supabase.from('settings').select('*').eq('id', 1).single()
      .then(({ data }: any) => setF(data))
  }, [])

  if (!f) return <p className="text-center text-sm">লোড হচ্ছে...</p>

  const set = (k: string, v: string) => setF({ ...f, [k]: v })

  const fields: [string, string][] = [
    ['org_name', 'ফাউন্ডেশনের নাম'],
    ['slogan', 'স্লোগান'],
    ['hotline', 'হটলাইন নম্বর'],
    ['facebook_page', 'ফেসবুক পেজের লিংক'],
    ['facebook_group', 'ফেসবুক গ্রুপের লিংক'],
    ['whatsapp_url', 'হোয়াটসঅ্যাপ কমিউনিটির লিংক'],
    ['telegram_url', 'টেলিগ্রাম চ্যানেলের লিংক'],
    ['zoom_link', 'জুম মিটিং লিংক'],
    ['meet_link', 'গুগল মিট লিংক'],
  ]
  const keys = ['org_name', 'slogan', 'hotline', 'bank_details', 'theme_color', 'logo_url', 'cover_url',
    'facebook_page', 'facebook_group', 'whatsapp_url', 'telegram_url', 'zoom_link', 'meet_link']

  async function save() {
    setBusy(true)
    const upd: any = {}
    keys.forEach(k => (upd[k] = f[k] || null))
    upd.org_name = f.org_name || 'আমাদের ফাউন্ডেশন'
    upd.theme_color = f.theme_color || '#16a34a'
    const { error } = await supabase.from('settings').update(upd).eq('id', 1)
    setBusy(false)
    if (error) setMsg('ব্যর্থ: ' + error.message)
    else {
      setMsg('✅ সেভ হয়েছে (' + fmtDT(new Date().toISOString()) + '), পেজ রিফ্রেশ হচ্ছে...')
      setTimeout(() => window.location.reload(), 1200)
    }
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-bold">লোগো</p>
        {f.logo_url && <img src={f.logo_url} className="w-16 h-16 rounded-full object-cover" />}
        <PhotoPicker supabase={supabase} folder="logo" label="লোগো বাছাই করুন"
          onDone={u => set('logo_url', u)} />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-bold">কভার ফটো</p>
        {f.cover_url && <img src={f.cover_url} className="w-full h-28 rounded-lg object-cover" />}
        <PhotoPicker supabase={supabase} folder="cover" label="কভার ফটো বাছাই করুন"
          onDone={u => set('cover_url', u)} />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-bold">থিম রঙ</p>
        <div className="flex flex-wrap gap-2 items-center">
          {COLORS.map(c => (
            <button key={c} onClick={() => set('theme_color', c)}
              className="w-9 h-9 rounded-full border-2"
              style={{ background: c, borderColor: f.theme_color === c ? '#000' : 'transparent' }} />
          ))}
          <input type="color" value={f.theme_color || '#16a34a'}
            onChange={e => set('theme_color', e.target.value)} className="w-9 h-9" />
        </div>
      </div>

      {fields.map(([k, label]) => (
        <div key={k}>
          <label className="text-xs text-gray-500">{label}</label>
          <input className={input} value={f[k] || ''} onChange={e => set(k, e.target.value)} />
        </div>
      ))}

      <div>
        <label className="text-xs text-gray-500">ব্যাংক / বিকাশ / নগদের বিবরণ</label>
        <textarea className={input} rows={3} value={f.bank_details || ''}
          onChange={e => set('bank_details', e.target.value)} />
      </div>

      <button className={btn + ' w-full'} disabled={busy} onClick={save}>
        {busy ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
      </button>
      {msg && <p className="text-sm text-center">{msg}</p>}
    </div>
  )
}
