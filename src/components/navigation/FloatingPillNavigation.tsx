import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

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
  backgroundColor = '#E8E8ED',
  textColor = '#000000',
  activeBackgroundColor = '#1D1D1F',
  activeTextColor = '#FFFFFF',
  padding = 6,
  gap = 2,
  linkPadding = '9px 20px',
  className = '',
}: FloatingPillNavigationProps) {
  const location = useLocation()

  function getActiveLabel(): string {
    const path = location.pathname
    if (path === '/') return 'Home'
    if (path.startsWith('/events')) return 'Events'
    if (path.startsWith('/schedule')) return 'Schedule'
    if (path.startsWith('/winners') || path.startsWith('/results')) return 'Results'
    if (path.startsWith('/gallery')) return 'Gallery'
    if (path.startsWith('/announcements') || path.startsWith('/notice-board')) return 'Notice Board'
    if (path.startsWith('/about')) return 'About'

    const matched = items.find((item) => item.href === path)
    return matched ? matched.label : items[0]?.label || 'Home'
  }

  const [activeItem, setActiveItem] = useState<string>(getActiveLabel())

  useEffect(() => {
    setActiveItem(getActiveLabel())
  }, [location.pathname])

  return (
    <nav
      aria-label="Floating Pill Navigation"
      className={`inline-flex items-center select-none shadow-xs ${className}`}
      style={{
        backgroundColor,
        borderRadius: 9999,
        padding: `${padding}px`,
        gap: `${gap}px`,
        position: 'relative',
        width: 'max-content',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {items.map((item) => {
        const isActive = item.label === activeItem
        return (
          <Link
            key={item.label}
            to={item.href}
            onClick={() => setActiveItem(item.label)}
            className="relative transition-colors duration-200 focus:outline-none"
            style={{
              padding: linkPadding,
              textDecoration: 'none',
              color: isActive ? activeTextColor : textColor,
              fontSize: '13.5px',
              fontWeight: isActive ? 600 : 500,
              letterSpacing: '-0.37px',
              lineHeight: '18px',
              cursor: 'pointer',
              zIndex: 1,
              borderRadius: 9999,
              whiteSpace: 'nowrap',
            }}
          >
            {isActive && (
              <motion.div
                layoutId="floatingPillActiveIndicator"
                className="absolute inset-0 shadow-sm"
                style={{
                  backgroundColor: activeBackgroundColor,
                  borderRadius: 9999,
                  zIndex: -1,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 650,
                  damping: 50,
                  mass: 0.8,
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
