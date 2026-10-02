import { getLang } from './i18n'

export function fmtDT(s?: string | null) {
  if (!s) return ''
  const d = new Date(s)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleString(getLang() === 'en' ? 'en-GB' : 'bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}
