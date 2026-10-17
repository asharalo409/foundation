import { useEffect, useState } from 'react'

const HEART =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'
const STAR = 'M0 -6 L1.6 -1.6 L6 0 L1.6 1.6 L0 6 L-1.6 1.6 L-6 0 L-1.6 -1.6Z'
const T = 3.7
const LAST = 'splash-last-v2'

function getBrand() {
  try {
    const v = JSON.parse(localStorage.getItem('brand-v1') || 'null')
    return v && typeof v === 'object' ? v : null
  } catch {
    return null
  }
}

const poss = (n: string) => (n.endsWith('ন') ? n + 'ের' : n + '-এর')

type Kind = 'elder' | 'mother' | 'boy' | 'girl'

function Person({ x, s, kind, shirt, d }: { x: number; s: number; kind: Kind; shirt: string; d: number }) {
  const skin = kind === 'elder' ? '#d9a074' : kind === 'mother' ? '#e2b08a' : '#e8b894'
  const ink = '#2a1d17'
  return (
    <g transform={`translate(${x} 262) scale(${s})`} style={{ ['--d' as any]: d + 's' }}>
      <g className="sp-slump">
        <g className="sp-cheer">
          {kind === 'mother' ? (
            <path d="M-11 -78 Q-11 -84 0 -84 Q11 -84 11 -78 L17 -6 H-17Z" fill={shirt} />
          ) : (
            <>
              <path d="M-5 -32 V-2 M5 -32 V-2" stroke="#2c3a46" strokeWidth="8" strokeLinecap="round" fill="none" />
              <rect x="-11" y="-80" width="22" height="50" rx="9" fill={shirt} />
            </>
          )}

          <g className="sp-sad">
            <path d="M-10 -72 Q-16 -54 -4 -46 M10 -72 Q16 -54 4 -46" stroke={shirt} strokeWidth="8" strokeLinecap="round" fill="none" />
            <circle cx="-3" cy="-46" r="3.6" fill={skin} />
            <circle cx="3" cy="-46" r="3.6" fill={skin} />
          </g>
          <g className="sp-happy">
            <path d="M-10 -74 L-25 -102 M10 -74 L25 -102" stroke={shirt} strokeWidth="8" strokeLinecap="round" fill="none" />
            <circle cx="-26" cy="-105" r="4" fill={skin} />
            <circle cx="26" cy="-105" r="4" fill={skin} />
          </g>

          <circle cx="0" cy="-92" r="12" fill={skin} />

          {kind === 'elder' && (
            <>
              <path d="M-12 -97 Q0 -113 12 -97 Q0 -101 -12 -97Z" fill="#f4f1ea" />
              <path d="M-10 -88 Q0 -68 10 -88 Q0 -81 -10 -88Z" fill="#f1efe9" />
            </>
          )}
          {kind === 'mother' && (
            <path d="M-13 -90 Q-14 -109 0 -109 Q14 -109 13 -90 Q8 -99 0 -99 Q-8 -99 -13 -90Z M-13 -90 Q-17 -76 -10 -71 L-6 -80Z M13 -90 Q17 -76 10 -71 L6 -80Z" fill="#d1608a" />
          )}
          {kind === 'boy' && <path d="M-12 -95 Q-10 -108 0 -107 Q10 -108 12 -95 Q0 -100 -12 -95Z" fill="#1f1a17" />}
          {kind === 'girl' && (
            <>
              <path d="M-12 -95 Q-10 -108 0 -107 Q10 -108 12 -95 Q0 -100 -12 -95Z" fill="#1f1a17" />
              <circle cx="-14" cy="-90" r="4" fill="#1f1a17" />
              <circle cx="14" cy="-90" r="4" fill="#1f1a17" />
              <circle cx="-14" cy="-94" r="2.2" fill="#ff7d92" />
              <circle cx="14" cy="-94" r="2.2" fill="#ff7d92" />
            </>
          )}

          <g className="sp-sad">
            <circle cx="-4.5" cy="-92" r="1.5" fill={ink} />
            <circle cx="4.5" cy="-92" r="1.5" fill={ink} />
            <path d="M-8 -97 L-2.5 -99.5 M8 -97 L2.5 -99.5" stroke={ink} strokeWidth="1.3" strokeLinecap="round" />
            <path d="M-4 -84 Q0 -88 4 -84" stroke={ink} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </g>
          <g className="sp-happy">
            <path d="M-7.5 -92 Q-4.5 -97 -1.5 -92 M1.5 -92 Q4.5 -97 7.5 -92" stroke={ink} strokeWidth="1.6" fill="none" strokeLinecap="round" />
            <path d="M-6 -87 Q0 -79 6 -87Z" fill="#8f2d2d" />
            <circle cx="-8.5" cy="-87" r="2.2" fill="#ff7d92" opacity=".55" />
            <circle cx="8.5" cy="-87" r="2.2" fill="#ff7d92" opacity=".55" />
          </g>

          <g className="sp-sad">
            <g className="sp-blink">
              <path d="M-16 -54 q-4 3 0 6 q4 3 0 6 M16 -54 q4 3 0 6 q-4 3 0 6" stroke="#cbd5dc" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            </g>
          </g>

          <g transform="translate(0 7)">
            <ellipse cx="0" cy="0" rx="10" ry="3" fill="#3b2a1f" />
            <g className="sp-happy">
              <path d="M-8 0 Q0 -9 8 0Z" fill="#fff8ea" />
              <path className="sp-steam" d="M-3 -6 q-3 -5 0 -9" stroke="#fff" strokeWidth="1.4" fill="none" opacity=".8" />
            </g>
            <path d="M-10 0 Q0 14 10 0Z" fill="#c98d4a" />
          </g>
        </g>
      </g>
    </g>
  )
}

