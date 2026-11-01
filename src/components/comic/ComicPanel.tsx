import React from 'react'

export type CategoryKey = 'arts' | 'literature' | 'stage' | 'theatre'

export interface ComicPanelConfig {
  id: string
  categoryKey: CategoryKey
  expandedFrameName: string
  ariaLabel: string
  imageSrc: string
  accentColor: string
  isExpansionEnabled?: boolean
  styleBox: {
    left: string
    top: string
    width: string
    height: string
  }
  outerClipPath: string
  innerClipPath: string
}

interface ComicPanelProps {
  panel: ComicPanelConfig
  onSelect?: (panel: ComicPanelConfig, element: HTMLButtonElement) => void
  panelRef?: (element: HTMLButtonElement | null) => void
}

export const ComicPanel: React.FC<ComicPanelProps> = ({ panel, onSelect, panelRef }) => {
  return (
    <button
      ref={panelRef}
      type="button"
      aria-label={panel.ariaLabel}
      onClick={(e) => onSelect?.(panel, e.currentTarget)}
      className="comic-panel-button"
      style={{
        left: panel.styleBox.left,
        top: panel.styleBox.top,
        width: panel.styleBox.width,
        height: panel.styleBox.height,
        clipPath: panel.outerClipPath,
        WebkitClipPath: panel.outerClipPath,
      }}
    >
      <img
        src={panel.imageSrc}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="comic-panel-border-layer"
      />

      <div
        className="comic-panel-inner-clip"
        style={{
          backgroundColor: panel.accentColor,
          clipPath: panel.innerClipPath,
          WebkitClipPath: panel.innerClipPath,
        }}
      >
        <img
          src={panel.imageSrc}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="comic-panel-artwork"
        />
      </div>
    </button>
  )
}
