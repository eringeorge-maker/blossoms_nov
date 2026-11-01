import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Menu, X, User, LogOut, ShieldAlert } from 'lucide-react'
import { FloatingPillNavigation, type NavItem } from '@/components/navigation/FloatingPillNavigation'
import { getActiveStudent, logoutStudent, isDeveloperAdmin, logoutDeveloperAdmin, type StudentProfile } from '@/lib/auth/authStore'

const NAV_LINKS: NavItem[] = [
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
    if (href === '/') return location.pathname === '/'
    if (href === '/events') return location.pathname.startsWith('/events')
    if (href === '/winners') return location.pathname.startsWith('/winners') || location.pathname.startsWith('/results')
    if (href === '/announcements') return location.pathname.startsWith('/announcements') || location.pathname.startsWith('/notice-board')
    return location.pathname.startsWith(href)
  }

  return (
    <header
      className="sticky top-0 z-50 w-full px-4 sm:px-6 md:px-10 py-3.5 flex items-center justify-between select-none bg-[#F7F3E9]/90 backdrop-blur-md border-b border-black/5 transition-all"
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif" }}
    >
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#FFD400] focus:text-[#111111] focus:rounded-lg focus:font-semibold">
        Skip to main content
      </a>

      {/* ── Left Section: Brand Identity ─────────────────────────────── */}
      <div className="flex items-center shrink-0">
        <div className="flex items-center bg-[#1D1D1F] px-3.5 py-1.5 rounded-full shadow-xs">
          <Link to="/" className="flex items-center focus:outline-none" aria-label="Department of Commerce">
            <img
              src="/assets/doc_logo.png"
              alt="Department of Commerce"
              className="w-[85px] h-[28px] md:w-[105px] md:h-[34px] object-contain"
              loading="eager"
            />
          </Link>

          <div
            className="w-[1px] h-[20px] md:h-[24px] bg-white/20 mx-2 md:mx-2.5"
            role="separator"
            aria-orientation="vertical"
          />

          <Link to="/" className="flex items-center focus:outline-none" aria-label="Blossoms 2026 Home">
            <img
              src="/assets/blossoms_2026_logo.png"
              alt="Blossoms 2026"
              className="w-[80px] h-[32px] md:w-[100px] md:h-[38px] object-contain"
              loading="eager"
            />
          </Link>
        </div>
      </div>

      {/* ── Center Section: Framer-Style Floating Pill Navigation ─────── */}
      <div className="hidden lg:flex items-center justify-center flex-1 mx-4">
        <FloatingPillNavigation
          items={NAV_LINKS}
          backgroundColor="#E8E8ED"
          textColor="#000000"
          activeBackgroundColor="#1D1D1F"
          activeTextColor="#FFFFFF"
          padding={6}
          gap={2}
          linkPadding="9px 20px"
        />
      </div>

      {/* ── Right Section: Login / Profile Actions ───────────────────── */}
      <div className="hidden lg:flex items-center shrink-0">
        {student ? (
          <div className="flex items-center gap-2">
            <Link
              to="/app"
              className="h-[44px] px-4 rounded-full bg-[#FFD400] hover:bg-[#fed61a] active:scale-95 text-[#111111] font-semibold text-[14px] flex items-center gap-2 cursor-pointer transition-all duration-150 focus:outline-none shadow-xs"
            >
              <User className="w-[17px] h-[17px] stroke-[2.4]" />
              <span>Roll #{student.rollNumber}</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              title="Log out"
              className="h-[44px] w-[44px] rounded-full bg-[#E8E8ED] hover:bg-[#d8d8dd] text-[#1D1D1F] flex items-center justify-center transition-colors cursor-pointer focus:outline-none"
              aria-label="Log out"
            >
              <LogOut className="w-[17px] h-[17px]" />
            </button>
          </div>
        ) : admin ? (
          <div className="flex items-center gap-2">
            <Link
              to="/admin"
              className="h-[44px] px-4 rounded-full bg-[#1D1D1F] hover:bg-black active:scale-95 text-white font-semibold text-[14px] flex items-center gap-2 cursor-pointer transition-all duration-150 focus:outline-none shadow-xs"
            >
              <ShieldAlert className="w-[17px] h-[17px] text-[#FFD400] stroke-[2.4]" />
              <span>Dev Console</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              title="Log out"
              className="h-[44px] w-[44px] rounded-full bg-[#E8E8ED] hover:bg-[#d8d8dd] text-[#1D1D1F] flex items-center justify-center transition-colors cursor-pointer focus:outline-none"
              aria-label="Log out"
            >
              <LogOut className="w-[17px] h-[17px]" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="h-[44px] px-5 rounded-full bg-[#FFD400] hover:bg-[#fed61a] active:scale-95 text-[#111111] font-semibold text-[15px] flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 focus:outline-none shadow-xs"
            aria-label="User Login"
          >
            <span>Login</span>
            <User className="w-[17px] h-[17px] stroke-[2.4]" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* ── Mobile View: Hamburger and Login ─────────────────────────── */}
      <div className="flex lg:hidden items-center gap-2">
        {!student && !admin && (
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="h-[36px] px-3 rounded-full bg-[#FFD400] text-[#111111] font-semibold text-[13px] flex items-center gap-1.5 cursor-pointer"
          >
            <span>Login</span>
            <User className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          className="flex items-center justify-center w-10 h-10 rounded-full bg-[#E8E8ED] text-[#1D1D1F] hover:bg-[#d8d8dd] transition-colors focus:outline-none"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-drawer"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Mobile Drawer Navigation ─────────────────────────────────── */}
      {menuOpen && (
        <div
          id="mobile-nav-drawer"
          className="lg:hidden fixed inset-0 top-[65px] z-50 bg-[#F7F3E9]/98 border-t border-black/5 flex flex-col p-6 animate-fadeIn overflow-y-auto"
        >
          <nav aria-label="Mobile Navigation" className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => {
              const active = isLinkActive(link.href)
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center justify-between px-5 py-3 rounded-full text-[17px] font-[500] transition-colors ${
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

          <div className="mt-8 pt-6 border-t border-black/10 space-y-3">
            {student ? (
              <div className="space-y-2">
                <Link
                  to="/app"
                  onClick={() => setMenuOpen(false)}
                  className="w-full h-[46px] rounded-full bg-[#FFD400] text-[#111111] font-semibold flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span>Student Portal (Roll #{student.rollNumber})</span>
                </Link>
                <button
                  type="button"
                  onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="w-full h-[42px] rounded-full bg-[#E8E8ED] text-[#1D1D1F] font-medium flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-600"
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
                  className="w-full h-[46px] rounded-full bg-[#1D1D1F] text-white font-semibold flex items-center justify-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4 text-[#FFD400]" />
                  <span>Developer Admin Console</span>
                </Link>
                <button
                  type="button"
                  onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="w-full h-[42px] rounded-full bg-[#E8E8ED] text-[#1D1D1F] font-medium flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => { navigate('/login'); setMenuOpen(false); }}
                className="w-full h-[46px] rounded-full bg-[#FFD400] text-[#111111] font-semibold flex items-center justify-center gap-2"
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
