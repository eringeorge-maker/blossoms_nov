import { Outlet } from 'react-router-dom'
import { PublicHeader } from './PublicHeader'
import { Footer } from './Footer'

/** Shell for public-facing pages (unauthenticated visitors) */
export function PublicShell() {
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <PublicHeader />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
