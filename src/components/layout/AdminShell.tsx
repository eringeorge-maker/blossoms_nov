import { Link, Outlet, useLocation, Navigate, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, CalendarDays, List, Users, UserCog, Megaphone, ScrollText, Menu, X, ChevronRight, LogOut,
  ClipboardCheck, UserX, Download, Trophy, GraduationCap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/Skeleton'
import { ROLE_LABELS, signOut, useAuth } from '@/lib/auth/authStore'
import type { UserRole } from '@/types'

type NavItem = { label: string; href: string; icon: typeof List; roles?: UserRole[] }

const ADMIN_NAV: NavItem[] = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Events', href: '/admin/events', icon: List },
  { label: 'Attendance', href: '/admin/attendance', icon: ClipboardCheck },
  { label: 'Registrations', href: '/admin/registrations', icon: Users },
  { label: 'Defaulters', href: '/admin/defaulters', icon: UserX },
  { label: 'Exports', href: '/admin/exports', icon: Download },
  { label: 'Students & classes', href: '/admin/students', icon: GraduationCap },
  { label: 'Winners', href: '/admin/winners', icon: Trophy },
  { label: 'Announcements', href: '/admin/announcements', icon: Megaphone, roles: ['super_admin', 'content_editor'] },
  { label: 'Schedule', href: '/admin/schedule', icon: CalendarDays },
  { label: 'Admins & contacts', href: '/admin/coordinators', icon: UserCog, roles: ['super_admin'] },
  { label: 'Audit log', href: '/admin/audit', icon: ScrollText, roles: ['super_admin'] },
]

export function AdminShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const auth = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!auth.ready) {
    return (
      <div className="min-h-screen bg-gutter p-8 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }
  if (!auth.admin) {
    return <Navigate to={`/login?role=admin&redirect=${encodeURIComponent(location.pathname)}`} replace />
  }
  const admin = auth.admin
  const nav = ADMIN_NAV.filter((n) => !n.roles || n.roles.includes(admin.role))

  async function handleLogout() {
    await signOut()
    navigate('/login?role=admin', { replace: true })
  }

  const signOutButton = (
    <button
      onClick={handleLogout}
      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-display uppercase tracking-wider text-paper/80 hover:text-white hover:bg-paper/10 border border-paper/20 transition-colors"
    >
      <LogOut className="w-3.5 h-3.5" /> Sign out
    </button>
  )

  return (
    <div className="min-h-screen flex bg-gutter">
      <aside className="hidden md:flex flex-col w-64 bg-ink text-paper border-r-2 border-ink sticky top-0 h-screen overflow-y-auto">
        <div className="p-5 border-b-2 border-paper/20">
          <Link to="/" className="font-display text-2xl text-blossoms-yellow uppercase">Blossoms</Link>
          <p className="text-xs text-paper/50 mt-0.5">Admin console · 2026-27</p>
        </div>
        <NavList items={nav} location={location} />
        <div className="p-4 border-t border-paper/10 mt-auto space-y-3">
          <div className="text-xs">
            <p className="font-semibold text-paper truncate">{admin.fullName}</p>
            <p className="text-paper/50 truncate">{admin.email}</p>
          </div>
          {signOutButton}
        </div>
      </aside>

      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <aside className="w-72 bg-ink text-paper flex flex-col overflow-y-auto">
            <div className="p-5 border-b-2 border-paper/20 flex items-center justify-between">
              <p className="font-display text-xl text-blossoms-yellow uppercase">Blossoms admin</p>
              <button onClick={() => setSidebarOpen(false)} aria-label="Close menu" className="text-paper/70 hover:text-paper">
                <X className="w-5 h-5" />
              </button>
            </div>
            <NavList items={nav} location={location} onNavigate={() => setSidebarOpen(false)} />
            <div className="p-4 border-t border-paper/10 mt-auto">{signOutButton}</div>
          </aside>
          <button className="flex-1 bg-ink/40" onClick={() => setSidebarOpen(false)} aria-label="Close menu" />
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="sticky top-0 z-40 bg-paper border-b-2 border-ink px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="md:hidden w-10 h-10 flex items-center justify-center border-2 border-ink rounded-xl"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open admin menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-display text-xl text-ink uppercase tracking-wide truncate">Admin console</span>
            <span className="hidden sm:inline-block bg-ink text-blossoms-yellow text-[10px] font-bold px-2 py-0.5 rounded border border-ink uppercase">
              {ROLE_LABELS[admin.role]}
            </span>
          </div>
          <Link
            to="/"
            className="text-xs font-display uppercase tracking-wider text-ink/70 hover:text-ink font-bold px-3 py-1.5 rounded-lg border border-ink/30 hover:border-ink bg-white shrink-0"
          >
            Public site →
          </Link>
        </header>
        <main id="main-content" className="flex-1 p-4 md:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function NavList({ items, location, onNavigate }: { items: NavItem[]; location: ReturnType<typeof useLocation>; onNavigate?: () => void }) {
  return (
    <nav aria-label="Admin navigation" className="flex-1 px-3 py-4">
      <ul className="flex flex-col gap-1">
        {items.map(({ label, href, icon: Icon }) => {
          const isActive = href === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(href)
          return (
            <li key={href}>
              <Link
                to={href}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                  isActive ? 'bg-primary text-white' : 'text-paper/70 hover:bg-paper/10 hover:text-paper'
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
