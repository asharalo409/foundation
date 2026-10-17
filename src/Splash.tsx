
import { useEffect, useState } from 'react'

function getBrand() {
  try {
    const value = JSON.parse(localStorage.getItem('brand-v1') || 'null')
    return value && typeof value === 'object' ? value : null
  } catch {
    return null
  }
}

const HEART =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'

function Journey() {
  return (
    <svg
      viewBox="0 0 360 220"
      className="w-full"
      role="img"
      aria-label="স্বেচ্ছাসেবক খাবারের গাড়ি ঠেলে মানুষের পাশে এগিয়ে যাচ্ছেন"
    >
      <defs>
        <linearGradient id="journeySky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#07513a" />
          <stop offset="70%" stopColor="#08704a" />
          <stop offset="100%" stopColor="#033b2b" />
        </linearGradient>
        <linearGradient id="journeyGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff4a6" />
          <stop offset="50%" stopColor="#ffd34d" />
          <stop offset="100%" stopColor="#e89b16" />
        </linearGradient>
        <linearGradient id="cartWood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8a638" />
          <stop offset="100%" stopColor="#a85a16" />
        </linearGradient>
        <radialGradient id="roadGlow">
          <stop offset="0%" stopColor="#ffdb64" stopOpacity=".48" />
          <stop offset="100%" stopColor="#ffdb64" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="360" height="220" rx="20" fill="url(#journeySky)" />

      <circle cx="175" cy="115" r="135" fill="url(#roadGlow)" />

      {/* দূরের গ্রাম */}
      <g fill="#031f19" opacity=".65">
        <path d="M0 132L27 110L54 132V171H0Z" />
        <path d="M-5 132L27 104L60 132L54 134L27 115L2 135Z" />
        <rect x="16" y="143" width="12" height="17" fill="#d9a84d" opacity=".55" />
        <path d="M275 143L310 113L345 143V171H275Z" />
        <path d="M269 143L310 105L351 143L345 145L310 117L275 145Z" />
      </g>

      {/* সামনে এগোনোর সোনালি পথ */}
      <path
        d="M-15 195 Q75 180 140 199 T375 188"
        fill="none"
        stroke="#f7ca43"
        strokeWidth="2.2"
        opacity=".9"
      />
      <path
        d="M-15 199 Q75 184 140 203 T375 192"
        fill="none"
        stroke="#ffe8a0"
        strokeWidth=".7"
        opacity=".65"
      />

      {/* চলমান রাস্তার দাগ */}
      <path
        d="M-30 214H390"
        stroke="#f7d66d"
        strokeWidth="3"
        strokeDasharray="22 17"
        opacity=".65"
        className="journey-road"
      />

      {/* স্বেচ্ছাসেবক ও গাড়ি একসঙ্গে এগিয়ে যাচ্ছে */}
      <g className="journey-traveller">
        {/* পেছনের পা */}
        <g className="journey-leg-back">
          <path
            d="M88 143L76 173L65 187"
            fill="none"
            stroke="#1c2930"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M64 187L79 187"
            stroke="#f0d8b0"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </g>

        {/* সামনের পা */}
        <g className="journey-leg-front">
          <path
            d="M98 143L106 169L117 185"
            fill="none"
            stroke="#243039"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M112 186L126 186"
            stroke="#f0d8b0"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </g>

        {/* শরীর ও সবুজ স্বেচ্ছাসেবক জ্যাকেট */}
        <path
          d="M80 96Q89 90 99 98L109 135Q96 148 81 140L74 117Z"
          fill="#13a66b"
          stroke="#80e6b3"
          strokeWidth="1.3"
        />

        {/* পরিচয় ব্যাজ */}
        <circle cx="94" cy="111" r="5" fill="#ffe17b" />
        <path d="M91 114L94 118L97 114" fill="none" stroke="#8b641c" strokeWidth="1" />

        {/* মাথা */}
        <path d="M77 83Q77 70 89 70Q102 71 102 84L99 95H81Z" fill="#f0bd91" />
        <path d="M77 82Q75 68 90 67Q102 68 103 82L98 78L82 78Z" fill="#192820" />
        <path d="M100 87L96 90" stroke="#754b35" strokeWidth="1.2" />

        {/* গাড়ি ঠেলার বাহু */}
        <path
          d="M102 104L123 116L151 116"
          fill="none"
          stroke="#f0bd91"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M102 103L123 115"
          stroke="#13a66b"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M123 115L151 116"
          stroke="#f0bd91"
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* গাড়ির হাতল */}
        <path
          d="M146 111L160 111"
          stroke="#f6d47b"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>

      {/* খাবারের গাড়ি */}
      <g className="journey-cart">
        <path
          d="M153 112H222L211 151H165Z"
          fill="url(#cartWood)"
          stroke="#f3c75e"
          strokeWidth="1.5"
        />
        <path
          d="M149 108H226V115H149Z"
          fill="#ffd55c"
        />
        <path d="M166 122H215" stroke="#f8d18b" strokeWidth="1" opacity=".7" />

        {/* খাবারের প্যাকেট */}
        <g>
          <path d="M168 107L170 88H185L188 107Z" fill="#fff0cb" />
          <path d="M170 88L177 82L185 88Z" fill="#e5b85c" />
          <path d="M190 107L192 93H207L210 107Z" fill="#f5e3b5" />
          <path d="M192 93L199 87L207 93Z" fill="#fff2d3" />
          <path d="M175 98L178 101L181 98" fill="none" stroke="#c18732" strokeWidth="1.3" />
        </g>

        {/* গাড়ির চাকা */}
        <g className="journey-wheel" transform="translate(173 160)">
          <circle r="11" fill="#172c2a" stroke="#d9b75f" strokeWidth="2" />
          <circle r="4" fill="#f4d477" />
          <path d="M0 -8V8M-8 0H8M-5.7 -5.7L5.7 5.7M5.7 -5.7L-5.7 5.7"
            stroke="#e8d39a" strokeWidth="1.5" />
        </g>
        <g className="journey-wheel" transform="translate(207 160)">
          <circle r="11" fill="#172c2a" stroke="#d9b75f" strokeWidth="2" />
          <circle r="4" fill="#f4d477" />
          <path d="M0 -8V8M-8 0H8M-5.7 -5.7L5.7 5.7M5.7 -5.7L-5.7 5.7"
            stroke="#e8d39a" strokeWidth="1.5" />
        </g>
      </g>

      {/* চলার পথে ছোট ছোট আলোককণা */}
      {[35, 132, 246, 300].map((x, i) => (
        <circle
          key={x}
          cx={x}
          cy={35 + (i % 3) * 21}
          r={i % 2 ? 1.8 : 2.5}
          fill="#ffe38a"
          className="journey-spark"
          style={{ animationDelay: `${i * 0.3}s` }}
        />
      ))}

      <text
        x="180"
        y="27"
        textAnchor="middle"
        fill="#ffedac"
        fontSize="10"
        fontWeight="600"
        letterSpacing="1"
      >
        মানুষের পাশে, মানবতার পথে
      </text>
    </svg>
  )
}

