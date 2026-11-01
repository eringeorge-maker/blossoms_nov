import React from 'react'
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
  onBack: () => void
}

const FULLSCREEN_CLIP_PATH = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'

export const ExpandedCategoryFrame: React.FC<ExpandedCategoryFrameProps> = ({
  panel,
  phase,
  originRect,
  onBack,
}) => {
  if (phase === 'idle') return null

  const isAtFullscreen = phase === 'expanded'
  const currentClipPath = isAtFullscreen ? FULLSCREEN_CLIP_PATH : panel.outerClipPath

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

        <div
          className="expanded-category-content-stage"
          data-stage-slot="event-list-content-area"
          aria-hidden="true"
        />
      </div>
    </section>
  )
}
