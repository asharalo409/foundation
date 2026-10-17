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
      aria-label="দুটি বাস্তবসম্মত হাত ভালোবাসার হৃদয় আগলে রেখেছে"
    >
      <defs>
        <radialGradient id="humanityGlow">
          <stop offset="0%" stopColor="#fff8c9" stopOpacity=".95" />
          <stop offset="55%" stopColor="#fbbf24" stopOpacity=".25" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="naturalSkin" x1="0" y1="0" x2=".8" y2="1">
          <stop offset="0%" stopColor="#ffe6c1" />
          <stop offset="48%" stopColor="#efbd8c" />
          <stop offset="100%" stopColor="#ce8e5d" />
        </linearGradient>

        <linearGradient id="skinLight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff0d5" />
          <stop offset="100%" stopColor="#e4ad7c" />
        </linearGradient>

        <linearGradient id="sleeveGreen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#45d393" />
          <stop offset="100%" stopColor="#087747" />
        </linearGradient>

        <linearGradient id="heartGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff9c4" />
          <stop offset="45%" stopColor="#ffd84d" />
          <stop offset="100%" stopColor="#e99a0b" />
        </linearGradient>

        <filter id="handShadow" x="-30%" y="-30%" width="160%" height="170%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" />
          <feOffset dy="2" />
          <feComponentTransfer>
            <feFuncA type="linear" slope=".24" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="heartGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      {/* Warm golden light */}
      <circle
        cx="170"
        cy="108"
        r="91"
        fill="url(#humanityGlow)"
        className="humanity-aura"
      />

      {/* Fine golden halo */}
      <ellipse
        cx="170"
        cy="120"
        rx="94"
        ry="83"
        fill="none"
        stroke="#eac75b"
        strokeWidth="1"
        opacity=".48"
      />

      <ellipse
        cx="170"
        cy="120"
        rx="77"
        ry="69"
        fill="none"
        stroke="#ffe7a0"
        strokeWidth="1"
        strokeDasharray="3 8"
        opacity=".55"
        className="humanity-orbit"
      />

      {/* LEFT FOREARM AND SLEEVE */}
      <g className="humanity-left">
        <path
          d="M-8 190
             L43 190
             Q67 186 89 171
             L116 153
             L130 171
             Q114 188 95 198
             Q69 213 35 224
             L-8 237 Z"
          fill="#041e15"
          opacity=".22"
          transform="translate(0 3)"
        />

        <path
          d="M-8 183
             L43 183
             Q64 181 83 169
             L111 151
             Q121 145 129 153
             Q136 162 125 171
             L96 192
             Q72 207 38 217
             L-8 230 Z"
          fill="url(#sleeveGreen)"
          stroke="#8ae4b5"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Sleeve stitching */}
        <path
          d="M-3 222 L38 209 Q72 199 96 182 L122 162"
          fill="none"
          stroke="#a5f0cb"
          strokeWidth="2"
          opacity=".65"
        />

        {/* Wrist */}
        <path
          d="M105 166
             Q116 153 126 143
             L140 130
             Q146 124 152 130
             Q158 136 151 143
             L137 157
             Q129 166 118 174 Z"
          fill="url(#naturalSkin)"
          stroke="#d99c6e"
          strokeWidth="1"
        />

        {/* Thumb */}
        <path
          d="M119 161
             Q124 151 134 143
             L147 134
             Q153 131 157 137
             Q160 143 153 148
             L139 160
             Q130 168 123 172 Z"
          fill="url(#skinLight)"
          stroke="#d69a6c"
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* Palm */}
        <path
          d="M118 167
             Q122 156 132 147
             L148 133
             Q155 128 161 133
             Q166 138 161 144
             L152 153
             Q158 148 163 152
             Q168 157 162 163
             L147 177
             Q138 184 127 181
             L117 177 Z"
          fill="url(#naturalSkin)"
          stroke="#d69a6c"
          strokeWidth="1.1"
          strokeLinejoin="round"
          filter="url(#handShadow)"
        />

        {/* Individual fingers */}
        <path
          d="M132 153
             L148 138
             Q154 133 158 138
             Q161 143 156 148
             L143 161"
          fill="url(#skinLight)"
          stroke="#d69a6c"
          strokeWidth="1"
          strokeLinecap="round"
        />

        <path
          d="M139 160
             L153 148
             Q159 143 163 148
             Q167 153 161 158
             L149 170"
          fill="url(#skinLight)"
          stroke="#d69a6c"
          strokeWidth="1"
          strokeLinecap="round"
        />

        <path
          d="M146 168
             L158 158
             Q164 154 168 159
             Q171 164 165 169
             L153 178"
          fill="url(#naturalSkin)"
          stroke="#d69a6c"
          strokeWidth="1"
          strokeLinecap="round"
        />

        {/* Palm crease */}
        <path
          d="M127 170 Q137 161 145 154"
          fill="none"
          stroke="#b97950"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity=".65"
        />

        {/* Fingernail highlights */}
        <path
          d="M153 138 Q156 136 158 139"
          fill="none"
          stroke="#fff0d8"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>

      {/* RIGHT FOREARM AND SLEEVE */}
      <g className="humanity-right">
        <path
          d="M348 190
             L297 190
             Q273 186 251 171
             L224 153
             L210 171
             Q226 188 245 198
             Q271 213 305 224
             L348 237 Z"
          fill="#041e15"
          opacity=".22"
          transform="translate(0 3)"
        />

        <path
          d="M348 183
             L297 183
             Q276 181 257 169
             L229 151
             Q219 145 211 153
             Q204 162 215 171
             L244 192
             Q268 207 302 217
             L348 230 Z"
          fill="url(#sleeveGreen)"
          stroke="#8ae4b5"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        <path
          d="M343 222 L302 209 Q268 199 244 182 L218 162"
          fill="none"
          stroke="#a5f0cb"
          strokeWidth="2"
          opacity=".65"
        />

        {/* Wrist */}
        <path
          d="M235 166
             Q224 153 214 143
             L200 130
             Q194 124 188 130
             Q182 136 189 143
             L203 157
             Q211 166 222 174 Z"
          fill="url(#naturalSkin)"
          stroke="#d99c6e"
          strokeWidth="1"
        />

        {/* Thumb */}
        <path
          d="M221 161
             Q216 151 206 143
             L193 134
             Q187 131 183 137
             Q180 143 187 148
             L201 160
             Q210 168 217 172 Z"
          fill="url(#skinLight)"
          stroke="#d69a6c"
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* Palm */}
        <path
          d="M222 167
             Q218 156 208 147
             L192 133
             Q185 128 179 133
             Q174 138 179 144
             L188 153
             Q182 148 177 152
             Q172 157 178 163
             L193 177
             Q202 184 213 181
             L223 177 Z"
          fill="url(#naturalSkin)"
          stroke="#d69a6c"
          strokeWidth="1.1"
          strokeLinejoin="round"
          filter="url(#handShadow)"
        />

        {/* Individual fingers */}
        <path
          d="M208 153
             L192 138
             Q186 133 182 138
             Q179 143 184 148
             L197 161"
          fill="url(#skinLight)"
          stroke="#d69a6c"
          strokeWidth="1"
          strokeLinecap="round"
        />

        <path
          d="M201 160
             L187 148
             Q181 143 177 148
             Q173 153 179 158
             L191 170"
          fill="url(#skinLight)"
          stroke="#d69a6c"
          strokeWidth="1"
          strokeLinecap="round"
        />

        <path
          d="M194 168
             L182 158
             Q176 154 172 159
             Q169 164 175 169
             L187 178"
          fill="url(#naturalSkin)"
          stroke="#d69a6c"
          strokeWidth="1"
          strokeLinecap="round"
        />

        <path
          d="M213 170 Q203 161 195 154"
          fill="none"
          stroke="#b97950"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity=".65"
        />

        <path
          d="M187 138 Q184 136 182 139"
          fill="none"
          stroke="#fff0d8"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>

      {/* Heart-shaped glow behind the heart */}
      <path
        d={HEART}
        transform="translate(149 64) scale(1.8)"
        fill="#ffcc35"
        opacity=".75"
        filter="url(#heartGlow)"
        className="humanity-heart-glow"
      />

      {/* Heart held gently between the hands */}
      <g className="humanity-heart">
        <path
          d={HEART}
          transform="translate(151 67) scale(1.65)"
          fill="url(#heartGold)"
          stroke="#fff1a7"
          strokeWidth=".8"
          strokeLinejoin="round"
        />

        <path
          d="M164 80 Q167 76 172 79"
          fill="none"
          stroke="#fffde7"
          strokeWidth="2"
          strokeLinecap="round"
        />

        <circle cx="158" cy="86" r="2" fill="#fff9d9" />
      </g>

      {/* Rays of hope */}
      <g
        className="humanity-rays"
        fill="none"
        stroke="#ffe8a0"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M170 46 V36" />
        <path d="M141 52 L135 43" />
        <path d="M199 52 L205 43" />
        <path d="M124 78 L114 75" />
        <path d="M216 78 L226 75" />
        <path d="M132 105 L124 111" />
        <path d="M208 105 L216 111" />
      </g>

      {/* Floating golden particles */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const radius = 70 + (i % 3) * 9

        return (
          <circle
            key={i}
            cx={170 + Math.cos(angle) * radius}
            cy={106 + Math.sin(angle) * radius}
            r={i % 3 === 0 ? 2 : 1.3}
            fill="#fff0ac"
            className="humanity-particle"
            style={{ animationDelay: `${i * 0.16}s` }}
          />
        )
      })}

      {/* Golden trail */}
      <path
        d="M39 225 Q105 242 170 225 T301 225"
        fill="none"
        stroke="#e8bd43"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity=".8"
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
