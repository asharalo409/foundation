
import { useEffect, useState } from 'react'

type Phase = 'story' | 'welcome' | 'fade' | 'gone'

function getBrand() {
  try {
    const value = JSON.parse(
      localStorage.getItem('brand-v1') || 'null'
    )
    return value && typeof value === 'object' ? value : null
  } catch {
    return null
  }
}

const HEART =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'

function HumanStory() {
  return (
    <svg
      viewBox="0 0 360 220"
      className="w-full h-auto overflow-visible"
      role="img"
      aria-label="একটি অসহায় পরিবারের কাছে স্বেচ্ছাসেবকের খাবার পৌঁছে দেওয়া"
    >
      <defs>
        <linearGradient id="storySky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#092e20" />
          <stop offset="60%" stopColor="#155b37" />
          <stop offset="100%" stopColor="#b78a32" />
        </linearGradient>

        <linearGradient id="goldLight">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0" />
          <stop offset="50%" stopColor="#fff6b0" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="foodBox">
          <stop stopColor="#e9a23b" />
          <stop offset="100%" stopColor="#a75a1b" />
        </linearGradient>

        <radialGradient id="sunGlow">
          <stop stopColor="#ffdf80" stopOpacity=".85" />
          <stop offset="100%" stopColor="#ffdf80" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background */}
      <rect width="360" height="220" rx="22" fill="url(#storySky)" />
      <circle cx="245" cy="75" r="100" fill="url(#sunGlow)" />

      {/* Village silhouettes */}
      <g fill="#041e15" opacity=".65">
        <path d="M0 145L32 116L64 145V184H0Z" />
        <path d="M47 151L82 124L117 151V184H47Z" />
        <path d="M246 145L278 116L310 145V184H246Z" />
        <path d="M290 153L325 125L360 153V184H290Z" />
        <path d="M0 184H360V220H0Z" />
      </g>

      {/* Hopeful golden path */}
      <path
        d="M8 198 Q90 220 175 188 T352 180"
        fill="none"
        stroke="#fbbf24"
        strokeWidth="2"
        opacity=".75"
      />

      {/* Hungry family: fades away as help arrives */}
      <g className="story-hungry">
        {/* Simple hut */}
        <path d="M9 100L48 69L88 100Z" fill="#352d23" />
        <path d="M17 98H80V151H17Z" fill="#65513a" />
        <path d="M10 98L48 70L86 98" fill="none" stroke="#a38b63" strokeWidth="4" />

        {/* Adult */}
        <circle cx="63" cy="113" r="11" fill="#c58a63" />
        <path d="M52 111Q54 96 65 101L74 110Z" fill="#302820" />
        <path d="M48 151L53 126Q64 120 75 130L80 165H44Z" fill="#b4a28b" />
        <path d="M48 137L35 150" stroke="#c58a63" strokeWidth="7" strokeLinecap="round" />

        {/* Child */}
        <circle cx="104" cy="145" r="8" fill="#d8a47c" />
        <path d="M97 142Q101 132 109 140" fill="#302820" />
        <path d="M96 155Q104 150 112 157L117 181H91Z" fill="#a18c73" />
        <path d="M92 163L81 159" stroke="#d8a47c" strokeWidth="5" strokeLinecap="round" />

        <text x="50" y="45" textAnchor="middle" fill="#ffdf8c" fontSize="11" fontWeight="bold">
          ক্ষুধার্ত আজ...
        </text>
      </g>

      {/* Volunteer and food: arrive from the right */}
      <g className="story-help">
        {/* Volunteer legs */}
        <path d="M263 151L258 184M279 151L285 184"
          stroke="#e5e7eb" strokeWidth="8" strokeLinecap="round" />

        {/* Volunteer body */}
        <path d="M252 109Q270 100 288 111L294 155H247Z"
          fill="#087a43" stroke="#62bd7c" strokeWidth="1.5" />

        {/* White sleeves */}
        <path d="M253 118L239 145M287 118L299 140"
          stroke="#f7f5e9" strokeWidth="9" strokeLinecap="round" />

        {/* Head and cap */}
        <circle cx="270" cy="93" r="13" fill="#dba47e" />
        <path d="M257 91Q258 75 271 78Q283 79 284 92Z" fill="#263a30" />
        <path d="M257 82Q270 72 283 82L283 87H257Z"
          fill="#f7f5e9" stroke="#d1c8a8" strokeWidth="1.5" />

        {/* Arms reaching toward the food */}
        <path d="M251 124L225 142M290 124L237 149"
          fill="none" stroke="#dba47e" strokeWidth="7" strokeLinecap="round" />

        {/* Food package */}
        <g className="story-package">
          <path d="M182 135H241L235 168H188Z" fill="url(#foodBox)" />
          <path d="M178 132H245V139H178Z" fill="#f8c65b" />
          <path d="M195 131L207 116L221 131Z" fill="#f2df9a" />
          <rect x="201" y="118" width="13" height="13" rx="2" fill="#fff8dc" />
          <path d="M207.5 128L206 126C201 122 204 118 207.5 121C211 118 214 122 209 126Z"
            fill="#d94848" />
        </g>

        {/* Smiling family receiving help */}
        <g className="story-family">
          <circle cx="156" cy="130" r="10" fill="#d8a47c" />
          <path d="M147 128Q151 116 161 122L166 128Z" fill="#302820" />
          <path d="M146 144Q156 138 166 146L172 173H141Z" fill="#f3d8a4" />
          <path d="M143 149L178 151" stroke="#d8a47c" strokeWidth="6" strokeLinecap="round" />
        </g>

        <text x="272" y="45" textAnchor="middle" fill="#ffdf8c" fontSize="11" fontWeight="bold">
          আশার আলো আজ...
        </text>
      </g>

      {/* Moving light sweeping from left to right */}
      <path
        className="story-beam"
        d="M-50 0L12 0L410 220H348Z"
        fill="url(#goldLight)"
        opacity=".55"
      />

      {/* Floating hearts */}
      {[0, 1, 2].map((n) => (
        <path
          key={n}
          d={HEART}
          fill="#fbbf24"
          className={`story-heart story-heart-${n}`}
          transform={`translate(${155 + n * 27} ${47 + n * 7}) scale(.45)`}
        />
      ))}

      {/* Sparkles */}
      {[0, 1, 2, 3, 4].map((n) => (
        <circle
          key={n}
          cx={25 + n * 67}
          cy={25 + (n % 3) * 35}
          r={n % 2 ? 1.5 : 2.5}
          fill="#ffe69b"
          className="story-sparkle"
          style={{ animationDelay: `${n * 0.35}s` }}
        />
      ))}
    </svg>
  )
}

