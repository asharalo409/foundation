import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './celebrate'
import './index.css'
import App from './App'
import Extras from './Offline'
import MediaHost from './Media'
import { startTranslator } from './translate'
import { applyCachedBranding } from './branding'
import { initAlarms } from './alarm'

applyCachedBranding()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Extras />
    <MediaHost />
  </StrictMode>
)

startTranslator()
initAlarms()

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {})
  })
}
