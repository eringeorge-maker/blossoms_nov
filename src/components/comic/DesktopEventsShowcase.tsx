import { useState, useCallback } from 'react'
import { PublicHeader } from '@/components/layout/PublicHeader'

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

interface DesktopEventsShowcaseProps {
  onSelectCategory?: (category: string) => void
  hideHeader?: boolean
}

export default function DesktopEventsShowcase({ onSelectCategory, hideHeader = false }: DesktopEventsShowcaseProps) {
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
      {/* ── Single Unified Common Navigation Bar ───────────────────── */}
      {!hideHeader && <PublicHeader />}

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
