import { useEffect, useState } from 'react'
import { fmtDT } from './time'

const input =
  'w-full border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-green-600'
const GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const bn = (n: number) => n.toLocaleString('bn-BD')
const dt = (s: string) => new Date(s).toLocaleDateString('bn-BD')
const since = (s?: string) =>
  s ? Math.floor((Date.now() - new Date(s).getTime()) / 86400000) : 9999
const tel = (p: string) => 'tel:' + (p || '').replace(/[^\d+]/g, '')
const wa = (p: string) => {
  let d = (p || '').replace(/\D/g, '')
  if (d.startsWith('0')) d = '88' + d
  return 'https://wa.me/' + d
}

export default function Blood({ supabase, member, user, settings, onNav }: any) {
  const [donors, setDonors] = useState<any[]>([])
  const [reqs, setReqs] = useState<any[]>([])
  const [nums, setNums] = useState<any>({})
  const [g, setG] = useState('all')
  const [q, setQ] = useState('')
  const [form, setForm] = useState('none')

  const isAdmin = member?.role === 'admin'
  const isHealth = isAdmin || member?.role === 'health'
  const own = donors.find(d => d.member_id === member?.id)

  async function load() {
    const [d, r, s] = await Promise.all([
      supabase.from('blood_donors').select('*').order('full_name'),
      supabase.from('blood_requests').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('settings').select('sos_phone, oxygen_phone, hotline').eq('id', 1).single(),
    ])
    setDonors(d.data || [])
    setReqs(r.data || [])
    setNums(s.data || {})
  }
  useEffect(() => { load() }, [])

  const sos = nums.sos_phone || nums.hotline || settings?.hotline
  const ready = (d: any) => d.available && since(d.last_donated) >= 90

  const list = donors
    .filter(d => g === 'all' || d.blood_group === g)
    .filter(d => !q || [d.full_name, d.district, d.upazila].join(' ').includes(q))
    .sort((a, b) => Number(ready(b)) - Number(ready(a)))

  async function toggleAvail() {
    await supabase.from('blood_donors').update({ available: !own.available }).eq('id', own.id)
    load()
  }
  async function removeDonor(id: string) {
    if (!confirm('তালিকা থেকে সরাবেন?')) return
    await supabase.from('blood_donors').delete().eq('id', id)
    load()
  }
  async function removeReq(id: string) {
    if (!confirm('রিকোয়েস্টটি মুছবেন?')) return
    await supabase.from('blood_requests').delete().eq('id', id)
    load()
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-red-600">🩸 জরুরি রক্তদান ও ২৪/৭ লাইফলাইন</p>
        <h2 className="text-xl font-bold">জরুরি রক্ত সন্ধান ও যোগাযোগ</h2>
        <p className="text-sm text-gray-500">
          মুমূর্ষু রোগীর জন্য দ্রুত রক্তদাতা খুঁজুন অথবা অ্যাম্বুলেন্স ও অক্সিজেন সেবার জন্য সরাসরি যোগাযোগ করুন।
        </p>
      </div>

      {!user ? (
        <button className="bg-red-600 text-white font-semibold rounded-lg px-4 py-2 text-sm"
          onClick={() => onNav('login')}>
          রক্তদাতা হতে লগইন করুন
        </button>
      ) : !member ? null : own ? (
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-2 border border-green-300">
          <p className="font-bold text-sm">✅ আপনি রক্তদাতা তালিকায় আছেন ({own.blood_group})</p>
          <div className="flex gap-2">
            <button className="flex-1 border rounded-lg py-2 text-sm font-semibold" onClick={toggleAvail}>
              {own.available ? '🟢 প্রস্তুত (ব্যস্ত করুন)' : '⚪ ব্যস্ত (প্রস্তুত করুন)'}
            </button>
            <button className="flex-1 border rounded-lg py-2 text-sm font-semibold"
              onClick={() => setForm('donor')}>
              তথ্য সম্পাদনা
            </button>
          </div>
        </div>
      ) : (
        <button className="bg-red-600 text-white font-semibold rounded-lg px-4 py-2 text-sm"
          onClick={() => setForm('donor')}>
          👤 রক্তদাতা হিসেবে নিবন্ধন করুন
        </button>
      )}

      {form === 'donor' && (
        <DonorForm supabase={supabase} member={member} own={own}
          onDone={() => { setForm('none'); load() }} onCancel={() => setForm('none')} />
      )}

      <div className="space-y-3">
        {sos && (
          <div className="rounded-2xl bg-red-600 text-white p-4 space-y-1">
            <p className="text-xs opacity-90">২৪/৭ রক্তদান কল সেন্টার</p>
            <p className="text-2xl font-bold tracking-wide">{sos}</p>
            <p className="text-xs opacity-90">যেকোনো রক্তের গ্রুপ সংগ্রহে সার্বক্ষণিক সহযোগিতা</p>
            <a href={tel(sos)} className="inline-block bg-white text-red-600 font-semibold text-sm rounded-lg px-3 py-1.5 mt-1">
              📞 সরাসরি কল দিন
            </a>
          </div>
        )}
        {nums.oxygen_phone && (
          <div className="rounded-2xl bg-green-700 text-white p-4 space-y-1">
            <p className="text-xs opacity-90">অ্যাম্বুলেন্স ও অক্সিজেন ব্যাংক</p>
            <p className="text-2xl font-bold tracking-wide">{nums.oxygen_phone}</p>
            <a href={tel(nums.oxygen_phone)} className="inline-block bg-white text-green-700 font-semibold text-sm rounded-lg px-3 py-1.5 mt-1">
              📞 অক্সিজেন হেল্পলাইন
            </a>
          </div>
        )}
        <div className="rounded-2xl bg-slate-900 text-white p-4 space-y-1">
          <p className="text-xs opacity-80">জাতীয় জরুরি সেবা বাংলাদেশ</p>
          <p className="text-2xl font-bold text-yellow-400">৯৯৯ (টোল-ফ্রি)</p>
          <p className="text-xs opacity-80">ফায়ার সার্ভিস, পুলিশ ও সরকারি অ্যাম্বুলেন্স সহায়তা</p>
          <a href="tel:999" className="inline-block bg-yellow-400 text-slate-900 font-semibold text-sm rounded-lg px-3 py-1.5 mt-1">
            📞 ৯৯৯ কল করুন
          </a>
        </div>
        {isAdmin && (
          <button className="text-xs underline text-gray-500" onClick={() => setForm(form === 'nums' ? 'none' : 'nums')}>
            ⚙️ জরুরি নম্বর সম্পাদনা
          </button>
        )}
        {form === 'nums' && (
          <NumsForm supabase={supabase} nums={nums} onDone={() => { setForm('none'); load() }} />
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="font-bold">🆘 জরুরি রক্তের রিকোয়েস্ট</h3>
          {isHealth && (
            <button className="text-sm font-semibold border border-red-500 text-red-600 rounded-lg px-3 py-1"
              onClick={() => setForm(form === 'req' ? 'none' : 'req')}>
              + রিকোয়েস্ট
            </button>
          )}
        </div>
        {form === 'req' && (
          <ReqForm supabase={supabase} member={member}
            onDone={() => { setForm('none'); load() }} onCancel={() => setForm('none')} />
        )}
        {reqs.length === 0 && <p className="text-sm text-gray-500">এখন কোনো জরুরি রিকোয়েস্ট নেই</p>}
        {reqs.map(r => (
          <div key={r.id} className="bg-white rounded-xl p-3 shadow-sm border border-red-300 space-y-1">
            <p className="font-bold text-red-600">🩸 {r.blood_group} রক্ত প্রয়োজন</p>
            <p className="text-sm">🏥 {r.hospital || '-'}</p>
            <p className="text-xs text-gray-500">📍 {[r.upazila, r.district].filter(Boolean).join(', ') || '-'}</p>
            {r.note && <p className="text-sm text-gray-600">{r.note}</p>}
            <p className="text-[11px] text-gray-400">🕒 প্রকাশ: {fmtDT(r.created_at)}</p>
            <div className="flex gap-3 items-center pt-1">
              {r.contact && (
                <a href={tel(r.contact)} className="bg-red-600 text-white text-sm font-semibold rounded-lg px-3 py-1.5">
                  📞 {r.contact}
                </a>
              )}
              {isHealth && (
                <button className="text-xs text-red-600 underline" onClick={() => removeReq(r.id)}>মুছুন</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <h3 className="font-bold">রক্তদাতা ডিরেক্টরি</h3>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['all', ...GROUPS].map(x => (
            <button key={x} onClick={() => setG(x)}
              className={'px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap ' +
                (g === x ? 'bg-red-600 text-white' : 'bg-white border')}>
              {x === 'all' ? 'সকল গ্রুপ' : x}
            </button>
          ))}
        </div>
        <input className={input} placeholder="🔍 জেলা, থানা বা রক্তদাতার নাম খুঁজুন..." value={q}
          onChange={e => setQ(e.target.value)} />
        <p className="text-xs text-gray-500">
          মোট দাতা: {bn(list.length)} জন · প্রস্তুত: {bn(list.filter(ready).length)} জন
        </p>

        {list.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">কোনো রক্তদাতা পাওয়া যায়নি</p>
        )}
        {list.map(d => (
          <div key={d.id} className="bg-white rounded-xl p-4 shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="bg-red-50 text-red-600 font-bold rounded-lg px-3 py-1 text-sm">🩸 {d.blood_group}</span>
              {ready(d) ? (
                <span className="text-xs font-semibold text-green-700">✓ রক্ত দিতে প্রস্তুত</span>
              ) : d.available ? (
                <span className="text-xs font-semibold text-amber-600">সম্প্রতি রক্ত দিয়েছেন</span>
              ) : (
                <span className="text-xs font-semibold text-gray-400">এখন ব্যস্ত</span>
              )}
            </div>
            <p className="font-bold">{d.full_name}</p>
            <p className="text-sm text-gray-500">📍 {[d.upazila, d.district].filter(Boolean).join(', ') || '-'}</p>
            <p className="text-xs text-gray-500">
              সর্বশেষ রক্তদান: {d.last_donated ? dt(d.last_donated) : 'তথ্য নেই'} · মোট রক্তদান:{' '}
              <b className="text-red-600">{bn(d.total_donations || 0)} বার</b>
            </p>
            <p className="text-[11px] text-gray-400">🕒 তালিকাভুক্ত: {fmtDT(d.created_at)}</p>
            <div className="flex gap-2">
              <a href={tel(d.phone)}
                className="flex-1 text-center bg-green-700 text-white rounded-lg py-2 text-sm font-semibold">
                📞 কল দিন
              </a>
              <a href={wa(d.phone)} target="_blank" rel="noreferrer"
                className="flex-1 text-center border border-green-700 text-green-700 rounded-lg py-2 text-sm font-semibold">
                💬 হোয়াটসঅ্যাপ
              </a>
            </div>
            {(isHealth || d.member_id === member?.id) && (
              <button className="text-xs text-red-600 underline" onClick={() => removeDonor(d.id)}>
                তালিকা থেকে সরান
              </button>
            )}
          </div>
        ))}
        <p className="text-[11px] text-gray-400 text-center">
          সাধারণত ৩ মাস পর আবার রক্ত দেওয়া যায়। রক্তদানের আগে সুস্থতা যাচাই করুন।
        </p>
      </div>
    </div>
  )
}

function DonorForm({ supabase, member, own, onDone, onCancel }: any) {
  const [f, setF] = useState({
    blood_group: own?.blood_group || member?.blood_group || '',
    district: own?.district || member?.district || '',
    upazila: own?.upazila || '',
    phone: own?.phone || member?.phone || '',
    last_donated: own?.last_donated || '',
    total: String(own?.total_donations ?? 0),
    available: own?.available ?? true,
    ok: !!own,
  })
  const [msg, setMsg] = useState('')
  const set = (k: string, v: any) => setF({ ...f, [k]: v })

  async function save() {
    if (!f.blood_group || !f.phone) { setMsg('রক্তের গ্রুপ ও ফোন নম্বর দিন'); return }
    if (!f.ok) { setMsg('তথ্য প্রকাশে সম্মতি দিতে টিক দিন'); return }
    const { error } = await supabase.from('blood_donors').upsert({
      member_id: member.id,
      full_name: member.full_name,
      blood_group: f.blood_group,
      district: f.district || null,
      upazila: f.upazila || null,
      phone: f.phone,
      last_donated: f.last_donated || null,
      total_donations: Number(f.total) || 0,
      available: f.available,
    }, { onConflict: 'member_id' })
    if (error) setMsg('ব্যর্থ: ' + error.message)
    else onDone()
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
      <h3 className="font-bold text-sm">রক্তদাতা তথ্য</h3>
      <select className={input} value={f.blood_group} onChange={e => set('blood_group', e.target.value)}>
        <option value="">রক্তের গ্রুপ *</option>
        {GROUPS.map(x => <option key={x}>{x}</option>)}
      </select>
      <input className={input} placeholder="ফোন নম্বর *" value={f.phone} onChange={e => set('phone', e.target.value)} />
      <input className={input} placeholder="জেলা" value={f.district} onChange={e => set('district', e.target.value)} />
      <input className={input} placeholder="থানা/উপজেলা" value={f.upazila} onChange={e => set('upazila', e.target.value)} />
      <label className="text-xs text-gray-500">সর্বশেষ রক্তদানের তারিখ (থাকলে)</label>
      <input className={input} type="date" value={f.last_donated} onChange={e => set('last_donated', e.target.value)} />
      <input className={input} type="number" placeholder="মোট কতবার রক্ত দিয়েছেন" value={f.total}
        onChange={e => set('total', e.target.value)} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={f.available} onChange={e => set('available', e.target.checked)} />
        আমি এখন রক্ত দিতে প্রস্তুত
      </label>
      <label className="flex items-start gap-2 text-xs text-gray-600">
        <input type="checkbox" className="mt-0.5" checked={f.ok} onChange={e => set('ok', e.target.checked)} />
        আমি সম্মতি দিচ্ছি যে আমার নাম, এলাকা ও ফোন নম্বর সবার জন্য দৃশ্যমান হবে।
      </label>
      <div className="flex gap-2">
        <button className="flex-1 bg-red-600 text-white font-semibold rounded-lg py-2" onClick={save}>সংরক্ষণ</button>
        <button className="border rounded-lg px-4" onClick={onCancel}>বাতিল</button>
      </div>
      {msg && <p className="text-sm text-center text-red-600">{msg}</p>}
    </div>
  )
}

function ReqForm({ supabase, member, onDone, onCancel }: any) {
  const [f, setF] = useState({ blood_group: '', hospital: '', district: '', upazila: '', contact: '', note: '' })
  const [msg, setMsg] = useState('')
  const set = (k: string, v: string) => setF({ ...f, [k]: v })

  async function save() {
    if (!f.blood_group || !f.contact) { setMsg('রক্তের গ্রুপ ও যোগাযোগের নম্বর দিন'); return }
    const { error } = await supabase.from('blood_requests').insert({
      ...f, created_by: member?.id || null,
    })
    if (error) setMsg('ব্যর্থ: ' + error.message)
    else onDone()
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
      <select className={input} value={f.blood_group} onChange={e => set('blood_group', e.target.value)}>
        <option value="">রক্তের গ্রুপ *</option>
        {GROUPS.map(x => <option key={x}>{x}</option>)}
      </select>
      <input className={input} placeholder="হাসপাতালের নাম" value={f.hospital} onChange={e => set('hospital', e.target.value)} />
      <input className={input} placeholder="জেলা" value={f.district} onChange={e => set('district', e.target.value)} />
      <input className={input} placeholder="থানা/উপজেলা" value={f.upazila} onChange={e => set('upazila', e.target.value)} />
      <input className={input} placeholder="যোগাযোগের নম্বর *" value={f.contact} onChange={e => set('contact', e.target.value)} />
      <textarea className={input} rows={2} placeholder="অতিরিক্ত তথ্য" value={f.note} onChange={e => set('note', e.target.value)} />
      <div className="flex gap-2">
        <button className="flex-1 bg-red-600 text-white font-semibold rounded-lg py-2" onClick={save}>প্রকাশ করুন</button>
        <button className="border rounded-lg px-4" onClick={onCancel}>বাতিল</button>
      </div>
      {msg && <p className="text-sm text-center text-red-600">{msg}</p>}
    </div>
  )
}

function NumsForm({ supabase, nums, onDone }: any) {
  const [sos, setSos] = useState(nums.sos_phone || '')
  const [ox, setOx] = useState(nums.oxygen_phone || '')

  async function save() {
    await supabase.from('settings')
      .update({ sos_phone: sos || null, oxygen_phone: ox || null }).eq('id', 1)
    onDone()
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
      <input className={input} placeholder="২৪/৭ রক্তদান কল সেন্টার নম্বর" value={sos} onChange={e => setSos(e.target.value)} />
      <input className={input} placeholder="অ্যাম্বুলেন্স ও অক্সিজেন ব্যাংক নম্বর" value={ox} onChange={e => setOx(e.target.value)} />
      <button className="w-full bg-green-700 text-white font-semibold rounded-lg py-2" onClick={save}>সেভ করুন</button>
    </div>
  )
}
