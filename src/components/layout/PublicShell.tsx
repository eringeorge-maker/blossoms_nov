import { Outlet } from 'react-router-dom'
import { PublicHeader } from './PublicHeader'
import { Footer } from './Footer'
import { MobileBottomNav } from './MobileBottomNav'

/** Shell for public-facing pages with mobile comic bottom nav */
export function PublicShell() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8E8]">
      <PublicHeader />
      <main id="main-content" className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
      <div className="hidden md:block">
        <Footer />
      </div>
      <MobileBottomNav />
    </div>
  )
}
