import { useEffect, useRef } from 'react'

const hex = (h: string) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(h || '')
  const n = parseInt(m ? m[1] : '087a43', 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const rgba = (c: number[], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`
const CANVAS = ['particles', 'stars', 'petals', 'bubbles', 'waves']

function baseOf(kind: string, dark: boolean, acc: number[]) {
  if (dark) {
    if (kind === 'particles') return 'linear-gradient(to top right,#000814,#003566 55%,#0077b6)'
    if (kind === 'stars') return 'linear-gradient(180deg,#020617,#0f1b3d 60%,#1e1b4b)'
    return 'linear-gradient(160deg,#0b1220,#0f1b2e 55%,#0b1220)'
  }
  if (kind === 'stars') return `linear-gradient(180deg,${rgba(acc, 0.14)},#f8fafc 55%,#fdf2f8)`
  return `linear-gradient(to top right,${rgba(acc, 0.16)},#f8fafc 55%,${rgba(acc, 0.07)})`
}

export default function Backdrop({ kind, dark, accent, transparent }: any) {
  const ref = useRef<HTMLCanvasElement>(null)
  const acc = hex(accent)
  const base = transparent ? 'transparent' : baseOf(kind, dark, acc)

  useEffect(() => {
    if (!CANVAS.includes(kind)) return
    const cv = ref.current
    if (!cv) return
    const g = cv.getContext('2d')
    if (!g) return

    let W = 0
    let H = 0
    let raf = 0
    let last = 0
    let ps: any[] = []
    let shoot: any = null
    let nextShoot = 3000
    const ptr = { x: -999, y: -999 }
    const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)

    const newP = (x: number, y: number) => ({
      x, y,
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7,
      r: 1.4 + Math.random() * 2.4,
      ph: Math.random() * 6.28,
    })

    function init() {
      const area = W * H
      if (kind === 'particles') {
        const n = Math.max(28, Math.min(70, Math.round(area / 16000)))
        ps = Array.from({ length: n }, () => newP(Math.random() * W, Math.random() * H))
      } else if (kind === 'stars') {
        const n = Math.max(50, Math.min(150, Math.round(area / 7000)))
        ps = Array.from({ length: n }, () => ({
          x: Math.random() * W, y: Math.random() * H, r: 0.4 + Math.random() * 1.3,
          ph: Math.random() * 6.28, sp: 0.5 + Math.random() * 1.6,
        }))
      } else if (kind === 'petals') {
        ps = Array.from({ length: 22 }, () => ({
          x: Math.random() * W, y: Math.random() * H, s: 6 + Math.random() * 9,
          vy: 0.35 + Math.random() * 0.6, sw: Math.random() * 6.28, rot: Math.random() * 6.28,
          vr: (Math.random() - 0.5) * 0.03, c: Math.floor(Math.random() * 3),
        }))
      } else if (kind === 'bubbles') {
        ps = Array.from({ length: 22 }, () => ({
          x: Math.random() * W, y: Math.random() * H, r: 10 + Math.random() * 34,
          vy: 0.15 + Math.random() * 0.35, ph: Math.random() * 6.28,
        }))
      }
    }

    function size() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = window.innerWidth
      H = window.innerHeight
      cv!.width = W * dpr
      cv!.height = H * dpr
      cv!.style.width = W + 'px'
      cv!.style.height = H + 'px'
      g!.setTransform(dpr, 0, 0, dpr, 0, 0)
      init()
    }

    function line(x1: number, y1: number, x2: number, y2: number) {
      g!.beginPath()
      g!.moveTo(x1, y1)
      g!.lineTo(x2, y2)
      g!.stroke()
    }

    function draw(t: number) {
      g!.clearRect(0, 0, W, H)

      if (kind === 'particles') {
        const col = dark ? [0, 245, 255] : acc
        const lc = dark ? [0, 217, 255] : acc
        ps.forEach(p => {
          p.x += p.vx
          p.y += p.vy
          if (p.x < 0 || p.x > W) p.vx *= -1
          if (p.y < 0 || p.y > H) p.vy *= -1
        })
        g!.lineWidth = 1
        for (let i = 0; i < ps.length; i++) {
          for (let j = i + 1; j < ps.length; j++) {
            const d = Math.hypot(ps[i].x - ps[j].x, ps[i].y - ps[j].y)
            if (d < 130) {
              g!.strokeStyle = rgba(lc, (1 - d / 130) * (dark ? 0.5 : 0.3))
              line(ps[i].x, ps[i].y, ps[j].x, ps[j].y)
            }
          }
        }
        ps.forEach(p => {
          const d = Math.hypot(p.x - ptr.x, p.y - ptr.y)
          if (d < 170) {
            g!.strokeStyle = rgba(lc, (1 - d / 170) * 0.8)
            line(p.x, p.y, ptr.x, ptr.y)
          }
        })
        ps.forEach(p => {
          const op = 0.45 + 0.35 * Math.sin(t / 900 + p.ph)
          g!.fillStyle = rgba(col, dark ? op : op * 0.8)
          g!.beginPath()
          g!.arc(p.x, p.y, p.r, 0, 6.283)
          g!.fill()
        })
      } else if (kind === 'stars') {
        ps.forEach(p => {
          const a = 0.3 + 0.7 * Math.abs(Math.sin((t / 1000) * p.sp + p.ph))
          g!.fillStyle = dark ? `rgba(255,255,255,${a})` : rgba(acc, a * 0.65)
          g!.beginPath()
          g!.arc(p.x, p.y, p.r, 0, 6.283)
          g!.fill()
        })
        const mx = W - 56
        const my = 78
        g!.save()
        g!.fillStyle = dark ? 'rgba(254,243,199,.95)' : rgba(acc, 0.55)
        g!.beginPath()
        g!.arc(mx, my, 20, 0, 6.283)
        g!.fill()
        g!.globalCompositeOperation = 'destination-out'
        g!.beginPath()
        g!.arc(mx + 9, my - 5, 18, 0, 6.283)
        g!.fill()
        g!.restore()

        if (!shoot && t > nextShoot) {
          shoot = {
            x: W * 0.1 + Math.random() * W * 0.7, y: Math.random() * H * 0.35,
            vx: 7 + Math.random() * 4, vy: 3 + Math.random() * 2, life: 0,
          }
        }
        if (shoot) {
          shoot.x += shoot.vx
          shoot.y += shoot.vy
          shoot.life++
          const gr = g!.createLinearGradient(shoot.x, shoot.y, shoot.x - shoot.vx * 8, shoot.y - shoot.vy * 8)
          gr.addColorStop(0, dark ? 'rgba(255,255,255,.9)' : rgba(acc, 0.7))
          gr.addColorStop(1, 'rgba(255,255,255,0)')
          g!.strokeStyle = gr
          g!.lineWidth = 2
          line(shoot.x, shoot.y, shoot.x - shoot.vx * 8, shoot.y - shoot.vy * 8)
          if (shoot.life > 40) {
            shoot = null
            nextShoot = t + 5000 + Math.random() * 7000
          }
        }
      } else if (kind === 'petals') {
        const cols = [[255, 183, 197], [255, 214, 224], dark ? [255, 200, 120] : acc]
        ps.forEach(p => {
          p.y += p.vy
          p.x += Math.sin(t / 1500 + p.sw) * 0.6
          p.rot += p.vr
          if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W }
          g!.save()
          g!.translate(p.x, p.y)
          g!.rotate(p.rot)
          g!.fillStyle = rgba(cols[p.c], dark ? 0.5 : 0.6)
          g!.beginPath()
          g!.ellipse(0, 0, p.s, p.s * 0.55, 0, 0, 6.283)
          g!.fill()
          g!.restore()
        })
      } else if (kind === 'bubbles') {
        const bc = dark ? [90, 200, 255] : acc
        ps.forEach(p => {
          p.y -= p.vy
          p.x += Math.sin(t / 2200 + p.ph) * 0.3
          if (p.y < -p.r) { p.y = H + p.r; p.x = Math.random() * W }
          const gr = g!.createRadialGradient(p.x - p.r * 0.3, p.y - p.r * 0.3, p.r * 0.1, p.x, p.y, p.r)
          gr.addColorStop(0, rgba(bc, 0.04))
          gr.addColorStop(1, rgba(bc, dark ? 0.22 : 0.18))
          g!.fillStyle = gr
          g!.beginPath()
          g!.arc(p.x, p.y, p.r, 0, 6.283)
          g!.fill()
          g!.strokeStyle = rgba(bc, 0.3)
          g!.lineWidth = 1
          g!.stroke()
        })
      } else if (kind === 'waves') {
        const wc = dark ? [0, 150, 200] : acc
        const L = [[16, 0.011, 0.0011, 0.12], [22, 0.008, 0.0008, 0.16], [14, 0.014, 0.0014, 0.2]]
        L.forEach(([amp, f, sp, al], i) => {
          const baseY = H * (0.8 - i * 0.055)
          g!.beginPath()
          g!.moveTo(0, H)
          for (let x = 0; x <= W; x += 8) g!.lineTo(x, baseY + Math.sin(x * f + t * sp + i * 2) * amp)
          g!.lineTo(W, H)
          g!.closePath()
          g!.fillStyle = rgba(wc, al * (dark ? 1.2 : 1))
          g!.fill()
        })
      }
    }

    function loop(t: number) {
      raf = requestAnimationFrame(loop)
      if (document.hidden || t - last < 33) return
      last = t
      draw(t)
    }

    const onMove = (e: PointerEvent) => { ptr.x = e.clientX; ptr.y = e.clientY }
    const onLeave = () => { ptr.x = -999; ptr.y = -999 }
    const onDown = (e: PointerEvent) => {
      if (kind !== 'particles') return
      for (let i = 0; i < 3 && ps.length < 110; i++) ps.push(newP(e.clientX, e.clientY))
    }

    size()
    window.addEventListener('resize', size)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerleave', onLeave)
    if (reduce) draw(1000)
    else raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', size)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerleave', onLeave)
    }
  }, [kind, dark, accent])

  if (kind === 'none') return null

  if (kind === 'aurora') {
    const blobs: [number[], string, string, string][] = [
      [acc, '-20vmax', '-25vmax', 'au1 18s ease-in-out infinite'],
      [[139, 92, 246], '35vmax', '10vmax', 'au2 23s ease-in-out infinite'],
      [[245, 158, 11], '-5vmax', '45vmax', 'au3 27s ease-in-out infinite'],
    ]
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ background: base, zIndex: 0 }}>
        <style>{`@keyframes au1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(18vmax,10vmax) scale(1.25)}}@keyframes au2{0%,100%{transform:translate(0,0) scale(1.1)}50%{transform:translate(-20vmax,12vmax) scale(.9)}}@keyframes au3{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(14vmax,-16vmax) scale(1.2)}}`}</style>
        {blobs.map(([c, left, top, anim], i) => (
          <div key={i} className="absolute rounded-full"
            style={{
              width: '70vmax', height: '70vmax', left, top,
              background: rgba(c, dark ? 0.32 : 0.26), filter: 'blur(80px)', animation: anim,
            }} />
        ))}
      </div>
    )
  }

  if (kind === 'geo') {
    const sc = dark ? '#7dd3fc' : '#' + accent.replace('#', '')
    const tile =
      `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'>` +
      `<g fill='none' stroke='${sc}' stroke-opacity='${dark ? 0.22 : 0.2}' stroke-width='1.2'>` +
      `<rect x='20' y='20' width='40' height='40'/>` +
      `<rect x='20' y='20' width='40' height='40' transform='rotate(45 40 40)'/>` +
      `<circle cx='40' cy='40' r='9'/></g></svg>`
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ background: base, zIndex: 0 }}>
        <style>{`@keyframes geo-move{from{transform:translate(0,0)}to{transform:translate(80px,80px)}}`}</style>
        <div style={{
          position: 'absolute', inset: -80,
          backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(tile)}")`,
          animation: 'geo-move 24s linear infinite',
        }} />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ background: base, zIndex: 0 }}>
      <canvas ref={ref} style={{ display: 'block' }} />
    </div>
  )
}
