import { Link, Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, CalendarDays, List, Users, UserCog,
  Megaphone, Image, BarChart2, ScrollText, Menu, X, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ADMIN_NAV = [
  { label: 'Overview',        href: '/admin',                icon: LayoutDashboard },
  { label: 'Events',          href: '/admin/events',         icon: List },
  { label: 'Schedule',        href: '/admin/schedule',       icon: CalendarDays },
  { label: 'Registrations',   href: '/admin/registrations',  icon: Users },
  { label: 'Students',        href: '/admin/students',       icon: Users },
  { label: 'Coordinators',    href: '/admin/coordinators',   icon: UserCog },
  { label: 'Announcements',   href: '/admin/announcements',  icon: Megaphone },
  { label: 'Content',         href: '/admin/content',        icon: Image },
  { label: 'Reports',         href: '/admin/reports',        icon: BarChart2 },
  { label: 'Audit Log',       href: '/admin/audit',          icon: ScrollText },
]

export function AdminShell() {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex bg-gutter">
      {/* Sidebar — desktop */}
      <aside
        className={cn(
          'hidden md:flex flex-col w-64 bg-ink text-paper',
          'border-r-2 border-ink sticky top-0 h-screen overflow-y-auto',
        )}
      >
        <div className="p-5 border-b-2 border-paper/20">
          <Link to="/" className="font-display text-2xl text-blossoms-yellow uppercase">
            Blossoms
          </Link>
          <p className="text-xs text-paper/50 mt-0.5">Admin Portal</p>
        </div>
        <NavList location={location} />
      </aside>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <aside className="w-72 bg-ink text-paper flex flex-col overflow-y-auto">
            <div className="p-5 border-b-2 border-paper/20 flex items-center justify-between">
              <p className="font-display text-xl text-blossoms-yellow uppercase">Blossoms Admin</p>
              <button
                onClick={() => setSidebarOpen(false)}
                aria-label="Close menu"
                className="text-paper/70 hover:text-paper"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <NavList location={location} onNavigate={() => setSidebarOpen(false)} />
          </aside>
          <button
            className="flex-1 bg-ink/40"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-paper border-b-2 border-ink px-4 h-14 flex items-center gap-3">
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center border-2 border-ink rounded-xl"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open admin menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-ink">Admin</span>
        </header>
        <main id="main-content" className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function NavList({
  location,
  onNavigate,
}: {
  location: ReturnType<typeof useLocation>
  onNavigate?: () => void
}) {
  return (
    <nav aria-label="Admin navigation" className="flex-1 px-3 py-4">
      <ul className="flex flex-col gap-1">
        {ADMIN_NAV.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === '/admin'
              ? location.pathname === '/admin'
              : location.pathname.startsWith(href)
          return (
            <li key={href}>
              <Link
                to={href}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                  isActive
                    ? 'bg-blossoms-red text-white'
                    : 'text-paper/70 hover:bg-paper/10 hover:text-paper'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span>{label}</span>
                {isActive && <ChevronRight className="w-3 h-3 ml-auto" aria-hidden="true" />}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
