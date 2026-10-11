import { useEffect, useState } from 'react'
import { IIco } from './IslamIcons'
import { dayInfo, status, dateKey, hm, hms, SCENE, getLog, toggleLog } from './salat'
import { PN, bnDigits, hijri, HIJRI_BN, setLoc } from './prayer'
import type { Loc } from './prayer'
import { getCfg } from './alarm'
import { Qibla, Tasbih, Amol, Zakat } from './IslamicTools'
import AlarmPanel from './AlarmPanel'
import { Sheet, LocBody, CalendarBody, Roza, Tracker, Soon } from './IslamicViews'

const GRID: [string, string, string, boolean?][] = [
  ['tracker', 'ট্র্যাকার', 'tracker'],
  ['roza', 'রোজা', 'roza'],
  ['qibla', 'কিবলা', 'qibla'],
  ['tasbih', 'তসবিহ', 'tasbih'],
  ['amol', 'আমল', 'amol'],
  ['zakat', 'জাকাত', 'zakat'],
  ['quran', 'কুরআন', 'quran', true],
  ['hadith', 'হাদিস', 'hadith', true],
]

const TITLES: Record<string, string> = {
  tracker: 'নামাজের ট্র্যাকার',
  roza: 'রোজা (সাহরি ও ইফতার)',
  qibla: 'কিবলা',
  tasbih: 'তসবিহ',
  amol: 'আমল',
  zakat: 'জাকাত',
  quran: 'কুরআন',
  hadith: 'হাদিস',
}

const STARS: [number, number, number, number][] = [
  [10, 18, 2, 0], [22, 8, 1.5, 0.6], [35, 24, 2, 1.2], [48, 10, 1.5, 0.3], [60, 20, 2, 0.9],
  [72, 7, 1.5, 1.5], [18, 34, 1.5, 0.4], [85, 28, 2, 1.1], [92, 14, 1.5, 0.7], [5, 6, 1.5, 1.8],
]

function Sky({ night }: { night: boolean }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {night ? (
        <>
          {STARS.map(([l, t, s, d], i) => (
            <span key={i} className="absolute rounded-full bg-white"
              style={{ left: l + '%', top: t + '%', width: s, height: s, animation: `isl-tw 3s ${d}s infinite` }} />
          ))}
          <div className="absolute rounded-full"
            style={{
              right: '10%', top: 22, width: 46, height: 46,
              background: 'radial-gradient(circle at 35% 35%, #fffbe6, #f3e6b8 60%, #d9c98f)',
              boxShadow: '0 0 40px 12px rgba(255,248,220,.3)',
            }} />
        </>
      ) : (
        <div className="absolute rounded-full"
          style={{
            right: '10%', top: 20, width: 52, height: 52,
            background: 'radial-gradient(circle at 40% 40%, #fff7c2, #fcd34d 70%, #f59e0b)',
            boxShadow: '0 0 60px 20px rgba(255,214,102,.45)',
          }} />
      )}
    </div>
  )
}

