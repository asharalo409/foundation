import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Phone, MessageCircle, Facebook, Contact, X } from 'lucide-react'

type Group = { key: string; label: string; items: any[] }

const digits = (s: string) => (s || '').replace(/\D/g, '')
// বাংলাদেশি নম্বর হলে ৮৮ যোগ করে হোয়াটসঅ্যাপ লিংক বানায়
const waLink = (n: string) => {
  const d = digits(n)
  if (!d) return ''
  return 'https://wa.me/' + (d.startsWith('0') ? '88' + d : d)
}
const fbLink = (u: string) => {
  const v = (u || '').trim()
  if (!v) return ''
  return /^https?:\/\//i.test(v) ? v : 'https://' + v.replace(/^\/+/, '')
}

export default function Committee({ supabase, color = '#087a43', onNav, isMem }: any) {
  const [list, setList] = useState<any[]>([])
  const [sel, setSel] = useState<any>(null)

  useEffect(() => {
    supabase.from('committee_public').select('*')
      .order('rank').order('full_name')
      .then(({ data }: any) => setList(data || []))
  }, [])

  if (!list.length) return null

  const groups: Group[] = []
  list.forEach(m => {
    let g = groups.find(x => x.key === m.role_key)
    if (!g) {
      g = { key: m.role_key, label: m.role_label, items: [] }
      groups.push(g)
    }
    g.items.push(m)
  })

  const phone = sel ? (sel.phone || '').trim() : ''
  const wa = sel ? waLink(sel.whatsapp || sel.phone) : ''
  const fb = sel ? fbLink(sel.facebook_url) : ''
  const none = !phone && !wa && !fb
  const act = 'flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white active:opacity-80'

  function openCard() {
    try { sessionStorage.setItem('open-member', sel.id) } catch {}
    setSel(null)
    onNav?.('members')
  }

  return (
    <section className="rounded-2xl border bg-white p-4 space-y-5">
      <div className="text-center">
        <h2 className="font-bold text-base">আমাদের কমিটি</h2>
        <p className="text-[11px] text-gray-500">ছবিতে চাপ দিলে পরিচয় ও যোগাযোগ দেখা যাবে</p>
      </div>

      {groups.map((g, gi) => {
        const size = gi === 0 ? 88 : 64
        return (
          <div key={g.key}>
            <div className="flex items-center gap-2 mb-3">
              <span className="flex-1 h-px" style={{ background: color + '44' }} />
              <span className="text-xs font-bold px-2" style={{ color }}>{g.label}</span>
              <span className="flex-1 h-px" style={{ background: color + '44' }} />
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-4">
              {g.items.map(m => (
                <button type="button" key={m.id} onClick={() => setSel(m)}
                  className="flex flex-col items-center text-center active:scale-95 transition"
                  style={{ width: size + 20 }}>
                  <div className="rounded-full overflow-hidden flex items-center justify-center bg-gray-100 font-bold"
                    style={{
                      width: size, height: size, border: `3px solid ${color}`,
                      boxShadow: `0 4px 14px ${color}44`, color, fontSize: size / 2.6,
                    }}>
                    {m.photo_url
                      ? <img src={m.photo_url} alt={m.full_name} loading="lazy"
                          className="w-full h-full object-cover" />
                      : (m.full_name || '?').slice(0, 1)}
                  </div>
                  <p className="mt-1.5 text-[12px] font-semibold leading-tight line-clamp-2">{m.full_name}</p>
                </button>
              ))}
            </div>
          </div>
        )
      })}

      {sel && createPortal(
        <div className="fixed inset-0 z-[80] bg-black/60 flex items-end sm:items-center justify-center"
          onClick={() => setSel(null)}>
          <div className="relative bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="h-20" style={{ background: `linear-gradient(135deg, ${color}, #0b3d2e)` }} />
            <button type="button" onClick={() => setSel(null)} aria-label="বন্ধ করুন"
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white"
              style={{ background: 'rgba(0,0,0,.3)' }}>
              <X className="w-4 h-4" />
            </button>
            <div className="px-5 pb-5 -mt-12 text-center space-y-3">
              <div className="mx-auto w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-3xl font-bold"
                style={{ border: `4px solid #fff`, boxShadow: `0 6px 18px ${color}55`, color }}>
                {sel.photo_url
                  ? <img src={sel.photo_url} alt={sel.full_name} className="w-full h-full object-cover" />
                  : (sel.full_name || '?').slice(0, 1)}
              </div>
              <div>
                <h3 className="text-lg font-bold leading-tight">{sel.full_name}</h3>
                <p className="text-sm font-semibold" style={{ color }}>{sel.role_label}</p>
              </div>

              <div className="grid gap-2">
                {phone && (
                  <a href={'tel:' + phone} className={act} style={{ background: color }}>
                    <Phone className="w-4 h-4" /> কল করুন · {phone}
                  </a>
                )}
                {wa && (
                  <a href={wa} target="_blank" rel="noreferrer" className={act} style={{ background: '#16a34a' }}>
                    <MessageCircle className="w-4 h-4" /> হোয়াটসঅ্যাপে বার্তা
                  </a>
                )}
                {fb && (
                  <a href={fb} target="_blank" rel="noreferrer" className={act} style={{ background: '#1877f2' }}>
                    <Facebook className="w-4 h-4" /> ফেসবুক প্রোফাইল
                  </a>
                )}
                {none && (
                  <p className="text-xs text-gray-500">এই দায়িত্বশীলের যোগাযোগের তথ্য এখানে দেওয়া নেই।</p>
                )}
                {isMem && (
                  <button type="button" onClick={openCard}
                    className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold border-2 active:opacity-80"
                    style={{ color, borderColor: color }}>
                    <Contact className="w-4 h-4" /> আইডি কার্ড দেখুন
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  )
}
