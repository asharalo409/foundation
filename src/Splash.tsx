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
      viewBox="0 0 340 220"
      className="w-full h-auto overflow-visible"
      role="img"
      aria-label="দুটি সুন্দর উন্মুক্ত হাত মমতায় হৃদয় আগলে রেখেছে"
    >
      <defs>
        {/* ত্বকের স্বাভাবিক সফট গ্রেডিয়েন্ট */}
        <linearGradient id="skinBase" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#ffdeb5" />
          <stop offset="60%" stopColor="#f3be8f" />
          <stop offset="100%" stopColor="#cf8c57" />
        </linearGradient>

        {/* হাতের তালুর ভেতরের অংশ */}
        <linearGradient id="skinInner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe9cd" />
          <stop offset="100%" stopColor="#e5a975" />
        </linearGradient>

        {/* জামার হাতা */}
        <linearGradient id="sleeveColor" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3ebd85" />
          <stop offset="100%" stopColor="#0a6b3f" />
        </linearGradient>

        {/* হৃদয়ের সোনালি দীপ্তি */}
        <radialGradient id="glowBack">
          <stop offset="0%" stopColor="#fff8b8" stopOpacity=".9" />
          <stop offset="50%" stopColor="#fbbf24" stopOpacity=".3" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="heartGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff9c2" />
          <stop offset="45%" stopColor="#fec835" />
          <stop offset="100%" stopColor="#e38e07" />
        </linearGradient>

        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* পেছনের নরম সোনালি আলোর বলয় */}
      <circle cx="170" cy="85" r="75" fill="url(#glowBack)" className="humanity-aura" />

      {/* সূক্ষ্ম বৃত্তাকার রিং */}
      <circle
        cx="170"
        cy="90"
        r="68"
        fill="none"
        stroke="#f8d675"
        strokeWidth="1"
        strokeDasharray="4 7"
        opacity=".5"
        className="humanity-orbit"
      />

      {/* ==================== বাম হাত ও হাতা ==================== */}
      <g className="humanity-left">
        {/* জামার হাতা (স্মুথ কার্ভ হয়ে ওঠা) */}
        <path
          d="M-10 185 C20 183 50 178 78 165 C96 156 112 144 122 135 L108 118 C92 135 68 152 35 162 C15 167 -10 168 Z"
          fill="url(#sleeveColor)"
          stroke="#7ce2ad"
          strokeWidth="1.2"
        />

        {/* তালু ও কবজির ভিত্তি */}
        <path
          d="M102 124 C108 115 116 108 126 102 C134 97 141 100 137 109 C133 118 123 130 112 143 C106 149 97 144 100 135 Z"
          fill="url(#skinBase)"
          stroke="#c98555"
          strokeWidth="1"
        />

        {/* তর্জনী ও মধ্যমা আঙুল */}
        <path
          d="M125 103 C132 88 141 83 147 88 C152 93 145 105 137 117 C130 126 123 125 125 103 Z"
          fill="url(#skinInner)"
          stroke="#c98555"
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* অনামিকা ও কনিষ্ঠা আঙুল */}
        <path
          d="M136 101 C144 92 153 90 157 95 C161 100 154 110 144 120 C138 126 132 121 136 101 Z"
          fill="url(#skinBase)"
          stroke="#c98555"
          strokeWidth="1"
        />

        {/* বৃদ্ধাঙ্গুলি */}
        <path
          d="M112 119 C119 110 128 111 133 118 C136 123 131 129 123 133 C117 136 110 130 112 119 Z"
          fill="url(#skinInner)"
          stroke="#c98555"
          strokeWidth="1"
        />

        {/* হাতের খাঁজ ও শেডিং */}
        <path
          d="M121 121 Q128 116 135 111"
          fill="none"
          stroke="#b87242"
          strokeWidth="1"
          strokeLinecap="round"
          opacity=".6"
        />
      </g>

      {/* ==================== ডান হাত ও হাতা ==================== */}
      <g className="humanity-right">
        {/* জামার হাতা */}
        <path
          d="M350 185 C320 183 290 178 262 165 C244 156 228 144 218 135 L232 118 C248 135 272 152 305 162 C325 167 350 168 Z"
          fill="url(#sleeveColor)"
          stroke="#7ce2ad"
          strokeWidth="1.2"
        />

        {/* তালু ও কবজির ভিত্তি */}
        <path
          d="M238 124 C232 115 224 108 214 102 C206 97 199 100 203 109 C207 118 217 130 228 143 C234 149 243 144 240 135 Z"
          fill="url(#skinBase)"
          stroke="#c98555"
          strokeWidth="1"
        />

        {/* তর্জনী ও মধ্যমা আঙুল */}
        <path
          d="M215 103 C208 88 199 83 193 88 C188 93 195 105 203 117 C210 126 217 125 215 103 Z"
          fill="url(#skinInner)"
          stroke="#c98555"
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* অনামিকা ও কনিষ্ঠা আঙুল */}
        <path
          d="M204 101 C196 92 187 90 183 95 C179 100 186 110 196 120 C202 126 208 121 204 101 Z"
          fill="url(#skinBase)"
          stroke="#c98555"
          strokeWidth="1"
        />

        {/* বৃদ্ধাঙ্গুলি */}
        <path
          d="M228 119 C221 110 212 111 207 118 C204 123 209 129 217 133 C223 136 230 130 228 119 Z"
          fill="url(#skinInner)"
          stroke="#c98555"
          strokeWidth="1"
        />

        {/* হাতের খাঁজ ও শেডিং */}
        <path
          d="M219 121 Q212 116 205 111"
          fill="none"
          stroke="#b87242"
          strokeWidth="1"
          strokeLinecap="round"
          opacity=".6"
        />
      </g>

      {/* ==================== ভালোবাসার সোনালি হৃদয় ==================== */}
      {/* গ্লো ফিল্টার */}
      <path
        d="M170 106 C163 99 138 82 138 65 C138 50 155 42 170 57 C185 42 202 50 202 65 C202 82 177 99 170 106 Z"
        fill="#f59e0b"
        opacity=".5"
        filter="url(#softGlow)"
        className="humanity-heart-glow"
      />

      {/* মূল হৃদয় */}
      <g className="humanity-heart">
        <path
          d="M170 106 C163 99 138 82 138 65 C138 50 155 42 170 57 C185 42 202 50 202 65 C202 82 177 99 170 106 Z"
          fill="url(#heartGold)"
          stroke="#fff4af"
          strokeWidth="1.5"
        />
        {/* হৃদয়ের ওপর আলোর গ্লিম/হাইলাইট */}
        <path
          d="M152 59 Q157 53 163 56"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity=".85"
        />
      </g>

      {/* চারপাশের আশার আলোকরশ্মি */}
      <g
        className="humanity-rays"
        stroke="#fde68a"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity=".85"
      >
        <path d="M170 36 V26" />
        <path d="M140 44 L132 35" />
        <path d="M200 44 L208 35" />
        <path d="M123 68 L113 65" />
        <path d="M217 68 L227 65" />
      </g>

      {/* নিচের সোনালি মসৃণ তরঙ্গ রেখা */}
      <path
        d="M40 195 Q105 210 170 195 T300 195"
        fill="none"
        stroke="#eab308"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity=".7"
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
          transform-origin: left bottom;
          animation: hand-left 1.6s cubic-bezier(.2,.8,.2,1) both;
        }

        .humanity-right {
          transform-box: fill-box;
          transform-origin: right bottom;
          animation: hand-right 1.6s cubic-bezier(.2,.8,.2,1) both;
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
          from { transform: translateX(-40px) rotate(-6deg); opacity: 0; }
          to { transform: translateX(0) rotate(0); opacity: 1; }
        }

        @keyframes hand-right {
          from { transform: translateX(40px) rotate(6deg); opacity: 0; }
          to { transform: translateX(0) rotate(0); opacity: 1; }
        }

        @keyframes heart-appear {
          0% { opacity: 0; transform: scale(.2) translateY(20px); }
          65% { opacity: 1; transform: scale(1.15) translateY(-5px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes heart-beat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.07); }
        }

        @keyframes heart-light {
          from { opacity: .3; transform: scale(.9); }
          to { opacity: .75; transform: scale(1.15); }
        }

        @keyframes orbit { to { transform: rotate(360deg); } }

        @keyframes ray-flash {
          from { opacity: .35; transform: scale(.9); }
          to { opacity: 1; transform: scale(1.1); }
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