function Petals() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {Array.from({ length: 24 }, (_, i) => (
        <span
          key={i}
          className="welcome-petal"
          style={{
            left: `${(i * 41 + 7) % 100}%`,
            animationDelay: `${(i % 8) * 0.28}s`,
            animationDuration: `${2.8 + (i % 5) * 0.55}s`,
            width: `${7 + (i % 3) * 2}px`,
            height: `${11 + (i % 3) * 3}px`,
            opacity: 0.65 + (i % 4) * 0.1,
          }}
        />
      ))}
    </div>
  )
}

export default function Splash({ ready }: { ready: boolean }) {
  const [phase, setPhase] = useState<'journey' | 'welcome' | 'fade' | 'gone'>('journey')
  const [brand] = useState(getBrand)

  useEffect(() => {
    const timer = setTimeout(() => setPhase('welcome'), 3600)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (phase !== 'welcome' || !ready) return

    const timer = setTimeout(() => setPhase('fade'), 1800)
    return () => clearTimeout(timer)
  }, [phase, ready])

  useEffect(() => {
    if (phase !== 'fade') return

    const timer = setTimeout(() => setPhase('gone'), 550)
    return () => clearTimeout(timer)
  }, [phase])

  if (phase === 'gone') return null

  const color = brand?.color || '#087a43'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden text-white"
      style={{
        background: `
          radial-gradient(ellipse at 50% 40%, ${color} 0%, #06452f 48%, #031c13 100%)
        `,
        opacity: phase === 'fade' ? 0 : 1,
        transition: 'opacity .55s ease',
        pointerEvents: phase === 'fade' ? 'none' : 'auto',
      }}
    >
      <style>{`
        @keyframes journey-move {
          0% { transform: translateX(-9px); }
          45% { transform: translateX(7px); }
          100% { transform: translateX(27px); }
        }

        @keyframes journey-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }

        @keyframes journey-step {
          0%, 100% { transform: rotate(-13deg); }
          50% { transform: rotate(13deg); }
        }

        @keyframes journey-spin {
          to { transform: rotate(360deg); }
        }

        @keyframes journey-dash {
          to { stroke-dashoffset: -78; }
        }

        @keyframes journey-glint {
          0%, 100% { opacity: .25; transform: scale(.7); }
          50% { opacity: 1; transform: scale(1.3); }
        }

        @keyframes welcome-logo {
          0% { opacity: 0; transform: scale(.65) rotate(-10deg); filter: brightness(.6); }
          65% { opacity: 1; transform: scale(1.08) rotate(2deg); filter: brightness(1.5); }
          100% { opacity: 1; transform: scale(1) rotate(0); filter: brightness(1); }
        }

        @keyframes welcome-title {
          0% { opacity: 0; transform: translateY(20px) scale(.85); letter-spacing: 12px; }
          100% { opacity: 1; transform: translateY(0) scale(1); letter-spacing: 1px; }
        }

        @keyframes welcome-subtitle {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes welcome-petal-fall {
          0% { transform: translate3d(0, -12vh, 0) rotate(0deg); }
          50% { transform: translate3d(22px, 50vh, 0) rotate(220deg); }
          100% { transform: translate3d(-18px, 115vh, 0) rotate(480deg); }
        }

        @keyframes welcome-orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes welcome-glow {
          0%, 100% { opacity: .55; transform: scale(.9); }
          50% { opacity: 1; transform: scale(1.08); }
        }

        .journey-traveller {
          transform-box: fill-box;
          transform-origin: center bottom;
          animation: journey-move 3.4s ease-in-out forwards, journey-bob .42s ease-in-out infinite;
        }

        .journey-leg-front, .journey-leg-back {
          transform-box: view-box;
          transform-origin: 94px 139px;
          animation: journey-step .42s ease-in-out infinite alternate;
        }

        .journey-leg-back {
          animation-direction: alternate-reverse;
        }

        .journey-cart {
          animation: journey-bob .42s ease-in-out infinite;
        }

        .journey-wheel {
          transform-box: fill-box;
          transform-origin: center;
          animation: journey-spin .65s linear infinite;
        }

        .journey-road {
          animation: journey-dash .7s linear infinite;
        }

        .journey-spark {
          transform-box: fill-box;
          transform-origin: center;
          animation: journey-glint 1.2s ease-in-out infinite;
        }

        .welcome-petal {
          position: absolute;
          top: -15%;
          border-radius: 85% 10% 85% 10%;
          background: linear-gradient(135deg, #fff2a6, #e7ae2c 65%, #e77c54);
          box-shadow: 0 0 10px rgba(255, 210, 75, .25);
          animation: welcome-petal-fall 3.8s linear infinite;
        }

        .welcome-logo {
          animation: welcome-logo .8s cubic-bezier(.2,.8,.2,1) both;
        }

        .welcome-title {
          animation: welcome-title .8s .2s cubic-bezier(.2,.8,.2,1) both;
        }

        .welcome-subtitle {
          animation: welcome-subtitle .7s .45s ease both;
        }

        @media (prefers-reduced-motion: reduce) {
          .journey-traveller, .journey-leg-front, .journey-leg-back,
          .journey-cart, .journey-wheel, .journey-road, .journey-spark,
          .welcome-petal, .welcome-logo, .welcome-title, .welcome-subtitle {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>

      <Petals />

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center px-6 text-center">
        {/* লোগো */}
        <div
          className={`relative mb-5 flex h-24 w-24 items-center justify-center rounded-full border-2 border-yellow-400 p-1.5 shadow-[0_0_35px_rgba(255,210,65,.38)] ${
            phase === 'welcome' ? 'welcome-logo' : ''
          }`}
          style={{ background: 'rgba(255,255,255,.94)' }}
        >
          <div
            className="absolute -inset-3 rounded-full border border-yellow-300/50"
            style={phase === 'welcome' ? { animation: 'welcome-orbit 8s linear infinite' } : undefined}
          />
          {brand?.logo ? (
            <img
              src={brand.logo}
              alt="মানবসেবা ফাউন্ডেশন"
              className="h-full w-full rounded-full object-contain"
            />
          ) : (
            <svg viewBox="0 0 24 24" className="h-12 w-12" fill="#d7a629">
              <path d={HEART} />
            </svg>
          )}
        </div>

        <h1 className="text-2xl font-extrabold tracking-wide sm:text-3xl">
          {brand?.name || 'মানবসেবা ফাউন্ডেশন'}
        </h1>

        <p className="mt-3 text-sm font-medium tracking-wide text-yellow-200 sm:text-base">
          — মানুষের পাশে, মানবতার পথে —
        </p>

        {phase === 'journey' ? (
          <div className="mt-9 w-full">
            <div className="overflow-hidden rounded-2xl border border-yellow-200/20 shadow-[0_0_35px_rgba(255,193,7,.08)]">
              <Journey />
            </div>

            <h2 className="mt-6 text-xl font-bold text-yellow-200">
              মানুষের পাশে এগিয়ে চলি
            </h2>
            <p className="mt-2 text-sm text-white/70">
              একটি ছোট সহায়তা, একটি নতুন আশা
            </p>

            <div className="mx-auto mt-7 h-2 w-full max-w-xs overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full"
                style={{
                  width: '100%',
                  background: 'linear-gradient(90deg,#e9a51a,#fff0a0,#e9a51a)',
                  transformOrigin: 'left',
                  animation: 'journey-load 3.6s linear forwards',
                }}
              />
            </div>
            <style>{`
              @keyframes journey-load {
                from { transform: scaleX(0); }
                to { transform: scaleX(1); }
              }
            `}</style>
            <p className="mt-3 text-xs text-yellow-100/80">
              মানবতার পথে আমাদের এই যাত্রা...
            </p>
          </div>
        ) : (
          <div className="mt-10 flex w-full flex-col items-center py-5">
            <div
              className="mb-3 text-yellow-300"
              style={{ animation: 'welcome-glow 1.5s ease-in-out infinite' }}
            >
              <svg viewBox="0 0 24 24" className="h-9 w-9" fill="currentColor">
                <path d={HEART} />
              </svg>
            </div>

            <h2
              className={`text-5xl font-black text-transparent sm:text-6xl ${
                phase === 'welcome' ? 'welcome-title' : ''
              }`}
              style={{
                backgroundImage: 'linear-gradient(180deg,#fff5b0 0%,#ffcf3e 48%,#e7a21a 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                filter: 'drop-shadow(0 3px 12px rgba(255,194,35,.22))',
              }}
            >
              স্বাগতম!
            </h2>

            <p
              className={`mt-5 max-w-xs text-base leading-8 text-white/90 sm:text-lg ${
                phase === 'welcome' ? 'welcome-subtitle' : ''
              }`}
            >
              আপনাকে মানবসেবা ফাউন্ডেশনের
              <br />
              পক্ষ থেকে আন্তরিক স্বাগতম
            </p>

            <div className="mt-6 flex items-center gap-3 text-yellow-300">
              <span className="h-px w-12 bg-yellow-400/70" />
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                <path d={HEART} />
              </svg>
              <span className="h-px w-12 bg-yellow-400/70" />
            </div>

            <p className="mt-5 text-sm tracking-widest text-yellow-100/80">
              ভালোবাসা • মানবতা • সেবা
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
