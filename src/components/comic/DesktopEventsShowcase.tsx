import { Link, useNavigate } from 'react-router-dom'
import { useState, useCallback } from 'react'
import { User } from 'lucide-react'

interface PanelMeta {
  id: string
  name: string
  ariaLabel: string
  clipPath: string
}

const PANELS: PanelMeta[] = [
  {
    id: 'arts',
    name: 'Arts',
    ariaLabel: 'Fine Arts and Creative Competitions Panel',
    // Tall vertical panel on left: (0,0), (254,0), (362,704), (0,704)
    clipPath: 'polygon(0% 0%, 22.68% 0%, 32.32% 100%, 0% 100%)',
  },
  {
    id: 'literature',
    name: 'Literature',
    ariaLabel: 'Literary and Debating Competitions Panel',
    // Upper-middle panel: (270,0), (692,0), (678,360), (326,360)
    clipPath: 'polygon(24.11% 0%, 61.79% 0%, 60.54% 51.14%, 29.11% 51.14%)',
  },
  {
    id: 'stage',
    name: 'Stage',
    ariaLabel: 'Stage Music and Dance Competitions Panel',
    // Upper-right panel: (706,0), (1120,0), (1120,426), (692,360)
    clipPath: 'polygon(63.04% 0%, 100% 0%, 100% 60.51%, 61.79% 51.14%)',
  },
  {
    id: 'theatre',
    name: 'Theatre',
    ariaLabel: 'Theatrical Arts and Proscenium Competitions Panel',
    // Lower wide panel: (342,376), (1120,442), (1120,704), (378,704)
    clipPath: 'polygon(30.54% 53.41%, 100% 62.78%, 100% 100%, 33.75% 100%)',
  },
]

const NAV_LINKS = [
  { label: 'Home',         href: '/' },
  { label: 'Events',       href: '/events', isActive: true },
  { label: 'Schedule',     href: '/schedule' },
  { label: 'Results',      href: '/winners' },
  { label: 'Gallery',      href: '/gallery' },
  { label: 'Notice Board', href: '/announcements' },
  { label: 'About',        href: '/about' },
]

interface DesktopEventsShowcaseProps {
  onSelectCategory?: (category: string) => void
}

export default function DesktopEventsShowcase({ onSelectCategory }: DesktopEventsShowcaseProps) {
  const navigate = useNavigate()
  const [hoveredPanel, setHoveredPanel] = useState<string | null>(null)

  const handlePanelClick = useCallback((panelId: string) => {
    if (onSelectCategory) {
      onSelectCategory(panelId)
    }
  }, [onSelectCategory])

  return (
    <div
      className="min-h-screen w-full bg-[#F7F3E9] flex flex-col select-none overflow-x-hidden"
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
    >
      {/* ── Top Navigation Bar (Strict Specification) ──────────────── */}
      <header className="w-full h-[95px] bg-[#080808] px-[100px] flex items-center justify-between z-30 shrink-0">
        {/* Left Section — Brand Identity */}
        <div className="flex items-center shrink-0">
          <Link to="/" className="flex items-center focus:outline-none" aria-label="Department of Commerce">
            <img
              src="/assets/doc_logo.png"
              alt="Department of Commerce"
              className="w-[142px] h-[52px] object-contain"
              loading="eager"
            />
          </Link>

          <div
            className="w-[1px] h-[50px] bg-white/20 mx-[24px]"
            role="separator"
            aria-orientation="vertical"
          />

          <Link to="/" className="flex items-center focus:outline-none" aria-label="Blossoms 2026 Home">
            <img
              src="/assets/blossoms_2026_logo.png"
              alt="Blossoms 2026"
              className="w-[136px] h-[60px] object-contain"
              loading="eager"
            />
          </Link>
        </div>

        {/* Center Section — Navigation Links */}
        <nav aria-label="Primary Navigation" className="hidden lg:flex items-center gap-[42px]">
          {NAV_LINKS.map((link) => {
            const isEventsLink = link.isActive === true
            return (
              <Link
                key={link.label}
                to={link.href}
                className={`relative text-[16px] font-[500] tracking-normal transition-colors py-1 focus:outline-none ${
                  isEventsLink
                    ? 'text-[#FFD400]'
                    : 'text-[#F5F5F5] visited:text-[#F5F5F5] hover:text-white'
                }`}
              >
                {link.label}
                {isEventsLink && (
                  <span
                    className="absolute left-1/2 -translate-x-1/2 bottom-[-12px] w-[54px] h-[2px] bg-[#FFD400] rounded-full pointer-events-none"
                    aria-hidden="true"
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right Section — Login Button */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-[120px] h-[48px] rounded-[12px] bg-[#FFD400] hover:bg-[#fed61a] active:scale-95 text-[#111111] font-semibold text-[16px] flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#FFD400] focus:ring-offset-2 focus:ring-offset-[#080808]"
            aria-label="User Login"
          >
            <span>Login</span>
            <User className="w-[18px] h-[18px] stroke-[2.4]" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* ── Main Canvas (Centered 4-Panel Comic Composition: 1120 x 704) ─── */}
      <main className="flex-1 w-full flex flex-col items-center justify-center p-4">
        <div
          className="relative comic-layout-frame"
          style={{
            width: 'min(1120px, calc(100vw - 96px), calc((100vh - 170px) * (1120 / 704)))',
            aspectRatio: '1120 / 704',
            margin: 'auto',
          }}
        >
          {/* Base Background Comic Artwork Container */}
          <div className="w-full h-full relative select-none">
            {/* The 4 interactive panels with clipping & hover micro-interaction */}
            {PANELS.map((panel) => {
              const isHovered = hoveredPanel === panel.id
              return (
                <div
                  key={panel.id}
                  role="button"
                  tabIndex={0}
                  aria-label={panel.ariaLabel}
                  onClick={() => handlePanelClick(panel.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handlePanelClick(panel.id)
                    }
                  }}
                  onMouseEnter={() => setHoveredPanel(panel.id)}
                  onMouseLeave={() => setHoveredPanel(null)}
                  className="absolute inset-0 cursor-pointer overflow-hidden focus:outline-none transition-all duration-200 z-10"
                  style={{
                    clipPath: panel.clipPath,
                    WebkitClipPath: panel.clipPath,
                  }}
                >
                  <img
                    src="/assets/comic_composition_1120x704.png"
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                    className="w-full h-full object-cover transition-all duration-200 pointer-events-none will-change-transform"
                    style={{
                      transform: isHovered ? 'scale(1.018)' : 'scale(1)',
                      filter: isHovered ? 'contrast(1.05) brightness(1.03)' : 'none',
                    }}
                  />
                </div>
              )
            })}

            {/* Underlying full composition image to guarantee perfect anti-aliasing on gutter borders */}
            <img
              src="/assets/comic_composition_1120x704.png"
              alt="Blossoms 2026 Comic Showcase"
              draggable={false}
              className="w-full h-full object-cover pointer-events-none"
            />
          </div>
        </div>
      </main>
    </div>
  )
}