function Gauge({ pct, name, label, time, sub }: any) {
  const C = 150
  const R = 112
  const A0 = 135
  const SW = 270
  const p = Math.min(1, Math.max(0, pct || 0))
  const pt = (a: number): [number, number] => [
    C + R * Math.cos((a * Math.PI) / 180),
    C + R * Math.sin((a * Math.PI) / 180),
  ]
  const d = (a1: number, a2: number) => {
    const [x1, y1] = pt(a1)
    const [x2, y2] = pt(a2)
    return `M${x1.toFixed(1)} ${y1.toFixed(1)}A${R} ${R} 0 ${a2 - a1 > 180 ? 1 : 0} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`
  }
  const aEnd = A0 + SW * p
  const [tx, ty] = pt(aEnd)

  return (
    <div className="relative mx-auto" style={{ width: 300, height: 250 }}>
      <svg width="300" height="250" viewBox="0 0 300 250" className="absolute inset-0">
        <defs>
          <linearGradient id="isl-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fde68a" />
            <stop offset="1" stopColor="#ffffff" />
          </linearGradient>
        </defs>
        <path d={d(A0, A0 + SW)} fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="14" strokeLinecap="round" />
        {p > 0.004 && (
          <path d={d(A0, aEnd)} fill="none" stroke="url(#isl-g)" strokeWidth="14" strokeLinecap="round" />
        )}
        <circle cx={tx} cy={ty} r="15" fill="rgba(255,255,255,.25)" />
        <circle cx={tx} cy={ty} r="9" fill="#fff" />
      </svg>
      <div className="absolute inset-x-0 text-center" style={{ top: 92 }}>
        <p className="text-2xl font-bold leading-tight">{name}</p>
        <p className="text-sm opacity-85">{label}</p>
        <p className="text-3xl font-bold tabular-nums leading-tight">{time}</p>
        {sub && <p className="text-xs opacity-80 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

function Ring({ pct, accent, size = 64 }: { pct: number; accent: string; size?: number }) {
  const r = size / 2 - 5
  const c = 2 * Math.PI * r
  return (
    <span className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={accent + '33'} strokeWidth="5" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={accent} strokeWidth="5"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
      </svg>
      <span className="text-sm font-bold" style={{ color: accent }}>
        {bnDigits(String(Math.round(pct * 100)))}%
      </span>
    </span>
  )
}

export default function Islamic({ supabase, settings, isAdmin }: any) {
  const accent = settings?.theme_color || '#087a43'
  const [view, setView] = useState('home')
  const [sheet, setSheet] = useState('')
  const [now, setNow] = useState(Date.now())
  const [, setRev] = useState(0)
  const [log, setLog] = useState(getLog())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const bump = () => setRev(r => r + 1)
  const st = status(now)
  const info = dayInfo(st.day)
  const loc = info.loc
  const L = info.list
  const dk = dateKey(st.day)
  const done = log[dk] || []

  function tick(key: string) {
    setLog(toggleLog(dk, key))
  }

  if (view !== 'home') {
    return (
      <div className="space-y-4">
        <button onClick={() => setView('home')} className="flex items-center gap-1 text-sm font-semibold"
          style={{ color: accent }}>
          <IIco name="chev-left" size={18} /> ইসলামিক কর্নার
        </button>
        <h2 className="text-xl font-bold">{TITLES[view]}</h2>
        {view === 'roza' && <Roza loc={loc} />}
        {view === 'qibla' && <Qibla loc={loc} />}
        {view === 'tasbih' && <Tasbih />}
        {view === 'amol' && <Amol />}
        {view === 'zakat' && <Zakat />}
        {view === 'tracker' && (
          <Tracker log={log} now={now} accent={accent}
            onToggle={(d, k) => setLog(toggleLog(d, k))} />
        )}
        {view === 'quran' && (
          <Soon icon="quran" title="কুরআন" accent={accent}
            text="একবার আপনার ফোনে ডাউনলোড করে নিলে ইন্টারনেট ছাড়াই আরবি ও বাংলা অনুবাদসহ পড়া যাবে। এতে আমাদের ডাটাবেজে কোনো জায়গা লাগবে না।" />
        )}
        {view === 'hadith' && (
          <Soon icon="hadith" title="হাদিস" accent={accent}
            text="সংকলন অনুযায়ী হাদিস আপনার ফোনে ডাউনলোড হয়ে থাকবে, ইন্টারনেট ছাড়াই পড়া যাবে। এতে আমাদের ডাটাবেজে কোনো জায়গা লাগবে না।" />
        )}
      </div>
    )
  }

  const gap = st.mode === 'gap'
  const total = st.cur.end - st.cur.start
  const prog = total > 0 ? (now - st.cur.start) / total : 0
  const nameKey = gap ? st.next.key : st.cur.key
  const left = (gap ? st.next.start : st.cur.end) - now
  const scene = SCENE[gap ? 'gap' : st.cur.key]
  const nd = new Date(now)
  const hj = hijri(nd)
  const dateLine =
    nd.toLocaleDateString('bn-BD', { weekday: 'long', day: 'numeric', month: 'long' }) +
    ' · ' + bnDigits(hj.d + ' ') + HIJRI_BN[hj.m - 1] + ' ' + bnDigits(String(hj.y))
  const alarmOn = getCfg().on

  const pill = 'rounded-full px-3 py-1.5 text-xs flex items-center gap-1.5 whitespace-nowrap'
  const pillBg = { background: 'rgba(255,255,255,.18)', backdropFilter: 'blur(6px)' }

  return (
    <div className="-mx-4 -mt-4">
      <style>{`
        @keyframes isl-tw{0%,100%{opacity:.25}50%{opacity:1}}
        @keyframes isl-pulse{0%{box-shadow:0 0 0 0 rgba(34,197,94,.6)}100%{box-shadow:0 0 0 9px rgba(34,197,94,0)}}
      `}</style>

      <section className="relative overflow-hidden text-white px-4 pt-5 pb-14"
        style={{ background: scene.bg, borderRadius: '0 0 34px 34px' }}>
        <Sky night={scene.night} />
        <div className="relative">
          <p className="text-center text-xs opacity-90">{dateLine}</p>
          <Gauge
            pct={prog}
            name={PN[nameKey]}
            label={gap ? 'শুরু হতে বাকি' : 'শেষ হতে বাকি'}
            time={hms(left)}
            sub={gap
              ? 'এখন কোনো ওয়াক্ত চলছে না'
              : 'এরপর: ' + PN[st.next.key] + ' · ' + hm(st.next.start, loc.tz)}
          />
          <div className="flex flex-wrap justify-center gap-2">
            <button className={pill} style={pillBg} onClick={() => setSheet('loc')}>
              <IIco name="pin" size={16} /> {loc.name}
            </button>
            <div className={pill} style={pillBg}>
              <IIco name="p-fajr" size={16} /> {PN.sunrise}: {hm(info.t.sunrise, loc.tz)}
              <span className="opacity-40">|</span>
              <IIco name="p-maghrib" size={16} /> সূর্যাস্ত: {hm(info.t.maghrib, loc.tz)}
            </div>
          </div>
        </div>
      </section>

      <section className="relative -mt-8 bg-white rounded-t-3xl shadow-xl overflow-hidden">
        {L.map(w => {
          const cur = st.mode === 'in' && st.cur.key === w.key
          const started = now >= w.start
          const passed = now >= w.end
          const ok = done.includes(w.key)
          return (
            <div key={w.key}
              className="flex items-center gap-3 px-4 py-3.5 border-b last:border-b-0 border-gray-100"
              style={cur ? { background: accent + '18' } : undefined}>
              <span style={{ color: cur ? accent : '#64748b' }}>
                <IIco name={'p-' + w.key} size={28} tint={cur ? 0.35 : 0.16} />
              </span>
              <span className="flex-1 font-semibold">{PN[w.key]}</span>
              {cur && (
                <span className="w-2.5 h-2.5 rounded-full"
                  style={{ background: '#22c55e', animation: 'isl-pulse 1.6s infinite' }} />
              )}
              {!cur && passed && !ok && (
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#f59e0b' }} />
              )}
              <span className="text-sm tabular-nums text-gray-600">
                {hm(w.start, loc.tz)} - {hm(w.end, loc.tz)}
              </span>
              <button disabled={!started} onClick={() => tick(w.key)} aria-label="done"
                className="w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 disabled:opacity-40"
                style={ok ? { background: accent, borderColor: accent, color: '#fff' } : { borderColor: '#cbd5e1' }}>
                {ok && <IIco name="check" size={15} stroke={3} />}
              </button>
            </div>
          )
        })}

        <div className="grid grid-cols-2 border-t border-gray-100">
          <button className="py-3.5 flex items-center justify-center gap-2 font-semibold"
            onClick={() => setSheet('alarm')}>
            <IIco name="alarm" size={20} /> অ্যালার্ম
            {alarmOn && <span className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} />}
          </button>
          <button className="py-3.5 flex items-center justify-center gap-2 font-semibold border-l border-gray-100"
            onClick={() => setSheet('cal')}>
            <IIco name="calendar" size={20} /> ক্যালেন্ডার
          </button>
        </div>
      </section>

      <div className="px-4 mt-4 space-y-4">
        <div className="flex gap-4 text-[11px] text-gray-500 justify-center">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#22c55e' }} /> চলছে
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#f59e0b' }} /> আদায় টিক দেওয়া নেই
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <p className="font-bold">টপ ফিচার</p>
          <div className="grid grid-cols-4 gap-y-4 gap-x-2">
            {GRID.map(([k, label, icon, soon]) => (
              <button key={k} onClick={() => setView(k)} className="flex flex-col items-center gap-1.5">
                <span className="relative">
                  {k === 'tracker' ? (
                    <Ring pct={done.length / 5} accent={accent} />
                  ) : (
                    <span className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ background: accent + '1f', color: accent }}>
                      <IIco name={icon} size={30} />
                    </span>
                  )}
                  {soon && (
                    <span className="absolute -top-1 -right-2 rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                      style={{ background: '#fef3c7', color: '#92400e' }}>
                      শীঘ্রই
                    </span>
                  )}
                </span>
                <span className="text-xs font-semibold">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-gray-400 text-center pb-2">
          সময়গুলো গাণিতিক হিসাবে। স্থানীয় মসজিদের সূচির সাথে ফারাক থাকলে অ্যালার্ম বাটনের "সময় মিলান" ব্যবহার করুন।
        </p>
      </div>

      {sheet === 'alarm' && (
        <Sheet title="অ্যালার্ম ও সময়" onClose={() => setSheet('')}>
          <AlarmPanel supabase={supabase} settings={settings} isAdmin={isAdmin} onChange={bump} />
        </Sheet>
      )}
      {sheet === 'cal' && (
        <Sheet title="নামাজের ক্যালেন্ডার" wide onClose={() => setSheet('')}>
          <CalendarBody loc={loc} />
        </Sheet>
      )}
      {sheet === 'loc' && (
        <Sheet title="স্থান বাছুন" onClose={() => setSheet('')}>
          <LocBody loc={loc}
            onPick={(l: Loc) => { setLoc(l); bump(); setSheet('') }} />
        </Sheet>
      )}
    </div>
  )
}
