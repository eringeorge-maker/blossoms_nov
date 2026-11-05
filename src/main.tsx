import '@/styles/globals.css'
import App from './app/App'
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'

const container = document.getElementById('root')
if (!container) throw new Error('Root element not found')

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
)

// Fade out the boot loader (index.html) once the app has painted, after a short minimum so it never flashes.
const loader = document.getElementById('boot-loader')
if (loader) {
  const shown = performance.now()
  const hide = () => {
    loader.classList.add('done')
    window.setTimeout(() => loader.remove(), 600)
  }
  const wait = Math.max(0, 900 - shown)
  window.addEventListener('load', () => window.setTimeout(hide, wait), { once: true })
  if (document.readyState === 'complete') window.setTimeout(hide, wait)
}
