import { Link, useLocation } from 'react-router-dom'
import { Home, Calendar, Clock, Megaphone, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

const MOBILE_TABS = [
  { label: 'Home',     href: '/',              icon: Home },
  { label: 'Events',   href: '/events',        icon: Calendar },
  { label: 'Schedule', href: '/schedule',      icon: Clock },
  { label: 'Alerts',   href: '/announcements', icon: Megaphone },
  { label: 'Winners',  href: '/winners',       icon: Trophy },
]

export function MobileBottomNav() {
  const location = useLocation()

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#121212] border-t-[3px] border-black shadow-[0_-4px_12px_rgba(0,0,0,0.35)]"
    >
      <ul className="flex items-center justify-around max-w-lg mx-auto px-1 py-1">
        {MOBILE_TABS.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(href)

          return (
            <li key={href} className="flex-1">
              <Link
                to={href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 py-1.5 px-1 min-h-[56px] transition-all relative',
                  isActive
                    ? 'text-[#FFD43B] font-bold'
                    : 'text-white/60 hover:text-white'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="relative">
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-transform',
                      isActive ? 'text-[#FFD43B] scale-110' : 'text-white/60'
                    )}
                    aria-hidden="true"
                  />
                  {isActive && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#793f98] animate-pulse" />
                  )}
                </div>

                <span className="font-display text-[10px] tracking-wider uppercase leading-none">
                  {label}
                </span>

                {/* Golden Active Underline Indicator */}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0.5 w-6 h-[3px] bg-[#FFD43B] rounded-full shadow-[0_0_8px_#FFD43B]"
                  />
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