function BrandEmblem({ logo }: { logo?: string }) {
  return (
    <div className="relative flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32">
      <div className="absolute inset-0 rounded-full splash-orbit" />

      <div className="absolute inset-[5px] rounded-full border-2 border-amber-300/80 shadow-[0_0_28px_rgba(251,191,36,.3)]" />

      <div className="relative w-[88%] h-[88%] rounded-full bg-white p-1.5 shadow-[0_0_40px_rgba(255,210,80,.3)]">
        <div className="w-full h-full rounded-full overflow-hidden border border-emerald-900/30 flex items-center justify-center">
          {logo ? (
            <img
              src={logo}
              alt="মানবসেবা ফাউন্ডেশনের লোগো"
              className="w-full h-full object-contain"
            />
          ) : (
            <svg viewBox="0 0 24 24" className="w-12 h-12 text-emerald-700" fill="currentColor">
              <path d={HEART} />
            </svg>
          )}
        </div>
      </div>

      <span className="absolute -inset-3 rounded-full border border-amber-200/20 splash-pulse" />
    </div>
  )
}

export default function Splash({ ready }: { ready: boolean }) {
  const [phase, setPhase] = useState<Phase>('story')
  const [brand, setBrand] = useState<any>(null)

  useEffect(() => {
    setBrand(getBrand())
  }, [])

  useEffect(() => {
    // Story lasts 3.2 seconds, then the welcome scene appears.
    const storyTimer = window.setTimeout(() => {
      setPhase((p) => p === 'story' ? 'welcome' : p)
    }, 3200)

    return () => window.clearTimeout(storyTimer)
  }, [])

  useEffect(() => {
    // Never dismiss before the app is ready and the welcome has appeared.
    if (!ready || phase !== 'welcome') return

    const fadeTimer = window.setTimeout(() => setPhase('fade'), 850)
    return () => window.clearTimeout(fadeTimer)
  }, [ready, phase])

  useEffect(() => {
    if (phase !== 'fade') return

    const endTimer = window.setTimeout(() => setPhase('gone'), 650)
    return () => window.clearTimeout(endTimer)
  }, [phase])

  if (phase === 'gone') return null

  const name = brand?.name || 'মানবসেবা ফাউন্ডেশন'
  const color = /^#[0-9a-f]{3,8}$/i.test(brand?.color || '')
    ? brand.color
    : '#087a43'

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-5 py-6 text-white splash-root ${phase === 'fade' ? 'splash-exit' : ''}`}
      style={{
        background: `radial-gradient(ellipse at 50% 38%, ${color} 0%, #06462c 42%, #03170f 100%)`,
        pointerEvents: phase === 'fade' ? 'none' : 'auto',
      }}
      role="status"
      aria-live="polite"
    >
      <style>{`
        .splash-root { isolation: isolate; }
        .splash-root::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          opacity: .25;
          background-image:
            radial-gradient(circle at 12% 16%, #fbd76b 1px, transparent 2px),
            radial-gradient(circle at 88% 30%, #fbd76b 1px, transparent 2px),
            radial-gradient(circle at 72% 74%, #fbd76b 1px, transparent 2px);
          background-size: 97px 113px, 131px 127px, 113px 137px;
          animation: ambient-glow 4s ease-in-out infinite alternate;
        }

        .splash-exit { animation: splash-out .65s ease forwards; }

        .splash-orbit {
          background: conic-gradient(
            from 0deg,
            transparent 0deg,
            #fbbf24 80deg,
            #fff3a6 130deg,
            transparent 190deg,
            #eab308 280deg,
            transparent 360deg
          );
          animation: orbit-spin 2.8s linear infinite;
        }

        .splash-pulse {
          animation: ring-pulse 2s ease-out infinite;
        }

        .story-hungry {
          animation: hungry-out 3.2s ease-in-out forwards;
        }

        .story-help {
          opacity: 0;
          animation: help-in 3.2s ease-in-out forwards;
        }

        .story-package {
          transform-box: fill-box;
          transform-origin: center;
          animation: package-bob 1.4s ease-in-out infinite alternate;
        }

        .story-beam {
          animation: beam-travel 2.8s ease-in-out infinite;
        }

        .story-heart {
          opacity: 0;
          transform-box: fill-box;
          transform-origin: center;
          animation: heart-rise 2.5s ease-out infinite;
        }

        .story-heart-1 { animation-delay: .65s; }
        .story-heart-2 { animation-delay: 1.3s; }

        .story-sparkle {
          animation: sparkle 1.5s ease-in-out infinite alternate;
        }

        .welcome-title {
          animation: welcome-in .75s cubic-bezier(.2,.8,.2,1) both;
        }

        .welcome-subtitle {
          animation: welcome-in .8s .15s ease both;
        }

        .welcome-light {
          animation: welcome-shine 2s ease-in-out infinite;
        }

        .splash-progress {
          animation: progress 3.2s cubic-bezier(.2,.7,.2,1) both;
        }

        @keyframes orbit-spin { to { transform: rotate(360deg); } }

        @keyframes ring-pulse {
          0% { transform: scale(.96); opacity: .7; }
          100% { transform: scale(1.17); opacity: 0; }
        }

        @keyframes hungry-out {
          0%, 20% { opacity: 1; transform: translateX(0); }
          70%, 100% { opacity: 0; transform: translateX(-25px); }
        }

        @keyframes help-in {
          0%, 30% { opacity: 0; transform: translateX(30px); }
          70%, 100% { opacity: 1; transform: translateX(0); }
        }

        @keyframes package-bob {
          from { transform: translateY(0); }
          to { transform: translateY(-3px); }
        }

        @keyframes beam-travel {
          0% { transform: translateX(-260px); opacity: 0; }
          20% { opacity: .65; }
          75% { opacity: .35; }
          100% { transform: translateX(260px); opacity: 0; }
        }

        @keyframes heart-rise {
          0% { opacity: 0; translate: 0 8px; scale: .7; }
          25% { opacity: .9; }
          100% { opacity: 0; translate: 0 -25px; scale: 1.2; }
        }

        @keyframes sparkle {
          from { opacity: .2; scale: .65; }
          to { opacity: 1; scale: 1.3; }
        }

        @keyframes welcome-in {
          from { opacity: 0; transform: translateY(12px) scale(.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes welcome-shine {
          0%, 100% { opacity: .55; transform: scaleX(.65); }
          50% { opacity: 1; transform: scaleX(1); }
        }

        @keyframes ambient-glow {
          from { opacity: .12; }
          to { opacity: .45; }
        }

        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }

        @keyframes splash-out {
          to { opacity: 0; transform: scale(1.025); visibility: hidden; }
        }

        @media (max-height: 650px) {
          .splash-content { gap: .6rem !important; }
          .splash-emblem { transform: scale(.78); margin: -8px 0; }
          .splash-scene { max-width: 290px !important; }
          .splash-heading { font-size: 1.4rem !important; }
        }

        @media (prefers-reduced-motion: reduce) {
          .splash-root *,
          .splash-root *::before,
          .splash-root *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      {/* Soft decorative lights */}
      <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

      <div className="splash-content relative z-10 flex w-full max-w-sm flex-col items-center gap-4 text-center">
        <div className="splash-emblem">
          <BrandEmblem logo={brand?.logo} />
        </div>

        <div className="space-y-2">
          <h1 className="splash-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
            {name}
          </h1>

          <div className="flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-amber-300/70" />
            <span className="text-sm sm:text-base font-medium text-amber-200">
              মানুষের পাশে, মানবতার পথে
            </span>
            <span className="h-px w-8 bg-amber-300/70" />
          </div>
        </div>

        {/* Human story */}
        <div className="splash-scene relative w-full max-w-[340px] my-1">
          <div className="absolute inset-0 rounded-3xl bg-amber-300/10 blur-2xl" />
          <div className="relative rounded-3xl overflow-hidden border border-amber-200/20 shadow-[0_15px_45px_rgba(0,0,0,.25)]">
            <HumanStory />
          </div>
        </div>

        {/* Story text */}
        {phase === 'story' ? (
          <div className="min-h-[62px] flex flex-col items-center justify-center gap-1">
            <p className="text-lg font-bold text-amber-100">
              ক্ষুধা থেকে আশার পথে...
            </p>
            <p className="text-xs text-white/65">
              একটি ছোট সহায়তা, একটি নতুন আশা
            </p>
          </div>
        ) : (
          <div className="min-h-[62px] flex flex-col items-center justify-center gap-1">
            <h2 className="welcome-title text-3xl sm:text-4xl font-extrabold text-amber-300 drop-shadow-[0_0_18px_rgba(251,191,36,.35)]">
              স্বাগতম!
            </h2>
            <p className="welcome-subtitle text-sm sm:text-base text-white/90">
              আপনাকে মানবসেবা ফাউন্ডেশনের পক্ষ থেকে
            </p>
          </div>
        )}

        {/* Golden divider */}
        <div className="welcome-light flex items-center gap-3 w-3/4">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-300" />
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-amber-300" fill="currentColor">
            <path d={HEART} />
          </svg>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-300" />
        </div>

        {/* Loading indicator */}
        <div className="w-full max-w-[270px] space-y-2 pt-1">
          <div className="h-1.5 w-full rounded-full bg-white/15 overflow-hidden border border-white/10">
            <div
              className="splash-progress h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-200 to-amber-400 shadow-[0_0_12px_rgba(251,191,36,.6)]"
              style={{ width: phase === 'welcome' ? '100%' : undefined }}
            />
          </div>
          <p className="text-xs font-medium tracking-wide text-amber-100/90">
            {phase === 'welcome' ? 'সেবায় এগিয়ে যাচ্ছি...' : 'আশার আলো জ্বালাচ্ছি...'}
          </p>
        </div>
      </div>

      <div className="absolute bottom-5 left-0 right-0 text-center text-[10px] tracking-[.18em] text-white/35">
        ভালোবাসা • মানবতা • সেবা
      </div>
    </div>
  )
}
