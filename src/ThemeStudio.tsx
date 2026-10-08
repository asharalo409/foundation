import { useEffect, useState } from 'react'
import { BGS, FONTS, PALETTES, loadFont } from './theme'

const SAMPLE = 'মানবতার পাশে দাঁড়ানোই আমাদের অঙ্গীকার'

export default function ThemeStudio({ ui, setUi, eff, isAdmin, supabase, onClose, onSaved, color }: any) {
  const [msg, setMsg] = useState('')

  useEffect(() => { Object.keys(FONTS).forEach(loadFont) }, [])

  const set = (k: string, v: string) => setUi({ ...ui, [k]: v })

  async function saveDefault() {
    const { error } = await supabase.from('settings').update({
      ui_bg: eff.bg, ui_font: eff.font, ui_palette: eff.palette, ui_glass: eff.glass,
    }).eq('id', 1)
    if (error) { setMsg('ব্যর্থ: ' + error.message); return }
    setMsg('✅ সবার জন্য ডিফল্ট হিসেবে সেভ হয়েছে')
    onSaved?.()
  }

  const on = (b: boolean): any =>
    b ? { borderColor: color, boxShadow: `0 0 0 2px ${color}` } : undefined

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center" onClick={onClose}>
      <div className="bg-white w-full max-w-md mx-auto rounded-t-2xl sm:rounded-2xl p-4 space-y-4 max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">🎨 থিম ও ব্যাকগ্রাউন্ড</h3>
          <button className="text-xl" onClick={onClose}>✕</button>
        </div>
        <p className="text-xs text-gray-500">
          ট্যাপ করলেই সাথে সাথে বদলায়। আপনার পছন্দ শুধু এই ফোনে মনে থাকে।
        </p>

        <div className="space-y-2">
          <p className="font-bold text-sm">ব্যাকগ্রাউন্ড</p>
          <div className="grid grid-cols-2 gap-2">
            {BGS.map(([k, icon, name, desc]) => (
              <button key={k} onClick={() => set('bg', k)}
                className="border rounded-xl p-2.5 text-left space-y-0.5" style={on(eff.bg === k)}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{icon}</span>
                  <b className="text-sm">{name}</b>
                </div>
                <p className="text-[10px] text-gray-500 leading-snug">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-bold text-sm">ফন্ট</p>
          <div className="space-y-2">
            {Object.entries(FONTS).map(([k, f]) => (
              <button key={k} onClick={() => set('font', k)}
                className="w-full border rounded-xl p-3 text-left" style={on(eff.font === k)}>
                <p className="text-[11px] text-gray-500">{f.label}</p>
                <p className="text-lg leading-snug" style={{ fontFamily: `${f.head}, sans-serif`, fontWeight: 700 }}>
                  {SAMPLE}
                </p>
                <p className="text-sm text-gray-600" style={{ fontFamily: `${f.body}, sans-serif` }}>
                  প্রতিটি দান ও খরচের হিসাব আমরা সবার সামনে রাখি।
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-bold text-sm">রঙ</p>
          <div className="flex flex-wrap gap-3">
            {Object.entries(PALETTES).map(([k, p]) => {
              const c = p.main || '#087a43'
              return (
                <button key={k} onClick={() => set('palette', k)} className="flex flex-col items-center gap-1">
                  <span className="w-10 h-10 rounded-full border-2 border-white"
                    style={{ background: c, boxShadow: eff.palette === k ? `0 0 0 3px ${c}` : '0 0 0 1px #cbd5e1' }} />
                  <span className="text-[10px]">{p.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-bold text-sm">কার্ডের ধরন</p>
          <div className="flex gap-2">
            {[['flat', '▭ সাধারণ'], ['glass', '🪟 কাচ (স্বচ্ছ)']].map(([k, l]) => (
              <button key={k} onClick={() => set('glass', k)}
                className="flex-1 border rounded-xl py-2.5 text-sm font-semibold" style={on(eff.glass === k)}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button className="flex-1 border rounded-lg py-2 text-sm" onClick={() => setUi({})}>
            ↺ সাইটের ডিফল্টে ফিরুন
          </button>
          <button className="flex-1 text-white font-semibold rounded-lg py-2 text-sm"
            style={{ background: color }} onClick={onClose}>
            হয়েছে
          </button>
        </div>

        {isAdmin && (
          <div className="border-t pt-3 space-y-2">
            <p className="text-xs text-gray-500">
              অ্যাডমিন: এখনকার বাছাই (ব্যাকগ্রাউন্ড, ফন্ট, রঙ, কার্ড) যাদের নিজের কিছু বাছা নেই তাদের সবার জন্য ডিফল্ট হবে।
            </p>
            <button className="w-full bg-amber-500 text-white font-semibold rounded-lg py-2.5" onClick={saveDefault}>
              💾 সবার জন্য ডিফল্ট করুন
            </button>
            {msg && <p className="text-xs text-center">{msg}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
