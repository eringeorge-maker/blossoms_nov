import { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowLeft, Calendar, MapPin, Users, X, ChevronRight } from 'lucide-react'
import { EVENTS, CATEGORIES } from '@/lib/data/eventsData'
import { QuickRegisterBox } from '@/components/events/QuickRegisterBox'
import { slotLabel, teamSizeLabel } from '@/lib/eventDisplay'
import { eventOrderIndex } from '@/lib/eventOrder'
import { cn } from '@/lib/utils'
import type { Event } from '@/types'

export type TransitionScene =
  | 'idle'
  | 'scene1_press'
  | 'scene2_expand'
  | 'scene3_reveal'
  | 'scene4_events'

export interface ComicFivePanelGridProps {
  initialCategory?: string | null
  onCategoryChange?: (category: string | null) => void
}

/** Predefined exact ordering matching user's reference screenshots */

const CATEGORY_THEMES: Record<
  string,
  {
    name: string
    color: string
    accentBg: string
    badge: string
    slogan: string
  }
> = {
  arts: {
    name: 'ARTS',
    color: '#E5004F',
    accentBg: 'from-[#E5004F]/20 via-[#111217] to-[#111217]',
    badge: 'TRINITY MERLIN A',
    slogan: 'PAINT · DESIGN · CREATE',
  },
  literature: {
    name: 'LITERATURE',
    color: '#009EE3',
    accentBg: 'from-[#009EE3]/20 via-[#111217] to-[#111217]',
    badge: 'TRINITY MERLIN A',
    slogan: 'READ · WRITE · SPEAK',
  },
  stage: {
    name: 'STAGE',
    color: '#E4007F',
    accentBg: 'from-[#E4007F]/20 via-[#111217] to-[#111217]',
    badge: 'TRINITY MERLIN A',
    slogan: 'PERFORM · SHINE',
  },
  theatre: {
    name: 'THEATRE',
    color: '#FFD100',
    accentBg: 'from-[#FFD100]/20 via-[#111217] to-[#111217]',
    badge: 'TRINITY MERLIN A',
    slogan: 'ACT · EMOTE · DRAMA',
  },
  'special-events': {
    name: 'SPECIAL EVENTS',
    color: '#7928CA',
    accentBg: 'from-[#7928CA]/20 via-[#111217] to-[#111217]',
    badge: 'TRINITY MERLIN A',
    slogan: 'CAMPUS HEADLINERS & CEREMONIES',
  },
}

