import { useEffect, useState } from 'react'

const CSS = `
@keyframes lp-pull{0%{transform:translateY(0)}35%{transform:translateY(14px)}100%{transform:translateY(0)}}
@keyframes lp-sway{0%,100%{transform:rotate(-1.2deg)}50%{transform:rotate(1.2deg)}}
@keyframes lp-hint{0%,100%{opacity:.35}50%{opacity:1}}
.lp-cord{transform-origin:118px 84px;animation:lp-sway 3.6s ease-in-out infinite}
.lp-cord.pull{animation:lp-pull .45s ease}
.lp-hint{animation:lp-hint 1.8s ease-in-out infinite}
.lp-fade{transition:opacity .6s ease,fill .6s ease}
@media (prefers-reduced-motion:reduce){.lp-cord,.lp-cord.pull,.lp-hint{animation:none}}
`

// লগইন ও আবেদন পেজের মঞ্চ: হাসিমুখ বাতি, দড়িতে টান দিলে আলো জ্বলে/নেভে।
// পাসওয়ার্ড লেখার সময় বাতি লজ্জায় চোখ বন্ধ করে (shy)।
export default function LampStage({
  children,
  shy,
  lit,
  onPull,
  offHint,
}: {
  children: any
  shy?: boolean
  lit?: boolean
  onPull?: () => void
  offHint?: string
}) {
  const ctl = lit !== undefined
  const [own, setOwn] = useState(false)
  const [awake, setAwake] = useState(false)
  const on = awake && (ctl ? !!lit : own)
  const [pull, setPull] = useState(false)
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      setAwake(true)
      setOwn(true)
    }, 700)
    return () => clearTimeout(t)
  }, [])

  function toggle() {
    setTouched(true)
    setPull(true)
    if (ctl) onPull?.()
    else setOwn(o => !o)
    setTimeout(() => setPull(false), 450)
  }

  const glow = on ? '#4ade80' : '#334155'
  const shade = on ? '#7fb08a' : '#3f5547'
  const eyesClosed = !on || shy

  return (
    <div
      className="relative overflow-hidden rounded-3xl px-4 pt-4 pb-8 min-h-[640px]"
      style={{
        background: on
          ? 'radial-gradient(120% 70% at 50% 8%, #123524 0%, #0a1510 55%, #060b09 100%)'
          : '#060a0d',
        transition: 'background .6s ease',
      }}
    >
      <style>{CSS}</style>
      <div className="relative z-10 w-full max-w-sm mx-auto">
        <div className="flex justify-center">
          <svg viewBox="0 0 160 205" width="190" height="243" role="img" aria-label="হাসিমুখ বাতি">
            <defs>
              <linearGradient id="lp-cone" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#d9f99d" stopOpacity=".55" />
                <stop offset="1" stopColor="#d9f99d" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="lp-pole" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#cbd5e1" />
                <stop offset=".5" stopColor="#f1f5f9" />
                <stop offset="1" stopColor="#94a3b8" />
              </linearGradient>
            </defs>

            <polygon
              points="46,86 114,86 150,200 10,200"
              fill="url(#lp-cone)"
              className="lp-fade"
              style={{ opacity: on ? 1 : 0 }}
            />
            <rect x="76" y="92" width="8" height="84" rx="3" fill="url(#lp-pole)" />
            <ellipse cx="80" cy="180" rx="30" ry="8" fill="#94a3b8" />
            <ellipse cx="80" cy="177" rx="30" ry="8" fill="#e2e8f0" />
            <path d="M52 30 H108 L124 86 H36 Z" fill={shade} className="lp-fade" />
            <ellipse
              cx="80"
              cy="86"
              rx="44"
              ry="6"
              fill={on ? '#fef9c3' : '#1f2a24'}
              className="lp-fade"
            />

            {eyesClosed ? (
              <g fill="none" stroke="#0f172a" strokeWidth="2.6" strokeLinecap="round">
                {shy ? (
                  <>
                    <path d="M58 52 q6 6 12 0" />
                    <path d="M90 52 q6 6 12 0" />
                  </>
                ) : (
                  <>
                    <path d="M58 54 h12" />
                    <path d="M90 54 h12" />
                  </>
                )}
              </g>
            ) : (
              <g fill="#0f172a">
                <ellipse cx="64" cy="52" rx="4" ry="5" />
                <ellipse cx="96" cy="52" rx="4" ry="5" />
                <circle cx="65.5" cy="50" r="1.4" fill="#fff" />
                <circle cx="97.5" cy="50" r="1.4" fill="#fff" />
              </g>
            )}

            {shy && on && (
              <g fill="#f87171" opacity=".55">
                <ellipse cx="56" cy="62" rx="6" ry="3.5" />
                <ellipse cx="104" cy="62" rx="6" ry="3.5" />
              </g>
            )}

            {on ? (
              <g>
                <path d="M68 62 q12 14 24 0 z" fill="#0f172a" />
                <path d="M74 68 q6 7 12 0 q-6 -3 -12 0 z" fill="#fb7185" />
              </g>
            ) : (
              <path
                d="M72 66 q8 4 16 0"
                fill="none"
                stroke="#0f172a"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            )}

            {/* দড়ি */}
            <g
              className={'lp-cord' + (pull ? ' pull' : '')}
              style={{ cursor: 'pointer' }}
              onClick={toggle}
            >
              <line x1="118" y1="86" x2="118" y2="126" stroke="#cbd5e1" strokeWidth="1.6" />
              <circle cx="118" cy="130" r="5.5" fill="#f8fafc" stroke="#94a3b8" />
              <rect x="104" y="90" width="28" height="48" fill="transparent" />
            </g>
          </svg>
        </div>

        <p
          className="text-center text-[11px] -mt-1 mb-3 text-white/60 lp-hint"
          style={{ opacity: on && touched ? 0 : undefined, transition: 'opacity .4s' }}
        >
          {on
            ? touched
              ? '\u00A0'
              : ctl
              ? 'দড়িতে টান দিন: লগইন ও আবেদন বদলাবে'
              : 'দড়িতে টান দিয়ে আলো জ্বালান বা নেভান'
            : offHint || '\u00A0'}
        </p>

        <div
          style={{
            ['--lamp-glow' as any]: on
              ? '0 0 0 1px ' + glow + '80, 0 0 28px ' + glow + '55, 0 10px 40px rgba(0,0,0,.5)'
              : '0 0 0 1px #33415580, 0 10px 40px rgba(0,0,0,.6)',
            transition: 'filter .6s ease, opacity .5s ease, max-height .6s ease',
            filter: on ? 'none' : 'brightness(.7)',
            opacity: ctl && !on && awake ? 0 : 1,
            maxHeight: ctl && !on && awake ? 0 : 900,
            overflow: ctl && !on && awake ? 'hidden' : 'visible',
            pointerEvents: ctl && !on && awake ? 'none' : 'auto',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
