import { useState } from 'react'

// ট্যাব সারির বদলে: বর্তমান অংশের নামসহ একটা কার্ড, চাপলে সব অংশের তালিকা খোলে।
// চালু অংশে আবার চাপলে অংশটা বন্ধ হয়ে যায়।
export default function Sections({
  tabs,
  value,
  onChange,
  color = '#15803d',
}: {
  tabs: string[][]
  value: string
  onChange: (k: string) => void
  color?: string
}) {
  const [open, setOpen] = useState(false)
  const cur = tabs.find(t => t[0] === value)

  return (
    <div
      className="bg-white rounded-2xl shadow-sm overflow-hidden"
      style={{ borderLeft: '5px solid ' + color }}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-3.5 text-left"
      >
        <span className="flex-1 min-w-0">
          <span className="block text-[11px] text-gray-500">
            {cur ? 'এখন দেখছেন' : 'অংশ বাছাই করুন'}
          </span>
          <b className="block truncate">{cur ? cur[1] : 'কোনোটি খোলা নেই'}</b>
        </span>
        <span
          className="text-[11px] font-semibold rounded-full px-2.5 py-1 shrink-0"
          style={{ background: color + '18', color }}
        >
          {open ? 'বন্ধ করুন' : 'বদলান'}
        </span>
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 text-gray-400 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform .25s',
          }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <div
        className="grid"
        style={{
          gridTemplateRows: open ? '1fr' : '0fr',
          transition: 'grid-template-rows .3s ease',
        }}
      >
        <div className="overflow-hidden">
          <div className="p-3 border-t grid grid-cols-2 gap-2">
            {tabs.map(([k, l]) => {
              const on = k === value
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    onChange(on ? '' : k)
                    setOpen(false)
                  }}
                  className="rounded-xl px-3 py-2.5 text-sm font-semibold text-left border"
                  style={
                    on
                      ? { background: color, color: '#fff', borderColor: color }
                      : { background: '#fff' }
                  }
                >
                  {l}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
