import { useEffect, useState } from 'react'

export default function Extras() {
  const [online, setOnline] = useState(navigator.onLine)
  const [evt, setEvt] = useState<any>(null)
  const [hide, setHide] = useState(() => {
    try { return localStorage.getItem('hideInstall') === '1' } catch { return false }
  })

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    const bip = (e: any) => { e.preventDefault(); setEvt(e) }
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    window.addEventListener('beforeinstallprompt', bip)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
      window.removeEventListener('beforeinstallprompt', bip)
    }
  }, [])

  const standalone =
    window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)

  function close() {
    setHide(true)
    try { localStorage.setItem('hideInstall', '1') } catch {}
  }
  async function install() {
    if (!evt) return
    evt.prompt()
    await evt.userChoice
    setEvt(null)
  }

  return (
    <>
      {!online && (
        <div className="fixed top-0 inset-x-0 z-50 bg-amber-500 text-white text-xs text-center py-1.5 px-3">
          📴 আপনি অফলাইনে আছেন। নতুন তথ্য ও আপলোডের জন্য ইন্টারনেট লাগবে।
        </div>
      )}

      {!standalone && !hide && evt && (
        <div className="fixed inset-x-3 bottom-20 z-40 bg-white border rounded-xl shadow-lg p-3 flex items-center gap-3">
          <p className="flex-1 text-sm font-semibold">📲 অ্যাপটি ফোনে ইনস্টল করুন</p>
          <button className="bg-green-700 text-white rounded-lg px-3 py-1.5 text-sm font-semibold" onClick={install}>
            ইনস্টল
          </button>
          <button className="text-gray-400 text-lg" onClick={close}>✕</button>
        </div>
      )}

      {!standalone && !hide && !evt && ios && (
        <div className="fixed inset-x-3 bottom-20 z-40 bg-white border rounded-xl shadow-lg p-3 flex items-start gap-3">
          <p className="flex-1 text-xs">
            📲 ইনস্টল করতে Safari-তে নিচের <b>শেয়ার</b> বাটন চেপে <b>"Add to Home Screen"</b> বাছুন।
          </p>
          <button className="text-gray-400 text-lg" onClick={close}>✕</button>
        </div>
      )}
    </>
  )
}
