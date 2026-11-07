import { Outlet, useLocation } from 'react-router-dom'
import { PublicHeader } from './PublicHeader'
import { Footer } from './Footer'

/** Shell for public-facing pages with unified top navbar */
export function PublicShell() {
  const location = useLocation()
  const isEvents = location.pathname.startsWith('/events')
  const isStippled = /^\/(gallery|announcements|notice-board)/.test(location.pathname)

  return (
    <div className={`min-h-screen flex flex-col ${isEvents ? 'bg-[#0f0f0f]' : isStippled ? 'page-stipple' : 'bg-paper'}`}>
      <PublicHeader />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      {!isEvents && (
        <Footer />
      )}
    </div>
  )
}
