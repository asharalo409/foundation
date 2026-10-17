
import { useEffect, useState } from 'react'

type Phase = 'hands' | 'welcome' | 'fade' | 'gone'

type Brand = {
  name?: string
  logo?: string
  color?: string
}

function getBrand(): Brand | null {
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

function HandsOfHumanity() {
  return (
    <svg
      viewBox="0 0 340 245"
      className="w-full h-auto overflow-visible"
      role="img"
      aria-label="দুটি হাতের মাঝে মানবতার হৃদয়"
    >
      <defs>
        <radialGradient id="humanityGlow">
          <stop offset="0%" stopColor="#fff5b5" stopOpacity=".95" />
          <stop offset="45%" stopColor="#fbbf24" stopOpacity=".3" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="handSkin" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ffe0ad" />
          <stop offset="100%" stopColor="#d99a60" />
        </linearGradient>

        <linearGradient id="handGreen" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#42c987" />
          <stop offset="100%" stopColor="#087a43" />
        </linearGradient>

        <linearGradient id="heartGold" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#fff8bd" />
          <stop offset=".45" stopColor="#ffd451" />
          <stop offset="1" stopColor="#e99b14" />
        </linearGradient>

        <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      {/* Background glow */}
      <circle
        cx="170"
        cy="116"
        r="100"
        fill="url(#humanityGlow)"
        className="humanity-aura"
      />

      {/* Golden orbit */}
      <ellipse
        cx="170"
        cy="119"
        rx="94"
        ry="78"
        fill="none"
        stroke="#f8d875"
        strokeWidth="1"
        strokeDasharray="3 9"
        opacity=".65"
        className="humanity-orbit"
      />

      <ellipse
        cx="170"
        cy="119"
        rx="115"
        ry="97"
        fill="none"
        stroke="#fbbf24"
        strokeWidth=".8"
        opacity=".25"
      />

      {/* Left arm and hand */}
      <g className="humanity-left">
        <path
          d="M-9 176 L40 176 Q61 173 80 153 L119 124 Q128 118 135 125 Q142 132 133 141 L103 168 Q88 186 65 194 L-9 215Z"
          fill="url(#handGreen)"
          stroke="#8ee6b5"
          strokeWidth="1.5"
        />

        <path
          d="M43 177 Q64 175 80 156 L112 133 Q119 128 124 134 Q129 140 120 147 L92 172 Q77 189 54 195"
          fill="none"
          stroke="#b1f3d0"
          strokeWidth="2"
          opacity=".6"
        />

        <path
          d="M105 166 Q118 157 133 145 L146 133 Q152 128 157 134 Q162 140 156 146 L140 163 Q130 175 116 178Z"
          fill="url(#handSkin)"
          stroke="#ffe0ad"
          strokeWidth="1.2"
        />
      </g>

      {/* Right arm and hand */}
      <g className="humanity-right">
        <path
          d="M349 176 L300 176 Q279 173 260 153 L221 124 Q212 118 205 125 Q198 132 207 141 L237 168 Q252 186 275 194 L349 215Z"
          fill="url(#handGreen)"
          stroke="#8ee6b5"
          strokeWidth="1.5"
        />

        <path
          d="M297 177 Q276 175 260 156 L228 133 Q221 128 216 134 Q211 140 220 147 L248 172 Q263 189 286 195"
          fill="none"
          stroke="#b1f3d0"
          strokeWidth="2"
          opacity=".6"
        />

        <path
          d="M235 166 Q222 157 207 145 L194 133 Q188 128 183 134 Q178 140 184 146 L200 163 Q210 175 224 178Z"
          fill="url(#handSkin)"
          stroke="#ffe0ad"
          strokeWidth="1.2"
        />
      </g>

      {/* Hands meet in the middle */}
      <g className="humanity-meet">
        <path
          d="M139 151 Q145 145 153 151 L170 164 L187 151 Q195 145 201 151 Q207 158 198 166 L176 185 Q170 190 164 185 L142 166 Q133 158 139 151Z"
          fill="url(#handSkin)"
          stroke="#ffe0ad"
          strokeWidth="1.5"
        />
      </g>

      {/* Heart glow */}
      <path
        d={HEART}
        transform="translate(146 73) scale(2)"
        fill="#fbbf24"
        opacity=".65"
        filter="url(#softGlow)"
        className="humanity-heart-glow"
      />

      {/* Main glowing heart */}
      <g className="humanity-heart">
        <path
          d={HEART}
          transform="translate(149 76) scale(1.75)"
          fill="url(#heartGold)"
          stroke="#fff1a5"
          strokeWidth=".65"
        />
        <path
          d="M164 88 Q167 83 172 86"
          fill="none"
          stroke="#fffde7"
          strokeWidth="2"
          strokeLinecap="round"
          opacity=".9"
        />
      </g>

      {/* Rays around the heart */}
      <g
        className="humanity-rays"
        stroke="#ffe69b"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <path d="M170 47V37" />
        <path d="M142 54L136 45" />
        <path d="M198 54L204 45" />
        <path d="M130 81L120 77" />
        <path d="M210 81L220 77" />
        <path d="M137 105L129 111" />
        <path d="M203 105L211 111" />
      </g>

      {/* Light particles */}
      {Array.from({ length: 14 }, (_, i) => {
        const angle = (i / 14) * Math.PI * 2
        const x = 170 + Math.cos(angle) * (65 + (i % 3) * 10)
        const y = 112 + Math.sin(angle) * (55 + (i % 2) * 10)

        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i % 3 === 0 ? 2.2 : 1.3}
            fill="#ffe9a0"
            className="humanity-particle"
            style={{ animationDelay: `${i * 0.13}s` }}
          />
        )
      })}

      {/* Bottom light trail */}
      <path
        d="M32 222 Q100 237 170 220 T308 222"
        fill="none"
        stroke="#e9ba43"
        strokeWidth="1.4"
        opacity=".75"
      />
    </svg>
  )
}

