import { useEffect, useState } from 'react'
import { fmtDT } from './time'

const KL: Record<string, string> = { blood: '🩸 রক্ত', aid: '🤝 সাহায্য', contact: '✉️ বার্তা' }
const ST: Record<string, [string, string]> = {
  pending: ['⏳ অপেক্ষমাণ', '#d97706'],
  approved: ['✅ গৃহীত', '#16a34a'],
  rejected: ['❌ প্রত্যাখ্যাত', '#dc2626'],
}
const bn = (n: number) => Number(n).toLocaleString('bn-BD')
const tel = (p: string) => 'tel:' + (p || '').replace(/[^\d+]/g, '')
const wa = (p: string) => {
  let d = (p || '').replace(/\D/g, '')
  if (d.startsWith('0')) d = '88' + d
  return 'https://wa.me/' + d
}

export default function Inbox({ supabase, member, kinds, canDelete }: any) {
  const [rows, setRows] = useState<any[]>([])
  const [kind, setKind] = useState<string>(kinds[0])
  const [st, setSt] = useState('pending')
  const [open, setOpen] = useState(true)
  const [msg, setMsg] = useState('')

  async function load() {
    const { data } = await supabase.from('public_requests').select('*')
      .in('kind', kinds).order('created_at', { ascending: false }).limit(150)
    setRows(data || [])
  }
  useEffect(() => { load() }, [])

  const pend = (k: string) => rows.filter(r => r.kind === k && r.status === 'pending').length
  const total = kinds.reduce((t: number, k: string) => t + pend(k), 0)
  const list = rows.filter(r => r.kind === kind && (st === 'all' || r.status === st))

  async function approve(r: any) {
    setMsg('')
    let pid: string | null = null
    if (r.kind === 'blood') {
      const when = r.urgent ? 'এখনই জরুরি' : r.needed_by ? 'প্রয়োজন: ' + fmtDT(r.needed_by) : ''
      const note = [r.details, when, 'আবেদনকারী: ' + r.name].filter(Boolean).join(' · ')
      const { data, error } = await supabase.from('blood_requests').insert({
        blood_group: r.blood_group, hospital: r.hospital, district: r.district,
        upazila: r.upazila, contact: r.phone, note, created_by: member?.id || null,
      }).select('id').single()
      if (error) { setMsg('প্রকাশ ব্যর্থ: ' + error.message); return }
      pid = data.id
    }
    const { error } = await supabase.from('public_requests').update({
      status: 'approved', decided_by: member?.id || null,
      decided_at: new Date().toISOString(), published_id: pid,
    }).eq('id', r.id)
    setMsg(error ? 'ব্যর্থ: ' + error.message
      : r.kind === 'blood' ? '✅ জরুরি রক্তের তালিকায় প্রকাশ হয়েছে' : '✅ গৃহীত')
    load()
  }

  async function reject(r: any) {
    const reason = window.prompt('প্রত্যাখ্যানের কারণ লিখুন (ঐচ্ছিক):')
    if (reason === null) return
    const { error } = await supabase.from('public_requests').update({
      status: 'rejected', admin_note: reason || null,
      decided_by: member?.id || null, decided_at: new Date().toISOString(),
    }).eq('id', r.id)
    setMsg(error ? 'ব্যর্থ: ' + error.message : '')
    load()
  }

  async function note(r: any) {
    const v = window.prompt('নোট লিখুন:', r.admin_note || '')
    if (v === null) return
    await supabase.from('public_requests').update({ admin_note: v || null }).eq('id', r.id)
    load()
  }

  async function remove(id: string) {
    if (!confirm('মুছে ফেলবেন?')) return
    await supabase.from('public_requests').delete().eq('id', id)
    load()
  }

  return (
    <div className="bg-white rounded-xl p-3 shadow-sm space-y-3 border border-amber-300">
      <button className="w-full flex justify-between items-center" onClick={() => setOpen(!open)}>
        <b className="text-sm">📥 আবেদন ইনবক্স</b>
        <span className="flex items-center gap-2">
          {total > 0 && (
            <span className="bg-red-600 text-white text-xs rounded-full px-2 py-0.5">{bn(total)}</span>
          )}
          <span className="text-gray-400">{open ? '▲' : '▼'}</span>
        </span>
      </button>

      {open && (
        <div className="space-y-3">
          <div className="flex gap-2 overflow-x-auto">
            {kinds.map((k: string) => (
              <button key={k} onClick={() => setKind(k)}
                className={'px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap ' +
                  (kind === k ? 'bg-green-700 text-white' : 'bg-white border')}>
                {KL[k]} {pend(k) > 0 && <span className="ml-1 text-xs">({bn(pend(k))})</span>}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {[['pending', 'অপেক্ষমাণ'], ['all', 'সব']].map(([k, l]) => (
              <button key={k} onClick={() => setSt(k)}
                className={'px-3 py-1 rounded-lg text-xs font-semibold ' +
                  (st === k ? 'bg-gray-800 text-white' : 'bg-white border')}>
                {l}
              </button>
            ))}
          </div>

          {msg && <p className="text-xs text-center">{msg}</p>}
          {list.length === 0 && <p className="text-sm text-gray-500 text-center py-3">কোনো আবেদন নেই</p>}

          {list.map(r => (
            <div key={r.id} className="rounded-xl border p-3 space-y-1.5">
              <div className="flex justify-between gap-2">
                <p className="font-bold text-sm">
                  {r.kind === 'blood' && <span className="text-red-600">{r.blood_group} · </span>}
                  {r.name}
                </p>
                <span className="text-[11px] font-semibold" style={{ color: ST[r.status][1] }}>{ST[r.status][0]}</span>
              </div>

              {r.kind === 'blood' && (
                <>
                  <p className="text-xs">🏥 {r.hospital}{r.urgent ? ' · 🚨 এখনই জরুরি' : ''}</p>
                  {r.needed_by && !r.urgent && <p className="text-xs">⏰ প্রয়োজন: {fmtDT(r.needed_by)}</p>}
                </>
              )}
              {r.kind === 'aid' && (
                <p className="text-xs">
                  {r.aid_type}
                  {r.amount_needed ? ' · আনুমানিক ৳' + Number(r.amount_needed).toLocaleString('bn-BD') : ''}
                </p>
              )}
              {r.kind === 'contact' && r.subject && <p className="text-xs font-semibold">{r.subject}</p>}
              {(r.district || r.upazila) && (
                <p className="text-xs text-gray-500">📍 {[r.upazila, r.district].filter(Boolean).join(', ')}</p>
              )}
              {r.details && <p className="text-sm text-gray-700 whitespace-pre-line">{r.details}</p>}
              {r.email && <p className="text-xs text-gray-500">✉️ {r.email}</p>}
              {r.admin_note && <p className="text-xs text-amber-700">📝 {r.admin_note}</p>}
              <p className="text-[10px] text-gray-400">🕒 {fmtDT(r.created_at)}</p>

              <div className="flex flex-wrap gap-2 pt-1">
                {r.phone && (
                  <>
                    <a href={tel(r.phone)} className="bg-green-700 text-white text-xs font-semibold rounded-lg px-3 py-1.5">
                      📞 {r.phone}
                    </a>
                    <a href={wa(r.phone)} target="_blank" rel="noreferrer"
                      className="border border-green-700 text-green-700 text-xs font-semibold rounded-lg px-3 py-1.5">
                      💬 হোয়াটসঅ্যাপ
                    </a>
                  </>
                )}
                {r.status === 'pending' && (
                  <>
                    <button className="bg-blue-600 text-white text-xs font-semibold rounded-lg px-3 py-1.5"
                      onClick={() => approve(r)}>
                      {r.kind === 'blood' ? '✓ যাচাই করে প্রকাশ' : '✓ গ্রহণ'}
                    </button>
                    <button className="border border-red-300 text-red-600 text-xs rounded-lg px-3 py-1.5"
                      onClick={() => reject(r)}>
                      প্রত্যাখ্যান
                    </button>
                  </>
                )}
                <button className="text-xs underline text-gray-600" onClick={() => note(r)}>নোট</button>
                {canDelete && (
                  <button className="text-xs underline text-red-600" onClick={() => remove(r.id)}>মুছুন</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
