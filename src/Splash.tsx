import { useEffect, useState } from 'react'

function brand() {
  try {
    const b = JSON.parse(localStorage.getItem('brand-v1') || 'null')
    return b && typeof b === 'object' ? b : null
  } catch { return null }
}

export default function Splash({ ready }: { ready: boolean }) {
  const [phase, setPhase] = useState<'show' | 'fade' | 'gone'>('show')
  const [t0] = useState(Date.now())
  const [b] = useState(brand)

  useEffect(() => {
    const m = setTimeout(() => setPhase(p => (p === 'show' ? 'fade' : p)), 3500)
    return () => clearTimeout(m)
  }, [])

  useEffect(() => {
    if (!ready) return
    const wait = Math.max(0, 750 - (Date.now() - t0))
    const a = setTimeout(() => setPhase(p => (p === 'show' ? 'fade' : p)), wait)
    return () => clearTimeout(a)
  }, [ready])

  useEffect(() => {
    if (phase !== 'fade') return
    const c = setTimeout(() => setPhase('gone'), 500)
    return () => clearTimeout(c)
  }, [phase])

  if (phase === 'gone') return null

  const color = b?.color || '#087a43'

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 text-white"
      style={{
        background: `linear-gradient(160deg, ${color}, #062e1d 70%, #020b07)`,
        opacity: phase === 'fade' ? 0 : 1,
        transition: 'opacity .5s ease',
        pointerEvents: phase === 'fade' ? 'none' : 'auto',
      }}
    >
      <style>{`
        @keyframes sp-spin{to{transform:rotate(360deg)}}
        @keyframes sp-pop{0%{transform:scale(.8);opacity:0}100%{transform:scale(1);opacity:1}}
        @keyframes sp-bar{0%{transform:translateX(-120%)}100%{transform:translateX(320%)}}
        @media (prefers-reduced-motion:reduce){.sp-a{animation:none !important}}
      `}</style>

      <div className="sp-a relative w-36 h-36 flex items-center justify-center"
        style={{ animation: 'sp-pop .6s ease-out' }}>
        <span className="sp-a absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0%, #fbbf24 35%, transparent 70%)',
            animation: 'sp-spin 1.6s linear infinite',
          }} />
        <span className="absolute rounded-full" style={{ inset: 4, background: '#06261a' }} />
        <div className="relative w-28 h-28 rounded-full overflow-hidden flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,.08)' }}>
          {b?.logo ? (
            <img src={b.logo} className="w-full h-full object-cover" />
          ) : (
            <span className="text-5xl">💚</span>
          )}
        </div>
      </div>

      {b?.name && <p className="text-xl font-bold text-center px-6">{b.name}</p>}

      <div className="w-32 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.2)' }}>
        <div className="sp-a h-full w-1/3 rounded-full"
          style={{ background: '#fbbf24', animation: 'sp-bar 1.2s ease-in-out infinite' }} />
      </div>
      <p className="text-xs opacity-70">লোড হচ্ছে...</p>
    </div>
  )
}