function BrandEmblem({ logo }: { logo?: string }) {
  return (
    <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full emblem-aura" />

      <div className="absolute inset-1 rounded-full border-2 border-amber-300/80" />

      <div className="absolute inset-[-7px] rounded-full border border-amber-200/25 emblem-ring" />

      <div className="relative w-[88%] h-[88%] rounded-full bg-white p-1.5 shadow-[0_0_35px_rgba(255,204,73,.35)]">
        <div className="w-full h-full overflow-hidden rounded-full border border-emerald-900/20 flex items-center justify-center">
          {logo ? (
            <img
              src={logo}
              alt="মানবসেবা ফাউন্ডেশন লোগো"
              className="w-full h-full object-contain"
            />
          ) : (
            <svg viewBox="0 0 24 24" className="w-12 h-12 text-emerald-700" fill="currentColor">
              <path d={HEART} />
            </svg>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Splash({ ready }: { ready: boolean }) {
  const [phase, setPhase] = useState<Phase>('hands')
  const [brand, setBrand] = useState<Brand | null>(null)

  useEffect(() => {
    setBrand(getBrand())
  }, [])

  // The two hands and heart animation.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPhase((current) => current === 'hands' ? 'welcome' : current)
    }, 3200)

    return () => window.clearTimeout(timer)
  }, [])

  // Show the welcome message until the app is ready.
  useEffect(() => {
    if (!ready || phase !== 'welcome') return

    const timer = window.setTimeout(() => {
      setPhase('fade')
    }, 1400)

    return () => window.clearTimeout(timer)
  }, [ready, phase])

  useEffect(() => {
    if (phase !== 'fade') return

    const timer = window.setTimeout(() => setPhase('gone'), 650)
    return () => window.clearTimeout(timer)
  }, [phase])

  if (phase === 'gone') return null

  const name = brand?.name || 'মানবসেবা ফাউন্ডেশন'
  const color =
    /^#[0-9a-f]{3,8}$/i.test(brand?.color || '')
      ? brand!.color!
      : '#087a43'

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden px-5 py-6 text-white splash-root ${phase === 'fade' ? 'splash-exit' : ''}`}
      style={{
        background: `radial-gradient(ellipse at 50% 38%, ${color} 0%, #06452c 43%, #02140d 100%)`,
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
          background-image:
            radial-gradient(circle, rgba(255,221,122,.65) 1px, transparent 2px),
            radial-gradient(circle, rgba(255,255,255,.18) 1px, transparent 2px);
          background-size: 73px 83px, 107px 121px;
          animation: atmosphere 5s ease-in-out infinite alternate;
        }

        .splash-exit {
          animation: scene-exit .65s ease forwards;
        }

        .emblem-aura {
          background: conic-gradient(
            from 0deg,
            transparent,
            #fbbf24,
            #fff4b1,
            transparent 65%,
            #eab308,
            transparent
          );
          animation: emblem-spin 3s linear infinite;
        }

        .emblem-ring {
          animation: ring-glow 2.5s ease-in-out infinite alternate;
        }

        .humanity-left {
          transform-box: fill-box;
          transform-origin: left center;
          animation: hand-left 1.6s cubic-bezier(.2,.8,.2,1) both;
        }

        .humanity-right {
          transform-box: fill-box;
          transform-origin: right center;
          animation: hand-right 1.6s cubic-bezier(.2,.8,.2,1) both;
        }

        .humanity-meet {
          opacity: 0;
          animation: meet-in .8s 1s ease forwards;
        }

        .humanity-heart {
          transform-box: fill-box;
          transform-origin: center;
          animation: heart-appear 1s 1.15s cubic-bezier(.2,.8,.2,1) both,
                     heart-beat 1.6s 2.15s ease-in-out infinite;
        }

        .humanity-heart-glow {
          transform-box: fill-box;
          transform-origin: center;
          animation: heart-light 1.5s 1.1s ease-in-out infinite alternate;
        }

        .humanity-orbit {
          transform-box: fill-box;
          transform-origin: center;
          animation: orbit 12s linear infinite;
        }

        .humanity-rays {
          transform-box: fill-box;
          transform-origin: center;
          animation: ray-flash 2s 1s ease-in-out infinite alternate;
        }

        .humanity-particle {
          animation: particle-glow 1.5s ease-in-out infinite alternate;
        }

        .welcome-content {
          animation: welcome-appear .9s cubic-bezier(.2,.8,.2,1) both;
        }

        .welcome-title {
          animation: title-shine 2s ease-in-out infinite;
        }

        .welcome-line {
          animation: line-glow 2s ease-in-out infinite;
        }

        @keyframes emblem-spin {
          to { transform: rotate(360deg); }
        }

        @keyframes ring-glow {
          from { opacity: .35; transform: scale(.98); }
          to { opacity: 1; transform: scale(1.04); }
        }

        @keyframes hand-left {
          from { transform: translateX(-48px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @keyframes hand-right {
          from { transform: translateX(48px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @keyframes meet-in {
          from { opacity: 0; transform: scale(.65); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes heart-appear {
          0% { opacity: 0; transform: scale(.2) rotate(-15deg); }
          65% { opacity: 1; transform: scale(1.2) rotate(5deg); }
          100% { opacity: 1; transform: scale(1) rotate(0); }
        }

        @keyframes heart-beat {
          0%, 100% { scale: 1; }
          50% { scale: 1.07; }
        }

        @keyframes heart-light {
          from { opacity: .3; scale: .85; }
          to { opacity: .9; scale: 1.15; }
        }

        @keyframes orbit { to { transform: rotate(360deg); } }

        @keyframes ray-flash {
          from { opacity: .35; scale: .9; }
          to { opacity: 1; scale: 1.12; }
        }

        @keyframes particle-glow {
          from { opacity: .25; scale: .65; }
          to { opacity: 1; scale: 1.3; }
        }

        @keyframes atmosphere {
          from { opacity: .15; }
          to { opacity: .55; }
        }

        @keyframes welcome-appear {
          from { opacity: 0; transform: translateY(16px) scale(.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes title-shine {
          0%, 100% { text-shadow: 0 0 8px rgba(251,191,36,.2); }
          50% { text-shadow: 0 0 24px rgba(251,191,36,.75); }
        }

        @keyframes line-glow {
          0%, 100% { opacity: .55; }
          50% { opacity: 1; }
        }

        @keyframes scene-exit {
          to { opacity: 0; transform: scale(1.025); visibility: hidden; }
        }

        @media (max-height: 650px) {
          .splash-layout { gap: .65rem !important; }
          .splash-brand-emblem { transform: scale(.78); margin: -8px 0; }
          .splash-story { max-width: 270px !important; }
          .splash-heading { font-size: 1.3rem !important; }
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

      {/* Ambient light */}
      <div className="pointer-events-none absolute -top-24 -left-20 h-64 w-64 rounded-full bg-emerald-300/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />

      <div className="splash-layout relative z-10 flex w-full max-w-sm flex-col items-center gap-4 text-center">
        <div className="splash-brand-emblem">
          <BrandEmblem logo={brand?.logo} />
        </div>

        <div className="space-y-2">
          <h1 className="splash-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
            {name}
          </h1>

          <div className="flex items-center justify-center gap-2">
            <span className="h-px w-7 bg-amber-300/70" />
            <p className="text-sm sm:text-base font-medium text-amber-200">
              মানুষের পাশে, মানবতার পথে
            </p>
            <span className="h-px w-7 bg-amber-300/70" />
          </div>
        </div>

        {/* Two hands and a glowing heart */}
        <div className="splash-story relative w-full max-w-[340px] my-1">
          <div className="absolute inset-0 rounded-full bg-amber-300/10 blur-3xl" />
          <HandsOfHumanity />
        </div>

        {phase === 'hands' ? (
          <div className="min-h-[76px] flex flex-col items-center justify-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-amber-100">
              দুটি হাত, এক মানবতা
            </h2>
            <p className="text-sm text-white/70">
              মানুষের সেবাই আমাদের অঙ্গীকার
            </p>
          </div>
        ) : (
          <div className="welcome-content min-h-[76px] flex flex-col items-center justify-center gap-2">
            <h2 className="welcome-title text-3xl sm:text-4xl font-extrabold text-amber-300">
              স্বাগতম!
            </h2>
            <p className="text-sm sm:text-base text-white/90">
              আপনাকে মানবসেবা ফাউন্ডেশনের পক্ষ থেকে
            </p>
          </div>
        )}

        <div className="welcome-line flex w-3/4 items-center justify-center gap-3">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-300" />
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-amber-300" fill="currentColor">
            <path d={HEART} />
          </svg>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-300" />
        </div>

        <div className="w-full max-w-[270px] space-y-2 pt-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/15 border border-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-100 to-amber-300 shadow-[0_0_14px_rgba(251,191,36,.65)]"
              style={{
                width: phase === 'welcome' ? '100%' : '70%',
                transition: 'width 1.5s ease',
              }}
            />
          </div>
          <p className="text-xs font-medium tracking-wide text-amber-100/90">
            {phase === 'welcome' ? 'সেবায় এগিয়ে যাচ্ছি...' : 'একসঙ্গে গড়ি মানবতার পৃথিবী'}
          </p>
        </div>
      </div>

      <div className="absolute bottom-5 left-0 right-0 text-center text-[10px] tracking-[.18em] text-white/40">
        ভালোবাসা • মানবতা • সেবা
      </div>
    </div>
  )
}
