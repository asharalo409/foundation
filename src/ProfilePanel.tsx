import { useState } from 'react'
import { ROLES } from './Dashboard'

function Switch({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-11 h-6 rounded-full p-0.5 flex shrink-0"
      style={{ background: on ? '#16a34a' : '#cbd5e1', justifyContent: on ? 'flex-end' : 'flex-start' }}>
      <span className="w-5 h-5 rounded-full" style={{ background: '#fff' }} />
    </button>
  )
}

export default function ProfilePanel({
  onClose, member, user, isAdmin, color, dark, setDark, lang, toggleLang, share,
  hideTicker, setHideTicker, unread, openBell, openDonate, openTheme, go, logout,
}: any) {
  const [q, setQ] = useState('')
  const h = new Date().getHours()
  const greet =
    h < 5 ? 'শুভ রাত্রি' : h < 12 ? 'শুভ সকাল' : h < 15 ? 'শুভ দুপুর' : h < 18 ? 'শুভ বিকাল' : h < 20 ? 'শুভ সন্ধ্যা' : 'শুভ রাত্রি'

  const rows: [string, string, () => void, number?][] = []
  if (user) rows.push(['⚙️', 'অ্যাকাউন্ট সেটিংস', () => go('me')])
  else {
    rows.push(['🔑', 'লগইন', () => go('login')])
    rows.push(['📝', 'সদস্য হওয়ার আবেদন', () => go('apply')])
  }
  rows.push(['🎨', 'থিম ও ব্যাকগ্রাউন্ড', openTheme])
  rows.push(['🔔', 'নোটিফিকেশন', openBell, unread])
  rows.push(['🕌', 'ইসলামিক কর্নার', () => go('islamic')])
  if (isAdmin) rows.push(['🛡️', 'অ্যাডমিন প্যানেল', () => go('admin')])
  rows.push(['🔗', 'শেয়ার করুন', share])
  rows.push(['🌐', lang === 'bn' ? 'Switch to English' : 'ভাষা পরিবর্তন (বাং)', toggleLang])
  if (user) rows.push(['🚪', 'লগআউট', logout])

  const list = rows.filter(r => !q || r[1].toLowerCase().includes(q.toLowerCase()))
  const name = member?.full_name || user?.email || 'অতিথি'

  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className="absolute right-2 top-14 w-[92%] max-w-sm bg-white rounded-2xl shadow-2xl p-4 space-y-3 max-h-[82vh] overflow-y-auto border">
        <div className="flex items-center gap-3">
          {member?.photo_url ? (
            <img src={member.photo_url} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl">
              {user ? name.slice(0, 1) : '👤'}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm">
              {greet}, <b>{name}</b>
            </p>
            <p className="text-xs text-gray-500">
              {member ? ROLES[member.role] || member.role : user ? 'অতিথি' : 'লগইন করা নেই'}
            </p>
          </div>
        </div>

        <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-green-600"
          placeholder="প্রোফাইল অপশন খুঁজুন..." value={q} onChange={e => setQ(e.target.value)} />

        <div className="rounded-xl p-3 space-y-2" style={{ background: '#fff8e1', color: '#5d4037' }}>
          <p className="font-bold text-sm">💚 অনুদানের হাত বাড়ান</p>
          <p className="text-[11px] opacity-80">আপনার ছোট দানও একজন অসহায় মানুষের পাশে দাঁড়ায়।</p>
          <button className="rounded-lg px-4 py-1.5 text-sm font-semibold" style={{ background: '#ffc107', color: '#3e2723' }}
            onClick={openDonate}>
            দান করুন
          </button>
        </div>

        <div className="rounded-xl p-3 space-y-3" style={{ background: '#e3f2fd', color: '#0d47a1' }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">🌙 ডার্ক মোড</span>
            <Switch on={dark} onClick={() => setDark(!dark)} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">📢 নোটিশ টিকার</span>
            <Switch on={!hideTicker} onClick={() => setHideTicker(!hideTicker)} />
          </div>
        </div>

        <div>
          {list.map(([icon, label, fn, badge]) => (
            <button key={label} onClick={fn}
              className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-left text-sm hover:bg-black/5">
              <span className="w-6 text-center">{icon}</span>
              <span className="flex-1">{label}</span>
              {!!badge && (
                <span className="text-xs font-bold rounded-full px-2 py-0.5" style={{ background: '#ffe082', color: '#5d4037' }}>
                  {badge}
                </span>
              )}
            </button>
          ))}
          {list.length === 0 && <p className="text-xs text-gray-400 text-center py-2">কিছু পাওয়া যায়নি</p>}
        </div>
      </div>
    </div>
  )
}
