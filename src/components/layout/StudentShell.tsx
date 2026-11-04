import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Home, Compass, CalendarDays, BookMarked, User, LogOut, Bell, X, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import blossomsLogoUrl from '@/assets/brand/blossoms-2026-27-lockup.webp'
import { signOut, useAuth } from '@/lib/auth/authStore'
import { getMyNotifications, markAllNotificationsRead, markNotification, type StudentNotification } from '@/lib/api/notifications'
import { formatDateTime } from '@/lib/eventDisplay'
import { Skeleton } from '@/components/ui/Skeleton'

const STUDENT_NAV = [
  { label: 'Home', href: '/app', icon: Home },
  { label: 'Register', href: '/app/events', icon: Compass },
  { label: 'My events', href: '/app/my-events', icon: BookMarked },
  { label: 'Schedule', href: '/app/schedule', icon: CalendarDays },
  { label: 'Profile', href: '/app/profile', icon: User },
]

export function StudentShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const auth = useAuth()

  if (!auth.ready) {
    return (
      <div className="min-h-screen bg-paper p-8 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }
  if (!auth.student) {
    return <Navigate to={`/login?role=student&redirect=${encodeURIComponent(location.pathname)}`} replace />
  }
  const student = auth.student

  async function handleLogout() {
    await signOut()
    navigate('/login?role=student', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <header className="sticky top-0 z-50 bg-primary border-b-[2.5px] border-ink">
        <div className="mx-auto max-w-[1240px] px-4 flex items-center justify-between h-14 gap-2">
          <Link to="/app" className="flex items-center gap-2 min-w-0">
            <img src={blossomsLogoUrl} alt="Blossoms 2026–27" className="w-[170px] sm:w-[200px] h-auto" />
            <span className="sr-only">Student portal</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex comic-caption-box text-[11px] py-1 px-3 bg-blossoms-yellow text-ink tabular-nums font-bold items-center gap-1.5 shadow-[2px_2px_0px_var(--color-ink)]">
              {student.registerNumber}
            </div>
            <NotificationBell />
            <button
              type="button"
              onClick={handleLogout}
              title="Sign out"
              aria-label="Sign out"
              className="flex items-center justify-center w-9 h-9 rounded-xl border-2 border-ink bg-white hover:bg-gutter text-ink shadow-[1.5px_1.5px_0px_var(--color-ink)] transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {!student.profileComplete && location.pathname !== '/app/profile' && (
        <div className="bg-blossoms-yellow border-b-2 border-ink">
          <div className="mx-auto max-w-[1240px] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-sm font-semibold text-ink">
            <span className="inline-flex items-center gap-2">
              <Phone className="w-4 h-4" aria-hidden="true" /> Add your phone number to finish your profile. You need it to
              register for events.
            </span>
            <Link to={`/app/profile?next=${encodeURIComponent(location.pathname)}`} className="underline font-bold">
              Complete profile →
            </Link>
          </div>
        </div>
      )}

      <main id="main-content" className="flex-1 pb-24">
        <Outlet />
      </main>

      <nav
        aria-label="Student navigation"
        className="fixed bottom-0 inset-x-0 z-50 bg-white border-t-[3px] border-ink shadow-[0_-4px_0_0_rgba(21,21,21,0.08)]"
      >
        <ul className="flex items-stretch justify-around max-w-[600px] mx-auto px-2">
          {STUDENT_NAV.map(({ label, href, icon: Icon }) => {
            const isActive = href === '/app' ? location.pathname === '/app' : location.pathname.startsWith(href)
            return (
              <li key={href} className="flex-1">
                <Link
                  to={href}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 py-2 px-1 min-h-[58px]',
                    'font-display text-xs tracking-wider uppercase transition-all',
                    isActive
                      ? 'text-primary font-bold border-t-4 border-primary -mt-[3px] bg-paper'
                      : 'text-ink/60 hover:text-ink'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
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

function NotificationBell() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: getMyNotifications,
    refetchInterval: 60_000,
  })
  const unread = items.filter((n) => !n.read_at).length

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['notifications'] })

  async function openItem(n: StudentNotification) {
    if (!n.read_at) await markNotification(n.id, 'read').catch(() => undefined)
    refresh()
    setOpen(false)
    if (n.link) navigate(n.link)
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-expanded={open}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl border-2 border-ink bg-white hover:bg-gutter text-ink shadow-[1.5px_1.5px_0px_var(--color-ink)]"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-comic-red-deep text-white text-[10px] font-bold flex items-center justify-center border border-ink tabular-nums">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[min(92vw,360px)] max-h-[70vh] overflow-y-auto bg-white border-2 border-ink rounded-2xl shadow-[4px_4px_0px_var(--color-ink)] z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b-2 border-ink">
            <p className="font-display text-lg text-ink">Notifications</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={async () => {
                  await markAllNotificationsRead().catch(() => undefined)
                  refresh()
                }}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          {isLoading ? (
            <p className="px-4 py-6 text-sm text-ink/60">Loading…</p>
          ) : items.length === 0 ? (
            <p className="px-4 py-6 text-sm text-ink/60">Nothing new. Team invites, results and updates show up here.</p>
          ) : (
            <ul className="divide-y divide-ink/10">
              {items.map((n) => (
                <li key={n.id} className={cn('flex gap-2 px-4 py-3', !n.read_at && 'bg-paper')}>
                  <button type="button" onClick={() => openItem(n)} className="flex-1 text-left">
                    <p className={cn('text-sm text-ink', !n.read_at && 'font-bold')}>{n.title}</p>
                    <p className="text-xs text-ink/70 mt-0.5">{n.body}</p>
                    <p className="text-[11px] text-ink/40 mt-1">{formatDateTime(n.created_at)}</p>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await markNotification(n.id, 'dismiss').catch(() => undefined)
                      refresh()
                    }}
                    aria-label={`Dismiss ${n.title}`}
                    className="self-start p-1 rounded text-ink/40 hover:text-ink"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
