import { useEffect, useState } from 'react'
import { GROUPS } from './menu'
import { t } from './i18n'

export default function Sidebar({ open, onClose, items, cur, go, color, settings, supabase, isMember }: any) {
  const [prog, setProg] = useState<any>(null)

  useEffect(() => {
    if (!open || !isMember) return
    const d = new Date()
    Promise.all([
      supabase.from('public_members').select('id'),
      supabase.from('monthly_fees').select('member_id')
        .eq('year', d.getFullYear()).eq('month', d.getMonth() + 1).eq('status', 'paid'),
    ]).then(([m, f]: any) => {
      setProg({
        total: (m.data || []).length,
        paid: new Set((f.data || []).map((x: any) => x.member_id)).size,
      })
    })
  }, [open])

  if (!open) return null

  const byKey: Record<string, any> = {}
  items.forEach((it: any) => { byKey[it[0]] = it })
  const used = new Set<string>()
  const sections: [string, any[]][] = GROUPS.map(([title, keys]: any) => {
    const rows = keys.filter((k: string) => byKey[k]).map((k: string) => { used.add(k); return byKey[k] })
    return [title, rows] as [string, any[]]
  }).filter(([, rows]: any) => rows.length)
  const rest = items.filter((it: any) => !used.has(it[0]))
  if (rest.length) sections.push(['অন্যান্য', rest])

  const pct = prog && prog.total > 0 ? Math.round((prog.paid / prog.total) * 100) : 0
  const bn = (n: number) => n.toLocaleString('bn-BD')

  return (
    <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,.45)' }} onClick={onClose}>
      <style>{`@keyframes sb-in{from{transform:translateX(-100%)}to{transform:translateX(0)}}`}</style>
      <aside onClick={e => e.stopPropagation()}
        className="absolute left-0 top-0 bottom-0 w-[82%] max-w-xs bg-white overflow-y-auto"
        style={{ animation: 'sb-in .25s ease-out' }}>
        <div className="flex items-center gap-3 p-4 border-b">
          {settings?.logo_url ? (
            <img src={settings.logo_url} className="w-10 h-10 rounded-xl object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg"
              style={{ background: color }}>💚</div>
          )}
          <p className="font-bold flex-1 min-w-0 truncate">{settings?.org_name || '...'}</p>
          <button className="text-xl text-gray-400" onClick={onClose}>✕</button>
        </div>

        <div className="p-2">
          {sections.map(([title, rows]) => (
            <div key={title}>
              <p className="text-[11px] font-bold text-gray-500 px-3 pt-3 pb-1">{title}</p>
              {rows.map(([k, icon, label]: any) => {
                const on = cur === k
                return (
                  <button key={k} onClick={() => go(k)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold"
                    style={on ? { background: color + '22', color } : undefined}>
                    <span className="text-lg w-7 text-center">{icon}</span>
                    <span className="flex-1">{t(label)}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {prog && prog.total > 0 && (
          <div className="m-3 rounded-2xl p-3" style={{ background: '#e3f2fd', color: '#0d47a1' }}>
            <div className="flex items-center gap-2">
              <span className="text-xl">💰</span>
              <div>
                <p className="text-sm font-bold">এ মাসের ফি সংগ্রহ</p>
                <p className="text-[11px] opacity-80">{bn(prog.paid)}/{bn(prog.total)} জন</p>
              </div>
            </div>
            <div className="flex justify-between text-[11px] mt-2">
              <span>অগ্রগতি</span>
              <b>{bn(pct)}%</b>
            </div>
            <div className="h-2 rounded-full mt-1" style={{ background: '#bbdefb' }}>
              <div className="h-full rounded-full" style={{ width: pct + '%', background: '#1e88e5' }} />
            </div>
          </div>
        )}
        <div className="h-6" />
      </aside>
    </div>
  )
}
