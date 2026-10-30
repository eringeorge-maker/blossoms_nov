import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Menu, X, Sparkles, LogOut, User, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { getActiveStudent, logoutStudent, isDeveloperAdmin, logoutDeveloperAdmin, type StudentProfile } from '@/lib/auth/authStore'

const NAV_LINKS = [
  { label: 'Events',         href: '/events' },
  { label: 'Schedule',       href: '/schedule' },
  { label: 'Announcements',  href: '/announcements' },
  { label: 'About',          href: '/about' },
  { label: 'Gallery',        href: '/gallery' },
  { label: 'Winners',        href: '/winners' },
]

export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [student, setStudent] = useState<StudentProfile | null>(getActiveStudent())
  const [admin, setAdmin] = useState<boolean>(isDeveloperAdmin())
  const location = useLocation()

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

  const isHome = location.pathname === '/'

  return (
    <header className={cn(
      "sticky top-0 z-50 transition-colors",
      isHome 
        ? "bg-[#F5B82E] md:bg-[#FFF8E8] md:border-b-[2.5px] md:border-ink md:shadow-[0_4px_0_0_rgba(21,21,21,0.06)]"
        : "bg-[#FFF8E8] border-b-[2.5px] border-ink shadow-[0_4px_0_0_rgba(21,21,21,0.06)]"
    )}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Top Comic Masthead Ticker (desktop always, mobile non-home only) */}
      <div className={cn(
        "bg-[#FFD43B] border-b-2 border-ink py-1 px-4 text-center overflow-hidden",
        isHome ? "hidden md:block" : "block"
      )}>
        <p className="font-display text-[11px] md:text-xs tracking-widest uppercase text-ink flex items-center justify-center gap-2">
          <span className="text-[#F04438]">★</span>
          <span>CHRIST (Deemed to be University) · Central Campus · Dept. of Cultures Presents</span>
          <span className="hidden sm:inline bg-[#F04438] text-white px-2 py-0.2 rounded-sm text-[10px] font-bold">
            BLOSSOMS '25
          </span>
          <span className="text-[#F04438]">★</span>
        </p>
      </div>

      <div className={cn(
        "mx-auto max-w-[1240px] px-3 sm:px-4 flex items-center justify-between",
        isHome ? "h-12 md:h-16" : "h-16"
      )}>
        {/* Comic Wordmark */}
        <Link
          to="/"
          className="group flex items-center gap-2 sm:gap-2.5 focus:outline-none"
          aria-label="Blossoms — go to homepage"
        >
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#DC2626] border-2 border-ink flex items-center justify-center text-white font-display text-xl md:text-2xl shadow-[2px_2px_0px_#151515] group-hover:rotate-6 transition-transform">
            B
          </div>
          <div className="flex flex-col">
            <span className="font-display text-2xl md:text-3xl text-[#151515] tracking-wide uppercase leading-none group-hover:text-[#DC2626] transition-colors">
              Blossoms
            </span>
            <span className="font-display text-[9px] md:text-[10px] tracking-widest text-[#DC2626] uppercase leading-tight font-black">
              The Campus Universe
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.href
            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'font-display text-lg tracking-wide uppercase transition-all relative py-1',
                  isActive
                    ? 'text-[#F04438] font-bold'
                    : 'text-ink hover:text-[#F04438]'
                )}
              >
                {link.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1 left-0 right-0 h-1 bg-[#F04438] rounded-full"
                  />
                )}
              </Link>
            )
          })}

          {/* Auth State Actions */}
          {student ? (
            <div className="flex items-center gap-2.5">
              <Link
                to="/app"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-ink bg-[#FFD43B] text-ink font-display text-sm tracking-wider uppercase font-bold shadow-[2px_2px_0px_#151515] hover:-translate-y-0.5 transition-transform"
              >
                <User className="w-4 h-4 text-[#F04438]" />
                <span>Roll #{student.rollNumber}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                title="Log out"
                className="p-2 rounded-xl border-2 border-ink bg-white text-ink hover:bg-red-50 hover:text-[#F04438] transition-colors shadow-[2px_2px_0px_#151515]"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : admin ? (
            <div className="flex items-center gap-2.5">
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-ink bg-[#151515] text-[#FFD43B] font-display text-sm tracking-wider uppercase font-bold shadow-[2px_2px_0px_#151515] hover:-translate-y-0.5 transition-transform"
              >
                <ShieldAlert className="w-4 h-4 text-[#FFD43B]" />
                <span>Dev Console</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                title="Log out"
                className="p-2 rounded-xl border-2 border-ink bg-white text-ink hover:bg-red-50 hover:text-[#F04438] transition-colors shadow-[2px_2px_0px_#151515]"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Button size="sm" variant="primary" asChild className="gap-1.5 shadow-[3px_3px_0px_#151515]">
              <Link to="/login">
                <Sparkles className="w-3.5 h-3.5 text-white" />
                Login
              </Link>
            </Button>
          )}
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden flex items-center justify-center w-11 h-11 rounded-xl border-2 border-ink bg-white shadow-[2px_2px_0px_#151515]"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X className="w-5 h-5 text-ink" /> : <Menu className="w-5 h-5 text-ink" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden fixed inset-0 top-[90px] z-40 bg-[#FFF8E8] border-t-2 border-ink overflow-y-auto"
        >
          <div className="p-4 bg-[#FFD43B] border-b-2 border-ink text-center">
            <span className="font-display text-xs uppercase tracking-wider text-ink font-bold">
              ★ Explore The Line-up &amp; Register Your Panel ★
            </span>
          </div>
          <nav aria-label="Mobile navigation" className="flex flex-col p-6 gap-2">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.href
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    'font-display text-2xl tracking-wide uppercase px-4 py-3 rounded-xl border-2 transition-all flex items-center justify-between',
                    isActive
                      ? 'bg-[#F04438] text-white border-ink shadow-[3px_3px_0px_#151515]'
                      : 'bg-white text-ink border-ink/30 hover:border-ink hover:bg-[#F5EBD4]'
                  )}
                >
                  <span>{link.label}</span>
                  <span className="text-sm opacity-60">→</span>
                </Link>
              )
            })}

            <div className="pt-4 border-t-2 border-ink mt-4">
              {student ? (
                <div className="space-y-2">
                  <Button size="lg" className="w-full bg-[#FFD43B] text-ink hover:bg-[#FFD43B]/90 border-2 border-ink" asChild>
                    <Link to="/app" onClick={() => setMenuOpen(false)}>
                      Open Registration Portal (Roll #{student.rollNumber})
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" className="w-full" onClick={() => { handleLogout(); setMenuOpen(false) }}>
                    Logout Roll #{student.rollNumber}
                  </Button>
                </div>
              ) : admin ? (
                <div className="space-y-2">
                  <Button size="lg" className="w-full bg-[#151515] text-white" asChild>
                    <Link to="/admin" onClick={() => setMenuOpen(false)}>
                      Developer Admin Console
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" className="w-full" onClick={() => { handleLogout(); setMenuOpen(false) }}>
                    Logout Admin
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button size="lg" variant="primary" asChild>
                    <Link to="/login?role=student" onClick={() => setMenuOpen(false)}>
                      Student Login
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="bg-[#151515] text-[#FFD43B]" asChild>
                    <Link to="/login?role=admin" onClick={() => setMenuOpen(false)}>
                      Admin Login
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
