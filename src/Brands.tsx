// সোশ্যাল ও মিটিং অ্যাপের চেনা চিহ্ন (ব্র্যান্ডের রঙে গোল/গোলকোণা আইকন)
const W = {
  fill: 'none',
  stroke: '#fff',
  strokeWidth: 2.2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

export const BRAND: Record<string, { bg: string; node: (s: number) => JSX.Element }> = {
  facebook: {
    bg: '#1877F2',
    node: s => (
      <svg viewBox="0 0 24 24" width={s} height={s} fill="#fff">
        <path d="M13.5 22v-8.2h2.8l.5-3.4h-3.3V8.2c0-1 .4-1.7 1.8-1.7h1.6V3.4C16.6 3.3 15.7 3.2 14.7 3.2c-2.6 0-4.4 1.6-4.4 4.5v2.7H7.5v3.4h2.8V22h3.2z" />
      </svg>
    ),
  },
  whatsapp: {
    bg: '#25D366',
    node: s => (
      <svg viewBox="0 0 24 24" width={s} height={s} {...W}>
        <path d="M3.5 20.5l1.2-4.2A8.5 8.5 0 1 1 8 19.4z" />
        <path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 .8c-.9-.4-1.7-1.2-2.1-2.1l.8-1-1-2z" fill="#fff" stroke="none" />
      </svg>
    ),
  },
  telegram: {
    bg: '#229ED9',
    node: s => (
      <svg viewBox="0 0 24 24" width={s} height={s} fill="#fff">
        <path d="M20.7 4.1L3.4 10.8c-1.2.5-1.1 1.1-.2 1.4l4.4 1.4 1.7 5.3c.2.6.1.8.7.8.5 0 .7-.2 1-.5l2.1-2 4.4 3.3c.8.4 1.4.2 1.6-.8l2.9-13.8c.3-1.2-.5-1.8-1.3-1.4zM9 13.3l8.5-5.4c.4-.3.8-.1.5.2l-7 6.5-.3 3.1z" />
      </svg>
    ),
  },
  zoom: {
    bg: '#2D8CFF',
    node: s => (
      <svg viewBox="0 0 24 24" width={s} height={s} fill="#fff">
        <rect x="2.5" y="6.5" width="12" height="11" rx="2.5" />
        <path d="M16.5 10.5l5-3.2v9.4l-5-3.2z" />
      </svg>
    ),
  },
  meet: {
    bg: '#00897B',
    node: s => (
      <svg viewBox="0 0 24 24" width={s} height={s}>
        <rect x="2.5" y="6.5" width="12" height="11" rx="2" fill="#fff" />
        <path d="M16.5 10.5l5-3.2v9.4l-5-3.2z" fill="#FFBA00" />
        <rect x="2.5" y="14" width="12" height="3.5" rx="1.5" fill="#00AC47" />
        <rect x="2.5" y="6.5" width="4" height="4" rx="1" fill="#EA4335" />
      </svg>
    ),
  },
}

export function BrandIcon({ name, size = 36 }: { name: string; size?: number }) {
  const b = BRAND[name]
  if (!b) return null
  return (
    <span
      className="inline-flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        borderRadius: name === 'zoom' || name === 'meet' ? 10 : '50%',
        background: b.bg,
      }}
    >
      {b.node(Math.round(size * 0.58))}
    </span>
  )
}