const HEARTS: [number, number, number][] = [
  [252, 146, 0.1], [282, 148, 0.35], [308, 164, 0.6], [334, 164, 0.85], [262, 138, 1.4], [320, 150, 1.65],
]
const SPARKS: [number, number, number][] = [
  [236, 150, 0.0], [266, 140, 0.3], [296, 158, 0.6], [324, 148, 0.9], [348, 176, 1.2], [214, 186, 0.2], [190, 176, 0.5], [120, 150, 0.8],
]
const STARS: [number, number][] = [
  [8, 6], [22, 14], [38, 5], [55, 11], [70, 4], [84, 13], [93, 6], [14, 24], [47, 22], [78, 26],
]

function Scene() {
  return (
    <svg viewBox="0 0 360 290" className="block w-full" style={{ overflow: 'visible' }} aria-hidden="true">
      <defs>
        <linearGradient id="spGround" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3e7a52" />
          <stop offset="1" stopColor="#2f5b45" />
        </linearGradient>
        <radialGradient id="spSun" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff6c2" />
          <stop offset=".55" stopColor="#ffd24d" />
          <stop offset="1" stopColor="#ffb02e" />
        </radialGradient>
        <linearGradient id="spWood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c27c36" />
          <stop offset="1" stopColor="#8a5322" />
        </linearGradient>
      </defs>

      <g className="sp-sun">
        <g className="sp-sunrays">
          {Array.from({ length: 12 }, (_, i) => (
            <path key={i} d="M250 232 L236 -60 L264 -60Z" fill="rgba(255,232,140,.2)" transform={`rotate(${i * 30} 250 232)`} />
          ))}
        </g>
        <circle cx="250" cy="232" r="46" fill="#ffd24d" opacity=".25" />
        <circle cx="250" cy="232" r="30" fill="url(#spSun)" />
      </g>

      {[0, 1, 2].map(i => (
        <path key={i} className="sp-bird" d="M0 0 q5 -6 10 0 q5 -6 10 0" stroke="#2a3b45" strokeWidth="1.6" fill="none"
          strokeLinecap="round" style={{ ['--b' as any]: i * 0.35 + 's', transform: `translateY(${52 + i * 18}px)` }} />
      ))}

      <path d="M-10 236 Q40 190 95 214 T190 206 T290 200 T380 214 V250 H-10Z" fill="#1e4a3a" />

      <g>
        <path d="M338 240 Q344 205 335 160" stroke="#7a5230" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M335 160 Q312 146 292 168 M335 160 Q318 138 300 140 M335 160 Q335 134 352 128 M335 160 Q356 142 372 158 M335 160 Q352 150 366 176"
          stroke="#2f8f4e" strokeWidth="5" fill="none" strokeLinecap="round" />
        <circle cx="337" cy="165" r="3" fill="#6b4a2b" />
      </g>

      <g>
        <rect x="26" y="206" width="44" height="34" fill="#a47c4c" />
        <path d="M16 208 L48 178 L80 208Z" fill="#d1a94f" />
        <rect x="42" y="220" width="12" height="20" fill="#5a3e22" />
        <rect x="58" y="216" width="8" height="8" fill="#f1d58a" opacity=".7" />
      </g>

      <path d="M-10 240 Q60 214 130 230 T260 224 T380 232 V256 H-10Z" fill="#256349" />
      <rect x="-20" y="236" width="400" height="60" fill="url(#spGround)" />
      <path d="M-20 252 H380 V270 H-20Z" fill="#c9a36a" />
      <path d="M-20 252 H380" stroke="#e0c08a" strokeWidth="2" />

      <Person x={252} s={1} kind="elder" shirt="#8d6e63" d={0} />
      <Person x={282} s={1} kind="mother" shirt="#c0568a" d={0.08} />
      <Person x={308} s={0.72} kind="boy" shirt="#4aa3df" d={0.16} />
      <Person x={334} s={0.72} kind="girl" shirt="#f2a33a" d={0.24} />

      <g className="sp-vgrp">
        <g className="sp-vbob">
          <g className="sp-leg sp-legb">
            <path d="M70 224 L62 262" stroke="#1e2a33" strokeWidth="9" strokeLinecap="round" />
            <path d="M56 262 H66" stroke="#3b2a1f" strokeWidth="5" strokeLinecap="round" />
          </g>
          <g className="sp-leg">
            <path d="M70 224 L78 262" stroke="#27363f" strokeWidth="9" strokeLinecap="round" />
            <path d="M74 262 H84" stroke="#3b2a1f" strokeWidth="5" strokeLinecap="round" />
          </g>
          <rect x="56" y="166" width="28" height="60" rx="10" fill="#0f9d62" />
          <path d="M58 170 Q70 182 82 170 L82 178 Q70 190 58 178Z" fill="#e63946" />
          <path d="M60 175 l4 3 M66 178 l4 2 M73 178 l4 -2" stroke="#fff" strokeWidth="1" opacity=".7" />
          <g transform="translate(70 204) scale(.5) translate(-12 -12)">
            <path d={HEART} fill="#ffe17b" />
          </g>
          <circle cx="70" cy="150" r="13" fill="#e0ac86" />
          <path d="M57 148 Q57 133 70 133 Q83 133 83 148 Q70 141 57 148Z" fill="#1f1a17" />
          <circle cx="75" cy="151" r="1.4" fill="#2a1d17" />
          <path d="M72 157 Q76 160 80 156" stroke="#2a1d17" strokeWidth="1.3" fill="none" strokeLinecap="round" />
          <path d="M80 176 L94 200" stroke="#e0ac86" strokeWidth="7" strokeLinecap="round" />
          <path d="M80 176 L88 190" stroke="#0f9d62" strokeWidth="10" strokeLinecap="round" />
          <path d="M74 178 L92 204" stroke="#e0ac86" strokeWidth="7" strokeLinecap="round" />
          <path d="M74 178 L82 192" stroke="#0f9d62" strokeWidth="10" strokeLinecap="round" />
        </g>

        <path d="M92 198 L102 208" stroke="#7a4a1f" strokeWidth="4" strokeLinecap="round" />
        <path d="M100 208 L152 208 L148 240 L104 240Z" fill="url(#spWood)" stroke="#f0c864" strokeWidth="1.2" />
        <path d="M104 220 H149" stroke="#f0c070" strokeWidth="1" opacity=".5" />
        <g transform="translate(126 226) scale(.55) translate(-12 -12)">
          <path d={HEART} fill="#fff" />
        </g>
        <g className="sp-wheel" style={{ transformOrigin: '112px 252px' }}>
          <circle cx="112" cy="252" r="10" fill="#172c2a" stroke="#d9b75f" strokeWidth="2" />
          <path d="M112 244 V260 M104 252 H120" stroke="#e8d39a" strokeWidth="1.5" />
        </g>
        <g className="sp-wheel" style={{ transformOrigin: '142px 252px' }}>
          <circle cx="142" cy="252" r="10" fill="#172c2a" stroke="#d9b75f" strokeWidth="2" />
          <path d="M142 244 V260 M134 252 H150" stroke="#e8d39a" strokeWidth="1.5" />
        </g>

        <path d="M110 208 V188 Q110 182 116 182 H138 Q144 182 144 188 V208Z" fill="#8796a2" />
        <g className="sp-lid">
          <path d="M107 182 H147 Q143 170 127 170 Q111 170 107 182Z" fill="#a5b4c0" />
          <circle cx="127" cy="168" r="3" fill="#cdd7de" />
        </g>
        {[0, 1, 2].map(i => (
          <path key={i} className="sp-steam2" d={`M${118 + i * 9} 176 q-5 -9 0 -17`} stroke="#fff" strokeWidth="2.2"
            fill="none" strokeLinecap="round" style={{ ['--k' as any]: i * 0.25 + 's' }} />
        ))}
        <circle className="sp-burst" cx="127" cy="176" r="4" fill="#fff6c8" />
        <g className="sp-burst2" transform="translate(127 176)">
          {Array.from({ length: 10 }, (_, i) => (
            <line key={i} x1="0" y1="-14" x2="0" y2="-36" stroke="#fff3b0" strokeWidth="2.4" strokeLinecap="round"
              transform={`rotate(${i * 36})`} />
          ))}
        </g>
      </g>

      {HEARTS.map(([x, y, k], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <g className="sp-heart" style={{ ['--k' as any]: k + 's' }}>
            <g transform="scale(.7) translate(-12 -12)">
              <path d={HEART} fill="#ff5d7a" />
            </g>
          </g>
        </g>
      ))}
      {SPARKS.map(([x, y, k], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <path className="sp-tw" d={STAR} fill="#fff1a8" style={{ ['--k' as any]: k + 's' }} />
        </g>
      ))}
    </svg>
  )
}

