import { useEffect, useState } from 'react'
import { Ico } from './Icons'
import './Icons2'
import DonateBox from './DonateBox'
import RequestModal from './PublicForms'
import { ago } from './Notify'

const bn = (n: number) => Number(n || 0).toLocaleString('bn-BD')
const tel = (p: string) => 'tel:' + (p || '').replace(/[^\d+]/g, '')
const wa = (p: string) => {
  let d = (p || '').replace(/\D/g, '')
  if (d.startsWith('0')) d = '88' + d
  return 'https://wa.me/' + d
}

export default function UrgentBoard({ supabase, settings, member }: any) {
  const [blood, setBlood] = useState<any[]>([])
  const [aid, setAid] = useState<any[]>([])
  const [form, setForm] = useState('')
  const [donate, setDonate] = useState(false)
  const [, tick] = useState(0)

  async function load() {
    const [b, a] = await Promise.all([
      supabase.from('blood_board').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('aid_board').select('*').order('created_at', { ascending: false }).limit(6),
    ])
    let bd = b.data
    if (b.error) {
      // নতুন ভিউ এখনও তৈরি না হলে আগের তালিকায় ফিরে যাই
      const o = await supabase.from('blood_requests').select('*').order('created_at', { ascending: false }).limit(10)
      bd = o.data
    }
    setBlood(bd || [])
    setAid(a.error ? [] : a.data || [])
  }

  useEffect(() => {
    load()
    const h = () => load()
    window.addEventListener('alerts-new', h)
    const id = setInterval(() => tick(x => x + 1), 60000)
    return () => {
      window.removeEventListener('alerts-new', h)
      clearInterval(id)
    }
  }, [])

  const tile = (bg: string, icon: string, title: string, sub: string, k: string) => (
    <button onClick={() => setForm(k)}
      className="relative overflow-hidden rounded-3xl p-4 text-left text-white shadow-lg active:scale-95 transition"
      style={{ background: bg, minHeight: 156 }}>
      <span style={{ position: 'absolute', right: -26, top: -26, width: 104, height: 104, borderRadius: '50%', background: 'rgba(255,255,255,.14)' }} />
      <span className="relative w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,.22)' }}>
        <Ico name={icon} size={28} tint={0.5} />
      </span>
      <p className="relative font-extrabold text-lg leading-tight mt-3">{title}</p>
      <p className="relative text-[11px] opacity-90 mt-1 pr-10">{sub}</p>
      <span className="absolute bottom-3 right-3 text-xs font-bold rounded-full px-3 py-1" style={{ background: 'rgba(255,255,255,.25)' }}>
        আবেদন ›
      </span>
    </button>
  )

  return (
    <section className="space-y-3">
      <div>
        <p className="text-xs font-bold text-red-600 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" /> লাইভ
        </p>
        <h2 className="text-xl font-extrabold">জরুরি সাহায্য কেন্দ্র</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {tile('linear-gradient(145deg,#ef4444,#7f1d1d)', 'blood', 'রক্তের জন্য আবেদন', 'রক্ত দরকার? তথ্য দিন, দায়িত্বশীলরা যাচাই করে প্রকাশ করবেন', 'blood')}
        {tile('linear-gradient(145deg,#f59e0b,#92400e)', 'aid', 'সাহায্যের আবেদন', 'চিকিৎসা, শিক্ষা, খাদ্য বা অন্য প্রয়োজনে', 'aid')}
      </div>

      <div className="space-y-3">
        <p className="font-bold flex items-center gap-2 text-red-700">
          <Ico name="blood" size={20} /> এখন যাদের রক্ত দরকার
        </p>
        {blood.length === 0 && (
          <div className="rounded-2xl p-4 flex items-center gap-3 bg-white shadow-sm">
            <span className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#dcfce7', color: '#15803d' }}>
              <Ico name="works" size={22} />
            </span>
            <p className="text-sm text-gray-600">এখন কোনো রক্তের আবেদন নেই।</p>
          </div>
        )}
        {blood.map(r => (
          <div key={r.id} className="rounded-3xl overflow-hidden shadow-lg bg-white" style={{ border: '1px solid #fecaca' }}>
            <div className="flex">
              <div className="w-24 shrink-0 flex flex-col items-center justify-center text-white py-4"
                style={{ background: 'linear-gradient(160deg,#ef4444,#991b1b)' }}>
                <Ico name="blood" size={22} tint={0.5} />
                <span className="text-3xl font-extrabold leading-none mt-1">{r.blood_group}</span>
                <span className="text-[10px] opacity-90 mt-1">{r.urgent ? 'এখনই জরুরি' : 'রক্ত দরকার'}</span>
              </div>
              <div className="flex-1 p-3 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold truncate flex-1">{r.hospital || 'হাসপাতাল'}</p>
                  <span className="shrink-0 text-[10px] font-bold rounded-full px-2 py-0.5"
                    style={r.verified === false ? { background: '#fef3c7', color: '#92400e' } : { background: '#dcfce7', color: '#166534' }}>
                    {r.verified === false ? 'যাচাই চলছে' : 'যাচাইকৃত'}
                  </span>
                </div>
                {r.patient_problem && (
                  <p className="text-xs rounded-lg px-2 py-1.5" style={{ background: '#fef2f2', color: '#7f1d1d' }}>
                    <b>রোগীর সমস্যা:</b> {r.patient_problem}
                  </p>
                )}
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Ico name="map" size={14} /> {[r.upazila, r.district].filter(Boolean).join(', ') || '—'}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Ico name="clock" size={14} /> {ago(r.created_at)}
                </p>
                {r.note && <p className="text-xs text-gray-600 line-clamp-2">{r.note}</p>}
              </div>
            </div>
            {!r.contact && (
              <p className="text-[11px] text-center py-2 border-t border-red-100 text-gray-500">
                যাচাই শেষ হলে যোগাযোগের নম্বর এখানে আসবে{settings?.hotline ? '। জরুরি হলে হটলাইন: ' + settings.hotline : ''}
              </p>
            )}
            {r.contact && (
              <div className="grid grid-cols-2 border-t border-red-100">
                <a href={tel(r.contact)} className="py-3 flex items-center justify-center gap-2 font-bold text-white"
                  style={{ background: '#dc2626' }}>
                  <Ico name="phone" size={18} tint={0.6} /> কল করুন
                </a>
                <a href={wa(r.contact)} target="_blank" rel="noreferrer"
                  className="py-3 flex items-center justify-center gap-2 font-bold" style={{ color: '#15803d' }}>
                  <Ico name="chat" size={18} /> হোয়াটসঅ্যাপ
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <p className="font-bold flex items-center gap-2" style={{ color: '#b45309' }}>
          <Ico name="aid" size={20} /> সাহায্যের প্রয়োজন
        </p>
        {aid.length === 0 && (
          <div className="rounded-2xl p-4 flex items-center gap-3 bg-white shadow-sm">
            <span className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#fef3c7', color: '#b45309' }}>
              <Ico name="aid" size={22} />
            </span>
            <p className="text-sm text-gray-600">এখন কোনো অনুমোদিত সাহায্যের আবেদন নেই।</p>
          </div>
        )}
        {aid.map(r => (
          <div key={r.id} className="rounded-3xl overflow-hidden shadow-lg bg-white" style={{ border: '1px solid #fde68a' }}>
            <div className="p-4 space-y-2" style={{ background: 'linear-gradient(135deg,#fffbeb,#fff)' }}>
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg,#f59e0b,#b45309)' }}>
                  <Ico name="aid" size={26} tint={0.5} />
                </span>
                <div className="min-w-0">
                  <p className="font-extrabold">{r.aid_type}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Ico name="map" size={14} /> {[r.upazila, r.district].filter(Boolean).join(', ') || '—'} ·{' '}
                    <Ico name="clock" size={14} /> {ago(r.created_at)}
                  </p>
                </div>
              </div>
              {r.amount_needed ? (
                <p className="text-sm font-bold" style={{ color: '#b45309' }}>
                  আনুমানিক প্রয়োজন: ৳{bn(r.amount_needed)}
                </p>
              ) : null}
              {r.details && <p className="text-sm text-gray-700 whitespace-pre-line">{r.details}</p>}
            </div>
            <button onClick={() => setDonate(true)}
              className="w-full py-3 flex items-center justify-center gap-2 font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#f59e0b,#b45309)' }}>
              <Ico name="heart" size={18} tint={0.6} /> দান করে সহায়তা করুন
            </button>
          </div>
        ))}
        <p className="text-[11px] text-gray-400">
          গোপনীয়তার জন্য আবেদনকারীর নাম ও ফোন এখানে দেখানো হয় না। সরাসরি সাহায্য করতে চাইলে সভাপতি বা সাধারণ সম্পাদকের সাথে কথা বলুন।
        </p>
      </div>

      {form && <RequestModal supabase={supabase} kind={form} settings={settings} onClose={() => setForm('')} />}
      {donate && (
        <DonateBox supabase={supabase} settings={settings} member={member} isMember
          onClose={() => setDonate(false)} onFinance={() => setDonate(false)} />
      )}
    </section>
  )
}
