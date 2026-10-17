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
      className="w-full h-auto"
      role="img"
      aria-label="দুটি খোলা হাত ভালোবাসার হৃদয় আগলে রেখেছে"
    >
      <defs>
        <linearGradient id="skin" x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#ffe7c6" />
          <stop offset="55%" stopColor="#f2c397" />
          <stop offset="100%" stopColor="#d99b6b" />
        </linearGradient>

        <linearGradient id="sleeve" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4bd59a" />
          <stop offset="100%" stopColor="#087747" />
        </linearGradient>

        <radialGradient id="heartLight">
          <stop offset="0%" stopColor="#fff9bd" stopOpacity=".9" />
          <stop offset="100%" stopColor="#ffd54f" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="goldHeart" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff4a8" />
          <stop offset="55%" stopColor="#ffce36" />
          <stop offset="100%" stopColor="#e9a20b" />
        </linearGradient>
      </defs>

      {/* নরম সোনালি আলো */}
      <circle cx="170" cy="82" r="76" fill="url(#heartLight)" />

      <circle
        cx="170" cy="83" r="69"
        fill="none"
        stroke="#f5d36c"
        strokeWidth="1"
        opacity=".65"
      />

      <circle
        cx="170" cy="83" r="57"
        fill="none"
        stroke="#ffe9a4"
        strokeWidth="1"
        strokeDasharray="3 7"
        opacity=".6"
      />

      {/* বাম হাতের সবুজ জামার হাতা */}
      <path
        d="M-5 160 L43 160
           Q67 157 87 142
           L113 124 L126 141
           Q106 165 78 177
           Q47 190 -5 207 Z"
        fill="url(#sleeve)"
        stroke="#8be6b9"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* ডান হাতের সবুজ জামার হাতা */}
      <path
        d="M345 160 L297 160
           Q273 157 253 142
           L227 124 L214 141
           Q234 165 262 177
           Q293 190 345 207 Z"
        fill="url(#sleeve)"
        stroke="#8be6b9"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* বাম কবজি ও তালু */}
      <path
        d="M105 146
           Q112 133 122 122
           L135 108
           Q142 101 148 107
           Q153 112 147 119
           L137 131
           Q149 124 154 131
           Q158 137 151 143
           L138 154
           Q125 163 111 157 Z"
        fill="url(#skin)"
        stroke="#c98d61"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* বাম হাতের চারটি স্বাভাবিক আঙুল */}
      <path
        d="M118 132
           L133 111 Q139 104 144 109
           Q149 113 143 120
           L132 134"
        fill="url(#skin)"
        stroke="#c98d61"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />

      <path
        d="M125 138
           L141 120 Q147 115 151 121
           Q155 126 149 132
           L137 144"
        fill="url(#skin)"
        stroke="#c98d61"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />

      <path
        d="M132 145
           L145 132 Q151 127 155 133
           Q159 138 153 144
           L142 153"
        fill="url(#skin)"
        stroke="#c98d61"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />

      {/* বাম বৃদ্ধাঙ্গুলি */}
      <path
        d="M116 143
           Q123 134 132 135
           Q138 136 136 142
           L127 152
           Q121 158 115 152 Z"
        fill="#f5cea4"
        stroke="#c98d61"
        strokeWidth="1"
      />

      {/* ডান কবজি ও তালু */}
      <path
        d="M235 146
           Q228 133 218 122
           L205 108
           Q198 101 192 107
           Q187 112 193 119
           L203 131
           Q191 124 186 131
           Q182 137 189 143
           L202 154
           Q215 163 229 157 Z"
        fill="url(#skin)"
        stroke="#c98d61"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* ডান হাতের চারটি আঙুল */}
      <path
        d="M222 132
           L207 111 Q201 104 196 109
           Q191 113 197 120
           L208 134"
        fill="url(#skin)"
        stroke="#c98d61"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />

      <path
        d="M215 138
           L199 120 Q193 115 189 121
           Q185 126 191 132
           L203 144"
        fill="url(#skin)"
        stroke="#c98d61"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />

      <path
        d="M208 145
           L195 132 Q189 127 185 133
           Q181 138 187 144
           L198 153"
        fill="url(#skin)"
        stroke="#c98d61"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />

      {/* ডান বৃদ্ধাঙ্গুলি */}
      <path
        d="M224 143
           Q217 134 208 135
           Q202 136 204 142
           L213 152
           Q219 158 225 152 Z"
        fill="#f5cea4"
        stroke="#c98d61"
        strokeWidth="1"
      />

      {/* তালুর সূক্ষ্ম রেখা */}
      <g
        fill="none"
        stroke="#bd8056"
        strokeWidth="1"
        strokeLinecap="round"
        opacity=".65"
      >
        <path d="M119 148 Q127 145 132 139" />
        <path d="M126 151 Q132 149 137 144" />
        <path d="M221 148 Q213 145 208 139" />
        <path d="M214 151 Q208 149 203 144" />
      </g>

      {/* আঙুলের নখের হালকা রেখা */}
      <g
        fill="none"
        stroke="#fff1db"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        <path d="M135 111 Q139 107 142 111" />
        <path d="M143 122 Q147 119 149 123" />
        <path d="M205 111 Q201 107 198 111" />
        <path d="M197 122 Q193 119 191 123" />
      </g>

      {/* হৃদয়ের পেছনে আলোর আভা */}
      <circle
        cx="170" cy="64" r="34"
        fill="#ffd54f"
        opacity=".24"
        className="humanity-pulse"
      />

      {/* সোনালি হৃদয় */}
      <g className="humanity-heart">
        <path
          d="M170 79
             C165 73 147 62 147 49
             C147 37 161 32 170 43
             C179 32 193 37 193 49
             C193 62 175 73 170 79 Z"
          fill="url(#goldHeart)"
          stroke="#fff0a6"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />

        <path
          d="M157 46 Q160 41 165 45"
          fill="none"
          stroke="#fffde6"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>

      {/* আশার আলোকরশ্মি */}
      <g
        stroke="#ffe8a0"
        strokeWidth="2"
        strokeLinecap="round"
        opacity=".9"
      >
        <path d="M170 25 V17" />
        <path d="M144 32 L140 25" />
        <path d="M196 32 L200 25" />
        <path d="M129 54 L121 51" />
        <path d="M211 54 L219 51" />
      </g>

      {/* নিচে মানবতার সোনালি পথ */}
      <path
        d="M43 197 Q103 215 170 197 T297 197"
        fill="none"
        stroke="#e8bd43"
        strokeWidth="1.7"
        strokeLinecap="round"
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
