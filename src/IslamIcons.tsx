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

export const ISL: Record<string, ReactNode> = {
  'p-fajr': (
    <>
      <T d="M7 18a5 5 0 0 1 10 0z" />
      <path d="M3 18h18" />
      <path d="M7 18a5 5 0 0 1 10 0" />
      <path d="M12 8V5.5M6.3 11.3 4.5 9.5M17.7 11.3l1.8-1.8M3.5 14.5H5M19 14.5h1.5" />
      <path d="M9 21h6" />
    </>
  ),
  'p-dhuhr': (
    <>
      <circle cx="12" cy="12" r="4" fill="currentColor" style={TINT} />
      <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8" />
    </>
  ),
  'p-asr': (
    <>
      <circle cx="12" cy="13" r="3.6" fill="currentColor" style={TINT} />
      <path d="M12 5.5v2M5.8 8.3l1.4 1.4M18.2 8.3l-1.4 1.4M3 13h2M19 13h2" />
      <path d="M4 19.5h16" />
    </>
  ),
  'p-maghrib': (
    <>
      <circle cx="9" cy="9.5" r="3.2" fill="currentColor" style={TINT} />
      <path d="M9 3.5v1.3M4 5.5l1 1M14 5.5l-1 1M3 9.5h1.3" />
      <Both d="M7 19.5h10.2a3.4 3.4 0 0 0 .3-6.8A5 5 0 0 0 9.2 11.6 4 4 0 0 0 7 19.5z" />
    </>
  ),
  'p-isha': (
    <>
      <Both d={CRESCENT} />
      <path d="m17.5 3.5.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z" />
    </>
  ),
  tracker: (
    <>
      <circle cx="12" cy="12" r="8.5" fill="currentColor" style={TINT} />
      <path d="m8.5 12.3 2.4 2.4 4.6-5" />
    </>
  ),
  roza: (
    <>
      <Both d="M4 12h16a8 8 0 0 1-16 0z" />
      <path d="M9 8.5c0-1.2 1-1.2 1-2.5M14 8.5c0-1.2 1-1.2 1-2.5" />
    </>
  ),
  qibla: (
    <>
      <circle cx="12" cy="12" r="9" fill="currentColor" style={TINT} />
      <path d="M12 6.5l2.3 5.5-2.3 5.5-2.3-5.5z" />
      <circle cx="12" cy="12" r=".8" fill="currentColor" />
    </>
  ),
  tasbih: (
    <>
      <circle cx="18.5" cy="11" r="1.3" fill="currentColor" />
      <circle cx="16.6" cy="15.6" r="1.3" fill="currentColor" />
      <circle cx="12" cy="17.5" r="1.3" fill="currentColor" />
      <circle cx="7.4" cy="15.6" r="1.3" fill="currentColor" />
      <circle cx="5.5" cy="11" r="1.3" fill="currentColor" />
      <circle cx="7.4" cy="6.4" r="1.3" fill="currentColor" />
      <circle cx="12" cy="4.5" r="1.3" fill="currentColor" />
      <circle cx="16.6" cy="6.4" r="1.3" fill="currentColor" />
      <path d="M12 18.8V21.5" />
    </>
  ),
  amol: (
    <>
      <path d="M5 7l1.5 1.5L9 5.5M5 13l1.5 1.5L9 11.5M5 19l1.5 1.5L9 17.5" />
      <path d="M12 7h8M12 13h8M12 19h8" />
    </>
  ),
  zakat: (
    <>
      <circle cx="12" cy="12" r="9" fill="currentColor" style={TINT} />
      <path d="M12 6.5v11M14.6 9.3c-.5-.8-1.5-1.3-2.7-1.3-1.5 0-2.5.8-2.5 1.9 0 2.6 5.3 1.3 5.3 3.9 0 1.1-1.1 1.9-2.7 1.9-1.3 0-2.4-.5-3-1.4" />
    </>
  ),
  quran: (
    <>
      <Both d="M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5z" />
      <path d="M12 6.5v13" />
    </>
  ),
  hadith: (
    <>
      <Both d="M7 3.5h8l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" />
      <path d="M15 3.5v4h4M9 12h6M9 16h6" />
    </>
  ),
  alarm: (
    <>
      <circle cx="12" cy="13" r="7" fill="currentColor" style={TINT} />
      <path d="M5 4.5 2.5 7M19 4.5 21.5 7M12 9.5V13l2.5 1.5" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5.5" width="16" height="14.5" rx="2.5" fill="currentColor" style={TINT} />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
    </>
  ),
  pin: (
    <>
      <Both d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  'chev-left': <path d="m14.5 5.5-6.5 6.5 6.5 6.5" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
}

export function IIco({
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
      {ISL[name] || ISL.tracker}
    </svg>
  )
}
