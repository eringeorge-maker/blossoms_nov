import { LayoutGrid, Layers } from 'lucide-react'

export type GalleryViewMode = 'masonry' | 'infinite-3d'

interface ViewSwitcherPillProps {
  mode: GalleryViewMode
  onChangeMode: (mode: GalleryViewMode) => void
}

/**
 * Top-left floating segmented control pill:
 * [CMS Masonry | 3D Infinite Gallery]
 * Styled after the Framer Strata component design.
 */
export function ViewSwitcherPill({ mode, onChangeMode }: ViewSwitcherPillProps) {
  return (
    <div
      role="group"
      aria-label="Gallery View Switcher"
      className="inline-flex items-center gap-1 p-1 bg-black/60 backdrop-blur-xl border border-white/15 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] select-none transition-all duration-200"
    >
      {/* CMS Masonry Tab */}
      <button
        type="button"
        onClick={() => onChangeMode('masonry')}
        aria-pressed={mode === 'masonry'}
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer active:scale-95 ${
          mode === 'masonry'
            ? 'bg-white text-[#0f0f11] shadow-[0_2px_12px_rgba(255,255,255,0.25)]'
            : 'text-white/70 hover:text-white hover:bg-white/10'
        }`}
      >
        <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
        <span>CMS Masonry</span>
      </button>

      {/* 3D Infinite Gallery Tab */}
      <button
        type="button"
        onClick={() => onChangeMode('infinite-3d')}
        aria-pressed={mode === 'infinite-3d'}
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer active:scale-95 ${
          mode === 'infinite-3d'
            ? 'bg-white text-[#0f0f11] shadow-[0_2px_12px_rgba(255,255,255,0.25)]'
            : 'text-white/70 hover:text-white hover:bg-white/10'
        }`}
      >
        <Layers className="w-3.5 h-3.5 shrink-0" />
        <span>3D Infinite Gallery</span>
      </button>
    </div>
  )
}
