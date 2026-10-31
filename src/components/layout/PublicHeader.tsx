import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Menu, X, User, LogOut, ShieldAlert } from 'lucide-react'
import { getActiveStudent, logoutStudent, isDeveloperAdmin, logoutDeveloperAdmin, type StudentProfile } from '@/lib/auth/authStore'

const NAV_LINKS = [
  { label: 'Home',         href: '/' },
  { label: 'Events',       href: '/events' },
  { label: 'Schedule',     href: '/schedule' },
  { label: 'Results',      href: '/winners' },
  { label: 'Gallery',      href: '/gallery' },
  { label: 'Notice Board', href: '/announcements' },
  { label: 'About',        href: '/about' },
]

export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [student, setStudent] = useState<StudentProfile | null>(getActiveStudent())
  const [admin, setAdmin] = useState<boolean>(isDeveloperAdmin())
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    function syncAuth() {
      setStudent(getActiveStudent())
      setAdmin(isDeveloperAdmin())
    }
    syncAuth()
    window.addEventListener('blossoms-auth-changed', syncAuth)
    return () => window.removeEventListener('blossoms-auth-changed', syncAuth)
  }, [])

  function handleLogout() {
    logoutStudent()
    logoutDeveloperAdmin()
    setStudent(null)
    setAdmin(false)
  }

  function isLinkActive(href: string): boolean {
    if (href === '/') {
      return location.pathname === '/'
    }
    if (href === '/events') {
      return location.pathname.startsWith('/events')
    }
    if (href === '/winners') {
      return location.pathname.startsWith('/winners') || location.pathname.startsWith('/results')
    }
    if (href === '/announcements') {
      return location.pathname.startsWith('/announcements') || location.pathname.startsWith('/notice-board')
    }
    return location.pathname.startsWith(href)
  }

  return (
    <header
      className="sticky top-0 z-50 w-full h-[72px] md:h-[95px] bg-[#080808] px-4 sm:px-8 md:px-[6.1vw] lg:px-[100px] flex items-center justify-between select-none shadow-md transition-colors"
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
    >
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#FFD400] focus:text-[#111111] focus:rounded-lg focus:font-semibold">
        Skip to main content
      </a>

      {/* ── Left Section: Brand Identity ─────────────────────────────── */}
      <div className="flex items-center shrink-0">
        <Link to="/" className="flex items-center focus:outline-none" aria-label="Department of Commerce">
          <img
            src="/assets/doc_logo.png"
            alt="Department of Commerce"
            className="w-[100px] h-[36px] md:w-[142px] md:h-[52px] object-contain"
            loading="eager"
          />
        </Link>

        <div
          className="w-[1px] h-[34px] md:h-[50px] bg-white/20 mx-[14px] md:mx-[24px]"
          role="separator"
          aria-orientation="vertical"
        />

        <Link to="/" className="flex items-center focus:outline-none" aria-label="Blossoms 2026 Home">
          <img
            src="/assets/blossoms_2026_logo.png"
            alt="Blossoms 2026"
            className="w-[96px] h-[42px] md:w-[136px] md:h-[60px] object-contain"
            loading="eager"
          />
        </Link>
      </div>

      {/* ── Center Section: Navigation Links (Desktop) ────────────────── */}
      <nav aria-label="Primary Navigation" className="hidden lg:flex items-center gap-[36px] xl:gap-[42px]">
        {NAV_LINKS.map((link) => {
          const active = isLinkActive(link.href)
          return (
            <Link
              key={link.label}
              to={link.href}
              className={`relative text-[16px] font-[500] tracking-normal transition-colors py-1 focus:outline-none ${
                active
                  ? 'text-[#FFD400]'
                  : 'text-[#F5F5F5] visited:text-[#F5F5F5] hover:text-white'
              }`}
            >
              {link.label}
              {active && (
                <span
                  className="absolute left-1/2 -translate-x-1/2 bottom-[-12px] w-[54px] h-[2px] bg-[#FFD400] rounded-full pointer-events-none"
                  aria-hidden="true"
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* ── Right Section: Login / Profile Actions ───────────────────── */}
      <div className="hidden lg:flex items-center shrink-0">
        {student ? (
          <div className="flex items-center gap-2.5">
            <Link
              to="/app"
              className="h-[48px] px-4 rounded-[12px] bg-[#FFD400] hover:bg-[#fed61a] active:scale-95 text-[#111111] font-semibold text-[15px] flex items-center gap-2 cursor-pointer transition-all duration-150 focus:outline-none"
            >
              <User className="w-[18px] h-[18px] stroke-[2.4]" />
              <span>Roll #{student.rollNumber}</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              title="Log out"
              className="h-[48px] w-[48px] rounded-[12px] bg-[#1a1a1a] hover:bg-[#262626] text-[#F5F5F5] hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer focus:outline-none"
              aria-label="Log out"
            >
              <LogOut className="w-[18px] h-[18px]" />
            </button>
          </div>
        ) : admin ? (
          <div className="flex items-center gap-2.5">
            <Link
              to="/admin"
              className="h-[48px] px-4 rounded-[12px] bg-[#FFD400] hover:bg-[#fed61a] active:scale-95 text-[#111111] font-semibold text-[15px] flex items-center gap-2 cursor-pointer transition-all duration-150 focus:outline-none"
            >
              <ShieldAlert className="w-[18px] h-[18px] stroke-[2.4]" />
              <span>Dev Console</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              title="Log out"
              className="h-[48px] w-[48px] rounded-[12px] bg-[#1a1a1a] hover:bg-[#262626] text-[#F5F5F5] hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer focus:outline-none"
              aria-label="Log out"
            >
              <LogOut className="w-[18px] h-[18px]" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-[120px] h-[48px] rounded-[12px] bg-[#FFD400] hover:bg-[#fed61a] active:scale-95 text-[#111111] font-semibold text-[16px] flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#FFD400] focus:ring-offset-2 focus:ring-offset-[#080808]"
            aria-label="User Login"
          >
            <span>Login</span>
            <User className="w-[18px] h-[18px] stroke-[2.4]" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* ── Mobile Hamburger Toggle ──────────────────────────────────── */}
      <div className="flex lg:hidden items-center gap-2">
        {!student && !admin && (
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="h-[38px] px-3 rounded-[10px] bg-[#FFD400] text-[#111111] font-semibold text-[13px] flex items-center gap-1.5 cursor-pointer"
          >
            <span>Login</span>
            <User className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          className="flex items-center justify-center w-10 h-10 rounded-[10px] bg-[#1a1a1a] text-[#F5F5F5] hover:text-[#FFD400] transition-colors focus:outline-none"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-drawer"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Mobile Navigation Drawer ─────────────────────────────────── */}
      {menuOpen && (
        <div
          id="mobile-nav-drawer"
          className="lg:hidden fixed inset-0 top-[72px] z-50 bg-[#080808]/98 border-t border-white/10 flex flex-col p-6 animate-fadeIn overflow-y-auto"
        >
          <nav aria-label="Mobile Navigation" className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => {
              const active = isLinkActive(link.href)
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-[18px] font-[500] transition-colors ${
                    active
                      ? 'bg-[#FFD400] text-[#111111] font-semibold'
                      : 'text-[#F5F5F5] hover:bg-white/5'
                  }`}
                >
                  <span>{link.label}</span>
                  <span className="text-sm opacity-60">→</span>
                </Link>
              )
            })}
          </nav>

          <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
            {student ? (
              <div className="space-y-2">
                <Link
                  to="/app"
                  onClick={() => setMenuOpen(false)}
                  className="w-full h-[48px] rounded-xl bg-[#FFD400] text-[#111111] font-semibold flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span>Student Portal (Roll #{student.rollNumber})</span>
                </Link>
                <button
                  type="button"
                  onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="w-full h-[42px] rounded-xl bg-white/10 text-white font-medium flex items-center justify-center gap-2 hover:bg-red-500/20 hover:text-red-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              </div>
            ) : admin ? (
              <div className="space-y-2">
                <Link
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="w-full h-[48px] rounded-xl bg-[#FFD400] text-[#111111] font-semibold flex items-center justify-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Developer Admin Console</span>
                </Link>
                <button
                  type="button"
                  onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="w-full h-[42px] rounded-xl bg-white/10 text-white font-medium flex items-center justify-center gap-2 hover:bg-red-500/20 hover:text-red-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => { navigate('/login'); setMenuOpen(false); }}
                className="w-full h-[48px] rounded-xl bg-[#FFD400] text-[#111111] font-semibold flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
export default PublicHeader
