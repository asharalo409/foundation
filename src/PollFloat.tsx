import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

const BN = '০১২৩৪৫৬৭৮৯'
const bn = (v: any) => String(v).replace(/\d/g, d => BN[+d])

const CSS = `
@keyframes pf-bob{0%,100%{transform:translateY(0) rotate(-1.5deg)}50%{transform:translateY(-7px) rotate(1.5deg)}}
@keyframes pf-ring{0%{transform:scale(.8);opacity:.55}100%{transform:scale(1.55);opacity:0}}
@keyframes pf-drop{0%{transform:translateY(-22px);opacity:0}18%{opacity:1}62%{transform:translateY(5px);opacity:1}72%,100%{transform:translateY(7px);opacity:0}}
@keyframes pf-in{from{transform:translateX(30px);opacity:0}to{transform:none;opacity:1}}
.pf-wrap{animation:pf-in .5s cubic-bezier(.2,.9,.3,1.2) both}
.pf-bob{animation:pf-bob 3.4s ease-in-out infinite}
.pf-ring{animation:pf-ring 2.2s ease-out infinite}
.pf-paper{animation:pf-drop 2.8s ease-in infinite}
@media (prefers-reduced-motion:reduce){.pf-bob,.pf-ring,.pf-paper,.pf-wrap{animation:none !important}}
`

export default function PollFloat({ supabase, member, color = '#087a43', onNav }: any) {
  const [open, setOpen] = useState<any[]>([])
  const [voted, setVoted] = useState<Set<string>>(new Set())
  const [hide, setHide] = useState(() => { try { return sessionStorage.getItem('pf-hide') === '1' } catch { return false } })

  useEffect(() => {
    if (!member) return
    let off = false
    ;(async () => {
      const a = await supabase.from('polls').select('id, question, closes_at, is_closed').eq('is_closed', false).order('created_at', { ascending: false })
      const live = (a.data || []).filter((p: any) => !p.closes_at || new Date(p.closes_at) > new Date())
      const b = live.length ? await supabase.from('poll_votes').select('poll_id').eq('member_id', member.id) : { data: [] }
      if (off) return
      setOpen(live); setVoted(new Set((b.data || []).map((x: any) => x.poll_id)))
    })()
    return () => { off = true }
  }, [member?.id])

  if (!member || hide || open.length === 0) return null
  const todo = open.filter(p => !voted.has(p.id))
  const pending = todo.length > 0
  const first = (pending ? todo : open)[0]
  const dark = '#0b2a1c'

  return (
    <div className="pf-wrap fixed right-3 z-20 flex items-center gap-2" style={{ top: 76 }}>
      <style>{CSS}</style>
      <button onClick={() => onNav('polls')} aria-label="ভোট দিন"
        className="flex max-w-[190px] items-center gap-2 rounded-2xl border bg-white/95 py-1.5 pl-3 pr-1.5 text-left shadow-lg backdrop-blur"
        style={{ borderColor: color + '55' }}>
        <span className="min-w-0">
          <span className="block text-[10px] font-bold uppercase tracking-wide" style={{ color: pending ? color : '#64748b' }}>
            {pending ? `ভোট চলছে${todo.length > 1 ? ' (' + bn(todo.length) + 'টি)' : ''}` : 'আপনি ভোট দিয়েছেন'}
          </span>
          <span className="block truncate text-xs font-semibold text-slate-800">{first.question}</span>
        </span>

        <span className="relative grid h-14 w-14 shrink-0 place-items-center">
          {pending && <span className="pf-ring absolute inset-1 rounded-full" style={{ background: color }} />}
          <svg viewBox="0 0 64 64" className="pf-bob relative h-14 w-14" aria-hidden>
            <defs>
              <linearGradient id="pfb" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={color} /><stop offset="1" stopColor={dark} />
              </linearGradient>
            </defs>
            <g className="pf-paper"><rect x="25" y="8" width="14" height="18" rx="2" fill="#fff" stroke={color} strokeWidth="1.6" />
              <path d="m28.5 16.5 2.6 2.8 5-5.6" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></g>
            <rect x="9" y="26" width="46" height="30" rx="6" fill="url(#pfb)" />
            <rect x="9" y="26" width="46" height="9" rx="4.5" fill="#fff" fillOpacity=".16" />
            <rect x="20" y="25" width="24" height="5" rx="2.5" fill={dark} />
            <path d="M22 44h20M22 49h12" stroke="#fff" strokeOpacity=".55" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          {pending && (
            <span className="absolute -right-0.5 top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">{bn(todo.length)}</span>
          )}
        </span>
      </button>
      <button onClick={() => { setHide(true); try { sessionStorage.setItem('pf-hide', '1') } catch {} }} aria-label="লুকান"
        className="absolute -left-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-slate-700 text-white shadow"><X size={11} /></button>
    </div>
  )
}
