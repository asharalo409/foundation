import { Component, StrictMode } from 'react'
import type { ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const rootEl = document.getElementById('root') as HTMLElement

const msgOf = (e: any) => String((e && (e.stack || e.message)) || e).slice(0, 1200)

async function resetApp() {
  try {
    const regs = await navigator.serviceWorker?.getRegistrations()
    if (regs) await Promise.all(regs.map(r => r.unregister()))
    const keys = await caches.keys()
    await Promise.all(keys.map(k => caches.delete(k)))
  } catch {}
  location.reload()
}

function Fail({ e }: { e: any }) {
  const btn = {
    padding: '10px 16px', borderRadius: 10, border: 0, fontWeight: 700, marginRight: 8, marginTop: 8,
    background: '#991b1b', color: '#fff',
  } as const
  return (
    <div style={{ padding: 20, minHeight: '100vh', background: '#fef2f2', color: '#7f1d1d', fontFamily: 'sans-serif' }}>
      <h2 style={{ margin: '0 0 8px' }}>অ্যাপ চালু হয়নি</h2>
      <p style={{ fontSize: 14 }}>নিচের লেখাটার স্ক্রিনশট পাঠান, এতে সমস্যা বের করা সহজ হয়।</p>
      <pre style={{
        whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 12, background: '#fff', color: '#111',
        padding: 12, borderRadius: 8,
      }}>
        {msgOf(e)}
      </pre>
      <button style={btn} onClick={() => location.reload()}>আবার চেষ্টা করুন</button>
      <button style={{ ...btn, background: '#475569' }} onClick={resetApp}>ক্যাশ মুছে নতুন করে লোড</button>
    </div>
  )
}

class Guard extends Component<{ children: ReactNode }, { err: any }> {
  state = { err: null as any }
  static getDerivedStateFromError(err: any) {
    return { err }
  }
  render() {
    return this.state.err ? <Fail e={this.state.err} /> : this.props.children
  }
}

const root = createRoot(rootEl)

async function boot() {
  try {
    await import('./celebrate')
    const [a, b, c, d, e, f] = await Promise.all([
      import('./App'),
      import('./Offline'),
      import('./Media'),
      import('./translate'),
      import('./branding'),
      import('./alarm'),
    ])
    const App = a.default
    const Extras = b.default
    const MediaHost = c.default

    e.applyCachedBranding()
    root.render(
      <StrictMode>
        <Guard>
          <App />
          <Extras />
          <MediaHost />
        </Guard>
      </StrictMode>
    )
    d.startTranslator()
    f.initAlarms()

    if ('serviceWorker' in navigator) {
      const reg = () => navigator.serviceWorker.register('./sw.js').catch(() => {})
      if (document.readyState === 'complete') reg()
      else window.addEventListener('load', reg)
    }
  } catch (err) {
    root.render(<Fail e={err} />)
  }
}

boot()