export function ComicFivePanelGrid({
  initialCategory,
  onCategoryChange,
}: ComicFivePanelGridProps = {}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryParam = searchParams.get('category')

  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCategory || categoryParam || null
  )
  const [scene, setScene] = useState<TransitionScene>(
    initialCategory || categoryParam ? 'scene4_events' : 'idle'
  )
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  const timeoutsRef = useRef<number[]>([])

  // Clear all pending transition timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((t) => clearTimeout(t))
    }
  }, [])

  // Adjust state during render if target prop or URL query parameter changes
  const targetCategory = initialCategory || categoryParam
  const [prevTargetCategory, setPrevTargetCategory] = useState(targetCategory)

  if (targetCategory !== prevTargetCategory) {
    setPrevTargetCategory(targetCategory)
    if (targetCategory && targetCategory !== selectedCategory && scene === 'idle') {
      setSelectedCategory(targetCategory)
      setScene('scene4_events')
    }
  }

  // Choreographed 4-Scene Transition Trigger
  function triggerCategoryTransition(slug: string) {
    // Clear any active timeouts
    timeoutsRef.current.forEach((t) => clearTimeout(t))
    timeoutsRef.current = []

    setSelectedCategory(slug)
    setSelectedEventId(null)

    // Optional physical haptic feedback on mobile devices
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([25, 20, 35])
      } catch {
        // Ignored if haptic unsupported
      }
    }

    // SCENE 1 (~100ms): Physical inward press & sharp spring-back
    setScene('scene1_press')

    // SCENE 2 (~250-350ms): Panel expands to occupy screen; non-selected panels slide away
    const t2 = window.setTimeout(() => {
      setScene('scene2_expand')
    }, 110)

    // SCENE 3 (~150-200ms): Diagonal ink wipe + speed lines burst + offset-print chromatic shift
    const t3 = window.setTimeout(() => {
      setScene('scene3_reveal')
    }, 420)

    // SCENE 4 (~250-350ms): Event list enters panel-by-panel with sharp clipped reveal & tilt-settle
    const t4 = window.setTimeout(() => {
      setScene('scene4_events')
      // Update URL search param for deep linking
      searchParams.set('category', slug)
      setSearchParams(searchParams, { replace: true })
      if (onCategoryChange) onCategoryChange(slug)
    }, 600)

    timeoutsRef.current = [t2, t3, t4]
  }

  // Return smoothly back to the 5-panel comic spread
  function handleReturnToSpread() {
    timeoutsRef.current.forEach((t) => clearTimeout(t))
    timeoutsRef.current = []
    setSelectedCategory(null)
    setSelectedEventId(null)
    setScene('idle')
    searchParams.delete('category')
    setSearchParams(searchParams, { replace: true })
    if (onCategoryChange) onCategoryChange(null)
  }

  // Filter & sort events for active category
  const activeEvents: Event[] = useMemo(() => {
    if (!selectedCategory) return []
    const list: Event[] = EVENTS.filter(
      (ev: Event) => (ev.category?.slug || 'special-events') === selectedCategory
    )
    return list.sort((a: Event, b: Event) => {
      const orderA = eventOrderIndex(a)
      const orderB = eventOrderIndex(b)
      return orderA - orderB
    })
  }, [selectedCategory])

  // Selected event object for details drawer/modal
  const selectedEvent: Event | null = useMemo(() => {
    if (!selectedEventId) return null
    return activeEvents.find((e: Event) => e.id === selectedEventId) || null
  }, [selectedEventId, activeEvents])

  const currentTheme = selectedCategory
    ? CATEGORY_THEMES[selectedCategory] || CATEGORY_THEMES.arts
    : CATEGORY_THEMES.arts

  return (
    <div className="w-full max-w-[960px] mx-auto select-none transition-all">
      {/* ── Outer Comic Page Frame ─────────────────────────── */}
      <div className="relative bg-[#151515] p-2 sm:p-3 rounded-2xl border-[4px] border-[#151515] shadow-[6px_8px_0px_#151515] overflow-hidden">
        
        {/* ═════════════════════════════════════════════════════ */}
        {/* SCENE 3 OVERLAY: SPEED LINES BURST & DIAGONAL INK WIPE */}
        {/* ═════════════════════════════════════════════════════ */}
        {scene === 'scene3_reveal' && (
          <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
            {/* 1. Diagonal Ink Wipe Sweep */}
            <div className="absolute inset-0 bg-[#151515] animate-ink-wipe z-10" />

            {/* 2. Comic Speed Lines SVG Burst */}
            <svg
              className="absolute inset-0 w-full h-full animate-speed-lines z-20 pointer-events-none"
              viewBox="0 0 600 880"
              xmlns="http://www.w3.org/2000/svg"
            >
              {Array.from({ length: 48 }).map((_, i) => {
                const angle = (i * 360) / 48
                const rad = (angle * Math.PI) / 180
                const x1 = 300 + Math.cos(rad) * 110
                const y1 = 440 + Math.sin(rad) * 110
                const x2 = 300 + Math.cos(rad) * 650
                const y2 = 440 + Math.sin(rad) * 650
                const strokeWidth = i % 3 === 0 ? 4 : i % 2 === 0 ? 2.5 : 1.5
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#FFD43B"
                    strokeWidth={strokeWidth}
                    opacity="0.85"
                  />
                )
              })}
            </svg>

            {/* 3. Offset-Print Aberration Pop Title */}
            <div className="relative z-30 animate-offset-print text-center px-4">
              <span className="inline-block bg-[#FFD43B] text-[#151515] font-display text-4xl sm:text-6xl font-black px-6 py-3 rounded-2xl border-4 border-[#151515] shadow-[5px_5px_0px_#151515] uppercase tracking-wider -rotate-2">
                TURNING TO {currentTheme.name}!
              </span>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════ */}
        {/* SCENE 4: CATEGORY ARENA MATRIX (Revealed New Comic Page) */}
        {/* ═════════════════════════════════════════════════════ */}
        {scene === 'scene4_events' && selectedCategory ? (
          <div className="relative bg-[#111217] rounded-xl p-4 sm:p-6 text-white min-h-[580px] overflow-hidden">
            {/* Background Theme Radial Glow */}
            <div
              className="absolute top-0 right-0 w-96 h-96 rounded-full filter blur-3xl pointer-events-none opacity-20"
              style={{ backgroundColor: currentTheme.color }}
            />

            {/* Top Comic Navigation & Category Quick Tabs */}
            <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b border-white/10">
              <button
                onClick={handleReturnToSpread}
                className="inline-flex items-center gap-2 bg-[#FFD43B] hover:bg-[#FFE066] text-[#151515] font-display uppercase tracking-wider font-black px-3.5 py-1.5 rounded-xl border-2 border-[#151515] shadow-[2px_2px_0px_#151515] text-xs sm:text-sm active:translate-y-0.5 transition-all"
                title="Return to the 5-Panel Comic Page Spread"
              >
                <ArrowLeft className="w-4 h-4" />
                ← COMIC SPREAD
              </button>

              {/* Fast Category Switcher Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
                {CATEGORIES.map((cat) => {
                  const isActive = cat.slug === selectedCategory
                  return (
                    <button
                      key={cat.slug}
                      onClick={() => triggerCategoryTransition(cat.slug)}
                      className={cn(
                        'px-2.5 py-1 rounded-lg font-display text-[11px] sm:text-xs tracking-wider uppercase font-black transition-all border',
                        isActive
                          ? 'bg-[#F5B82E] text-[#151515] border-[#F5B82E] shadow-[0_0_10px_rgba(245,184,46,0.3)]'
                          : 'bg-[#1C1D24] text-white/70 border-white/10 hover:bg-[#252730] hover:text-white'
                      )}
                    >
                      {cat.name}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Category Title Header (Matches User's Arena Screenshots) */}
            <div className="relative z-10 mb-6 pb-2 border-b border-[#F5B82E]/40 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <h2 className="text-3xl sm:text-4xl font-display uppercase tracking-widest text-[#F5B82E] font-black drop-shadow-[0_2px_10px_rgba(245,184,46,0.25)]">
                  {currentTheme.name}
                </h2>
                <p className="text-white/60 text-xs sm:text-sm font-sans mt-0.5">
                  ★ {currentTheme.slogan} · Official CHRIST Blossoms Competitions
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#F5B82E]/90 bg-[#F5B82E]/10 border border-[#F5B82E]/30 px-2.5 py-1 rounded-md tracking-wider">
                  {activeEvents.length} COMPETITIONS
                </span>
              </div>
            </div>

            {/* 3-Column Pill Buttons Grid (Exact match to Arena Matrix) */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-3.5 mb-8">
              {activeEvents.map((ev: Event, index: number) => {
                const isSelected = selectedEventId === ev.id
                // Highlight default featured event matching reference screenshots
                const isDefaultHighlighted =
                  !selectedEventId &&
                  ((selectedCategory === 'stage' && ev.title.includes('Classical')) ||
                    (selectedCategory === 'theatre' && ev.title.includes('Short Film')))

                const isHighlight = isSelected || isDefaultHighlighted
                const isOdd = index % 2 === 1

                return (
                  <button
                    key={ev.id}
                    onClick={() => setSelectedEventId(ev.id)}
                    style={{ animationDelay: `${index * 40}ms` }}
                    className={cn(
                      'group relative text-left py-3.5 px-4 rounded-xl font-medium text-sm transition-all outline-none',
                      isOdd ? 'animate-panel-settle-odd' : 'animate-panel-settle-even',
                      isHighlight
                        ? 'bg-[#232018] border-2 border-[#F5B82E] text-[#F5B82E] shadow-[0_0_15px_rgba(245,184,46,0.22)]'
                        : 'bg-[#1E1F25] hover:bg-[#262730] border border-[#333540] text-white/90 hover:border-white/30'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-sans font-semibold tracking-wide truncate">
                        {ev.title}
                      </span>
                      <ChevronRight
                        className={cn(
                          'w-4 h-4 transition-transform flex-shrink-0',
                          isHighlight
                            ? 'text-[#F5B82E] translate-x-1'
                            : 'text-white/30 group-hover:translate-x-1 group-hover:text-white/70'
                        )}
                      />
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Cluster Badge in Bottom Right (Exact match to reference screenshots) */}
            <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/10">
              <span className="text-xs text-white/40 font-mono">
                CHRIST (DEEMED TO BE UNIVERSITY) · BLOSSOMS 2026
              </span>
              <div className="border border-[#F5B82E] bg-black/60 text-[#F5B82E] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-[0_0_8px_rgba(245,184,46,0.2)]">
                {currentTheme.badge}
              </div>
            </div>

            {/* ── Interactive Event Details & 6-Digit Registration Drawer ── */}
            {selectedEvent && (
              <div className="relative z-20 mt-6 bg-[#1A1B22] border-2 border-[#F5B82E] rounded-2xl p-4 sm:p-5 shadow-2xl animate-fade-in">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="inline-block bg-[#F5B82E] text-[#151515] font-display text-[10px] uppercase font-black px-2 py-0.5 rounded tracking-wider">
                      SELECTED EVENT
                    </span>
                    <h3 className="text-xl sm:text-2xl font-display uppercase tracking-wide text-white mt-1">
                      {selectedEvent.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedEventId(null)}
                    className="p-1 rounded-lg bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-white/70 text-xs sm:text-sm mb-4 leading-relaxed">
                  {selectedEvent.description ||
                    'Official university competition. Check rules, dates, and submit your registration.'}
                </p>

                {/* Event Metadata Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-5 text-xs">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#F5B82E]" />
                    <div>
                      <span className="block text-white/40 text-[10px] uppercase font-bold">SLOT</span>
                      <span className="text-white font-medium">
                        {slotLabel(selectedEvent.schedule_slots?.[0])}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#F5B82E]" />
                    <div>
                      <span className="block text-white/40 text-[10px] uppercase font-bold">VENUE</span>
                      <span className="text-white font-medium truncate">
                        {selectedEvent.schedule_slots?.[0]?.venue?.name || 'Central Campus'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center gap-2 col-span-2 sm:col-span-1">
                    <Users className="w-4 h-4 text-[#F5B82E]" />
                    <div>
                      <span className="block text-white/40 text-[10px] uppercase font-bold">FORMAT</span>
                      <span className="text-white font-medium capitalize">
                        {teamSizeLabel(selectedEvent)}
                      </span>
                    </div>
                  </div>
                </div>

                <QuickRegisterBox event={selectedEvent} />
              </div>
            )}
          </div>
        ) : (
          /* ═════════════════════════════════════════════════════ */
          /* SCENES 1 & 2: PHYSICAL 5-PANEL COMIC SPREAD & EXPANSION */
          /* ═════════════════════════════════════════════════════ */
          <div className="relative w-full bg-white rounded-xl overflow-hidden">
            <svg
              viewBox="0 0 600 880"
              className="w-full h-auto overflow-hidden bg-white block"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* ── Ben-Day Halftone Dot Patterns ──────────── */}
                <pattern
                  id="comic-halftone"
                  width="14"
                  height="14"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <circle cx="7" cy="7" r="4.6" fill="#000000" />
                </pattern>

                <pattern
                  id="comic-halftone-dense"
                  width="12"
                  height="12"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <circle cx="6" cy="6" r="4.2" fill="#000000" />
                </pattern>

                {/* Gradient Masks for Halftone Fading */}
                <linearGradient id="fade-panel-1" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                  <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.65" />
                  <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.18" />
                  <stop offset="95%" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>
                <mask id="mask-p1">
                  <rect x="0" y="0" width="600" height="880" fill="url(#fade-panel-1)" />
                </mask>

                <linearGradient id="fade-panel-2" x1="1" y1="1" x2="0.05" y2="0.05">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                  <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.60" />
                  <stop offset="75%" stopColor="#FFFFFF" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>
                <mask id="mask-p2">
                  <rect x="0" y="0" width="600" height="880" fill="url(#fade-panel-2)" />
                </mask>

                <linearGradient id="fade-panel-3" x1="0" y1="1" x2="0.9" y2="0.1">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                  <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.55" />
                  <stop offset="80%" stopColor="#FFFFFF" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>
                <mask id="mask-p3">
                  <rect x="0" y="0" width="600" height="880" fill="url(#fade-panel-3)" />
                </mask>

                <linearGradient id="fade-panel-4" x1="0.5" y1="1" x2="0.5" y2="0.05">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.92" />
                  <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.52" />
                  <stop offset="75%" stopColor="#FFFFFF" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>
                <mask id="mask-p4">
                  <rect x="0" y="0" width="600" height="880" fill="url(#fade-panel-4)" />
                </mask>

                <radialGradient id="fade-panel-5" cx="50%" cy="50%" r="65%">
                  <stop offset="25%" stopColor="#FFFFFF" stopOpacity="0" />
                  <stop offset="65%" stopColor="#FFFFFF" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.95" />
                </radialGradient>
                <mask id="mask-p5">
                  <rect x="0" y="0" width="600" height="880" fill="url(#fade-panel-5)" />
                </mask>

                {/* Angled Clip Paths */}
                <clipPath id="clip-p1">
                  <polygon points="12,12 296,12 346,260 12,248" />
                </clipPath>
                <clipPath id="clip-p2">
                  <polygon points="306,12 588,12 588,286 356,260" />
                </clipPath>
                <clipPath id="clip-p3">
                  <polygon points="12,258 242,272 186,560 12,560" />
                </clipPath>
                <clipPath id="clip-p4">
                  <polygon points="252,272 588,296 588,560 196,560" />
                </clipPath>
                <clipPath id="clip-p5">
                  <polygon points="12,570 588,570 588,868 12,868" />
                </clipPath>
              </defs>

              {/* ────────────────────────────────────────────── */}
              {/* PANEL 1: LITERATURE (TOP LEFT)                */}
              {/* ────────────────────────────────────────────── */}
              <g
                id="panel-literature"
                className={cn(
                  'cursor-pointer transition-all duration-300',
                  scene === 'scene1_press' && selectedCategory === 'literature' && 'animate-comic-press',
                  scene === 'scene2_expand' &&
                    selectedCategory !== 'literature' &&
                    'opacity-0 -translate-x-full -translate-y-1/2 rotate-[-12deg]'
                )}
                onClick={() => triggerCategoryTransition('literature')}
                tabIndex={0}
                role="button"
                aria-label="Literature Events"
              >
                <polygon
                  id="panel-polygon-literature"
                  points="12,12 296,12 346,260 12,248"
                  fill="#009EE3"
                  pointerEvents="all"
                />
                <g clipPath="url(#clip-p1)" pointerEvents="none">
                  <rect x="12" y="12" width="340" height="250" fill="url(#comic-halftone)" mask="url(#mask-p1)" pointerEvents="none" />
                  <text
                    x="220"
                    y="85"
                    fill="#FFFFFF"
                    opacity="0.22"
                    fontFamily="Bangers, Impact, system-ui, sans-serif"
                    fontSize="62"
                    fontWeight="900"
                    transform="rotate(-8 220 85)"
                  >
                    WORDS!
                  </text>
                  <g transform="translate(26, 26)">
                    <rect x="0" y="0" width="132" height="22" rx="3" fill="#FFD43B" stroke="#151515" strokeWidth="2" />
                    <text x="66" y="15" textAnchor="middle" fill="#151515" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="9.5" letterSpacing="0.8">
                      ★ READ · WRITE · SPEAK
                    </text>
                  </g>
                  <g transform="translate(26, 105)">
                    <text x="3" y="3" fill="#151515" fontFamily="Bangers, Impact, system-ui, sans-serif" fontSize="46" fontWeight="900" letterSpacing="1.5">
                      LITERATURE
                    </text>
                    <text x="0" y="0" fill="#FFFFFF" stroke="#151515" strokeWidth="3.5" paintOrder="stroke fill" fontFamily="Bangers, Impact, system-ui, sans-serif" fontSize="46" fontWeight="900" letterSpacing="1.5">
                      LITERATURE
                    </text>
                  </g>
                  <text x="28" y="134" fill="#FFEB99" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="10" letterSpacing="0.8">
                    DEBATE · QUIZ · JAM · WRITING
                  </text>
                  <g transform="translate(28, 178)">
                    <rect x="0" y="0" width="106" height="26" rx="13" fill="#FFFFFF" stroke="#151515" strokeWidth="2.5" />
                    <text x="45" y="17" textAnchor="middle" fill="#151515" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="10.5" letterSpacing="0.5">
                      8 EVENTS
                    </text>
                    <circle cx="92" cy="13" r="8" fill="#FFD43B" stroke="#151515" strokeWidth="1.5" />
                    <text x="92" y="16.5" textAnchor="middle" fill="#151515" fontWeight="900" fontSize="10">→</text>
                  </g>
                </g>
                <polygon points="12,12 296,12 346,260 12,248" fill="none" stroke="#151515" strokeWidth={scene === 'scene2_expand' && selectedCategory === 'literature' ? 8 : 4} pointerEvents="none" />
              </g>

              {/* ────────────────────────────────────────────── */}
              {/* PANEL 2: ARTS (TOP RIGHT)                      */}
              {/* ────────────────────────────────────────────── */}
              <g
                id="panel-arts"
                className={cn(
                  'cursor-pointer transition-all duration-300',
                  scene === 'scene1_press' && selectedCategory === 'arts' && 'animate-comic-press',
                  scene === 'scene2_expand' &&
                    selectedCategory !== 'arts' &&
                    'opacity-0 translate-x-full -translate-y-1/2 rotate-[12deg]'
                )}
                onClick={() => triggerCategoryTransition('arts')}
                tabIndex={0}
                role="button"
                aria-label="Arts Events"
              >
                <polygon
                  id="panel-polygon-arts"
                  points="306,12 588,12 588,286 356,260"
                  fill="#E5004F"
                  pointerEvents="all"
                />
                <g clipPath="url(#clip-p2)" pointerEvents="none">
                  <rect x="306" y="12" width="282" height="275" fill="url(#comic-halftone)" mask="url(#mask-p2)" pointerEvents="none" />
                  <text
                    x="485"
                    y="85"
                    fill="#FFFFFF"
                    opacity="0.22"
                    fontFamily="Bangers, Impact, system-ui, sans-serif"
                    fontSize="68"
                    fontWeight="900"
                    transform="rotate(6 485 85)"
                  >
                    CREATE!
                  </text>
                  <g transform="translate(370, 26)">
                    <rect x="0" y="0" width="136" height="22" rx="3" fill="#FFD43B" stroke="#151515" strokeWidth="2" />
                    <text x="68" y="15" textAnchor="middle" fill="#151515" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="9.5" letterSpacing="0.8">
                      ★ PAINT · DESIGN · CREATE
                    </text>
                  </g>
                  <g transform="translate(372, 105)">
                    <text x="3" y="3" fill="#151515" fontFamily="Bangers, Impact, system-ui, sans-serif" fontSize="50" fontWeight="900" letterSpacing="2">
                      ARTS
                    </text>
                    <text x="0" y="0" fill="#FFFFFF" stroke="#151515" strokeWidth="3.5" paintOrder="stroke fill" fontFamily="Bangers, Impact, system-ui, sans-serif" fontSize="50" fontWeight="900" letterSpacing="2">
                      ARTS
                    </text>
                  </g>
                  <text x="374" y="134" fill="#FFEB99" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="10" letterSpacing="0.8">
                    SKETCH · PAINT · CRAFT · POT
                  </text>
                  <g transform="translate(374, 178)">
                    <rect x="0" y="0" width="112" height="26" rx="13" fill="#FFFFFF" stroke="#151515" strokeWidth="2.5" />
                    <text x="48" y="17" textAnchor="middle" fill="#151515" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="10.5" letterSpacing="0.5">
                      10 EVENTS
                    </text>
                    <circle cx="98" cy="13" r="8" fill="#FFD43B" stroke="#151515" strokeWidth="1.5" />
                    <text x="98" y="16.5" textAnchor="middle" fill="#151515" fontWeight="900" fontSize="10">→</text>
                  </g>
                </g>
                <polygon points="306,12 588,12 588,286 356,260" fill="none" stroke="#151515" strokeWidth={scene === 'scene2_expand' && selectedCategory === 'arts' ? 8 : 4} pointerEvents="none" />
              </g>

              {/* ────────────────────────────────────────────── */}
              {/* PANEL 3: STAGE (MID LEFT)                      */}
              {/* ────────────────────────────────────────────── */}
              <g
                id="panel-stage"
                className={cn(
                  'cursor-pointer transition-all duration-300',
                  scene === 'scene1_press' && selectedCategory === 'stage' && 'animate-comic-press',
                  scene === 'scene2_expand' &&
                    selectedCategory !== 'stage' &&
                    'opacity-0 -translate-x-full translate-y-1/4 rotate-[-10deg]'
                )}
                onClick={() => triggerCategoryTransition('stage')}
                tabIndex={0}
                role="button"
                aria-label="Stage Events"
              >
                <polygon
                  id="panel-polygon-stage"
                  points="12,258 242,272 186,560 12,560"
                  fill="#E4007F"
                  pointerEvents="all"
                />
                <g clipPath="url(#clip-p3)" pointerEvents="none">
                  <rect x="12" y="258" width="230" height="305" fill="url(#comic-halftone-dense)" mask="url(#mask-p3)" pointerEvents="none" />
                  <text
                    x="90"
                    y="430"
                    fill="#FFFFFF"
                    opacity="0.18"
                    fontFamily="Bangers, Impact, system-ui, sans-serif"
                    fontSize="64"
                    fontWeight="900"
                    transform="rotate(-15 90 430)"
                  >
                    ROAR!
                  </text>
                  <g transform="translate(24, 280)">
                    <rect x="0" y="0" width="122" height="22" rx="3" fill="#FFD43B" stroke="#151515" strokeWidth="2" />
                    <text x="61" y="15" textAnchor="middle" fill="#151515" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="9.5" letterSpacing="0.8">
                      ★ PERFORM · SHINE
                    </text>
                  </g>
                  <g transform="translate(24, 365)">
                    <text x="3" y="3" fill="#151515" fontFamily="Bangers, Impact, system-ui, sans-serif" fontSize="48" fontWeight="900" letterSpacing="2">
                      STAGE
                    </text>
                    <text x="0" y="0" fill="#FFFFFF" stroke="#151515" strokeWidth="3.5" paintOrder="stroke fill" fontFamily="Bangers, Impact, system-ui, sans-serif" fontSize="48" fontWeight="900" letterSpacing="2">
                      STAGE
                    </text>
                  </g>
                  <text x="26" y="395" fill="#FFEB99" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="10" letterSpacing="0.8">
                    BANDS · DANCE · VOCALS · DUET
                  </text>
                  <g transform="translate(26, 490)">
                    <rect x="0" y="0" width="116" height="26" rx="13" fill="#FFFFFF" stroke="#151515" strokeWidth="2.5" />
                    <text x="51" y="17" textAnchor="middle" fill="#151515" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="10.5" letterSpacing="0.5">
                      8 SHOWDOWNS
                    </text>
                    <circle cx="102" cy="13" r="8" fill="#FFD43B" stroke="#151515" strokeWidth="1.5" />
                    <text x="102" y="16.5" textAnchor="middle" fill="#151515" fontWeight="900" fontSize="10">→</text>
                  </g>
                </g>
                <polygon points="12,258 242,272 186,560 12,560" fill="none" stroke="#151515" strokeWidth={scene === 'scene2_expand' && selectedCategory === 'stage' ? 8 : 4} pointerEvents="none" />
              </g>

              {/* ────────────────────────────────────────────── */}
              {/* PANEL 4: THEATRE (MID RIGHT)                   */}
              {/* ────────────────────────────────────────────── */}
              <g
                id="panel-theatre"
                className={cn(
                  'cursor-pointer transition-all duration-300',
                  scene === 'scene1_press' && selectedCategory === 'theatre' && 'animate-comic-press',
                  scene === 'scene2_expand' &&
                    selectedCategory !== 'theatre' &&
                    'opacity-0 translate-x-full translate-y-1/4 rotate-[10deg]'
                )}
                onClick={() => triggerCategoryTransition('theatre')}
                tabIndex={0}
                role="button"
                aria-label="Theatre Events"
              >
                <polygon
                  id="panel-polygon-theatre"
                  points="252,272 588,296 588,560 196,560"
                  fill="#FFD100"
                  pointerEvents="all"
                />
                <g clipPath="url(#clip-p4)" pointerEvents="none">
                  <rect x="196" y="272" width="392" height="290" fill="url(#comic-halftone)" mask="url(#mask-p4)" pointerEvents="none" />
                  <text
                    x="410"
                    y="410"
                    fill="#151515"
                    opacity="0.12"
                    fontFamily="Bangers, Impact, system-ui, sans-serif"
                    fontSize="68"
                    fontWeight="900"
                    transform="rotate(5 410 410)"
                  >
                    DRAMA!
                  </text>
                  <g transform="translate(268, 305)">
                    <rect x="0" y="0" width="132" height="22" rx="3" fill="#FFFFFF" stroke="#151515" strokeWidth="2" />
                    <text x="66" y="15" textAnchor="middle" fill="#151515" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="9.5" letterSpacing="0.8">
                      ★ ACT · EMOTE · DRAMA
                    </text>
                  </g>
                  <g transform="translate(268, 375)">
                    <text x="3" y="3" fill="#151515" fontFamily="Bangers, Impact, system-ui, sans-serif" fontSize="50" fontWeight="900" letterSpacing="2">
                      THEATRE
                    </text>
                    <text x="0" y="0" fill="#FFFFFF" stroke="#151515" strokeWidth="3.5" paintOrder="stroke fill" fontFamily="Bangers, Impact, system-ui, sans-serif" fontSize="50" fontWeight="900" letterSpacing="2">
                      THEATRE
                    </text>
                  </g>
                  <text x="270" y="405" fill="#151515" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="10" letterSpacing="0.8">
                    PROSCENIUM · STREET PLAY · MIME · SHORT FILM
                  </text>
                  <g transform="translate(270, 490)">
                    <rect x="0" y="0" width="126" height="26" rx="13" fill="#151515" stroke="#151515" strokeWidth="2.5" />
                    <text x="56" y="17" textAnchor="middle" fill="#FFD43B" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="10.5" letterSpacing="0.5">
                      5 PRODUCTIONS
                    </text>
                    <circle cx="112" cy="13" r="8" fill="#FFFFFF" stroke="#151515" strokeWidth="1.5" />
                    <text x="112" y="16.5" textAnchor="middle" fill="#151515" fontWeight="900" fontSize="10">→</text>
                  </g>
                </g>
                <polygon points="252,272 588,296 588,560 196,560" fill="none" stroke="#151515" strokeWidth={scene === 'scene2_expand' && selectedCategory === 'theatre' ? 8 : 4} pointerEvents="none" />
              </g>

              {/* ────────────────────────────────────────────── */}
              {/* PANEL 5: SPECIAL EVENTS (BOTTOM WIDE)          */}
              {/* ────────────────────────────────────────────── */}
              <g
                id="panel-specials"
                className={cn(
                  'cursor-pointer transition-all duration-300',
                  scene === 'scene1_press' && selectedCategory === 'special-events' && 'animate-comic-press',
                  scene === 'scene2_expand' &&
                    selectedCategory !== 'special-events' &&
                    'opacity-0 translate-y-full rotate-[2deg]'
                )}
                onClick={() => triggerCategoryTransition('special-events')}
                tabIndex={0}
                role="button"
                aria-label="Special Events"
              >
                <polygon
                  id="panel-polygon-specials"
                  points="12,570 588,570 588,868 12,868"
                  fill="#7928CA"
                  pointerEvents="all"
                />
                <g clipPath="url(#clip-p5)" pointerEvents="none">
                  <rect x="12" y="570" width="576" height="300" fill="url(#comic-halftone)" mask="url(#mask-p5)" pointerEvents="none" />
                  <text
                    x="300"
                    y="740"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    opacity="0.14"
                    fontFamily="Bangers, Impact, system-ui, sans-serif"
                    fontSize="110"
                    fontWeight="900"
                  >
                    LEGEND!
                  </text>
                  <g transform="translate(30, 592)">
                    <rect x="0" y="0" width="186" height="22" rx="3" fill="#FFD43B" stroke="#151515" strokeWidth="2" />
                    <text x="93" y="15" textAnchor="middle" fill="#151515" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="9.5" letterSpacing="0.8">
                      ★ FESTIVAL HEADLINERS &amp; CEREMONIES
                    </text>
                  </g>
                  <g transform="translate(32, 665)">
                    <text x="3" y="3" fill="#151515" fontFamily="Bangers, Impact, system-ui, sans-serif" fontSize="50" fontWeight="900" letterSpacing="2">
                      SPECIAL EVENTS
                    </text>
                    <text x="0" y="0" fill="#FFFFFF" stroke="#151515" strokeWidth="3.5" paintOrder="stroke fill" fontFamily="Bangers, Impact, system-ui, sans-serif" fontSize="50" fontWeight="900" letterSpacing="2">
                      SPECIAL EVENTS
                    </text>
                  </g>
                  <text x="34" y="698" fill="#FFEB99" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="11.5" letterSpacing="0.8">
                    BLOSSOMS INAUGURATION (12 NOV) · GRAND VALEDICTORY (MAIN AUDI)
                  </text>
                  <g transform="translate(34, 755)">
                    <rect x="0" y="0" width="170" height="30" rx="15" fill="#FFD43B" stroke="#151515" strokeWidth="2.5" />
                    <text x="78" y="19" textAnchor="middle" fill="#151515" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="11" letterSpacing="0.8">
                      EXPLORE CEREMONIES
                    </text>
                    <circle cx="152" cy="15" r="9" fill="#FFFFFF" stroke="#151515" strokeWidth="2" />
                    <text x="152" y="19" textAnchor="middle" fill="#151515" fontWeight="900" fontSize="11">→</text>
                  </g>
                </g>
                <polygon points="12,570 588,570 588,868 12,868" fill="none" stroke="#151515" strokeWidth={scene === 'scene2_expand' && selectedCategory === 'special-events' ? 8 : 4} pointerEvents="none" />
              </g>
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}
