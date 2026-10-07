export const cn = (...a: any[]) => a.filter(Boolean).join(' ')

export function Avatar({ src, name, size = 36 }: { src?: string | null; name?: string; size?: number }) {
  const ini = (name || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('')
  const style: any = { width: size, height: size, fontSize: size * 0.38 }
  return src ? (
    <img src={src} alt={name || ''} style={style} className="rounded-full object-cover shrink-0" />
  ) : (
    <span style={{ ...style, background: '#cbd5e1', color: '#334155' }}
      className="rounded-full font-semibold flex items-center justify-center shrink-0">
      {ini}
    </span>
  )
}

const TONES: Record<string, string> = {
  green: '#16a34a', amber: '#d97706', red: '#dc2626',
  blue: '#2563eb', gray: '#6b7280', purple: '#9333ea',
}

export function Badge({ tone = 'gray', children }: { tone?: string; children: any }) {
  const c = TONES[tone] || TONES.gray
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap"
      style={{ color: c, background: c + '22', border: `1px solid ${c}44` }}>
      {children}
    </span>
  )
}

export function Table({ children, min = 640 }: { children: any; min?: number }) {
  return (
    <div className="relative w-full overflow-x-auto rounded-xl border bg-white shadow-sm">
      <table className="w-full caption-bottom text-sm" style={{ minWidth: min }}>{children}</table>
    </div>
  )
}
export const THead = ({ children }: any) => <thead className="[&_tr]:border-b">{children}</thead>
export const TBody = ({ children }: any) => <tbody className="[&_tr:last-child]:border-0">{children}</tbody>
export const TR = ({ children, className }: any) => (
  <tr className={cn('border-b transition-colors hover:bg-black/5', className)}>{children}</tr>
)
export const TH = ({ children, className }: any) => (
  <th className={cn('h-11 px-3 text-left align-middle font-medium text-gray-500 whitespace-nowrap', className)}>
    {children}
  </th>
)
export const TD = ({ children, className }: any) => (
  <td className={cn('p-3 align-middle', className)}>{children}</td>
)
