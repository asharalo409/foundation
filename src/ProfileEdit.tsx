import { useEffect, useState } from 'react'
import PhotoPicker from './Upload'

const input =
  'w-full border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-green-600'
const GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function ProfileEdit({ supabase, member, isAdmin, setMember }: any) {
  const [people, setPeople] = useState<any[]>([])
  const [target, setTarget] = useState<string>(member?.id || '')
  const [f, setF] = useState<any>(null)
  const [msg, setMsg] = useState('')
  const [ok, setOk] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!isAdmin) return
    supabase.from('members').select('id, full_name, member_code').order('full_name')
      .then(({ data }: any) => setPeople(data || []))
  }, [isAdmin])

  useEffect(() => {
    if (!target) return
    setF(null)
    setMsg('')
    supabase.from('members').select('*').eq('id', target).maybeSingle()
      .then(({ data }: any) => setF(data))
  }, [target])

  if (!member) return null

  const set = (k: string, v: string) => setF((p: any) => ({ ...p, [k]: v }))

  async function save() {
    if (!f.full_name?.trim()) { setOk(false); setMsg('নাম দিন'); return }
    setBusy(true)
    const upd: any = {
      full_name: f.full_name.trim(),
      phone: f.phone || null,
      blood_group: f.blood_group || null,
      district: f.district || null,
      upazila: f.upazila || null,
      photo_url: f.photo_url || null,
    }
    const { error } = await supabase.from('members').update(upd).eq('id', target)
    setBusy(false)
    if (error) { setOk(false); setMsg('ব্যর্থ: ' + error.message); return }
    setOk(true)
    setMsg('✅ প্রোফাইল সংরক্ষিত হয়েছে')
    if (target === member.id) setMember({ ...member, ...upd })
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
      <h3 className="font-bold">✏️ প্রোফাইল সম্পাদনা</h3>
      <p className="text-xs text-gray-500">
        আপনি নিজের প্রোফাইলের তথ্য বদলাতে পারবেন। পদবী, আইডি ও সদস্যপদ শুধু অ্যাডমিন বদলাতে পারে।
      </p>

      {isAdmin && (
        <select className={input} value={target} onChange={e => setTarget(e.target.value)}>
          <option value={member.id}>আমার প্রোফাইল</option>
          {people.filter(p => p.id !== member.id).map(p => (
            <option key={p.id} value={p.id}>{p.full_name} ({p.member_code})</option>
          ))}
        </select>
      )}

      {!f ? (
        <p className="text-sm text-gray-500 text-center py-2">লোড হচ্ছে...</p>
      ) : (
        <>
          {f.photo_url && <img src={f.photo_url} className="w-20 h-20 rounded-full object-cover" />}
          <PhotoPicker supabase={supabase} folder="members" label="ছবি বদলান"
            onDone={(u: string) => set('photo_url', u)} />
          <input className={input} placeholder="পূর্ণ নাম" value={f.full_name || ''}
            onChange={e => set('full_name', e.target.value)} />
          <input className={input} placeholder="মোবাইল নম্বর" value={f.phone || ''}
            onChange={e => set('phone', e.target.value)} />
          <select className={input} value={f.blood_group || ''} onChange={e => set('blood_group', e.target.value)}>
            <option value="">রক্তের গ্রুপ</option>
            {GROUPS.map(g => <option key={g}>{g}</option>)}
          </select>
          <input className={input} placeholder="জেলা" value={f.district || ''}
            onChange={e => set('district', e.target.value)} />
          <input className={input} placeholder="থানা/উপজেলা" value={f.upazila || ''}
            onChange={e => set('upazila', e.target.value)} />
          <button className="w-full bg-green-700 text-white font-semibold rounded-lg py-2.5 disabled:opacity-50"
            disabled={busy} onClick={save}>
            {busy ? 'অপেক্ষা করুন...' : 'সংরক্ষণ'}
          </button>
        </>
      )}
      {msg && <p className={'text-sm text-center ' + (ok ? 'text-green-700' : 'text-red-600')}>{msg}</p>}
    </div>
  )
}
