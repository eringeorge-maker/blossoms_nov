import { Link, useLocation } from 'react-router-dom'
import { BookMarked, Home, Phone, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth/authStore'
import { NotificationBell } from './NotificationBell'

export const STUDENT_TABS = [
  { label: 'My page', href: '/app', icon: Home },
  { label: 'My events', href: '/app/my-events', icon: BookMarked },
  { label: 'Profile', href: '/app/profile', icon: User },
]

export function isStudentTabActive(href: string, pathname: string) {
  return href === '/app' ? pathname === '/app' : pathname.startsWith(href)
}

/** Extra row of tabs under the site header, shown only while a student is signed in. */
export function StudentTabs() {
  const { student } = useAuth()
  const { pathname } = useLocation()
  if (!student) return null

  return (
    <>
      <div className="w-full bg-[#FFF8E8] border-b-2 border-[#0f0f0f]">
        <div className="mx-auto max-w-[1240px] px-3 sm:px-6 flex items-center gap-2 h-12">
          <nav aria-label="Student" className="flex-1 min-w-0 overflow-x-auto">
            <ul className="flex items-center gap-1.5 w-max">
              {STUDENT_TABS.map(({ label, href, icon: Icon }) => {
                const active = isStudentTabActive(href, pathname)
                return (
                  <li key={href}>
                    <Link
                      to={href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'h-8 px-3 rounded-full border-2 text-[13px] font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors',
                        active
                          ? 'bg-[#FFD43B] border-[#0f0f0f] text-[#151515]'
                          : 'border-transparent text-[#151515]/70 hover:text-[#151515] hover:border-[#0f0f0f]/30'
                      )}
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" />
                      {label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
          <span className="hidden sm:inline text-xs font-bold tabular-nums text-[#151515]/60">{student.registerNumber}</span>
          <NotificationBell />
        </div>
      </div>
      {!student.profileComplete && pathname !== '/app/profile' && (
        <div className="w-full bg-blossoms-yellow border-b-2 border-ink">
          <div className="mx-auto max-w-[1240px] px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 text-sm font-semibold text-ink">
            <span className="inline-flex items-center gap-2">
              <Phone className="w-4 h-4" aria-hidden="true" /> Add your phone number to finish your profile. You need it to register for
              events.
            </span>
            <Link to={`/app/profile?next=${encodeURIComponent(pathname)}`} className="underline font-bold">
              Complete profile →
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
