import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { useRef, useMemo, useState } from 'react'
import { isRouteActive } from '@/lib/utils'

export interface NavItem {
  label: string
  href: string
}

export interface FloatingPillNavigationProps {
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

interface DockNavItemProps {
  item: NavItem
  isActive: boolean
  mouseX: MotionValue<number>
  activeBackgroundColor: string
  activeTextColor: string
  textColor: string
  linkPadding: string
}

/**
 * Individual Nav Item with interactive macOS Dock magnification effect.
 * Uses cursor proximity to scale the hovered item and its immediate neighbors in a smooth cosine wave.
 */
function DockNavItem({
  item,
  isActive,
  mouseX,
  activeBackgroundColor,
  activeTextColor,
  textColor,
  linkPadding,
}: DockNavItemProps) {
  const ref = useRef<HTMLAnchorElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  // Distance from mouse cursor X coordinate to the center of this item
  const distance = useTransform(mouseX, (val: number) => {
    if (!ref.current || val === Infinity) return Infinity
    const rect = ref.current.getBoundingClientRect()
    return val - (rect.left + rect.width / 2)
  })

  // MacBook Dock magnification physics:
  // Item directly beneath cursor scales up to ~1.28x.
  // Adjacent items within a 130px radius scale down in a smooth bell curve.
  const scaleSync = useTransform(distance, (d: number) => {
    if (d === Infinity) return 1
    const threshold = 130
    const absD = Math.abs(d)
    if (absD < threshold) {
      const progress = Math.cos((absD / threshold) * (Math.PI / 2))
      return 1 + 0.28 * Math.pow(progress, 1.3)
    }
    return 1
  })

  // Subtle upward lift mirroring the macOS Dock elevation
  const ySync = useTransform(distance, (d: number) => {
    if (d === Infinity) return 0
    const threshold = 130
    const absD = Math.abs(d)
    if (absD < threshold) {
      const progress = Math.cos((absD / threshold) * (Math.PI / 2))
      return -4 * progress
    }
    return 0
  })

  // Spring physics for buttery-smooth interpolation
  const scale = useSpring(scaleSync, {
    stiffness: 420,
    damping: 28,
    mass: 0.35,
  })

  const y = useSpring(ySync, {
    stiffness: 420,
    damping: 28,
    mass: 0.35,
  })

  return (
    <motion.div
      style={{
        scale,
        y,
        transformOrigin: 'bottom center',
        zIndex: isHovered ? 40 : isActive ? 20 : 10,
      }}
      className="relative flex items-center justify-center will-change-transform"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        ref={ref}
        to={item.href}
        className="relative block select-none transition-colors duration-150 focus:outline-none"
        style={{
          padding: linkPadding,
          textDecoration: 'none',
          color: isActive ? activeTextColor : textColor,
          fontSize: '13.5px',
          fontWeight: isActive ? 600 : 500,
          letterSpacing: '-0.3px',
          lineHeight: '18px',
          cursor: 'pointer',
          borderRadius: 9999,
          whiteSpace: 'nowrap',
          WebkitFontSmoothing: 'antialiased',
        }}
        aria-current={isActive ? 'page' : undefined}
      >
        {/* Active Pill Indicator (glides between items via shared layoutId) */}
        {isActive && (
          <motion.div
            layoutId="floatingPillActiveIndicator"
            className="absolute inset-0 shadow-xs"
            style={{
              backgroundColor: activeBackgroundColor,
              borderRadius: 9999,
              zIndex: -1,
            }}
            transition={{
              type: 'spring',
              stiffness: 550,
              damping: 38,
              mass: 0.5,
            }}
          />
        )}

        {/* Hover backdrop glow for non-active items */}
        {isHovered && !isActive && (
          <motion.div
            layoutId="dockHoverGlow"
            className="absolute inset-0 bg-black/5 rounded-full -z-10"
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}

        {/* Text Label */}
        <span className="relative z-10 inline-block transition-transform duration-100">
          {item.label}
        </span>
      </Link>
    </motion.div>
  )
}

export function FloatingPillNavigation({
  items,
  backgroundColor = '#E8E8ED',
  textColor = '#000000',
  activeBackgroundColor = '#1D1D1F',
  activeTextColor = '#FFFFFF',
  padding = 5,
  gap = 3,
  linkPadding = '8px 18px',
  className = '',
}: FloatingPillNavigationProps) {
  const location = useLocation()
  const mouseX = useMotionValue<number>(Infinity)

  // Direct derivation: active label is derived from the current URL path.
  // This guarantees the active pill can NEVER desynchronize or lag behind page changes.
  const activeLabel = useMemo(() => {
    const matched = items.find((item) => isRouteActive(item.href, location.pathname))
    return matched ? matched.label : null
  }, [items, location.pathname])

  return (
    <motion.nav
      aria-label="Festival Navigation"
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={`inline-flex items-center select-none shadow-xs transition-shadow duration-200 ${className}`}
      style={{
        backgroundColor,
        borderRadius: 9999,
        padding: `${padding}px`,
        gap: `${gap}px`,
        position: 'relative',
        width: 'max-content',
        overflow: 'visible',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {items.map((item) => (
        <DockNavItem
          key={item.label}
          item={item}
          isActive={item.label === activeLabel}
          mouseX={mouseX}
          activeBackgroundColor={activeBackgroundColor}
          activeTextColor={activeTextColor}
          textColor={textColor}
          linkPadding={linkPadding}
        />
      ))}
    </motion.nav>
  )
}

export default FloatingPillNavigation
