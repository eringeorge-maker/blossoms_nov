import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Home, Compass, CalendarDays, BookMarked, User, LogOut, Menu, X } from 'lucide-react'
import { cn, isRouteActive } from '@/lib/utils'
import { getActiveStudent, logoutStudent, type StudentProfile } from '@/lib/auth/authStore'
import { FloatingPillNavigation, type NavItem } from '@/components/navigation/FloatingPillNavigation'

const STUDENT_NAV_LINKS: NavItem[] = [
  { label: 'Portal Home', href: '/app' },
  { label: 'Register',    href: '/app/events' },
  { label: 'My Entries',  href: '/app/my-events' },
  { label: 'My Schedule', href: '/app/schedule' },
  { label: 'Student Bio', href: '/app/profile' },
]

const MOBILE_STUDENT_TABS = [
  { label: 'Home',     href: '/app',            icon: Home },
  { label: 'Register', href: '/app/events',     icon: Compass },
  { label: 'Entries',  href: '/app/my-events',  icon: BookMarked },
  { label: 'Schedule', href: '/app/schedule',   icon: CalendarDays },
  { label: 'Bio',      href: '/app/profile',    icon: User },
]

/**
 * Shell for authenticated student portal.
 * On desktop viewports, the navigation bar is always placed at the top,
 * identical in style to the public site navbar with the MacBook dock magnification effect.
 */
export function StudentShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const [student, setStudent] = useState<StudentProfile | null>(getActiveStudent())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    function syncAuth() {
      const active = getActiveStudent()
      setStudent(active)
      if (!active) {
        navigate('/login?role=student', { replace: true })
      }
    }
    syncAuth()
    window.addEventListener('blossoms-auth-changed', syncAuth)
    return () => window.removeEventListener('blossoms-auth-changed', syncAuth)
  }, [navigate])

  function handleLogout() {
    logoutStudent()
    navigate('/login?role=student', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8E8]">
      {/* ── Top Header Navigation (Always at Top in Desktop Viewport) ── */}
      <header
        className="sticky top-0 z-50 w-full px-4 sm:px-6 md:px-8 py-2.5 flex items-center justify-between select-none bg-[#F7F3E9] border-b border-black/5"
        style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif" }}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#FFD400] focus:text-[#111111] focus:rounded-lg focus:font-semibold"
        >
          Skip to main content
        </a>

        {/* ── Left Section: Student Portal Brand ───────────────────────── */}
        <div className="flex items-center shrink-0">
          <Link
            to="/app"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFD400] border border-black/20 text-xs font-bold text-[#111111] uppercase tracking-wider shadow-xs hover:bg-[#fed61a] transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-[#F04438] animate-pulse" />
            <span>Student Portal</span>
          </Link>
        </div>

        {/* ── Center Section: Floating Pill Navigation with MacBook Magnification ── */}
        <div className="hidden lg:flex items-center justify-center flex-1 mx-4 overflow-visible py-1">
          <FloatingPillNavigation
            items={STUDENT_NAV_LINKS}
            backgroundColor="#E8E8ED"
            textColor="#000000"
            activeBackgroundColor="#1D1D1F"
            activeTextColor="#FFFFFF"
            padding={5}
            gap={3}
            linkPadding="7px 18px"
          />
        </div>

        {/* ── Right Section: Student Roll Number & Actions ─────────────── */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          {student && (
            <Link
              to="/app/profile"
              className="h-[40px] px-3.5 rounded-full bg-[#FFD400] hover:bg-[#fed61a] active:scale-95 text-[#111111] font-semibold text-[13.5px] flex items-center gap-2 transition-all shadow-xs cursor-pointer focus:outline-none"
              title="View student profile"
            >
              <User className="w-[16px] h-[16px] stroke-[2.4]" />
              <span>Roll #{student.rollNumber}</span>
            </Link>
          )}

          <button
            type="button"
            onClick={handleLogout}
            title="Log out"
            className="h-[40px] w-[40px] rounded-full bg-[#E8E8ED] hover:bg-red-50 hover:text-red-600 text-[#1D1D1F] flex items-center justify-center transition-colors cursor-pointer focus:outline-none"
            aria-label="Log out"
          >
            <LogOut className="w-[16px] h-[16px]" />
          </button>
        </div>

        {/* ── Mobile Controls (Hamburger & Quick Roll #) ───────────────── */}
        <div className="flex lg:hidden items-center gap-2">
          {student && (
            <div className="px-2.5 py-1 rounded-full bg-[#FFD400] text-[#111111] text-[11px] font-bold">
              #{student.rollNumber}
            </div>
          )}
          <button
            type="button"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-[#E8E8ED] text-[#1D1D1F] hover:bg-[#dededd] transition-colors focus:outline-none"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ── Mobile Drawer (When Opened on Small Screens) ─────────────── */}
      {mobileMenuOpen && (
        <div
          style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif" }}
          className="lg:hidden fixed inset-x-0 top-[56px] bottom-0 z-[100] bg-[#F7F3E9] border-t border-black/5 flex flex-col p-6 animate-fadeIn overflow-y-auto"
        >
          <nav aria-label="Mobile Student Navigation" className="flex flex-col gap-2">
            {STUDENT_NAV_LINKS.map((link) => {
              const active = isRouteActive(link.href, location.pathname)
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-5 py-3 rounded-full text-[16px] font-[500] transition-colors ${
                    active
                      ? 'bg-[#1D1D1F] text-white font-semibold'
                      : 'bg-[#E8E8ED] text-[#000000] hover:bg-[#dfdfdd]'
                  }`}
                >
                  <span>{link.label}</span>
                  <span className="text-sm opacity-60">→</span>
                </Link>
              )
            })}
          </nav>

          <div className="mt-6 pt-6 border-t border-black/10">
            <button
              type="button"
              onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
              className="w-full h-[44px] rounded-full bg-red-100 text-red-700 font-semibold flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Main Page Content ────────────────────────────────────────── */}
      <main id="main-content" className="flex-1 pb-20 lg:pb-8">
        <Outlet />
      </main>

      {/* ── Mobile-Only Bottom Navigation Bar (Hidden on Desktop) ─────── */}
      <nav
        aria-label="Mobile Student Bottom Navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t-[3px] border-ink shadow-[0_-4px_0_0_rgba(21,21,21,0.08)]"
      >
        <ul className="flex items-stretch justify-around max-w-[600px] mx-auto px-2">
          {MOBILE_STUDENT_TABS.map(({ label, href, icon: Icon }) => {
            const isActive = isRouteActive(href, location.pathname)
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

export default StudentShell
