import type { CSSProperties } from 'react'
import { ICONS } from './Icons'

const TINT: CSSProperties = { fillOpacity: 'var(--tint, .16)' }
const T = ({ d }: { d: string }) => <path d={d} fill="currentColor" stroke="none" style={TINT} />
const Both = ({ d }: { d: string }) => (
  <>
    <T d={d} />
    <path d={d} />
  </>
)

// মেনু ও সাইড মেনুর জন্য "weather" আইকন
ICONS.weather = (
  <>
    <circle cx="8.5" cy="8.5" r="3" fill="currentColor" style={TINT} />
    <path d="M8.5 3v1.3M3 8.5h1.3M4.6 4.6l.9.9M12.4 4.6l-.9.9" />
    <Both d="M8 19.5h9.2a3.3 3.3 0 0 0 .4-6.6 4.6 4.6 0 0 0-8.7-1.3A3.9 3.9 0 0 0 8 19.5z" />
  </>
)

const CSS = `
@keyframes wxSpin{to{transform:rotate(360deg)}}
@keyframes wxDrift{0%,100%{transform:translateX(-1px)}50%{transform:translateX(1.2px)}}
@keyframes wxFall{0%{transform:translateY(-1.5px);opacity:0}25%{opacity:1}100%{transform:translateY(3px);opacity:0}}
@keyframes wxFlash{0%,88%,100%{opacity:1}92%,96%{opacity:.2}}
@keyframes wxRain{from{transform:translateY(-20px)}to{transform:translateY(440px)}}
@keyframes wxCloudMove{0%{transform:translateX(-30px)}100%{transform:translateX(34px)}}
@keyframes wxTw{0%,100%{opacity:.25}50%{opacity:1}}
@keyframes wxFlashScreen{0%,90%,100%{opacity:0}93%{opacity:.35}96%{opacity:0}98%{opacity:.25}}
.wx-rays{transform-origin:12px 12px;animation:wxSpin 28s linear infinite}
.wx-cloud{animation:wxDrift 6s ease-in-out infinite}
.wx-drop{animation:wxFall 1.1s linear infinite}
.wx-bolt{animation:wxFlash 3.2s linear infinite}
.wx-r{position:absolute;top:-20px;width:1.6px;height:18px;background:linear-gradient(rgba(255,255,255,0),rgba(255,255,255,.75));animation:wxRain linear infinite;border-radius:2px}
.wx-cl{position:absolute;border-radius:50%;filter:blur(18px);background:rgba(255,255,255,.4);animation:wxCloudMove 14s ease-in-out infinite alternate}
.wx-st{position:absolute;border-radius:50%;background:#fff;animation:wxTw 3s infinite}
.wx-flash{position:absolute;inset:0;background:#fff;opacity:0;animation:wxFlashScreen 6s linear infinite}
@media (prefers-reduced-motion:reduce){.wx-rays,.wx-cloud,.wx-drop,.wx-bolt,.wx-r,.wx-cl,.wx-st,.wx-flash{animation:none}}
`
if (typeof document !== 'undefined' && !document.getElementById('wx-css')) {
  const s = document.createElement('style')
  s.id = 'wx-css'
  s.textContent = CSS
  document.head.appendChild(s)
}

const CLOUD = 'M7 18.5h10.2a3.8 3.8 0 0 0 .5-7.57A5.5 5.5 0 0 0 7.1 10 4.3 4.3 0 0 0 7 18.5z'

const Sun = ({ x = 12, y = 12, s = 1 }: { x?: number; y?: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) translate(-12 -12)`}>
    <g className="wx-rays" stroke="#fbbf24" strokeWidth="1.6" strokeLinecap="round">
      {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
        <line key={a} x1="12" y1="3" x2="12" y2="5.2" transform={`rotate(${a} 12 12)`} />
      ))}
    </g>
    <circle cx="12" cy="12" r="4.6" fill="url(#wx-sun)" />
  </g>
)

const Moon = ({ x = 12, y = 12, s = 1 }: { x?: number; y?: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) translate(-12 -12)`}>
    <path d="M17.5 14.6A6.4 6.4 0 1 1 9.4 6.5a5 5 0 0 0 8.1 8.1z" fill="#fde68a" />
    <circle cx="17.6" cy="6" r=".7" fill="#fff" />
    <circle cx="19.6" cy="9.4" r=".5" fill="#fff" />
  </g>
)

const Cloud = ({ dark = false, dx = 0, dy = 0 }: { dark?: boolean; dx?: number; dy?: number }) => (
  <g transform={`translate(${dx} ${dy})`}>
    <path d={CLOUD} fill={dark ? 'url(#wx-cd)' : 'url(#wx-cl)'} className="wx-cloud" />
  </g>
)

