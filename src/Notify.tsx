import { useCallback, useEffect, useRef, useState } from 'react'
import { Ico } from './Icons'
import './Icons2'

export type AlertRow = {
  id: string
  kind: string
  title: string
  body?: string | null
  tab?: string | null
  urgent?: boolean
  created_at: string
}

const KIND: Record<string, { icon: string; color: string }> = {
  notice: { icon: 'notices', color: '#2563eb' },
  blood: { icon: 'blood', color: '#dc2626' },
  request: { icon: 'alert', color: '#dc2626' },
  aid: { icon: 'aid', color: '#d97706' },
  donation: { icon: 'finance', color: '#16a34a' },
  member: { icon: 'apply', color: '#7c3aed' },
  report: { icon: 'works', color: '#0891b2' },
  voice: { icon: 'voices', color: '#db2777' },
  duty: { icon: 'volunteers', color: '#d97706' },
  chat: { icon: 'chat', color: '#2563eb' },
}
export const kindOf = (k: string) => KIND[k] || { icon: 'bell', color: '#2563eb' }

const rd = (k: string, d: string) => {
  try { return localStorage.getItem(k) || d } catch { return d }
}
const wr = (k: string, v: string) => {
  try { localStorage.setItem(k, v) } catch {}
}
const bnum = (n: number) => Number(n).toLocaleString('bn-BD')

export function ago(s: string) {
  const m = Math.max(0, Math.floor((Date.now() - new Date(s).getTime()) / 60000))
  if (m < 1) return 'এইমাত্র'
  if (m < 60) return bnum(m) + ' মিনিট আগে'
  const h = Math.floor(m / 60)
  if (h < 24) return bnum(h) + ' ঘণ্টা আগে'
  return bnum(Math.floor(h / 24)) + ' দিন আগে'
}

async function sysNotify(a: AlertRow, icon?: string) {
  try {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    if (document.visibilityState === 'visible') return
    const reg = await navigator.serviceWorker?.getRegistration()
    const opts: any = {
      body: a.body || '',
      tag: 'al-' + a.id,
      data: { tab: a.tab || 'home' },
      vibrate: a.urgent ? [200, 100, 200, 100, 300] : [120],
      requireInteraction: !!a.urgent,
    }
    if (icon) opts.icon = icon
    if (reg) await reg.showNotification(a.title, opts)
    else new Notification(a.title, opts)
  } catch {}
}

export function useAlerts(supabase: any, user: any, logo?: string) {
  const [list, setList] = useState<AlertRow[]>([])
  const [seen, setSeen] = useState(() => rd('alerts-seen', '2000-01-01T00:00:00Z'))
  const [gone, setGone] = useState<string[]>(() => {
    try { return JSON.parse(rd('alerts-gone', '[]')) } catch { return [] }
  })
  const [banner, setBanner] = useState<AlertRow | null>(null)
  const logoRef = useRef(logo)
  logoRef.current = logo

  const fetchAll = useCallback(async () => {
    const { data, error } = await supabase.from('alerts')
      .select('id, kind, title, body, tab, urgent, created_at')
      .order('created_at', { ascending: false }).limit(40)
    if (error) {
      const n = await supabase.from('notices').select('id, title, body, is_urgent, created_at')
        .neq('kind', 'gallery').order('created_at', { ascending: false }).limit(15)
      setList((n.data || []).map((x: any) => ({
        id: 'n-' + x.id, kind: 'notice', title: x.title, body: x.body,
        tab: 'notices', urgent: x.is_urgent, created_at: x.created_at,
      })))
      return
    }
    setList(data || [])
  }, [supabase])

  useEffect(() => {
    fetchAll()
    const ch = supabase.channel('alerts-feed-' + (user?.id || 'anon'))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, (p: any) => {
        const a = p.new as AlertRow
        setList(l => (l.some(x => x.id === a.id) ? l : [a, ...l].slice(0, 60)))
        setBanner(a)
        try { navigator.vibrate?.(a.urgent ? [200, 100, 200, 100, 300] : [120]) } catch {}
        sysNotify(a, logoRef.current)
        window.dispatchEvent(new CustomEvent('alerts-new', { detail: a }))
      })
      .subscribe()
    const poll = setInterval(fetchAll, 120000)
    return () => {
      clearInterval(poll)
      supabase.removeChannel(ch)
    }
  }, [user?.id])

  const visible = list.filter(a => !gone.includes(a.id))
  const unread = visible.filter(a => new Date(a.created_at) > new Date(seen)).length

  function markSeen() {
    const n = new Date().toISOString()
    setSeen(n)
    wr('alerts-seen', n)
  }
  function dismiss(ids: string[]) {
    const next = Array.from(new Set([...gone, ...ids])).slice(-300)
    setGone(next)
    wr('alerts-gone', JSON.stringify(next))
  }

  return { list: visible, unread, markSeen, dismiss, banner, clearBanner: () => setBanner(null) }
}

