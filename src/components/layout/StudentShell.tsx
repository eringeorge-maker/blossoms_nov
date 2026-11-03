import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Home, Compass, CalendarDays, BookMarked, User, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import blossomsLogoUrl from '@/assets/brand/blossoms-2026-27-lockup.webp'
import { getActiveStudent, logoutStudent, type StudentProfile } from '@/lib/auth/authStore'

const STUDENT_NAV = [
  { label: 'Portal Home', href: '/app',            icon: Home },
  { label: 'Register',    href: '/app/events',     icon: Compass },
  { label: 'My Entries',  href: '/app/my-events',  icon: BookMarked },
  { label: 'My Schedule', href: '/app/schedule',   icon: CalendarDays },
  { label: 'Student Bio', href: '/app/profile',    icon: User },
]

/** Shell for student registration portal with authentic comic bottom nav */
export function StudentShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const [student, setStudent] = useState<StudentProfile | null>(getActiveStudent())

  useEffect(() => {
    function syncAuth() {
      const active = getActiveStudent()
      setStudent(active)
    }
    window.addEventListener('blossoms-auth-changed', syncAuth)
    return () => window.removeEventListener('blossoms-auth-changed', syncAuth)
  }, [])

  if (!student) {
    return <Navigate to="/login?role=student" replace />
  }

  function handleLogout() {
    logoutStudent()
    navigate('/login?role=student', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8E8]">
      {/* Compact comic student header */}
      <header className="sticky top-0 z-50 bg-primary border-b-[2.5px] border-ink">
        <div className="mx-auto max-w-[1240px] px-4 flex items-center justify-between h-14">
          <Link
            to="/app"
            className="flex items-center gap-2 group"
          >
            <img src={blossomsLogoUrl} alt="Blossoms 2026–27" className="w-[200px] h-auto" />
            <span className="sr-only">Registration Portal</span>
          </Link>

          <div className="flex items-center gap-2.5">
            {student && (
              <div className="hidden sm:flex comic-caption-box text-[11px] py-1 px-3 bg-[#FFD43B] text-ink tabular-nums font-bold flex items-center gap-1.5 shadow-[2px_2px_0px_#151515]">
                <span>ROLL #{student.rollNumber}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleLogout}
              title="Logout roll number"
              className="flex items-center justify-center w-8 h-8 rounded-xl border-2 border-ink bg-white hover:bg-red-50 text-ink hover:text-[#793f98] shadow-[1.5px_1.5px_0px_#151515] transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
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
                      ? 'text-[#793f98] font-bold border-t-4 border-[#793f98] -mt-[3px] bg-[#FFF8E8]'
                      : 'text-ink/60 hover:text-ink'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon
                    className={cn('w-5 h-5', isActive ? 'stroke-[#793f98]' : 'stroke-current')}
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