const CSS = `
.sp-scene{--T:${T}s}
@keyframes sc-in{from{opacity:0}to{opacity:1}}
@keyframes sc-out{from{opacity:1}to{opacity:0}}
@keyframes sc-walk{from{transform:translateX(-190px)}to{transform:translateX(60px)}}
@keyframes sc-bob{from{transform:translateY(0)}to{transform:translateY(-3px)}}
@keyframes sc-leg{from{transform:rotate(-17deg)}to{transform:rotate(17deg)}}
@keyframes sc-spin{to{transform:rotate(360deg)}}
@keyframes sc-slump{from{transform:rotate(-1.5deg)}to{transform:rotate(1.5deg) translateY(1.5px)}}
@keyframes sc-bounce{from{transform:translateY(0)}to{transform:translateY(-10px)}}
@keyframes sc-burst{from{transform:scale(.4);opacity:.95}to{transform:scale(28);opacity:0}}
@keyframes sc-rays{from{transform:scale(.3);opacity:1}to{transform:scale(1.7);opacity:0}}
@keyframes sc-steam{0%{opacity:0;transform:translateY(0) scaleX(1)}30%{opacity:.85}100%{opacity:0;transform:translateY(-26px) scaleX(1.4)}}
@keyframes sc-lid{to{transform:translate(-12px,-16px) rotate(-28deg)}}
@keyframes sc-sun{from{transform:translateY(75px)}to{transform:translateY(-42px)}}
@keyframes sc-heart{0%{opacity:0;transform:translateY(0) scale(.4)}25%{opacity:1}100%{opacity:0;transform:translateY(-52px) scale(1.1)}}
@keyframes sc-tw{0%,100%{opacity:0;transform:scale(.3)}50%{opacity:1;transform:scale(1.3)}}
@keyframes sc-blink{0%,100%{opacity:.2}50%{opacity:1}}
@keyframes sc-rev{from{clip-path:inset(-12px 100% -12px 0)}to{clip-path:inset(-12px 0 -12px 0)}}
@keyframes sc-revhead{0%{left:0;opacity:1}94%{opacity:1}100%{left:100%;opacity:0}}
@keyframes sc-line{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes sc-flash{from{opacity:0}to{opacity:1}}
@keyframes sc-bird{from{transform:translateX(-40px)}to{transform:translateX(420px)}}
@keyframes sc-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}

.sp-sad{animation:sc-out .25s ease forwards;animation-delay:calc(var(--T) + var(--d,0s))}
.sp-happy{opacity:0;animation:sc-in .25s ease forwards;animation-delay:calc(var(--T) + var(--d,0s))}
.sp-slump{transform-box:fill-box;transform-origin:50% 100%;animation:sc-slump 1.2s ease-in-out 3 alternate}
.sp-cheer{transform-box:fill-box;transform-origin:50% 100%;animation:sc-bounce .46s ease-in-out 8 alternate;animation-delay:calc(var(--T) + var(--d,0s) + .15s)}
.sp-blink{animation:sc-blink .9s ease-in-out infinite}
.sp-steam{animation:sc-steam 1.6s ease-out infinite;animation-delay:calc(var(--T) + var(--d,0s) + .3s)}

.sp-vgrp{transform:translateX(-190px);animation:sc-walk 3.45s cubic-bezier(.35,.1,.3,1) .25s forwards}
.sp-vbob{animation:sc-bob .38s ease-in-out .25s 9 alternate}
.sp-leg{transform-box:view-box;transform-origin:70px 224px;animation:sc-leg .38s ease-in-out .25s 9 alternate}
.sp-legb{animation-direction:alternate-reverse}
.sp-wheel{transform-box:view-box;animation:sc-spin .6s linear .25s 6}
.sp-lid{transform-box:fill-box;transform-origin:30% 100%;animation:sc-lid .5s ease-out forwards;animation-delay:var(--T)}
.sp-steam2{opacity:0;animation:sc-steam 1.8s ease-out infinite;animation-delay:calc(var(--T) + var(--k,0s))}
.sp-burst{transform-box:fill-box;transform-origin:center;opacity:0;animation:sc-burst .9s ease-out both;animation-delay:var(--T)}
.sp-burst2{opacity:0;animation:sc-rays .9s ease-out both;animation-delay:var(--T)}

.sp-sun{transform:translateY(75px);animation:sc-sun 1.4s ease-out forwards;animation-delay:calc(var(--T) + .1s)}
.sp-sunrays{transform-box:view-box;transform-origin:250px 232px;opacity:0;animation:sc-in 1s ease forwards,sc-spin 45s linear infinite;animation-delay:calc(var(--T) + .4s),0s}
.sp-dawn{opacity:0;animation:sc-in 1.3s ease forwards;animation-delay:calc(var(--T) + .1s)}
.sp-stars{animation:sc-out .8s ease forwards;animation-delay:var(--T)}
.sp-bird{opacity:0;animation:sc-bird 4.2s linear both;animation-delay:calc(var(--T) + .6s + var(--b,0s))}
.sp-heart{transform-box:fill-box;transform-origin:center;opacity:0;animation:sc-heart 1.7s ease-out 2 both;animation-delay:calc(var(--T) + var(--k,0s))}
.sp-tw{transform-box:fill-box;transform-origin:center;opacity:0;animation:sc-tw 1.4s ease-in-out infinite;animation-delay:calc(var(--T) + var(--k,0s))}

.sp-rev{animation:sc-rev 3.3s linear .35s both}
.sp-revhead{position:absolute;top:-6px;bottom:-6px;width:3px;left:0;border-radius:2px;background:linear-gradient(#fff6c0,#ffd24d);box-shadow:0 0 14px 4px rgba(255,214,90,.85);animation:sc-revhead 3.3s linear .35s both}
.sp-line{height:3px;border-radius:2px;margin:18px auto 0;max-width:260px;transform-origin:left;transform:scaleX(0);background:linear-gradient(90deg,#e9a51a,#fff0a0,#e9a51a);animation:sc-line 3.7s linear forwards}
.sp-after{opacity:0;animation:sc-rise .7s ease forwards;animation-delay:calc(var(--T) + .2s)}
.sp-endflash{position:absolute;inset:0;pointer-events:none;opacity:0;background:radial-gradient(circle at 50% 55%,#fffbe0,#ffe9a0 45%,#fff 100%);animation:sc-flash .5s ease-in forwards;animation-delay:4.45s}

@keyframes wl-spin{to{transform:translate(-50%,-50%) rotate(360deg)}}
@keyframes wl-pop{0%{opacity:0;transform:scale(.4) rotate(-14deg)}60%{opacity:1;transform:scale(1.12) rotate(3deg)}100%{opacity:1;transform:scale(1) rotate(0)}}
@keyframes wl-title{0%{opacity:0;transform:translateY(18px) scale(.9);letter-spacing:9px}100%{opacity:1;transform:none;letter-spacing:1px}}
@keyframes wl-up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes wl-shine{from{background-position:200% 0}to{background-position:-100% 0}}
@keyframes wl-glow{0%,100%{opacity:.5;transform:translate(-50%,-50%) scale(.9)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.12)}}
@keyframes wl-float{0%{opacity:0;transform:translateY(0) scale(.5)}20%{opacity:1}100%{opacity:0;transform:translateY(-75vh) scale(1)}}
@keyframes wl-flash{from{opacity:1}to{opacity:0}}
@keyframes wl-ring{0%,100%{box-shadow:0 0 0 0 rgba(255,210,65,.55)}60%{box-shadow:0 0 0 18px rgba(255,210,65,0)}}
@keyframes wl-orbit{to{transform:rotate(360deg)}}
.wl-rays{position:absolute;left:50%;top:44%;width:170vmax;height:170vmax;transform:translate(-50%,-50%);background:repeating-conic-gradient(from 0deg,rgba(255,226,140,.2) 0deg 5deg,transparent 5deg 15deg);-webkit-mask-image:radial-gradient(circle,#000 0%,transparent 58%);mask-image:radial-gradient(circle,#000 0%,transparent 58%);animation:wl-spin 60s linear infinite}
.wl-glow{position:absolute;left:50%;top:44%;width:340px;height:340px;border-radius:50%;background:radial-gradient(circle,rgba(255,226,120,.5),transparent 68%);animation:wl-glow 2.4s ease-in-out infinite}
.wl-spark{position:absolute;bottom:-20px;background:linear-gradient(135deg,#fff7c2,#ffd24d);clip-path:polygon(50% 0,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0 50%,38% 38%);animation:wl-float linear infinite}
.wl-flash{position:absolute;inset:0;background:#fff;pointer-events:none;animation:wl-flash .9s ease-out forwards}
.wl-logo{animation:wl-pop .85s cubic-bezier(.2,.8,.2,1) both,wl-ring 2s 1s ease-out infinite}
.wl-title{background-image:linear-gradient(110deg,#ffd24d 0%,#ffe9a0 35%,#fff 50%,#ffe9a0 65%,#ffd24d 100%);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 3px 14px rgba(255,194,35,.3));animation:wl-title .9s .2s cubic-bezier(.2,.8,.2,1) both,wl-shine 2.6s 1.1s linear infinite}
.wl-up1{animation:wl-up .7s .55s ease both}
.wl-up2{animation:wl-up .7s .8s ease both}
.wl-up3{animation:wl-up .7s 1.05s ease both}
@media (prefers-reduced-motion:reduce){
  .sp-vgrp,.sp-vbob,.sp-leg,.sp-wheel,.sp-slump,.sp-cheer,.sp-rev,.sp-revhead,.wl-rays,.wl-spark{animation-duration:.01ms !important;animation-iteration-count:1 !important}
}
`

