import { useEffect, useState } from 'react'

function brand() {
  try {
    const b = JSON.parse(localStorage.getItem('brand-v1') || 'null')
    return b && typeof b === 'object' ? b : null
  } catch { return null }
}

const HEART = 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'

const LINES = ['খাবার পৌঁছে দিচ্ছি...', 'পাশে দাঁড়াচ্ছি...', 'মানবতার সেবায়...']

// স্বেচ্ছাসেবক খাবারের গাড়ি ঠেলে অসহায় পরিবারের কাছে যাচ্ছেন; রাস্তা সরছে, চাকা ঘুরছে, ভালোবাসার হৃদয় উড়ছে।
function Scene() {
  const skin = '#f3c9a0'
  const ground = 118
  return (
    <svg viewBox="0 0 320 150" className="w-full" role="img" aria-label="স্বেচ্ছাসেবক খাবার পৌঁছে দিচ্ছেন">
      {/* দূরের বাড়ি, ধীরে সরে যায় */}
      <g className="sp-a" style={{ animation: 'sp-far 10s linear infinite' }} fill="rgba(255,255,255,.08)">
        {[0, 160, 320].map(o => (
          <g key={o} transform={`translate(${o} 0)`}>
            <rect x="14" y="84" width="34" height="34" />
            <path d="M10 84l21-18 21 18z" />
            <rect x="82" y="92" width="28" height="26" />
            <path d="M78 92l18-14 18 14z" />
            <rect x="122" y="80" width="26" height="38" />
          </g>
        ))}
      </g>

      {/* মাটি ও সরতে থাকা রাস্তার দাগ */}
      <line x1="0" y1={ground} x2="320" y2={ground} stroke="rgba(255,255,255,.4)" strokeWidth="2" />
      <line x1="0" y1="134" x2="320" y2="134" stroke="rgba(255,255,255,.28)" strokeWidth="3"
        strokeDasharray="16 12" className="sp-a" style={{ animation: 'sp-dash .8s linear infinite' }} />

      {/* স্বেচ্ছাসেবক ও গাড়ি */}
      <g className="sp-a" style={{ animation: 'sp-bob .5s ease-in-out infinite alternate' }}>
        <g className="sp-a" style={{ transformOrigin: '90px 100px', animation: 'sp-leg .5s ease-in-out infinite alternate' }}>
          <path d="M90 100V118" stroke="#1f2937" strokeWidth="5" strokeLinecap="round" />
        </g>
        <g className="sp-a" style={{ transformOrigin: '90px 100px', animation: 'sp-leg .5s ease-in-out infinite alternate-reverse' }}>
          <path d="M90 100V118" stroke="#374151" strokeWidth="5" strokeLinecap="round" />
        </g>
        <rect x="81" y="72" width="18" height="30" rx="8" fill="#fbbf24" />
        <path d="M81 80h18" stroke="#fff" strokeWidth="3" />
        <circle cx="90" cy="63" r="8" fill={skin} />
        <path d="M82 62a8 8 0 0116 0z" fill="#fff" />
        <path d="M96 80L116 90" stroke={skin} strokeWidth="4" strokeLinecap="round" />
        <path d="M96 85L116 93" stroke="#d6a97c" strokeWidth="4" strokeLinecap="round" />

        <path d="M112 93L119 84" stroke="#92400e" strokeWidth="3" strokeLinecap="round" />
        <path d="M118 82h56l-6 22h-44z" fill="#b45309" />
        <rect x="116" y="80" width="60" height="4" rx="2" fill="#92400e" />
        <path d="M126 82c-2-8 2-14 8-14s10 6 8 14z" fill="#fde68a" />
        <rect x="146" y="64" width="20" height="18" rx="2" fill="#fff" />
        <path transform="translate(149 67) scale(.6)" d={HEART} fill="#ef4444" />
        {[132, 164].map(x => (
          <g key={x} className="sp-a" style={{ transformOrigin: `${x}px 108px`, animation: 'sp-spin .7s linear infinite' }}>
            <circle cx={x} cy="108" r="10" fill="#111827" stroke="#9ca3af" strokeWidth="2" />
            <path d={`M${x} 99V117M${x - 9} 108H${x + 9}`} stroke="#9ca3af" strokeWidth="2" />
          </g>
        ))}
      </g>

      {/* অপেক্ষায় থাকা পরিবার */}
      <g>
        <path d="M261 100V118M267 100V118" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" />
        <rect x="252" y="72" width="18" height="30" rx="8" fill="#60a5fa" />
        <circle cx="261" cy="63" r="8" fill={skin} />
        <path d="M252 61a9 9 0 0118 0c-3-3-15-3-18 0z" fill="#1f2937" />
        <path d="M254 78L244 64M268 78L277 66" stroke={skin} strokeWidth="4" strokeLinecap="round" />
        <path d="M286 106V118M291 106V118" stroke="#1f2937" strokeWidth="3.4" strokeLinecap="round" />
        <rect x="280" y="88" width="16" height="20" rx="6" fill="#f472b6" />
        <circle cx="288" cy="81" r="6.4" fill={skin} />
        <path d="M282 88L277 76M295 88L300 76" stroke={skin} strokeWidth="3.4" strokeLinecap="round" />
        {[-14, 0, 14].map((dx, i) => (
          <g key={i} transform={`translate(${268 + dx} 46) scale(.5)`}>
            <path className="sp-a" d={HEART} fill="#f87171"
              style={{
                transformBox: 'fill-box', transformOrigin: 'center',
                animation: `sp-heart 2.4s ease-out ${i * 0.8}s infinite`, opacity: 0,
              }} />
          </g>
        ))}
      </g>
    </svg>
  )
}

