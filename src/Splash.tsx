
import { useEffect, useState } from 'react'

function brand() {
  try {
    const b = JSON.parse(localStorage.getItem('brand-v1') || 'null')
    return b && typeof b === 'object' ? b : null
  } catch { return null }
}

const HEART = 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'
const STAR = 'M0 -7L1.8 -1.8L7 0L1.8 1.8L0 7L-1.8 1.8L-7 0L-1.8 -1.8Z'

const WORDS = ['মানুষের', 'পাশে,', 'মানবতার', 'পাশে']

// সময়রেখা (মিলিসেকেন্ড)
const WALK = 2900      // স্বেচ্ছাসেবক এক মাথা থেকে অন্য মাথায় পৌঁছান
const STORY = 4000     // আনন্দের মুহূর্ত শেষ, এরপর স্বাগতম
const HARD = 8500      // যাই হোক, এর বেশি আটকে রাখব না

const GROUND = 128
const SKIN = ['#f3c9a0', '#e0ac7e', '#c68e64', '#f3c9a0']

// ক্ষুধার্ত পরিবারের একজন। পায়ের পাতা (0,0) বিন্দুতে।
function Person({ x, s, skin, shirt, long, happy }: {
  x: number; s: number; skin: string; shirt: [string, string]; long?: boolean; happy: boolean
}) {
  return (
    <g transform={`translate(${x} ${GROUND}) scale(${s})`}>
      <path d="M-4 -22V0M4 -22V0" stroke="#1f2937" strokeWidth="4.4" strokeLinecap="round" />
      <rect x="-9" y="-52" width="18" height="32" rx="8" fill={happy ? shirt[1] : shirt[0]} style={{ transition: 'fill .5s' }} />
      {/* হাত: ক্ষুধায় ঝুলে থাকে, খাবার পেলে উঠে যায় */}
      <path d={happy ? 'M-8 -47L-18 -64M8 -47L18 -64' : 'M-8 -47L-11 -27M8 -47L11 -27'}
        stroke={skin} strokeWidth="3.6" strokeLinecap="round" />
      {long && <path d="M-9 -64q-2 14 2 24M9 -64q2 14-2 24" stroke="#111827" strokeWidth="4" fill="none" strokeLinecap="round" />}
      <circle cx="0" cy="-60" r="8" fill={skin} />
      <path d={long ? 'M-9 -60a9 9 0 0118 0c-5-4-13-4-18 0z' : 'M-8.5 -61a8.5 8.5 0 0117 0c-4-3-13-3-17 0z'} fill="#111827" />
      <circle cx="-3" cy="-59.5" r="1" fill="#1f2937" />
      <circle cx="3" cy="-59.5" r="1" fill="#1f2937" />
      {!happy && <path d="M-5 -64.4l3 1M5 -64.4l-3 1" stroke="#1f2937" strokeWidth=".9" strokeLinecap="round" />}
      <path d={happy ? 'M-4 -56.4q4 4.4 8 0' : 'M-3.6 -54q3.6-3 7.2 0'} stroke="#7c2d12" strokeWidth="1.1" fill="none" strokeLinecap="round" />
    </g>
  )
}

