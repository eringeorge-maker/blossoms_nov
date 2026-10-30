import { Link, Outlet, useLocation } from 'react-router-dom'
import { Home, Compass, CalendarDays, BookMarked, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const STUDENT_NAV = [
  { label: 'Home',      href: '/app',            icon: Home },
  { label: 'Explore',   href: '/app/events',     icon: Compass },
  { label: 'My Events', href: '/app/my-events',  icon: BookMarked },
  { label: 'Schedule',  href: '/app/schedule',   icon: CalendarDays },
  { label: 'Profile',   href: '/app/profile',    icon: User },
]

/** Shell for authenticated student pages with authentic comic bottom nav */
export function StudentShell() {
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8E8]">
      {/* Compact comic student header */}
      <header className="sticky top-0 z-50 bg-[#FFF8E8] border-b-[2.5px] border-ink shadow-[0_2px_0_0_rgba(21,21,21,0.06)]">
        <div className="mx-auto max-w-[1240px] px-4 flex items-center justify-between h-14">
          <Link
            to="/app"
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#F04438] border-2 border-ink flex items-center justify-center text-white font-display text-lg shadow-[1.5px_1.5px_0px_#151515]">
              B
            </div>
            <span className="font-display text-2xl text-ink uppercase tracking-wide group-hover:text-[#F04438] transition-colors">
              Blossoms Student
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="comic-caption-box text-[10px] py-0 px-2 bg-[#FFD43B] hidden sm:inline-block">
              ROSTER VERIFIED ★
            </span>
            <Link
              to="/app/profile"
              className="flex items-center justify-center w-9 h-9 rounded-full border-2 border-ink bg-white shadow-[2px_2px_0px_#151515] hover:bg-[#FFD43B] transition-colors"
              aria-label="My profile"
            >
              <User className="w-4 h-4 text-ink" />
            </Link>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main id="main-content" className="flex-1 pb-24">
        <Outlet />
      </main>

      {/* Mobile comic bottom navigation */}
      <nav
        aria-label="Student navigation"
        className="fixed bottom-0 inset-x-0 z-50 bg-white border-t-[3px] border-ink shadow-[0_-4px_0_0_rgba(21,21,21,0.08)]"
      >
        <ul className="flex items-stretch justify-around max-w-[600px] mx-auto px-2">
          {STUDENT_NAV.map(({ label, href, icon: Icon }) => {
            const isActive =
              href === '/app'
                ? location.pathname === '/app'
                : location.pathname.startsWith(href)
            return (
              <li key={href} className="flex-1">
                <Link
                  to={href}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 py-2 px-1 min-h-[58px]',
                    'font-display text-xs tracking-wider uppercase transition-all',
                    isActive
                      ? 'text-[#F04438] font-bold border-t-4 border-[#F04438] -mt-[3px] bg-[#FFF8E8]'
                      : 'text-ink/60 hover:text-ink'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon
                    className={cn('w-5 h-5', isActive ? 'stroke-[#F04438]' : 'stroke-current')}
                    aria-hidden="true"
                  />
                  <span>{label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
