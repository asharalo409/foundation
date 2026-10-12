import type { CSSProperties } from 'react'
import { ICONS } from './Icons'

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

Object.assign(ICONS, {
  phone: (
    <Both d="M7 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2C10.5 20 4 13.5 4 5.5a2 2 0 0 1 2-2z" />
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" fill="currentColor" style={TINT} />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  alert: (
    <>
      <Both d="M12 3.5 21 19H3z" />
      <path d="M12 10v4M12 16.6v.2" />
    </>
  ),
  aid: (
    <>
      <Both d="M12 11.5s-3.8-2.4-3.8-5.3a2.2 2.2 0 0 1 3.8-1.4 2.2 2.2 0 0 1 3.8 1.4c0 2.9-3.8 5.3-3.8 5.3z" />
      <path d="M3.5 14.5c2.8 1.2 4.2 3 5.8 4.2 2.2 1.6 5 .6 8.2-1.4l3-2" />
    </>
  ),
  back: <path d="M19 12H5M11 6l-6 6 6 6" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  flame: (
    <Both d="M12 3c.4 3.2 4.6 5.2 4.6 10a4.6 4.6 0 0 1-9.2 0c0-2.1 1-3.2 2.1-4.2.1 1.2.7 2.1 1.6 2.5C11.1 9.2 11.3 6.1 12 3z" />
  ),
  medal: (
    <>
      <circle cx="12" cy="9" r="5" fill="currentColor" style={TINT} />
      <circle cx="12" cy="9" r="5" />
      <path d="M8.6 13.2 7 21l5-2.6L17 21l-1.6-7.8" />
    </>
  ),
  bolt: <Both d="M13 2.5 5.5 13H11l-1 8.5L18.5 10H13z" />,
  spark: <Both d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />,
  mail: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" fill="currentColor" style={TINT} />
      <path d="m4 7.5 8 6 8-6" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="currentColor" style={TINT} />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
})
