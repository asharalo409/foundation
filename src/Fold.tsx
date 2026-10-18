import type { ReactNode } from 'react'

// খোলা-বন্ধ করা যায় এমন অংশ (অ্যাকর্ডিয়ন কার্ড)
export default function Fold({
  title,
  hint,
  badge,
  color = '#15803d',
  open,
  onToggle,
  children,
}: {
  title: string
  hint?: string
  badge?: string | number
  color?: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <section className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ borderLeft: '5px solid ' + color }}>
      <button type="button" aria-expanded={open} onClick={onToggle} className="w-full flex items-center gap-3 p-3.5 text-left">
        <span className="flex-1 min-w-0">
          <b className="block">{title}</b>
          {hint && <span className="block text-[11px] text-gray-500 truncate">{hint}</span>}
        </span>
        {badge !== undefined && badge !== '' && (
          <span className="text-white text-xs font-bold rounded-full px-2.5 py-0.5 shrink-0" style={{ background: color }}>
            {badge}
          </span>
        )}
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 text-gray-400 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .25s' }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <div className="grid" style={{ gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows .3s ease' }}>
        <div className="overflow-hidden">
          <div className="p-3 border-t bg-gray-50/60">{open ? children : null}</div>
        </div>
      </div>
    </section>
  )
}
