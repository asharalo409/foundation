const KEY = 'brand-v1'

type Icon = { src: string; sizes: string; type: string; purpose: string }
type Brand = { logo: string; name: string; color: string; icons: Icon[]; apple: string }

function meta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.name = name
    document.head.appendChild(el)
  }
  el.content = content
}

function link(rel: string, href: string, type?: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
  if (type) el.type = type
}

function apply(b: Brand) {
  document.title = b.name
  meta('theme-color', b.color)
  meta('apple-mobile-web-app-title', b.name)
  link('icon', b.icons[0].src, 'image/png')
  link('apple-touch-icon', b.apple)

  const base = location.origin + location.pathname.replace(/[^/]*$/, '')
  const manifest = {
    name: b.name,
    short_name: b.name.slice(0, 12),
    start_url: base,
    scope: base,
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: b.color,
    lang: 'bn',
    icons: b.icons,
  }
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' })
  )
  document.querySelectorAll('link[rel="manifest"]').forEach(e => e.remove())
  const m = document.createElement('link')
  m.rel = 'manifest'
  m.href = url
  document.head.appendChild(m)
}

function load(url: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const i = new Image()
    i.crossOrigin = 'anonymous'
    i.onload = () => res(i)
    i.onerror = rej
    i.src = url
  })
}

function draw(img: HTMLImageElement, size: number): string {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  g.fillStyle = '#ffffff'
  g.fillRect(0, 0, size, size)
  const box = size * 0.72
  const s = Math.min(box / img.width, box / img.height)
  const w = img.width * s
  const h = img.height * s
  g.drawImage(img, (size - w) / 2, (size - h) / 2, w, h)
  return c.toDataURL('image/png')
}

export function applyCachedBranding() {
  try {
    const b = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (b && b.icons) apply(b)
  } catch {}
}

export async function applyBranding(s: any) {
  if (!s) return
  const name = s.org_name || 'ফাউন্ডেশন'
  const color = s.theme_color || '#087a43'

  if (!s.logo_url) {
    document.title = name
    meta('theme-color', color)
    return
  }

  try {
    const old = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (old && old.logo === s.logo_url && old.name === name && old.color === color) {
      apply(old)
      return
    }
  } catch {}

  try {
    const img = await load(s.logo_url)
    const b: Brand = {
      logo: s.logo_url,
      name,
      color,
      icons: [
        { src: draw(img, 192), sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
        { src: draw(img, 512), sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ],
      apple: draw(img, 180),
    }
    try { localStorage.setItem(KEY, JSON.stringify(b)) } catch {}
    apply(b)
  } catch {
    document.title = name
    meta('theme-color', color)
  }
}
