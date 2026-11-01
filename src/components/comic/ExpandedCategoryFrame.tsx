import React from 'react'
import { Calendar, MapPin, Users } from 'lucide-react'
import type { Event } from '@/types'
import { formatSlot } from '@/lib/utils'
import { ComicPanelConfig } from './ComicPanel'

export type ExpansionPhase = 'idle' | 'expanding-init' | 'expanded' | 'contracting'

export interface BoundingRectBox {
  left: number
  top: number
  width: number
  height: number
}

interface ExpandedCategoryFrameProps {
  panel: ComicPanelConfig
  phase: ExpansionPhase
  originRect: BoundingRectBox
  events: Event[]
  onBack: () => void
  onSelectEvent?: (eventId: string) => void
}

const FULLSCREEN_CLIP_PATH = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'

const CATEGORY_TITLES: Record<string, string> = {
  arts: 'ARTS',
  literature: 'LITERATURE',
  stage: 'STAGE',
  theatre: 'THEATRE',
}

function formatTeamBadge(event: Event): string {
  if (event.event_format === 'individual') return 'Solo'
  if (event.event_format === 'team') {
    if (event.min_team_size && event.max_team_size) {
      return event.min_team_size === event.max_team_size
        ? `Team of ${event.min_team_size}`
        : `Team (${event.min_team_size}–${event.max_team_size})`
    }
    return 'Team'
  }
  if (event.min_team_size && event.max_team_size) {
    return `Solo / Team (${event.min_team_size}–${event.max_team_size})`
  }
  return 'Solo / Team'
}

export const ExpandedCategoryFrame: React.FC<ExpandedCategoryFrameProps> = ({
  panel,
  phase,
  originRect,
  events,
  onBack,
  onSelectEvent,
}) => {
  if (phase === 'idle') return null

  const isAtFullscreen = phase === 'expanded'
  const currentClipPath = isAtFullscreen ? FULLSCREEN_CLIP_PATH : panel.outerClipPath
  const categoryHeading = CATEGORY_TITLES[panel.categoryKey] || panel.categoryKey.toUpperCase()

  return (
    <section
      data-frame-name={panel.expandedFrameName}
      aria-label={panel.expandedFrameName}
      className="expanded-category-frame"
      style={{
        backgroundColor: panel.accentColor,
        left: isAtFullscreen ? '0px' : `${originRect.left}px`,
        top: isAtFullscreen ? '0px' : `${originRect.top}px`,
        width: isAtFullscreen ? '100vw' : `${originRect.width}px`,
        height: isAtFullscreen ? '100vh' : `${originRect.height}px`,
        clipPath: currentClipPath,
        WebkitClipPath: currentClipPath,
      }}
    >
      {/* Original panel illustration fades out smoothly during expansion so the expanded state is a plain background */}
      <img
        src={panel.imageSrc}
        alt=""
        aria-hidden="true"
        draggable={false}
        className={`expanded-category-origin-layer ${
          isAtFullscreen ? 'is-expanded' : 'is-collapsed'
        }`}
      />

      <div className="expanded-category-ink-border" aria-hidden="true" />

      <div
        className={`expanded-destination-ui ${
          isAtFullscreen ? 'is-visible' : 'is-hidden'
        }`}
      >
        {/* Top Header Bar: Back Button + Category Heading */}
        <div className="expanded-destination-header">
          <button
            type="button"
            onClick={onBack}
            className="expanded-back-button"
            aria-label="Back to Events Showcase"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#080808"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </button>

          <div className="expanded-category-title-group">
            <h1 className="expanded-category-heading">{categoryHeading}</h1>
            <span className="expanded-category-count-pill">
              {events.length} {events.length === 1 ? 'EVENT' : 'EVENTS'}
            </span>
          </div>
        </div>

        {/* Category Events Grid */}
        <div
          className="expanded-category-content-stage"
          data-stage-slot="event-list-content-area"
        >
          <div className="expanded-events-grid">
            {events.map((ev, index) => {
              const firstSlot = ev.schedule_slots?.[0]
              const slotText = firstSlot?.starts_at
                ? formatSlot(firstSlot.starts_at, firstSlot.ends_at)
                : 'Schedule TBD'
              const venueText = firstSlot?.venue?.name || 'Venue TBD'

              return (
                <article
                  key={ev.id}
                  onClick={() => onSelectEvent?.(ev.id)}
                  style={{ animationDelay: `${index * 45}ms` }}
                  className="expanded-event-card"
                >
                  <div className="expanded-event-card-top">
                    <div className="expanded-event-badges">
                      <span className="expanded-event-index">
                        #{index + 1 < 10 ? `0${index + 1}` : index + 1}
                      </span>
                      <span className="expanded-event-format">
                        <Users className="w-3.5 h-3.5" />
                        {formatTeamBadge(ev)}
                      </span>
                    </div>

                    <h2 className="expanded-event-title">{ev.title}</h2>
                    <p className="expanded-event-desc">{ev.description}</p>
                  </div>

                  <div className="expanded-event-card-footer">
                    <div className="expanded-event-meta">
                      <div className="expanded-event-meta-row">
                        <Calendar className="w-3.5 h-3.5 shrink-0 text-[#E52B27]" />
                        <span className="truncate">{slotText}</span>
                      </div>
                      <div className="expanded-event-meta-row">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-[#087BC4]" />
                        <span className="truncate">{venueText}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectEvent?.(ev.id)
                      }}
                      className="expanded-event-action-btn"
                    >
                      Details &amp; Register →
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
