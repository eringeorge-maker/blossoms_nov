import { useEffect, useMemo, useRef, useState } from 'react'
import { PublicHeader } from '@/components/layout/PublicHeader'
import { EVENTS } from '@/lib/data/eventsData'
import type { Event } from '@/types'
import { ComicPanel, type ComicPanelConfig } from './ComicPanel'
import {
  type BoundingRectBox,
  ExpandedCategoryFrame,
  type ExpansionPhase,
} from './ExpandedCategoryFrame'

const TRANSITION_DURATION_MS = 650

const ORDER_MAP: Record<string, number> = {
  // Arts
  'Digital Poster Making': 1,
  'Greeting Card': 2,
  'Pot Art': 3,
  'Pencil Sketching': 4,
  'Reel Making': 5,
  'Collage': 6,
  'Mehendi Design': 7,
  'Rangoli Design': 8,
  'Painting': 9,
  'Photography': 10,
  // Literature
  'Quiz': 1,
  'Pot Pourri': 2,
  'Extempore': 3,
  'Dumb Charades': 4,
  'Air Crash / Ship-Wreck': 5,
  'Debate': 6,
  'Jam': 7,
  'Creative Writing': 8,
  // Stage
  'Indian Dance Classical (Group)': 1,
  'Non Theme': 2,
  'BOB (W)': 3,
  'BOB (I)': 4,
  'Indian Folk and Film Singing (Solo)': 5,
  'Western Singing (Solo)': 6,
  'Western Acapella': 7,
  'Duet Dance': 8,
  // Theatre
  'Mono Act': 1,
  'Proscenium': 2,
  'Street Play': 3,
  'Short Film Making': 4,
  'Mime': 5,
}

const DESKTOP_COMIC_PANELS: ComicPanelConfig[] = [
  {
    id: 'panel-1-arts',
    categoryKey: 'arts',
    expandedFrameName: 'Arts Expanded',
    ariaLabel: 'Arts events category panel',
    imageSrc: '/assets/panel-1.png',
    accentColor: '#E52B27',
    isExpansionEnabled: true,
    styleBox: {
      left: '-6.25%',
      top: '-1.2%',
      width: '36.462%',
      height: '112.5%',
    },
    outerClipPath: 'polygon(0% 0%, 68.044% 0%, 100% 100%, 0% 100%)',
    innerClipPath: 'polygon(1.93% 0.99%, 66.12% 0.99%, 97.74% 99.01%, 1.93% 99.01%)',
  },
  {
    id: 'panel-2-literature',
    categoryKey: 'literature',
    expandedFrameName: 'Literature Expanded',
    ariaLabel: 'Literature events category panel',
    imageSrc: '/assets/panel-2.png',
    accentColor: '#F28A24',
    isExpansionEnabled: true,
    styleBox: {
      left: '20.067%',
      top: '-1.2%',
      width: '53.4375%',
      height: '62.642%',
    },
    outerClipPath: 'polygon(0% 0%, 100% 0%, 80.639% 100%, 10.714% 89.286%)',
    innerClipPath: 'polygon(1.54% 1.79%, 98.35% 1.79%, 79.66% 98.06%, 11.84% 87.68%)',
  },
  {
    id: 'panel-3-stage',
    categoryKey: 'stage',
    expandedFrameName: 'Stage Expanded',
    ariaLabel: 'Stage events category panel',
    imageSrc: '/assets/panel-3.png',
    accentColor: '#087BC4',
    isExpansionEnabled: true,
    styleBox: {
      left: '64.7656%',
      top: '-1.2%',
      width: '41.4844%',
      height: '70.3125%',
    },
    outerClipPath: 'polygon(24.939% 0%, 100% 0%, 100% 100%, 0% 89.545%)',
    innerClipPath: 'polygon(26.25% 1.59%, 98.31% 1.59%, 98.31% 98.23%, 2.11% 88.14%)',
  },
  {
    id: 'panel-4-theatre',
    categoryKey: 'theatre',
    expandedFrameName: 'Theatre Expanded',
    ariaLabel: 'Theatre events category panel',
    imageSrc: '/assets/panel-4.png',
    accentColor: '#F5C51B',
    isExpansionEnabled: true,
    styleBox: {
      left: '26.0938%',
      top: '57.1274%',
      width: '80.1563%',
      height: '54.1726%',
    },
    outerClipPath: 'polygon(0% 0%, 100% 26.549%, 100% 100%, 6.892% 100%)',
    innerClipPath: 'polygon(1.04% 2.33%, 99.12% 28.38%, 99.12% 97.94%, 7.64% 97.94%)',
  },
]

