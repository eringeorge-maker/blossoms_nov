import { Outlet, useLocation } from 'react-router-dom'
import { PublicHeader } from './PublicHeader'
import { Footer } from './Footer'
import { MobileBottomNav } from './MobileBottomNav'

/** Shell for public-facing pages with unified sleek black navbar and mobile bottom nav */
export function PublicShell() {
  const location = useLocation()
  const isEvents = location.pathname.startsWith('/events')

  return (
    <div className={`min-h-screen flex flex-col ${isEvents ? 'bg-[#000000]' : 'bg-[#FFF8E8]'}`}>
      <PublicHeader />
      <main id="main-content" className={`flex-1 ${isEvents ? '' : 'pb-20 md:pb-0'}`}>
        <Outlet />
      </main>
      {!isEvents && (
        <div className="hidden md:block">
          <Footer />
        </div>
      )}
      <MobileBottomNav />
    </div>
  )
}