export function WIcon({ kind, night = false, size = 40, className }: { kind: string; night?: boolean; size?: number; className?: string }) {
  let body: any
  if (kind === 'clear') body = night ? <Moon s={1.25} /> : <Sun s={1.3} />
  else if (kind === 'partly') body = (<>{night ? <Moon x={9} y={9} s={0.8} /> : <Sun x={9} y={9} s={0.8} />}<Cloud dx={1} dy={2} /></>)
  else if (kind === 'cloud') body = (<><Cloud dark dx={-3} dy={-3} /><Cloud dx={1} dy={1} /></>)
  else if (kind === 'fog') {
    body = (
      <>
        <Cloud dy={-3} />
        <g stroke="#cbd5e1" strokeWidth="1.6" strokeLinecap="round">
          <line x1="5" y1="19.5" x2="19" y2="19.5" />
          <line x1="7" y1="22" x2="17" y2="22" />
        </g>
      </>
    )
  } else if (kind === 'snow') {
    body = (
      <>
        <Cloud dark dy={-3} />
        {[8.5, 12, 15.5].map((x, i) => (
          <circle key={x} cx={x} cy={21} r="1.1" fill="#fff" className="wx-drop" style={{ animationDelay: i * 0.3 + 's' }} />
        ))}
      </>
    )
  } else if (kind === 'thunder') {
    body = (
      <>
        <Cloud dark dy={-4} />
        <path d="M12.8 14 10 18.6h2.6l-1 4 4-5.5h-2.7l1.3-3.1z" fill="#fde047" className="wx-bolt" />
      </>
    )
  } else {
    const xs = kind === 'heavy' ? [7.5, 10.2, 12.9, 15.6, 18.3] : kind === 'drizzle' ? [9, 14] : [8.5, 12.2, 15.9]
    body = (
      <>
        <Cloud dark dy={-4} />
        {xs.map((x, i) => (
          <line key={x} x1={x} y1="18" x2={x - 0.8} y2="20.6" stroke="#60a5fa" strokeWidth="1.7" strokeLinecap="round"
            className="wx-drop" style={{ animationDelay: i * 0.22 + 's' }} />
        ))}
      </>
    )
  }

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
      <defs>
        <radialGradient id="wx-sun" cx="40%" cy="38%">
          <stop offset="0" stopColor="#fff7ae" />
          <stop offset="1" stopColor="#f59e0b" />
        </radialGradient>
        <linearGradient id="wx-cl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#cbd5e1" />
        </linearGradient>
        <linearGradient id="wx-cd" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cbd5e1" />
          <stop offset="1" stopColor="#64748b" />
        </linearGradient>
      </defs>
      {body}
    </svg>
  )
}

export function Fx({ kind, night }: { kind: string; night: boolean }) {
  const rainy = ['drizzle', 'rain', 'heavy', 'thunder'].includes(kind)
  const drops = kind === 'heavy' || kind === 'thunder' ? 38 : kind === 'drizzle' ? 16 : 26
  const clouds = ['partly', 'cloud', 'fog'].includes(kind) || rainy
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {night && !rainy && kind !== 'fog' && Array.from({ length: 14 }, (_, i) => (
        <i key={i} className="wx-st"
          style={{
            left: ((i * 53) % 96) + 2 + '%', top: ((i * 29) % 46) + 4 + '%',
            width: 1.5 + (i % 3) * 0.8, height: 1.5 + (i % 3) * 0.8, animationDelay: ((i * 0.37) % 3) + 's',
          }} />
      ))}
      {!night && kind === 'clear' && (
        <div className="absolute rounded-full"
          style={{
            right: '-6%', top: '-8%', width: 190, height: 190,
            background: 'radial-gradient(circle, rgba(255,236,150,.85), rgba(255,200,60,.25) 55%, transparent 70%)',
          }} />
      )}
      {clouds && [0, 1, 2].map(i => (
        <i key={i} className="wx-cl"
          style={{ left: i * 38 - 10 + '%', top: 10 + i * 14 + '%', width: 170, height: 70, animationDelay: -i * 4 + 's', opacity: rainy ? 0.5 : 0.9 }} />
      ))}
      {rainy && Array.from({ length: drops }, (_, i) => (
        <i key={i} className="wx-r"
          style={{
            left: ((i * 37) % 100) + '%', animationDelay: ((i * 0.13) % 1.4) + 's',
            animationDuration: 0.7 + (i % 5) * 0.12 + 's', opacity: 0.55,
          }} />
      ))}
      {kind === 'thunder' && <div className="wx-flash" />}
    </div>
  )
}