const MOBILE_COMIC_PANELS: ComicPanelConfig[] = [
  {
    id: 'mobile-panel-1-arts',
    categoryKey: 'arts',
    expandedFrameName: 'Arts Expanded',
    ariaLabel: 'Arts events category panel',
    imageSrc: '/assets/mobile-panel-1.png',
    accentColor: '#E52B27',
    isExpansionEnabled: true,
    styleBox: {
      left: '0%',
      top: '0%',
      width: '55.9524%',
      height: '46.6156%',
    },
    outerClipPath: 'polygon(0% 0%, 100% 0%, 76.383% 100%, 0% 95.3425%)',
    innerClipPath: 'polygon(1.70% 1.10%, 98.09% 1.10%, 74.89% 98.77%, 1.70% 94.25%)',
  },
  {
    id: 'mobile-panel-2-literature',
    categoryKey: 'literature',
    expandedFrameName: 'Literature Expanded',
    ariaLabel: 'Literature events category panel',
    imageSrc: '/assets/mobile-panel-2.png',
    accentColor: '#F28A24',
    isExpansionEnabled: true,
    styleBox: {
      left: '44.4048%',
      top: '0%',
      width: '55.5952%',
      height: '49.553%',
    },
    outerClipPath: 'polygon(23.7687% 0%, 100% 0%, 100% 100%, 0% 94.3299%)',
    innerClipPath: 'polygon(25.27% 1.03%, 98.29% 1.03%, 98.29% 98.84%, 1.93% 93.30%)',
  },
  {
    id: 'mobile-panel-3-stage',
    categoryKey: 'stage',
    expandedFrameName: 'Stage Expanded',
    ariaLabel: 'Stage events category panel',
    imageSrc: '/assets/mobile-panel-3.png',
    accentColor: '#087BC4',
    isExpansionEnabled: true,
    styleBox: {
      left: '0%',
      top: '45.5939%',
      width: '100%',
      height: '30.7791%',
    },
    outerClipPath: 'polygon(0% 0%, 100% 16.5975%, 100% 100%, 0% 78.8382%)',
    innerClipPath: 'polygon(0.95% 1.87%, 99.05% 18.26%, 99.05% 98.13%, 0.95% 77.18%)',
  },
  {
    id: 'mobile-panel-4-theatre',
    categoryKey: 'theatre',
    expandedFrameName: 'Theatre Expanded',
    ariaLabel: 'Theatre events category panel',
    imageSrc: '/assets/mobile-panel-4.png',
    accentColor: '#F5C51B',
    isExpansionEnabled: true,
    styleBox: {
      left: '0%',
      top: '71.0089%',
      width: '100%',
      height: '28.9911%',
    },
    outerClipPath: 'polygon(0% 0%, 100% 22.6872%, 100% 100%, 0% 100%)',
    innerClipPath: 'polygon(0.95% 1.98%, 99.05% 24.45%, 99.05% 98.24%, 0.95% 98.24%)',
  },
]

interface DesktopEventsShowcaseProps {
  onSelectCategory?: (category: string) => void
  onSelectEvent?: (eventId: string) => void
  eventsByCategory?: Record<string, Event[]>
  hideHeader?: boolean
}

