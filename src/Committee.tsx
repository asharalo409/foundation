import { useEffect, useState } from 'react'

type Group = { key: string; label: string; items: any[] }

export default function Committee({ supabase, color = '#087a43' }: any) {
  const [list, setList] = useState<any[]>([])

  useEffect(() => {
    supabase.from('committee_public').select('*')
      .order('rank').order('full_name')
      .then(({ data }: any) => setList(data || []))
  }, [])

  if (!list.length) return null

  const groups: Group[] = []
  list.forEach(m => {
    let g = groups.find(x => x.key === m.role_key)
    if (!g) {
      g = { key: m.role_key, label: m.role_label, items: [] }
      groups.push(g)
    }
    g.items.push(m)
  })

  return (
    <section className="rounded-2xl border bg-white p-4 space-y-5">
      <div className="text-center">
        <h2 className="font-bold text-base">আমাদের কমিটি</h2>
        <p className="text-[11px] text-gray-500">যাঁরা সংগঠনকে এগিয়ে নিচ্ছেন</p>
      </div>

      {groups.map((g, gi) => {
        const size = gi === 0 ? 88 : 64
        return (
          <div key={g.key}>
            <div className="flex items-center gap-2 mb-3">
              <span className="flex-1 h-px" style={{ background: color + '44' }} />
              <span className="text-xs font-bold px-2" style={{ color }}>{g.label}</span>
              <span className="flex-1 h-px" style={{ background: color + '44' }} />
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-4">
              {g.items.map(m => (
                <div key={m.id} className="flex flex-col items-center text-center"
                  style={{ width: size + 20 }}>
                  <div className="rounded-full overflow-hidden flex items-center justify-center bg-gray-100 font-bold"
                    style={{
                      width: size, height: size, border: `3px solid ${color}`,
                      boxShadow: `0 4px 14px ${color}44`, color, fontSize: size / 2.6,
                    }}>
                    {m.photo_url
                      ? <img src={m.photo_url} alt={m.full_name} loading="lazy"
                          className="w-full h-full object-cover" />
                      : (m.full_name || '?').slice(0, 1)}
                  </div>
                  <p className="mt-1.5 text-[12px] font-semibold leading-tight line-clamp-2">{m.full_name}</p>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </section>
  )
}
