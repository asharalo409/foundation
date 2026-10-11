import type { CSSProperties, ReactNode } from 'react'

const TINT: CSSProperties = { fillOpacity: 'var(--tint, .16)' }

const T = ({ d }: { d: string }) => (
  <path d={d} fill="currentColor" stroke="none" style={TINT} />
)
const Both = ({ d }: { d: string }) => (
  <>
    <T d={d} />
    <path d={d} />
  </>
)

const CRESCENT = 'M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z'

export const ICONS: Record<string, ReactNode> = {
  home: (
    <>
      <T d="M5 10.5 12 4.5l7 6V19a1 1 0 0 1-1 1h-3.5v-5h-5v5H6a1 1 0 0 1-1-1z" />
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v9a1 1 0 0 0 1 1h3.5v-5h5v5H18a1 1 0 0 0 1-1v-9" />
    </>
  ),
  overview: (
    <>
      <rect x="4" y="12" width="4" height="8" rx="1.2" fill="currentColor" style={TINT} />
      <rect x="10" y="4" width="4" height="16" rx="1.2" fill="currentColor" style={TINT} />
      <rect x="16" y="9" width="4" height="11" rx="1.2" fill="currentColor" style={TINT} />
    </>
  ),
  finance: (
    <>
      <Both d="M6 3.5h12V21l-3-2-3 2-3-2-3 2z" />
      <path d="M9.5 8.5h5M9.5 12h5" />
    </>
  ),
  chat: (
    <>
      <Both d="M5 5h14a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 19 17h-7l-4.5 3.5V17H5a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 5 5z" />
      <path d="M8.5 9.5h7M8.5 12.5h4" />
    </>
  ),
  projects: (
    <>
      <T d="M12 14c0-3.6-2.6-6.2-6.2-6.2 0 3.6 2.6 6.2 6.2 6.2z" />
      <path d="M12 21v-7" />
      <path d="M12 14c0-3.6-2.6-6.2-6.2-6.2 0 3.6 2.6 6.2 6.2 6.2z" />
      <path d="M12 16c0-3.2 2.2-5.4 5.6-5.4 0 3.2-2.2 5.4-5.6 5.4z" />
      <path d="M8 21h8" />
    </>
  ),
  ledger: (
    <>
      <Both d="M5 4.5h11a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3z" />
      <path d="M5 17a3 3 0 0 1 3-3h11" />
      <path d="M9 8.5h6" />
    </>
  ),
  groups: (
    <>
      <circle cx="9" cy="8.5" r="3.2" fill="currentColor" style={TINT} />
      <path d="M3 19.5a6 6 0 0 1 12 0" />
      <circle cx="17" cy="9.5" r="2.5" />
      <path d="M16.2 14.2A4.8 4.8 0 0 1 21 18.5" />
    </>
  ),
  volunteers: (
    <>
      <Both d="M8 5.5H6a1 1 0 0 0-1 1V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6.5a1 1 0 0 0-1-1h-2" />
      <rect x="8.5" y="3" width="7" height="4.5" rx="1.5" />
      <path d="m9 14 2.2 2.2L15.5 12" />
    </>
  ),
  me: (
    <>
      <circle cx="12" cy="8" r="4" fill="currentColor" style={TINT} />
      <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  map: (
    <>
      <Both d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  works: (
    <>
      <Both d="M12 3 19 6v5.5c0 4.6-3 8-7 9.5-4-1.5-7-4.9-7-9.5V6z" />
      <path d="m8.8 12 2.4 2.4 4.2-4.6" />
    </>
  ),
  blood: (
    <>
      <Both d="M12 3s6 6.2 6 11a6 6 0 0 1-12 0c0-4.8 6-11 6-11z" />
      <path d="M9.3 14.5a2.8 2.8 0 0 0 2.7 2.6" />
    </>
  ),
  islamic: (
    <>
      <Both d={CRESCENT} />
      <path d="m17.5 3.5.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z" />
    </>
  ),
  voices: <Both d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9L3.5 9.7l5.9-.8z" />,
  notices: (
    <>
      <Both d="M4 9.5v5h3.5L14 18.5v-13L7.5 9.5z" />
      <path d="M17 9a4.2 4.2 0 0 1 0 6" />
      <path d="m7.5 14.5.9 4.5h2.4L10 15.5" />
    </>
  ),
  gallery: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" fill="currentColor" style={TINT} />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m3.5 17 5-4.5 4 3.5 3-2.5 5 4" />
    </>
  ),
  apply: (
    <>
      <circle cx="10" cy="8" r="4" fill="currentColor" style={TINT} />
      <path d="M3 20a7 7 0 0 1 11.5-5.3" />
      <path d="M18 9.5v6M15 12.5h6" />
    </>
  ),
  login: (
    <>
      <path d="M10 4.5H6.5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2H10" />
      <path d="m14 8 4 4-4 4M8.5 12H18" />
    </>
  ),
  admin: (
    <>
      <path d="M4 7h8M18 7h2M4 17h2M12 17h8" />
      <circle cx="15" cy="7" r="2.6" fill="currentColor" style={TINT} />
      <circle cx="9" cy="17" r="2.6" fill="currentColor" style={TINT} />
    </>
  ),
  heart: (
    <Both d="M12 20.5s-7.5-4.6-7.5-10.4a4.2 4.2 0 0 1 7.5-2.5 4.2 4.2 0 0 1 7.5 2.5c0 5.8-7.5 10.4-7.5 10.4z" />
  ),
  bell: (
    <>
      <Both d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z" />
      <path d="M10 20.5a2 2 0 0 0 4 0" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h10M4 17h13" />,
  palette: (
    <>
      <Both d="M12 3.5a8.5 8.5 0 1 0 0 17c1.3 0 1.9-.9 1.5-2-.4-1.2.3-2.3 1.6-2.3H17a3.5 3.5 0 0 0 3.5-3.5C20.5 7 16.8 3.5 12 3.5z" />
      <circle cx="8" cy="11" r="1" fill="currentColor" />
      <circle cx="11.5" cy="7.5" r="1" fill="currentColor" />
      <circle cx="16" cy="9.5" r="1" fill="currentColor" />
    </>
  ),
  share: (
    <>
      <path d="M12 15V4M8 8l4-4 4 4" />
      <path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" fill="currentColor" style={TINT} />
      <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
    </>
  ),
  logout: (
    <>
      <path d="M14 4.5h3.5a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H14" />
      <path d="m10 8-4 4 4 4M6 12h10" />
    </>
  ),
  moon: <Both d={CRESCENT} />,
}

export function Ico({
  name, size = 22, stroke = 1.8, tint, className, style,
}: {
  name: string
  size?: number
  stroke?: number
  tint?: number
  className?: string
  style?: CSSProperties
}) {
  const st: any = { ...style }
  if (tint !== undefined) st['--tint'] = tint
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={st}
      aria-hidden="true"
    >
      {ICONS[name] || ICONS.home}
    </svg>
  )
}