export default function DesktopEventsShowcase({
  onSelectCategory,
  onSelectEvent,
  eventsByCategory,
  hideHeader = false,
}: DesktopEventsShowcaseProps) {
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  )
  const panelElementRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [activeExpandedPanel, setActiveExpandedPanel] = useState<ComicPanelConfig | null>(null)
  const [expansionPhase, setExpansionPhase] = useState<ExpansionPhase>('idle')
  const [originRect, setOriginRect] = useState<BoundingRectBox>({
    left: 0,
    top: 0,
    width: 363,
    height: 704,
  })
  const transitionTimerRef = useRef<number | null>(null)
  const rafRef1 = useRef<number | null>(null)
  const rafRef2 = useRef<number | null>(null)

  useEffect(() => {
    const handleResize = () => {
      setIsMobileViewport(window.innerWidth <= 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current)
      if (rafRef1.current) window.cancelAnimationFrame(rafRef1.current)
      if (rafRef2.current) window.cancelAnimationFrame(rafRef2.current)
    }
  }, [])

  const handlePanelSelect = (panel: ComicPanelConfig, element: HTMLButtonElement) => {
    if (!panel.isExpansionEnabled || expansionPhase !== 'idle') return

    const rect = element.getBoundingClientRect()
    setOriginRect({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    })
    setActiveExpandedPanel(panel)
    setExpansionPhase('expanding-init')

    rafRef1.current = window.requestAnimationFrame(() => {
      rafRef2.current = window.requestAnimationFrame(() => {
        setExpansionPhase('expanded')
      })
    })

    onSelectCategory?.(panel.categoryKey)
  }

  const handleBackToShowcase = () => {
    if (!activeExpandedPanel || expansionPhase !== 'expanded') return

    const sourceEl = panelElementRefs.current[activeExpandedPanel.id]
    if (sourceEl) {
      const rect = sourceEl.getBoundingClientRect()
      setOriginRect({
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      })
    }

    setExpansionPhase('contracting')
    if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current)
    transitionTimerRef.current = window.setTimeout(() => {
      setExpansionPhase('idle')
      setActiveExpandedPanel(null)
    }, TRANSITION_DURATION_MS)
  }

  const activePanels = isMobileViewport ? MOBILE_COMIC_PANELS : DESKTOP_COMIC_PANELS

  const activeCategoryEvents = useMemo(() => {
    if (!activeExpandedPanel) return []
    const key = activeExpandedPanel.categoryKey
    const fromProps = eventsByCategory?.[key]
    if (fromProps && fromProps.length > 0) {
      return fromProps
    }
    return EVENTS.filter((ev) => ev.category?.slug === key).sort((a, b) => {
      const orderA = ORDER_MAP[a.title] ?? 99
      const orderB = ORDER_MAP[b.title] ?? 99
      return orderA - orderB
    })
  }, [activeExpandedPanel, eventsByCategory])

  return (
    <div
      className="events-showcase-page"
      data-frame-name="Events Showcase"
    >
      {!hideHeader && <PublicHeader />}

      {isMobileViewport ? (
        <div
          className="comic-layout-mobile"
          role="region"
          aria-label="Event categories comic showcase"
        >
          {activePanels.map((panel) => (
            <ComicPanel
              key={panel.id}
              panel={panel}
              panelRef={(el) => {
                panelElementRefs.current[panel.id] = el
              }}
              onSelect={handlePanelSelect}
            />
          ))}
        </div>
      ) : (
        <div
          className="comic-layout"
          role="region"
          aria-label="Event categories comic showcase"
        >
          {activePanels.map((panel) => (
            <ComicPanel
              key={panel.id}
              panel={panel}
              panelRef={(el) => {
                panelElementRefs.current[panel.id] = el
              }}
              onSelect={handlePanelSelect}
            />
          ))}
        </div>
      )}

      {activeExpandedPanel && (
        <ExpandedCategoryFrame
          panel={activeExpandedPanel}
          phase={expansionPhase}
          originRect={originRect}
          events={activeCategoryEvents}
          onBack={handleBackToShowcase}
          onSelectEvent={onSelectEvent}
        />
      )}
    </div>
  )
}