function Scene({ happy }: { happy: boolean }) {
  const skin = '#f3c9a0'
  const run = (extra: string) => (happy ? 'none' : extra)
  const folk: Array<{ x: number; s: number; shirt: [string, string]; long?: boolean }> = [
    { x: 322, s: 1, shirt: ['#64748b', '#60a5fa'] },
    { x: 350, s: .96, shirt: ['#6b7280', '#f472b6'], long: true },
    { x: 374, s: .66, shirt: ['#78716c', '#34d399'] },
    { x: 394, s: .56, shirt: ['#71717a', '#fb923c'] },
  ]
  return (
    <svg viewBox="0 16 420 144" className="w-full" role="img" aria-label="স্বেচ্ছাসেবক ক্ষুধার্ত পরিবারকে খাবার পৌঁছে দিচ্ছেন">
      <defs>
        <radialGradient id="sp-glow">
          <stop offset="0" stopColor="#fff" stopOpacity=".95" />
          <stop offset=".45" stopColor="#fde68a" stopOpacity=".5" />
          <stop offset="1" stopColor="#fde68a" stopOpacity="0" />
        </radialGradient>
        <clipPath id="sp-sky"><rect x="0" y="0" width="420" height={GROUND} /></clipPath>
      </defs>

      {/* আকাশের তারা */}
      {[[20, 20, 0], [60, 40, .6], [118, 16, 1.1], [180, 34, .3], [236, 14, .9], [290, 30, 1.4], [400, 18, .5], [30, 70, 1.2], [140, 62, .2]].map(([x, y, d], i) => (
        <circle key={i} cx={x} cy={y} r="1.3" fill="#fff" className="sp-a"
          style={{ opacity: .15, animation: `sp-tw 2.2s ease-in-out ${d}s infinite` }} />
      ))}

      {/* ভোরের সূর্য: খাবার পৌঁছালে ওঠে */}
      <g clipPath="url(#sp-sky)">
        <g className="sp-a" style={{ transform: happy ? 'translateY(0)' : 'translateY(60px)', transition: 'transform 1.1s cubic-bezier(.2,.8,.2,1)' }}>
          <circle cx="352" cy="118" r="52" fill="url(#sp-glow)" />
          <circle cx="352" cy="118" r="22" fill="#fbbf24" />
        </g>
      </g>

      {/* দূরের বাড়ি */}
      <g fill="rgba(255,255,255,.07)">
        {[0, 210].map(o => (
          <g key={o} transform={`translate(${o} 0)`}>
            <rect x="14" y="94" width="34" height="34" />
            <path d="M10 94l21-18 21 18z" />
            <rect x="82" y="102" width="28" height="26" />
            <path d="M78 102l18-14 18 14z" />
            <rect x="122" y="90" width="26" height="38" />
            <rect x="160" y="104" width="24" height="24" />
            <path d="M156 104l16-12 16 12z" />
          </g>
        ))}
      </g>

      <line x1="0" y1={GROUND} x2="420" y2={GROUND} stroke="rgba(255,255,255,.4)" strokeWidth="2" />
      <line x1="0" y1="144" x2="420" y2="144" stroke="rgba(255,255,255,.22)" strokeWidth="3" strokeDasharray="16 12" className="sp-a"
        style={{ animation: run('sp-road .5s linear infinite') }} />

      {/* ক্ষুধার্ত পরিবারের ভাবনা: খালি থালা */}
      <g style={{ opacity: happy ? 0 : 1, transition: 'opacity .3s' }}>
        <circle cx="322" cy="52" r="2" fill="rgba(255,255,255,.5)" />
        <circle cx="328" cy="44" r="3" fill="rgba(255,255,255,.5)" />
        <ellipse cx="348" cy="28" rx="22" ry="13" fill="rgba(255,255,255,.18)" />
        <ellipse cx="348" cy="30" rx="10" ry="3.4" fill="none" stroke="#fff" strokeWidth="1.4" />
        <path d="M339 30q9 6 18 0" fill="none" stroke="#fff" strokeWidth="1.4" />
      </g>

      {/* পরিবার */}
      {folk.map((p, i) => (
        <Person key={i} x={p.x} s={p.s} skin={SKIN[i]} shirt={p.shirt} long={p.long} happy={happy} />
      ))}

      {/* স্বেচ্ছাসেবক: বাঁ প্রান্ত থেকে ডান প্রান্ত অবধি */}
      <g transform="translate(0 10)">
        <g className="sp-a" style={{ animation: `sp-walk ${WALK}ms cubic-bezier(.25,.55,.35,1) forwards` }}>
          <g className="sp-a" style={{ animation: run('sp-bob .42s ease-in-out infinite alternate') }}>
            <g className="sp-a" style={{ transformOrigin: '90px 100px', animation: run('sp-leg .42s ease-in-out infinite alternate') }}>
              <path d="M90 100V118" stroke="#1f2937" strokeWidth="5" strokeLinecap="round" />
            </g>
            <g className="sp-a" style={{ transformOrigin: '90px 100px', animation: run('sp-leg .42s ease-in-out infinite alternate-reverse') }}>
              <path d="M90 100V118" stroke="#374151" strokeWidth="5" strokeLinecap="round" />
            </g>
            <rect x="81" y="72" width="18" height="30" rx="8" fill="#fbbf24" />
            <path d="M81 80h18" stroke="#fff" strokeWidth="3" />
            <circle cx="90" cy="63" r="8" fill={skin} />
            <path d="M82 62a8 8 0 0116 0z" fill="#fff" />
            <circle cx="93" cy="64" r="1" fill="#1f2937" />
            <path d={happy ? 'M87.5 66.8q3 3 6 0' : 'M88 67.4q2.6 1.4 5 0'} stroke="#7c2d12" strokeWidth="1" fill="none" strokeLinecap="round" />
            <path d="M96 80L116 90" stroke={skin} strokeWidth="4" strokeLinecap="round" />
            <path d="M96 85L116 93" stroke="#d6a97c" strokeWidth="4" strokeLinecap="round" />

            {/* খাবারের গাড়ি */}
            <path d="M112 93L119 84" stroke="#92400e" strokeWidth="3" strokeLinecap="round" />
            <path d="M118 82h56l-6 22h-44z" fill="#b45309" />
            <rect x="116" y="80" width="60" height="4" rx="2" fill="#92400e" />
            <path d="M126 82c-2-8 2-14 8-14s10 6 8 14z" fill="#fde68a" />
            <rect x="146" y="64" width="20" height="18" rx="2" fill="#fff" />
            <path transform="translate(149 67) scale(.6)" d={HEART} fill="#ef4444" />
            {[132, 164].map(x => (
              <g key={x} className="sp-a" style={{ transformOrigin: `${x}px 108px`, animation: happy ? 'none' : 'sp-spin .8s linear infinite' }}>
                <circle cx={x} cy="108" r="10" fill="#111827" stroke="#9ca3af" strokeWidth="2" />
                <path d={`M${x} 99V117M${x - 9} 108H${x + 9}`} stroke="#9ca3af" strokeWidth="2" />
              </g>
            ))}
          </g>
        </g>
      </g>

      {happy && (
        <>
          {/* আলোর ঝলক */}
          <circle cx="345" cy="92" r="70" fill="url(#sp-glow)" className="sp-a"
            style={{ opacity: 0, transformBox: 'fill-box', transformOrigin: 'center', animation: 'sp-flash 1.1s ease-out both' }} />
          {/* ভালোবাসার হৃদয় */}
          {[322, 350, 374, 394, 336, 362].map((hx, i) => (
            <g key={i} transform={`translate(${hx - 5} 52) scale(.5)`}>
              <path className="sp-a" d={HEART} fill="#f87171"
                style={{
                  transformBox: 'fill-box', transformOrigin: 'center', opacity: 0,
                  animation: `sp-heart 1.8s ease-out ${i * 0.16}s infinite`,
                }} />
            </g>
          ))}
          {/* পরিবারের সামনে খাবারের থালা */}
          {[326, 354, 376, 396].map((px, i) => (
            <g key={i} className="sp-a"
              style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: `sp-pop .5s ease-out ${i * 0.08}s both` }}>
              <ellipse cx={px} cy={GROUND + 5} rx="8" ry="2.6" fill="#fff" />
              <path d={`M${px - 6} ${GROUND + 4}c0-6 3-8 6-8s6 2 6 8z`} fill="#fbbf24" />
            </g>
          ))}
        </>
      )}
    </svg>
  )
}