export function AlertBanner({ a, onClose, onOpen }: { a: AlertRow; onClose: () => void; onOpen: (tab: string) => void }) {
  const c = kindOf(a.kind)

  useEffect(() => {
    const id = setTimeout(onClose, 6500)
    return () => clearTimeout(id)
  }, [a.id])

  return (
    <div className="fixed left-3 right-3 top-3 z-[60]" style={{ animation: 'alIn .35s cubic-bezier(.2,.9,.3,1)' }}>
      <style>{`
        @keyframes alIn{from{transform:translateY(-130%);opacity:0}to{transform:none;opacity:1}}
        @keyframes alBar{from{width:100%}to{width:0}}
      `}</style>
      <button className="w-full text-left rounded-2xl overflow-hidden shadow-2xl bg-white"
        style={{ border: `1px solid ${c.color}66`, color: '#111827' }}
        onClick={() => onOpen(a.tab || 'home')}>
        <div className="flex gap-3 p-3 items-start">
          <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white"
            style={{ background: `linear-gradient(135deg, ${c.color}, ${c.color}bb)` }}>
            <Ico name={c.icon} size={20} tint={0.4} />
          </span>
          <span className="flex-1 min-w-0">
            <b className="text-sm block leading-snug">{a.title}</b>
            {a.body && <span className="text-xs text-gray-600 block truncate">{a.body}</span>}
          </span>
          <span className="text-gray-400 p-1" onClick={e => { e.stopPropagation(); onClose() }}>
            <Ico name="close" size={16} />
          </span>
        </div>
        <div style={{ height: 3, background: c.color, animation: 'alBar 6.5s linear forwards' }} />
      </button>
    </div>
  )
}

export function AlertsPanel({
  list, onClose, onOpen, onDismiss,
}: { list: AlertRow[]; onClose: () => void; onOpen: (tab: string) => void; onDismiss: (ids: string[]) => void }) {
  const [perm, setPerm] = useState<string>(typeof Notification === 'undefined' ? 'unsupported' : Notification.permission)

  async function ask() {
    try { setPerm(await Notification.requestPermission()) } catch {}
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose}>
      <div className="mx-3 mt-16 bg-white rounded-2xl p-4 max-h-[78vh] overflow-y-auto space-y-3"
        onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center gap-2">
          <h3 className="font-bold text-lg flex items-center gap-2"><Ico name="bell" size={22} /> নোটিফিকেশন</h3>
          <div className="flex items-center gap-3">
            {list.length > 0 && (
              <button className="text-xs text-red-600 underline" onClick={() => onDismiss(list.map(a => a.id))}>
                সব মুছুন
              </button>
            )}
            <button className="p-1" onClick={onClose} aria-label="close"><Ico name="close" size={20} /></button>
          </div>
        </div>

        {perm === 'default' && (
          <div className="rounded-xl p-3 space-y-2" style={{ background: '#eff6ff', color: '#1e3a8a' }}>
            <p className="text-sm font-bold">ফোনে নোটিফিকেশন চালু করুন</p>
            <p className="text-xs">অ্যাপ ব্যাকগ্রাউন্ডে থাকলেও নতুন জরুরি রক্ত, নোটিশ ও দায়িত্বের খবর ফোনের নোটিফিকেশন বারে আসবে।</p>
            <button className="rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ background: '#2563eb' }} onClick={ask}>
              চালু করুন
            </button>
          </div>
        )}
        {perm === 'denied' && (
          <p className="text-xs rounded-xl p-3" style={{ background: '#fef3c7', color: '#92400e' }}>
            নোটিফিকেশন বন্ধ করা আছে। ফোনের ব্রাউজার বা অ্যাপ সেটিংস থেকে এই সাইটের নোটিফিকেশনের অনুমতি দিন।
          </p>
        )}
        {perm === 'granted' && (
          <p className="text-[11px] text-gray-500">
            নোটিফিকেশন চালু আছে। অ্যাপ খোলা বা ব্যাকগ্রাউন্ডে থাকলে বাজবে।
          </p>
        )}

        {list.length === 0 && <p className="text-sm text-gray-500 text-center py-6">কোনো নোটিফিকেশন নেই</p>}

        {list.map(a => {
          const c = kindOf(a.kind)
          return (
            <div key={a.id} className="flex gap-2 items-start border-t pt-3 first:border-t-0 first:pt-0">
              <button className="flex gap-3 flex-1 min-w-0 text-left" onClick={() => onOpen(a.tab || 'home')}>
                <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white"
                  style={{ background: `linear-gradient(135deg, ${c.color}, ${c.color}bb)` }}>
                  <Ico name={c.icon} size={20} tint={0.4} />
                </span>
                <span className="min-w-0">
                  <b className="text-sm block leading-snug">
                    {a.urgent && <span style={{ color: '#dc2626' }}>জরুরি · </span>}
                    {a.title}
                  </b>
                  {a.body && <span className="text-xs text-gray-600 block line-clamp-2">{a.body}</span>}
                  <span className="text-[10px] text-gray-400">{ago(a.created_at)}</span>
                </span>
              </button>
              <button className="text-gray-400 p-1" onClick={() => onDismiss([a.id])} aria-label="dismiss">
                <Ico name="close" size={16} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
