import { useState } from 'react'
import { FESTIVAL_PHOTOS } from './galleryData'
import { ViewSwitcherPill, type GalleryViewMode } from './components/ViewSwitcherPill'
import { Infinite3DGallery } from './components/Infinite3DGallery'
import { DynamicMasonryView } from './components/DynamicMasonryView'
import { EdgeVeilVignette } from './components/EdgeVeilVignette'
import { GalleryLightbox } from './components/GalleryLightbox'

/**
 * Blossoms 2026–27 Dynamic Masonry CMS & 3D Infinite Gallery
 * Built after Framer's Strata dual-view gallery component.
 */
export default function GalleryPage() {
  const [viewMode, setViewMode] = useState<GalleryViewMode>('infinite-3d')
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null)

  return (
    <div className="relative min-h-[calc(100dvh-64px)] sm:min-h-[92vh] w-full bg-[#0a0a0c] text-white overflow-hidden flex flex-col">
      {/* ── Top Floating Navigation Toolbar ──────────────────────────── */}
      <header className="absolute top-3 sm:top-4 inset-x-0 z-30 px-3 sm:px-6 flex items-center justify-between pointer-events-none">
        {/* Top Left: Dual View Switcher */}
        <div className="pointer-events-auto">
          <ViewSwitcherPill mode={viewMode} onChangeMode={setViewMode} />
        </div>
      </header>

      {/* ── Main Gallery Canvas Stage ─────────────────────────────────── */}
      <main className="relative flex-1 w-full h-full flex items-center justify-center pt-16 sm:pt-14 pb-1 sm:pb-4 overflow-hidden">
        {viewMode === 'infinite-3d' ? (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {/* Top & Edge Atmospheric Lens Shimmer & Vignette */}
            <EdgeVeilVignette backdropColor="#0a0a0c" />

            {/* 3D Infinite Drag & Momentum Canvas (Fixed to 'plain') */}
            <Infinite3DGallery
              photos={FESTIVAL_PHOTOS}
              stance="plain"
              backdropColor="#0a0a0c"
              onSelectPhoto={(idx) => setActivePhotoIndex(idx)}
            />
          </div>
        ) : (
          /* CMS Masonry Responsive View */
          <div className="w-full overflow-y-auto">
            <DynamicMasonryView
              photos={FESTIVAL_PHOTOS}
              onSelectPhoto={(idx) => setActivePhotoIndex(idx)}
            />
          </div>
        )}
      </main>

      {/* ── Fullscreen Interactive Lightbox ───────────────────────────── */}
      <GalleryLightbox
        photos={FESTIVAL_PHOTOS}
        activeIndex={activePhotoIndex}
        onClose={() => setActivePhotoIndex(null)}
        onChangeIndex={setActivePhotoIndex}
      />
    </div>
  )
}
