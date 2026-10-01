import { useEffect, useState } from 'react'

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

export default function Admin({ supabase }: { supabase: any }) {
  const [sec, setSec] = useState('apps')
  const secs = [
    ['apps', 'আবেদন'],
    ['members', 'সদস্য'],
    ['settings', 'সেটিংস'],
  ]
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {secs.map(([k, l]) => (
          <button
            key={k}
            onClick={() => setSec(k)}
            className={
              'flex-1 py-2 rounded-lg text-sm font-semibold ' +
              (sec === k ? 'bg-green-700 text-white' : 'bg-white border')
            }
          >
            {l}
          </button>
        ))}
      </div>
      {sec === 'apps' && <Apps supabase={supabase} />}
      {sec === 'members' && <Members supabase={supabase} />}
      {sec === 'settings' && <SettingsForm supabase={supabase} />}
    </div>
  )
}

function Apps({ supabase }: { supabase: any }) {
  const [list, setList] = useState<any[]>([])
  const [msg, setMsg] = useState('')

  async function load() {
    const { data } = await supabase
      .from('applications')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    setList(data || [])
  }
  useEffect(() => { load() }, [])

  async function approve(a: any) {
    const { error } = await supabase.from('members').insert({
      full_name: a.full_name,
      phone: a.phone,
      email: a.email,
      blood_group: a.blood_group,
      district: a.district,
      role: 'member',
    })
    if (error) { setMsg('ব্যর্থ: ' + error.message); return }
    await supabase.from('applications').update({ status: 'approved' }).eq('id', a.id)
    setMsg('✅ সদস্য যুক্ত হয়েছে')
    load()
  }

  async function reject(a: any) {
    await supabase.from('applications').update({ status: 'rejected' }).eq('id', a.id)
    load()
  }

  return (
    <div className="space-y-3">
      {msg && <p className="text-sm text-center">{msg}</p>}
      {list.length === 0 && (
        <p className="text-center text-gray-500 text-sm">কোনো নতুন আবেদন নেই</p>
      )}
      {list.map(a => (
        <div key={a.id} className="bg-white rounded-xl p-4 shadow-sm space-y-1">
          <p className="font-bold">{a.full_name}</p>
          <p className="text-sm">📞 {a.phone}</p>
          {a.email && <p className="text-sm">✉️ {a.email}</p>}
          <p className="text-sm">
            🩸 {a.blood_group || '-'} · 📍 {a.district || '-'}
          </p>
          {a.message && <p className="text-sm text-gray-600">"{a.message}"</p>}
          <div className="flex gap-2 pt-2">
            <button className={btn} onClick={() => approve(a)}>অনুমোদন</button>
            <button
              className="border border-red-300 text-red-600 rounded-lg px-4 py-2"
              onClick={() => reject(a)}
            >
              বাতিল
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function Members({ supabase }: { supabase: any }) {
  const [list, setList] = useState<any[]>([])

  async function load() {
    const { data } = await supabase
      .from('members')
      .select('*')
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

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">মোট সদস্য: {list.length}</p>
      {list.map(m => (
        <div key={m.id} className="bg-white rounded-xl p-4 shadow-sm space-y-2">
          <div className="flex justify-between">
            <p className="font-bold">{m.full_name}</p>
            <span className={'text-xs ' + (m.is_active ? 'text-green-700' : 'text-red-600')}>
              {m.is_active ? 'সক্রিয়' : 'বন্ধ'}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            {m.phone || '-'} · {m.email || '-'}
          </p>
          <select
            className={input}
            value={m.role}
            onChange={e => setRole(m.id, e.target.value)}
          >
            {Object.entries(ROLES).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <button className="text-sm underline text-gray-600" onClick={() => toggle(m)}>
            {m.is_active ? 'সদস্যপদ বন্ধ করুন' : 'আবার চালু করুন'}
          </button>
        </div>
      ))}
    </div>
  )
}

function SettingsForm({ supabase }: { supabase: any }) {
  const [f, setF] = useState<any>(null)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    supabase.from('settings').select('*').eq('id', 1).single()
      .then(({ data }: any) => setF(data))
  }, [])

  if (!f) return <p className="text-center text-sm">লোড হচ্ছে...</p>

  const fields: [string, string][] = [
    ['org_name', 'ফাউন্ডেশনের নাম'],
    ['slogan', 'স্লোগান'],
    ['hotline', 'হটলাইন নম্বর'],
    ['bank_details', 'ব্যাংক / বিকাশ / নগদের বিবরণ'],
    ['theme_color', 'থিম রঙ (যেমন #16a34a)'],
  ]

  async function save() {
    setBusy(true)
    const { error } = await supabase
      .from('settings')
      .update({
        org_name: f.org_name,
        slogan: f.slogan,
        hotline: f.hotline,
        bank_details: f.bank_details,
        theme_color: f.theme_color,
      })
      .eq('id', 1)
    setBusy(false)
    if (error) setMsg('ব্যর্থ: ' + error.message)
    else {
      setMsg('✅ সেভ হয়েছে, পেজ রিফ্রেশ হচ্ছে...')
      setTimeout(() => window.location.reload(), 800)
    }
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
      {fields.map(([k, label]) => (
        <div key={k}>
          <label className="text-xs text-gray-500">{label}</label>
          {k === 'bank_details' ? (
            <textarea
              className={input}
              rows={3}
              value={f[k] || ''}
              onChange={e => setF({ ...f, [k]: e.target.value })}
            />
          ) : (
            <input
              className={input}
              value={f[k] || ''}
              onChange={e => setF({ ...f, [k]: e.target.value })}
            />
          )}
        </div>
      ))}
      <button className={btn + ' w-full'} disabled={busy} onClick={save}>
        {busy ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
      </button>
      {msg && <p className="text-sm text-center">{msg}</p>}
    </div>
  )
}