const SPARKS = [
  [12, 18, 0], [84, 14, .4], [22, 70, .9], [76, 74, .2], [50, 8, .7], [8, 46, 1.1],
  [92, 48, .5], [34, 88, 1.3], [66, 90, .1], [30, 30, 1.6], [70, 34, .8], [56, 62, 1.4],
]

export default function Splash({ ready }: { ready: boolean }) {
  const [phase, setPhase] = useState<'show' | 'fade' | 'gone'>('show')
  const [b] = useState(brand)
  // একই সেশনে দ্বিতীয়বার এলে গল্প বাদ, শুধু ছোট স্বাগতম
  const [seen] = useState(() => {
    try { return sessionStorage.getItem('sp-seen') === '1' } catch { return false }
  })
  const [happy, setHappy] = useState(seen)
  const [storyDone, setStoryDone] = useState(seen)
  const [welcome, setWelcome] = useState(false)

  useEffect(() => {
    if (seen) return
    const a = setTimeout(() => setHappy(true), WALK + 80)
    const c = setTimeout(() => setStoryDone(true), STORY)
    return () => { clearTimeout(a); clearTimeout(c) }
  }, [])

  // হোম পেজ তৈরি আর গল্প শেষ হলে স্বাগতম
  useEffect(() => {
    if (storyDone && ready) setWelcome(true)
  }, [storyDone, ready])

  useEffect(() => {
    if (!welcome) return
    try { sessionStorage.setItem('sp-seen', '1') } catch {}
    const t = setTimeout(() => setPhase(p => (p === 'show' ? 'fade' : p)), seen ? 1200 : 2100)
    return () => clearTimeout(t)
  }, [welcome])

  useEffect(() => {
    const m = setTimeout(() => setPhase(p => (p === 'show' ? 'fade' : p)), HARD)
    return () => clearTimeout(m)
  }, [])

  useEffect(() => {
    if (phase !== 'fade') return
    const c = setTimeout(() => setPhase('gone'), 500)
    return () => clearTimeout(c)
  }, [phase])

  if (phase === 'gone') return null

  const color = b?.color || '#087a43'
  const name = b?.name || 'মানবসেবা ফাউন্ডেশন'

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 text-white px-4 overflow-hidden"
      style={{
        background: `linear-gradient(160deg, ${color}, #062e1d 70%, #020b07)`,
        opacity: phase === 'fade' ? 0 : 1,
        transition: 'opacity .5s ease',
        pointerEvents: phase === 'fade' ? 'none' : 'auto',
      }}
    >
      <style>{`
        @keyframes sp-spin{to{transform:rotate(360deg)}}
        @keyframes sp-pop{0%{transform:scale(.4);opacity:0}100%{transform:scale(1);opacity:1}}
        @keyframes sp-walk{from{transform:translateX(-250px)}to{transform:translateX(112px)}}
        @keyframes sp-road{to{stroke-dashoffset:-28}}
        @keyframes sp-bob{from{transform:translateY(0)}to{transform:translateY(-1.8px)}}
        @keyframes sp-leg{from{transform:rotate(-26deg)}to{transform:rotate(26deg)}}
        @keyframes sp-heart{0%{transform:translateY(0) scale(.5);opacity:0}25%{opacity:1}100%{transform:translateY(-52px) scale(1.1);opacity:0}}
        @keyframes sp-word{0%{opacity:0;transform:translateY(10px);filter:blur(4px)}100%{opacity:1;transform:none;filter:none}}
        @keyframes sp-fill{from{transform:scaleX(0)}to{transform:scaleX(1)}}
        @keyframes sp-flash{0%{opacity:.95;transform:scale(.3)}100%{opacity:0;transform:scale(2.2)}}
        @keyframes sp-screen{0%{opacity:1}100%{opacity:0}}
        @keyframes sp-beam{from{transform:translateX(-60vw) skewX(-18deg)}to{transform:translateX(160vw) skewX(-18deg)}}
        @keyframes sp-rot{to{transform:rotate(360deg)}}
        @keyframes sp-rays{0%{opacity:0;transform:scale(.4) rotate(0deg)}30%{opacity:1}100%{opacity:1;transform:scale(1) rotate(90deg)}}
        @keyframes sp-tw{0%,100%{opacity:.1;transform:scale(.3)}50%{opacity:1;transform:scale(1)}}
        @keyframes sp-shine{to{background-position:-200% 0}}
        @keyframes sp-rise{0%{opacity:0;transform:translateY(14px) scale(.96)}100%{opacity:1;transform:none}}
        @media (prefers-reduced-motion:reduce){.sp-a{animation:none !important}}
      `}</style>

      {/* স্বাগতমের আলোর রশ্মি */}
      {welcome && (
        <div className="sp-a absolute pointer-events-none"
          style={{
            left: '50%', top: '42%', width: 1100, height: 1100, margin: '-550px 0 0 -550px',
            background: 'repeating-conic-gradient(from 0deg, rgba(253,230,138,.22) 0 7deg, transparent 7deg 22deg)',
            WebkitMaskImage: 'radial-gradient(circle, #000 0, transparent 62%)',
            maskImage: 'radial-gradient(circle, #000 0, transparent 62%)',
            animation: 'sp-rays 1.4s ease-out both',
          }}>
          <div className="sp-a w-full h-full" style={{ animation: 'sp-rot 24s linear infinite' }} />
        </div>
      )}

      {/* লোগো সবসময় থাকে */}
      <div className="sp-a relative w-24 h-24 flex items-center justify-center"
        style={{
          animation: 'sp-pop .6s ease-out',
          transform: welcome ? 'scale(1.18)' : 'scale(1)',
          transition: 'transform .6s ease',
        }}>
        <span className="sp-a absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0%, #fbbf24 35%, transparent 70%)',
            animation: `sp-spin ${welcome ? 3 : 1.6}s linear infinite`,
          }} />
        <span className="absolute rounded-full" style={{ inset: 4, background: '#06261a' }} />
        <div className="relative w-[74px] h-[74px] rounded-full overflow-hidden flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,.08)' }}>
          {b?.logo ? (
            <img src={b.logo} className="w-full h-full object-cover" />
          ) : (
            <svg viewBox="0 0 24 24" className="w-10 h-10" fill="#4ade80">
              <path d={HEART} />
            </svg>
          )}
        </div>
      </div>

      <div className="relative w-full max-w-[560px]" style={{ minHeight: 250 }}>
        {/* গল্প: স্বেচ্ছাসেবক ও ক্ষুধার্ত পরিবার */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
          style={{ opacity: welcome ? 0 : 1, transition: 'opacity .4s ease' }}>
          <div className="w-full"><Scene happy={happy} /></div>
          <p className="text-xl font-bold text-center leading-snug" style={{ color: '#fde68a', minHeight: 30 }}>
            {WORDS.map((w, i) => (
              <span key={w + i} className="sp-a inline-block mx-[4px]"
                style={{ animation: `sp-word .6s ease ${(seen ? 0 : 0.35 + i * 0.6)}s both` }}>
                {w}
              </span>
            ))}
          </p>
          <div className="w-36 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.2)' }}>
            <div className="sp-a h-full w-full rounded-full"
              style={{ background: '#fbbf24', transformOrigin: 'left', animation: `sp-fill ${STORY}ms linear both` }} />
          </div>
        </div>

        {/* স্বাগতম */}
        {welcome && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-2">
            <h1 className="sp-a font-bold leading-tight"
              style={{
                fontSize: 56, animation: 'sp-rise .7s ease .15s both, sp-shine 2.2s linear .8s infinite',
                background: 'linear-gradient(100deg,#fde68a 25%,#ffffff 50%,#fde68a 75%)',
                backgroundSize: '200% 100%', WebkitBackgroundClip: 'text', backgroundClip: 'text',
                color: 'transparent', WebkitTextFillColor: 'transparent',
              }}>
              স্বাগতম
            </h1>
            <p className="sp-a text-base leading-snug px-2" style={{ animation: 'sp-rise .7s ease .5s both' }}>
              আপনাকে <b style={{ color: '#fde68a' }}>{name}</b>-এর পক্ষ থেকে আন্তরিক শুভেচ্ছা
            </p>
            <span className="sp-a block h-[3px] w-28 rounded-full"
              style={{ background: 'linear-gradient(90deg,transparent,#fbbf24,transparent)', animation: 'sp-rise .7s ease .8s both' }} />
          </div>
        )}
      </div>

      {/* আলোর ঝলকানি, আলোর রেখা ও তারা */}
      {welcome && (
        <>
          <div className="sp-a absolute inset-0 pointer-events-none"
            style={{
              opacity: 0,
              background: 'radial-gradient(circle at 50% 45%, #fff 0, rgba(253,230,138,.7) 40%, rgba(253,230,138,.2) 80%)',
              animation: 'sp-screen .9s ease-out both',
            }} />
          <div className="sp-a absolute top-0 bottom-0 pointer-events-none"
            style={{
              left: 0, width: '26vw',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.55), transparent)',
              animation: 'sp-beam 1.1s ease-in-out .1s both',
            }} />
          {SPARKS.map(([x, y, d], i) => (
            <svg key={i} viewBox="-8 -8 16 16" width={i % 3 === 0 ? 16 : 11} height={i % 3 === 0 ? 16 : 11}
              className="sp-a absolute pointer-events-none"
              style={{ left: x + '%', top: y + '%', opacity: 0, animation: `sp-tw 1.6s ease-in-out ${d}s infinite` }}>
              <path d={STAR} fill="#fde68a" />
            </svg>
          ))}
        </>
      )}
    </div>
  )
}
