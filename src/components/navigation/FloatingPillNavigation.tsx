import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'

export interface NavItem {
  label: string
  href: string
}

interface FloatingPillNavigationProps {
  items: NavItem[]
  backgroundColor?: string
  textColor?: string
  activeBackgroundColor?: string
  activeTextColor?: string
  padding?: number
  gap?: number
  linkPadding?: string
  className?: string
}

export function FloatingPillNavigation({
  items,
  backgroundColor = '#F5EBD4',
  textColor = '#000000',
  activeBackgroundColor = '#151515',
  activeTextColor = '#FFFFFF',
  padding = 6,
  gap = 2,
  linkPadding = '9px 20px',
  className = '',
}: FloatingPillNavigationProps) {
  const location = useLocation()

  const [lastPathname, setLastPathname] = useState(location.pathname)
  const [optimisticItem, setOptimisticItem] = useState<string | null>(null)

  // Reset optimistic selection when location changes (React render-time adjustment)
  if (lastPathname !== location.pathname) {
    setLastPathname(location.pathname)
    setOptimisticItem(null)
  }

  function getActiveLabel(): string {
    const path = location.pathname
    if (path === '/') return 'Home'
    if (path.startsWith('/events')) return 'Events'
    if (path.startsWith('/schedule')) return 'Schedule'
    if (path.startsWith('/winners') || path.startsWith('/results')) return 'Results'
    if (path.startsWith('/gallery')) return 'Gallery'
    if (path.startsWith('/announcements') || path.startsWith('/notice-board')) return 'Notice Board'

    // Pages outside the menu (student portal, login, …) highlight nothing.
    const matched = items.find((item) => item.href !== '/' && path.startsWith(item.href))
    return matched?.label ?? ''
  }

  const realActive = getActiveLabel()
  const activeItem = optimisticItem ?? realActive

  return (
    <nav
      aria-label="Floating Pill Navigation"
      className={`inline-flex items-center select-none border-2 border-[#0f0f0f] shadow-comic-sm ${className}`}
      style={{
        backgroundColor,
        borderRadius: 9999,
        padding: `${padding}px`,
        gap: `${gap}px`,
        position: 'relative',
        width: 'max-content',
      }}
    >
      {items.map((item) => {
        const isActive = item.label === activeItem
        return (
          <Link
            key={item.label}
            to={item.href}
            onClick={() => setOptimisticItem(item.label)}
            className="relative transition-all duration-100 active:scale-95 touch-manipulation"
            style={{
              padding: linkPadding,
              textDecoration: 'none',
              color: isActive ? activeTextColor : textColor,
              fontSize: '13.5px',
              fontWeight: isActive ? 600 : 500,
              letterSpacing: '-0.37px',
              lineHeight: '18px',
              zIndex: 1,
              borderRadius: 9999,
              whiteSpace: 'nowrap',
            }}
          >
            {isActive && (
              <motion.div
                layoutId="floatingPillActiveIndicator"
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundColor: activeBackgroundColor,
                  borderRadius: 9999,
                  zIndex: -1,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 900,
                  damping: 45,
                  mass: 0.35,
                }}
              />
            )}
            <span className="relative z-10">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export default FloatingPillNavigation
