import { Outlet, useLocation } from 'react-router-dom'
import { PublicHeader } from './PublicHeader'
import { Footer } from './Footer'

/** Shell for public-facing pages with unified top navbar */
export function PublicShell() {
  const location = useLocation()
  const isEvents = location.pathname.startsWith('/events')
  const isGallery = location.pathname.startsWith('/gallery')

  return (
    <div className={`min-h-screen flex flex-col ${isEvents ? 'bg-primary' : isGallery ? 'bg-[#0a0a0c]' : 'bg-paper'}`}>
      <PublicHeader />
      <main id="main-content" className="flex-1 flex flex-col">
        <Outlet />
      </main>
      {!isEvents && !isGallery && (
        <div className="hidden md:block">
          <Footer />
        </div>
      )}
    </div>
  )
}