export default function Splash({ ready }: { ready: boolean }) {
  const [brand] = useState(getBrand)
  const [short] = useState(() => {
    try {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true
      return Date.now() - Number(localStorage.getItem(LAST) || 0) < 20 * 60000
    } catch {
      return false
    }
  })
  const [phase, setPhase] = useState<'scene' | 'welcome' | 'fade' | 'gone'>(short ? 'welcome' : 'scene')
  const [held, setHeld] = useState(false)
  const [canSkip, setCanSkip] = useState(false)

  useEffect(() => {
    try { localStorage.setItem(LAST, String(Date.now())) } catch {}
    const a = setTimeout(() => setCanSkip(true), 700)
    const cap = setTimeout(() => setPhase(p => (p === 'gone' ? p : 'fade')), 10500)
    return () => { clearTimeout(a); clearTimeout(cap) }
  }, [])

  useEffect(() => {
    if (phase !== 'scene') return
    const t = setTimeout(() => setPhase('welcome'), 4900)
    return () => clearTimeout(t)
  }, [phase])

  useEffect(() => {
    if (phase !== 'welcome') return
    const t = setTimeout(() => setHeld(true), short ? 1300 : 2500)
    return () => clearTimeout(t)
  }, [phase])

  useEffect(() => {
    if (phase === 'welcome' && held && ready) setPhase('fade')
  }, [phase, held, ready])

  useEffect(() => {
    if (phase !== 'fade') return
    const t = setTimeout(() => setPhase('gone'), 600)
    return () => clearTimeout(t)
  }, [phase])

  if (phase === 'gone') return null

  const color = brand?.color || '#087a43'
  const name: string = brand?.name || 'মানবসেবা ফাউন্ডেশন'

  const logo = (size: number) => (
    <div className="rounded-full flex items-center justify-center overflow-hidden"
      style={{ width: size, height: size, background: 'rgba(255,255,255,.95)', border: '2px solid #f5c542', padding: 4 }}>
      {brand?.logo ? (
        <img src={brand.logo} alt="" className="w-full h-full rounded-full object-contain" />
      ) : (
        <svg viewBox="0 0 24 24" width={size * 0.55} height={size * 0.55} fill="#d7a629"><path d={HEART} /></svg>
      )}
    </div>
  )

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden text-white"
      style={{ background: '#0c1a24', opacity: phase === 'fade' ? 0 : 1, transition: 'opacity .6s ease', pointerEvents: phase === 'fade' ? 'none' : 'auto' }}>
      <style>{CSS}</style>

      {phase === 'scene' && (
        <div className="sp-scene absolute inset-0 flex flex-col">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,#0e1b2a 0%,#1d3347 55%,#3a5160 100%)' }} />
          <div className="sp-dawn absolute inset-0" style={{ background: 'linear-gradient(180deg,#ff9f55 0%,#ffcf7a 48%,#fff0c4 100%)' }} />
          <div className="sp-stars absolute inset-0">
            {STARS.map(([l, t], i) => (
              <i key={i} className="absolute rounded-full bg-white"
                style={{ left: l + '%', top: t + '%', width: 2, height: 2, animation: `sc-tw 2.4s ${(i * 0.3) % 2}s infinite` }} />
            ))}
          </div>

          <div className="relative flex-1 min-h-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
            {logo(64)}
            <p className="text-sm font-bold" style={{ color: '#ffe9a6', textShadow: '0 1px 8px rgba(0,0,0,.45)' }}>{name}</p>
          </div>

          <Scene />

          <div className="relative flex-none px-6 pt-5 pb-8 text-center"
            style={{ minHeight: 176, background: 'linear-gradient(180deg,#2f5b45,#1b382a)' }}>
            <div className="relative inline-block" style={{ marginTop: 6 }}>
              <span className="sp-rev" style={{ display: 'inline-block', fontSize: 26, fontWeight: 800, color: '#ffe9a6', textShadow: '0 2px 14px rgba(255,200,60,.45)' }}>
                মানুষের পাশে, মানবতার পথে
              </span>
              <i className="sp-revhead" />
            </div>
            <p className="sp-after text-sm mt-3" style={{ color: 'rgba(255,255,255,.8)' }}>ক্ষুধার্তের পাশে আমরা আছি</p>
            <div className="sp-line" />
          </div>

          <div className="sp-endflash" />
        </div>
      )}

      {phase !== 'scene' && (
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ background: `radial-gradient(ellipse at 50% 42%, ${color} 0%, #06452f 50%, #031c13 100%)` }}>
          <div className="wl-rays" />
          <div className="wl-glow" />
          {Array.from({ length: 22 }, (_, i) => (
            <i key={i} className="wl-spark"
              style={{
                left: ((i * 47 + 6) % 96) + '%', width: 6 + (i % 4) * 3, height: 6 + (i % 4) * 3,
                animationDuration: 3.2 + (i % 5) * 0.7 + 's', animationDelay: ((i * 0.31) % 3) + 's',
              }} />
          ))}

          <div className="relative z-10 flex flex-col items-center px-8 text-center">
            <div className="wl-logo rounded-full mb-5">{logo(104)}</div>
            <p className="wl-up1 text-xs font-bold" style={{ letterSpacing: 6, color: '#ffe9a6' }}>WELCOME</p>
            <h1 className="wl-title text-6xl font-black mt-1">স্বাগতম!</h1>
            <p className="wl-up2 mt-5 text-lg leading-8 max-w-xs" style={{ color: 'rgba(255,255,255,.92)' }}>
              আপনাকে {poss(name)} পক্ষ থেকে
              <br />
              আন্তরিক স্বাগতম
            </p>
            <div className="wl-up3 mt-6 flex items-center gap-3" style={{ color: '#f5c542' }}>
              <span className="h-px w-12" style={{ background: 'rgba(245,197,66,.7)' }} />
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d={HEART} /></svg>
              <span className="h-px w-12" style={{ background: 'rgba(245,197,66,.7)' }} />
            </div>
            <p className="wl-up3 mt-4 text-sm" style={{ letterSpacing: 4, color: 'rgba(255,233,166,.85)' }}>ভালোবাসা • মানবতা • সেবা</p>
          </div>

          <div className="wl-flash" />
        </div>
      )}

      {canSkip && phase !== 'fade' && (
        <button onClick={() => setPhase('fade')}
          className="absolute right-3 z-20 rounded-full px-3 py-1 text-xs"
          style={{ top: 'calc(env(safe-area-inset-top, 0px) + 10px)', background: 'rgba(0,0,0,.3)', color: '#fff' }}>
          এড়িয়ে যান ›
        </button>
      )}
    </div>
  )
}
