import { useState } from 'react'

const input =
  'w-full border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-green-600'
const GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const AID = ['চিকিৎসা সহায়তা', 'শিক্ষা সহায়তা', 'খাদ্য সহায়তা', 'বন্যা/দুর্যোগ সহায়তা', 'শীতবস্ত্র', 'অন্যান্য']

const TITLES: Record<string, [string, string]> = {
  blood: ['🩸 রক্তের জন্য আবেদন', 'রোগীর তথ্য দিন। আমাদের দায়িত্বশীলরা যাচাই করে রক্তদাতাদের জানাবেন।'],
  aid: ['🤝 সাহায্যের আবেদন', 'আপনার প্রয়োজনের কথা লিখুন। যাচাইয়ের পর আমরা যোগাযোগ করব।'],
  contact: ['✉️ আমাদের বার্তা পাঠান', 'প্রশ্ন, পরামর্শ বা অন্য যেকোনো কথা লিখুন।'],
}

export default function RequestModal({ supabase, kind, onClose, settings }: any) {
  const [f, setF] = useState<any>({
    name: '', phone: '', email: '', district: '', upazila: '', blood_group: '', hospital: '',
    needed_by: '', urgent: false, aid_type: '', amount_needed: '', subject: '', details: '', website: '',
  })
  const [msg, setMsg] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)
  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }))

  async function submit() {
    setMsg('')
    if (f.website) { setDone(true); return }

    let last = 0
    try { last = Number(localStorage.getItem('req-last') || 0) } catch {}
    if (Date.now() - last < 60000) { setMsg('একটু অপেক্ষা করে আবার চেষ্টা করুন'); return }

    const name = f.name.trim()
    const phone = f.phone.replace(/[^\d+]/g, '')
    if (name.length < 2) { setMsg('আপনার নাম লিখুন'); return }
    if (kind === 'contact') {
      if (!phone && !f.email.trim()) { setMsg('ফোন নম্বর বা ইমেইল দিন'); return }
      if (!f.details.trim()) { setMsg('বার্তা লিখুন'); return }
    } else if (phone.length < 6) { setMsg('সঠিক ফোন নম্বর দিন'); return }
    if (kind === 'blood') {
      if (!f.blood_group) { setMsg('রক্তের গ্রুপ বাছাই করুন'); return }
      if (!f.hospital.trim()) { setMsg('হাসপাতালের নাম লিখুন'); return }
    }
    if (kind === 'aid') {
      if (!f.aid_type) { setMsg('সাহায্যের ধরন বাছাই করুন'); return }
      if (!f.details.trim()) { setMsg('প্রয়োজনের বিবরণ লিখুন'); return }
    }

    const payload: any = {
      kind,
      name,
      phone: phone || null,
      email: f.email.trim() || null,
      district: f.district.trim() || null,
      upazila: f.upazila.trim() || null,
      details: f.details.trim() || null,
    }
    if (kind === 'blood') {
      payload.blood_group = f.blood_group
      payload.hospital = f.hospital.trim()
      payload.urgent = !!f.urgent
      payload.needed_by = f.needed_by ? new Date(f.needed_by).toISOString() : null
    }
    if (kind === 'aid') {
      payload.aid_type = f.aid_type
      payload.amount_needed = f.amount_needed ? Number(f.amount_needed) : null
    }
    if (kind === 'contact') payload.subject = f.subject.trim() || null

    setBusy(true)
    const { error } = await supabase.from('public_requests').insert(payload)
    setBusy(false)
    if (error) { setMsg('জমা হয়নি: ' + error.message); return }
    try { localStorage.setItem('req-last', String(Date.now())) } catch {}
    setDone(true)
  }

  const [title, sub] = TITLES[kind] || TITLES.contact

  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-end sm:items-center" onClick={onClose}>
      <div className="bg-white w-full max-w-md mx-auto rounded-t-2xl sm:rounded-2xl p-5 space-y-3 max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="font-bold text-lg">{title}</h3>
            <p className="text-xs text-gray-500">{sub}</p>
          </div>
          <button className="text-xl" onClick={onClose}>✕</button>
        </div>

        {done ? (
          <div className="text-center space-y-3 py-4">
            <div className="text-5xl">✅</div>
            <p className="font-bold">আবেদন জমা হয়েছে</p>
            <p className="text-sm text-gray-600">
              {kind === 'contact'
                ? 'আপনার বার্তা আমরা পেয়েছি। শীঘ্রই উত্তর দেব।'
                : 'আমাদের দায়িত্বশীলরা যাচাই করে আপনার দেওয়া নম্বরে যোগাযোগ করবেন।'}
            </p>
            {kind !== 'contact' && settings?.hotline && (
              <a href={'tel:' + settings.hotline}
                className="inline-block bg-red-600 text-white font-semibold rounded-lg px-5 py-2.5">
                📞 জরুরি হলে কল করুন: {settings.hotline}
              </a>
            )}
            <button className="block w-full border rounded-lg py-2" onClick={onClose}>বন্ধ করুন</button>
          </div>
        ) : (
          <div className="space-y-2">
            <input className={input} placeholder={kind === 'blood' ? 'রোগীর বা আপনার নাম *' : 'আপনার নাম *'}
              value={f.name} onChange={e => set('name', e.target.value)} />
            <input className={input} type="tel"
              placeholder={kind === 'contact' ? 'ফোন নম্বর (ইমেইল না দিলে আবশ্যক)' : 'যোগাযোগের ফোন নম্বর *'}
              value={f.phone} onChange={e => set('phone', e.target.value)} />
            {kind === 'contact' && (
              <input className={input} type="email" placeholder="ইমেইল (ঐচ্ছিক)"
                value={f.email} onChange={e => set('email', e.target.value)} />
            )}

            {kind === 'blood' && (
              <>
                <select className={input} value={f.blood_group} onChange={e => set('blood_group', e.target.value)}>
                  <option value="">রক্তের গ্রুপ *</option>
                  {GROUPS.map(g => <option key={g}>{g}</option>)}
                </select>
                <input className={input} placeholder="হাসপাতালের নাম *" value={f.hospital}
                  onChange={e => set('hospital', e.target.value)} />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={f.urgent} onChange={e => set('urgent', e.target.checked)} />
                  এখনই জরুরি
                </label>
                {!f.urgent && (
                  <>
                    <label className="text-xs text-gray-500">কখন প্রয়োজন (ঐচ্ছিক)</label>
                    <input className={input} type="datetime-local" value={f.needed_by}
                      onChange={e => set('needed_by', e.target.value)} />
                  </>
                )}
              </>
            )}

            {kind === 'aid' && (
              <>
                <select className={input} value={f.aid_type} onChange={e => set('aid_type', e.target.value)}>
                  <option value="">সাহায্যের ধরন *</option>
                  {AID.map(a => <option key={a}>{a}</option>)}
                </select>
                <input className={input} type="number" placeholder="আনুমানিক কত টাকা লাগবে (ঐচ্ছিক)"
                  value={f.amount_needed} onChange={e => set('amount_needed', e.target.value)} />
              </>
            )}

            {kind !== 'contact' && (
              <div className="grid grid-cols-2 gap-2">
                <input className={input} placeholder="জেলা" value={f.district}
                  onChange={e => set('district', e.target.value)} />
                <input className={input} placeholder="থানা/উপজেলা" value={f.upazila}
                  onChange={e => set('upazila', e.target.value)} />
              </div>
            )}

            {kind === 'contact' && (
              <input className={input} placeholder="বিষয়" value={f.subject}
                onChange={e => set('subject', e.target.value)} />
            )}

            <textarea className={input} rows={4}
              placeholder={kind === 'blood' ? 'অতিরিক্ত তথ্য (রোগীর অবস্থা, কত ব্যাগ ইত্যাদি)'
                : kind === 'aid' ? 'প্রয়োজনের বিবরণ *' : 'বার্তা *'}
              value={f.details} onChange={e => set('details', e.target.value)} />

            <input tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website}
              onChange={e => set('website', e.target.value)}
              style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />

            <button className="w-full bg-green-700 text-white font-semibold rounded-lg py-2.5 disabled:opacity-50"
              disabled={busy} onClick={submit}>
              {busy ? 'জমা হচ্ছে...' : 'আবেদন জমা দিন'}
            </button>
            {msg && <p className="text-sm text-center text-red-600">{msg}</p>}
            <p className="text-[11px] text-gray-400 text-center">
              আপনার তথ্য শুধু আমাদের দায়িত্বশীলরা দেখবেন। ভুয়া আবেদন দেবেন না।
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
