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
      viewBox="0 0 320 220"
      className="w-full h-auto overflow-visible select-none"
      role="img"
      aria-label="মানবতার প্রতীক ও ভালোবাসার উজ্জ্বল হৃদয়"
    >
      <defs>
        {/* গোল্ডেন ব্যাকগ্রাউন্ড গ্লো */}
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff8b5" stopOpacity=".85" />
          <stop offset="45%" stopColor="#fbbf24" stopOpacity=".3" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>

        {/* সোনালি হৃদয়ের গ্রেডিয়েন্ট */}
        <linearGradient id="goldHeartGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fffad2" />
          <stop offset="40%" stopColor="#f5be25" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        {/* আলিঙ্গনরত ডানার জন্য এমারেল্ড ও গোল্ডেন শেড */}
        <linearGradient id="wingGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* সফট ব্লার ফিল্টার */}
        <filter id="auraBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>

      {/* ব্যাকগ্রাউন্ড অরা */}
      <circle cx="160" cy="110" r="85" fill="url(#centerGlow)" className="humanity-aura" />

      {/* সূক্ষ্ম জ্যোতির্বলয় (Orbit Rings) */}
      <circle
        cx="160"
        cy="110"
        r="75"
        fill="none"
        stroke="#fde68a"
        strokeWidth="1"
        strokeDasharray="3 6"
        opacity=".5"
        className="humanity-orbit"
      />
      <circle
        cx="160"
        cy="110"
        r="92"
        fill="none"
        stroke="#fbbf24"
        strokeWidth=".75"
        opacity=".25"
      />

      {/* বাম পাশের আগলে রাখা সেবার হাত/ডানা (Embracing Arch Left) */}
      <g className="humanity-left">
        <path
          d="M 60 170 C 85 180, 115 175, 140 155 C 130 148, 120 135, 115 115 C 95 135, 75 152, 60 170 Z"
          fill="url(#wingGrad)"
          stroke="#6ee7b7"
          strokeWidth="1.2"
        />
        <path
          d="M 72 166 C 96 172, 125 160, 142 142"
          fill="none"
          stroke="#a7f3d0"
          strokeWidth="1.5"
          opacity=".7"
          strokeLinecap="round"
        />
        {/* সোনালি কণা */}
        <circle cx="140" cy="155" r="3" fill="#fde68a" />
      </g>

      {/* ডান পাশের আগলে রাখা সেবার হাত/ডানা (Embracing Arch Right) */}
      <g className="humanity-right">
        <path
          d="M 260 170 C 235 180, 205 175, 180 155 C 190 148, 200 135, 205 115 C 225 135, 245 152, 260 170 Z"
          fill="url(#wingGrad)"
          stroke="#6ee7b7"
          strokeWidth="1.2"
        />
        <path
          d="M 248 166 C 224 172, 195 160, 178 142"
          fill="none"
          stroke="#a7f3d0"
          strokeWidth="1.5"
          opacity=".7"
          strokeLinecap="round"
        />
        {/* সোনালি কণা */}
        <circle cx="180" cy="155" r="3" fill="#fde68a" />
      </g>

      {/* মাঝখানের সেতুবন্ধন ফোয়ারার রূপ */}
      <path
        d="M 148 160 C 156 166, 164 166, 172 160"
        fill="none"
        stroke="#fde68a"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* পেছনের সফট হার্ট গ্লো */}
      <path
        d={HEART}
        transform="translate(136 76) scale(2)"
        fill="#f59e0b"
        opacity=".5"
        filter="url(#auraBlur)"
        className="humanity-heart-glow"
      />

      {/* মূল সোনালি হৃদয় (Floating Golden Heart) */}
      <g className="humanity-heart">
        <path
          d={HEART}
          transform="translate(139 79) scale(1.75)"
          fill="url(#goldHeartGrad)"
          stroke="#fffbeb"
          strokeWidth=".8"
        />
        {/* হৃদয়ের ওপর কাঁচের মতো চকচকে গ্ল্যামার */}
        <path
          d="M 152 90 Q 156 84, 162 88"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          opacity=".9"
        />
      </g>

      {/* আশার আলোকরশ্মি (Rays of Hope) */}
      <g
        className="humanity-rays"
        stroke="#fde68a"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <path d="M 160 52 V 42" />
        <path d="M 132 60 L 124 52" />
        <path d="M 188 60 L 196 52" />
        <path d="M 118 84 L 108 81" />
        <path d="M 202 84 L 212 81" />
      </g>

      {/* নিচের সোনালি মসৃণ তরঙ্গ পথ */}
      <path
        d="M 45 195 Q 160 215, 275 195"
        fill="none"
        stroke="#fbbf24"
        strokeWidth="1.6"
        strokeLinecap="round"
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

  // Animation cycle
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPhase((current) => current === 'hands' ? 'welcome' : current)
    }, 3200)

    return () => window.clearTimeout(timer)
  }, [])

  // Show welcome message until app is ready
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
          transform-origin: left bottom;
          animation: hand-left 1.4s cubic-bezier(.2,.8,.2,1) both;
        }

        .humanity-right {
          transform-box: fill-box;
          transform-origin: right bottom;
          animation: hand-right 1.4s cubic-bezier(.2,.8,.2,1) both;
        }

        .humanity-heart {
          transform-box: fill-box;
          transform-origin: center;
          animation: heart-appear 1s 1.1s cubic-bezier(.2,.8,.2,1) both,
                     heart-beat 1.6s 2.1s ease-in-out infinite;
        }

        .humanity-heart-glow {
          transform-box: fill-box;
          transform-origin: center;
          animation: heart-light 1.5s 1.1s ease-in-out infinite alternate;
        }

        .humanity-orbit {
          transform-box: fill-box;
          transform-origin: center;
          animation: orbit 14s linear infinite;
        }

        .humanity-rays {
          transform-box: fill-box;
          transform-origin: center;
          animation: ray-flash 2s 1s ease-in-out infinite alternate;
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
          from { transform: translateX(-35px) scale(.85); opacity: 0; }
          to { transform: translateX(0) scale(1); opacity: 1; }
        }

        @keyframes hand-right {
          from { transform: translateX(35px) scale(.85); opacity: 0; }
          to { transform: translateX(0) scale(1); opacity: 1; }
        }

        @keyframes heart-appear {
          0% { opacity: 0; transform: scale(.2) translateY(25px); }
          65% { opacity: 1; transform: scale(1.15) translateY(-6px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes heart-beat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }

        @keyframes heart-light {
          from { opacity: .3; transform: scale(.9); }
          to { opacity: .8; transform: scale(1.2); }
        }

        @keyframes orbit { to { transform: rotate(360deg); } }

        @keyframes ray-flash {
          from { opacity: .35; transform: scale(.9); }
          to { opacity: 1; transform: scale(1.15); }
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

      {/* Ambient glow light */}
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

        {/* Humanity Emblem SVG Story */}
        <div className="splash-story relative w-full max-w-[320px] my-1">
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
