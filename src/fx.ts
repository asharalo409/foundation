const CSS = `
.fx-r{opacity:0;transform:translateY(22px) scale(.97);transition:opacity .55s ease var(--d,0ms),transform .6s cubic-bezier(.2,.8,.2,1) var(--d,0ms)}
.fx-r.fx-in{opacity:1;transform:none}
@keyframes fxPage{from{opacity:0;transform:translateY(14px) scale(.99)}to{opacity:1;transform:none}}
.fx-page{animation:fxPage .38s cubic-bezier(.2,.8,.2,1)}
@keyframes fxSheet{from{opacity:0;transform:translateY(26px) scale(.98)}to{opacity:1;transform:none}}
.fixed.inset-0>.bg-white{animation:fxSheet .28s cubic-bezier(.2,.8,.2,1)}
@keyframes fxShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
.fx-shimmer{background-size:200% 100%;animation:fxShimmer 3.5s linear infinite}
@keyframes fxGlow{0%,100%{box-shadow:0 0 0 0 var(--glow,rgba(22,163,74,.55))}60%{box-shadow:0 0 0 9px rgba(22,163,74,0)}}
.fx-glow{animation:fxGlow 2.4s ease-out infinite}
@media (prefers-reduced-motion:reduce){
  .fx-page,.fixed.inset-0>.bg-white,.fx-shimmer,.fx-glow{animation:none}
  .fx-r{opacity:1;transform:none;transition:none}
}
`

export function startFx(): () => void {
  if (typeof document === 'undefined') return () => {}

  if (!document.getElementById('fx-style')) {
    const s = document.createElement('style')
    s.id = 'fx-style'
    s.textContent = CSS
    document.head.appendChild(s)
  }

  const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  if (reduce || !('IntersectionObserver' in window)) return () => {}

  const seen = new WeakSet<Element>()

  const io = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('fx-in')
          io.unobserve(e.target)
        }
      })
    },
    { threshold: 0.06, rootMargin: '0px 0px -5% 0px' }
  )

  function scan() {
    const vh = window.innerHeight
    document
      .querySelectorAll('main .rounded-xl, main .rounded-2xl, main .rounded-3xl')
      .forEach(el => {
        if (seen.has(el)) return
        seen.add(el)
        if (el.closest('.fixed') || el.closest('.fx-r') || el.closest('table')) return
        const r = el.getBoundingClientRect()
        if (r.top < vh * 0.95) return
        const p = el.parentElement
        const idx = p ? Array.prototype.indexOf.call(p.children, el) : 0
        ;(el as HTMLElement).style.setProperty('--d', (idx % 3) * 70 + 'ms')
        el.classList.add('fx-r')
        io.observe(el)
      })
  }

  let timer: any = 0
  const mo = new MutationObserver(() => {
    clearTimeout(timer)
    timer = setTimeout(scan, 90)
  })
  mo.observe(document.body, { childList: true, subtree: true })
  scan()

  return () => {
    mo.disconnect()
    io.disconnect()
    clearTimeout(timer)
  }
}