export default function Splash({ ready }: { ready: boolean }) {
  const [phase, setPhase] = useState<'show' | 'fade' | 'gone'>('show')
  const [t0] = useState(Date.now())
  const [b] = useState(brand)
  const [li, setLi] = useState(0)

  useEffect(() => {
    const m = setTimeout(() => setPhase(p => (p === 'show' ? 'fade' : p)), 3500)
    return () => clearTimeout(m)
  }, [])

  useEffect(() => {
    const id = setInterval(() => setLi(i => (i + 1) % LINES.length), 1400)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!ready) return
    // দৃশ্যটা অন্তত একটু দেখানোর জন্য ১.৪ সেকেন্ড অপেক্ষা
    const wait = Math.max(0, 1400 - (Date.now() - t0))
    const a = setTimeout(() => setPhase(p => (p === 'show' ? 'fade' : p)), wait)
    return () => clearTimeout(a)
  }, [ready])

  useEffect(() => {
    if (phase !== 'fade') return
    const c = setTimeout(() => setPhase('gone'), 500)
    return () => clearTimeout(c)
  }, [phase])

  if (phase === 'gone') return null

  const color = b?.color || '#087a43'

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 text-white px-6"
      style={{
        background: `linear-gradient(160deg, ${color}, #062e1d 70%, #020b07)`,
        opacity: phase === 'fade' ? 0 : 1,
        transition: 'opacity .5s ease',
        pointerEvents: phase === 'fade' ? 'none' : 'auto',
      }}
    >
      <style>{`
        @keyframes sp-spin{to{transform:rotate(360deg)}}
        @keyframes sp-pop{0%{transform:scale(.8);opacity:0}100%{transform:scale(1);opacity:1}}
        @keyframes sp-bar{0%{transform:translateX(-120%)}100%{transform:translateX(320%)}}
        @keyframes sp-far{to{transform:translateX(-160px)}}
        @keyframes sp-dash{to{stroke-dashoffset:28}}
        @keyframes sp-bob{from{transform:translateY(0)}to{transform:translateY(-1.6px)}}
        @keyframes sp-leg{from{transform:rotate(-26deg)}to{transform:rotate(26deg)}}
        @keyframes sp-heart{0%{transform:translateY(0) scale(.5);opacity:0}25%{opacity:1}100%{transform:translateY(-52px) scale(1.1);opacity:0}}
        @keyframes sp-msg{0%{opacity:0;transform:translateY(4px)}20%,80%{opacity:1;transform:none}100%{opacity:0}}
        @media (prefers-reduced-motion:reduce){.sp-a{animation:none !important}}
      `}</style>

      <div className="sp-a relative w-28 h-28 flex items-center justify-center"
        style={{ animation: 'sp-pop .6s ease-out' }}>
        <span className="sp-a absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0%, #fbbf24 35%, transparent 70%)',
            animation: 'sp-spin 1.6s linear infinite',
          }} />
        <span className="absolute rounded-full" style={{ inset: 4, background: '#06261a' }} />
        <div className="relative w-[88px] h-[88px] rounded-full overflow-hidden flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,.08)' }}>
          {b?.logo ? (
            <img src={b.logo} className="w-full h-full object-cover" />
          ) : (
            <svg viewBox="0 0 24 24" className="w-11 h-11" fill="#4ade80">
              <path d={HEART} />
            </svg>
          )}
        </div>
      </div>

      {b?.name && <p className="text-xl font-bold text-center">{b.name}</p>}

      <div className="w-full max-w-[340px]"><Scene /></div>

      <p key={li} className="sp-a text-sm font-semibold h-5 text-center"
        style={{ animation: 'sp-msg 1.4s ease both', color: '#fde68a' }}>
        {LINES[li]}
      </p>

      <div className="w-32 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.2)' }}>
        <div className="sp-a h-full w-1/3 rounded-full"
          style={{ background: '#fbbf24', animation: 'sp-bar 1.2s ease-in-out infinite' }} />
      </div>
    </div>
  )
}
