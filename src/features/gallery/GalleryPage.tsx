import { useState, useMemo, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  Camera,
  MapPin,
  Calendar,
  Share2,
  Download,
  Filter,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { DisplayText } from '@/components/comic/ComicPrimitives'
import { FESTIVAL_PHOTOS, type GalleryPhoto } from './galleryData'

type CategoryFilter = 'all' | 'arts' | 'stage' | 'literature' | 'campus'

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all')
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null)

  const filteredPhotos = useMemo(() => {
    if (selectedCategory === 'all') return FESTIVAL_PHOTOS
    return FESTIVAL_PHOTOS.filter((p) => p.category === selectedCategory)
  }, [selectedCategory])

  const activePhoto = activePhotoIndex !== null ? filteredPhotos[activePhotoIndex] : null

  const handlePrev = useCallback(() => {
    if (activePhotoIndex === null) return
    setActivePhotoIndex((prev) => (prev! > 0 ? prev! - 1 : filteredPhotos.length - 1))
  }, [activePhotoIndex, filteredPhotos.length])

  const handleNext = useCallback(() => {
    if (activePhotoIndex === null) return
    setActivePhotoIndex((prev) => (prev! < filteredPhotos.length - 1 ? prev! + 1 : 0))
  }, [activePhotoIndex, filteredPhotos.length])

  const handleClose = useCallback(() => {
    setActivePhotoIndex(null)
  }, [])

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (activePhotoIndex === null) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activePhotoIndex, handleClose, handleNext, handlePrev])

  function handleShare(photo: GalleryPhoto) {
    if (navigator.share) {
      navigator
        .share({
          title: `Blossoms '26: ${photo.title}`,
          text: photo.caption,
          url: window.location.href,
        })
        .catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Gallery link copied to clipboard!')
    }
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-ink pb-20">
      {/* ── Comic Hero Banner ─────────────────────────────────── */}
      <section className="relative border-b-3 border-ink bg-gradient-to-r from-primary/10 via-comic-yellow/20 to-comic-red/10 py-12 px-4 overflow-hidden">
        {/* Halftone dot pattern overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #0f0f0f 1.5px, transparent 1.5px)',
            backgroundSize: '18px 18px',
          }}
        />

        <div className="relative z-10 mx-auto max-w-[1240px]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-comic-yellow border-2 border-ink px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-comic-sm mb-3">
                <Camera className="w-3.5 h-3.5" />
                <span>Blossoms Visual Anthology · 2026–27</span>
              </div>
              <DisplayText as="h1" className="text-4xl md:text-5xl lg:text-6xl text-ink tracking-tight">
                FESTIVAL GALLERY
              </DisplayText>
              <p className="mt-2 max-w-2xl text-ink/80 text-base md:text-lg">
                Raw energy, stage spotlights, and student craft from the Department of Commerce, CHRIST (Deemed to be University) Central Campus.
              </p>
            </div>

            {/* Quick stats badge cluster */}
            <div className="flex items-center gap-3">
              <div className="bg-white border-2 border-ink rounded-[14px] p-3 shadow-comic-sm text-center min-w-[90px]">
                <div className="font-display text-2xl text-primary font-bold">15</div>
                <div className="text-[11px] font-bold text-ink/70 uppercase">Snaps</div>
              </div>
              <div className="bg-white border-2 border-ink rounded-[14px] p-3 shadow-comic-sm text-center min-w-[90px]">
                <div className="font-display text-2xl text-comic-red font-bold">4</div>
                <div className="text-[11px] font-bold text-ink/70 uppercase">Arenas</div>
              </div>
              <div className="bg-comic-yellow border-2 border-ink rounded-[14px] p-3 shadow-comic-sm text-center min-w-[90px]">
                <div className="font-display text-2xl text-ink font-bold">DOC</div>
                <div className="text-[11px] font-bold text-ink/80 uppercase">Central</div>
              </div>
            </div>
          </div>

          {/* ── Filter Tabs ───────────────────────────────────── */}
          <div className="mt-8 flex flex-wrap items-center gap-2 pt-4 border-t-2 border-ink/10">
            <span className="text-xs font-bold uppercase tracking-wider text-ink/60 flex items-center gap-1.5 mr-2">
              <Filter className="w-3.5 h-3.5" /> Filter by Arena:
            </span>

            {[
              { id: 'all', label: 'All Snaps', count: FESTIVAL_PHOTOS.length },
              { id: 'arts', label: 'Arts & Design', count: FESTIVAL_PHOTOS.filter((p) => p.category === 'arts').length },
              { id: 'stage', label: 'Stage & Performance', count: FESTIVAL_PHOTOS.filter((p) => p.category === 'stage').length },
              { id: 'literature', label: 'Literature & Oratory', count: FESTIVAL_PHOTOS.filter((p) => p.category === 'literature').length },
              { id: 'campus', label: 'Campus Vibes', count: FESTIVAL_PHOTOS.filter((p) => p.category === 'campus').length },
            ].map((tab) => {
              const isActive = selectedCategory === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id as CategoryFilter)}
                  className={`cursor-pointer px-4 py-1.5 text-xs font-bold rounded-full border-2 border-ink transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-ink text-white shadow-comic-sm translate-y-[-1px]'
                      : 'bg-white text-ink hover:bg-comic-yellow/40'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-comic-yellow text-ink' : 'bg-ink/10 text-ink/70'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Photo Masonry Grid ─────────────────────────────────── */}
      <main className="mx-auto max-w-[1240px] px-4 pt-10">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {filteredPhotos.map((photo, index) => (
            <motion.div
              key={photo.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
              className="break-inside-avoid group cursor-pointer"
              onClick={() => setActivePhotoIndex(index)}
            >
              <div className="relative bg-white border-3 border-ink rounded-[16px] overflow-hidden shadow-comic-md transition-all duration-200 group-hover:translate-y-[-4px] group-hover:shadow-comic-lg">
                {/* Comic tape or corner label */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                  <span className="bg-comic-yellow/95 backdrop-blur-sm text-ink text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-ink shadow-sm uppercase tracking-wide">
                    {photo.tag}
                  </span>
                </div>

                {/* Quick zoom button */}
                <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    aria-label="Expand photo"
                    className="p-2 bg-ink/80 text-white rounded-full hover:bg-ink backdrop-blur-sm shadow"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Photo frame */}
                <div className="overflow-hidden bg-[#e5e5e5]">
                  <img
                    src={photo.src}
                    alt={photo.title}
                    loading="lazy"
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>

                {/* Caption Strip */}
                <div className="p-4 bg-white border-t-2 border-ink">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-lg text-ink font-bold tracking-tight line-clamp-1">
                      {photo.title}
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {photo.categoryLabel.split(' ')[0]}
                    </span>
                  </div>
                  <p className="text-xs text-ink/70 mt-1 line-clamp-2 leading-relaxed">
                    {photo.caption}
                  </p>
                  <div className="mt-3 pt-2.5 border-t border-ink/10 flex items-center justify-between text-[11px] text-ink/60">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-comic-red" />
                      <span className="line-clamp-1">{photo.venue}</span>
                    </span>
                    <span className="font-bold text-ink/80 group-hover:text-primary transition-colors">
                      View Snap →
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* ── Interactive Lightbox Modal ────────────────────────── */}
      <AnimatePresence>
        {activePhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 md:p-6"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-w-5xl w-full max-h-[92vh] bg-white border-3 border-ink rounded-[20px] overflow-hidden shadow-2xl flex flex-col md:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top controls (Mobile & Desktop) */}
              <button
                onClick={handleClose}
                aria-label="Close modal"
                className="absolute top-4 right-4 z-20 p-2 bg-white border-2 border-ink rounded-full text-ink hover:bg-comic-red hover:text-white transition-colors shadow-comic-sm"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Photo View Area */}
              <div className="relative flex-1 bg-[#0f0f0f] flex items-center justify-center p-3 md:p-6 min-h-[340px] max-h-[60vh] md:max-h-[85vh]">
                <img
                  src={activePhoto.src}
                  alt={activePhoto.title}
                  className="max-h-full max-w-full object-contain rounded-lg shadow-lg"
                />

                {/* Left/Right arrow overlay buttons */}
                <button
                  onClick={handlePrev}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 hover:bg-white text-ink rounded-full border-2 border-ink shadow-comic-sm transition-transform hover:scale-105"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 hover:bg-white text-ink rounded-full border-2 border-ink shadow-comic-sm transition-transform hover:scale-105"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <div className="absolute bottom-3 left-3 bg-black/75 text-white text-[11px] px-3 py-1 rounded-full font-bold">
                  {activePhotoIndex! + 1} of {filteredPhotos.length}
                </div>
              </div>

              {/* Photo Details Sidebar / Bottom Panel */}
              <div className="w-full md:w-[360px] p-6 flex flex-col justify-between bg-white border-t-3 md:border-t-0 md:border-l-3 border-ink overflow-y-auto max-h-[40vh] md:max-h-none">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-comic-yellow text-ink text-xs font-bold px-2.5 py-0.5 rounded-full border border-ink shadow-sm">
                      {activePhoto.tag}
                    </span>
                    <span className="text-xs font-bold text-primary">
                      {activePhoto.categoryLabel}
                    </span>
                  </div>

                  <DisplayText as="h2" className="text-2xl text-ink font-bold leading-tight">
                    {activePhoto.title}
                  </DisplayText>

                  <div className="mt-3 space-y-2 text-xs text-ink/75">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-comic-red shrink-0" />
                      <span className="font-semibold">{activePhoto.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary shrink-0" />
                      <span>Blossoms Cultural Festival 2026–27</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-[#faf8f5] border-2 border-ink rounded-[12px] shadow-comic-sm">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-ink/60 mb-1">
                      Anthology Note
                    </div>
                    <p className="text-xs text-ink/90 leading-relaxed font-body">
                      {activePhoto.caption}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-4 border-t-2 border-ink/10 flex items-center gap-3">
                  <a
                    href={activePhoto.src}
                    download={activePhoto.title.toLowerCase().replace(/\s+/g, '-') + '.png'}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-comic-yellow text-ink font-bold text-xs rounded-full border-2 border-ink shadow-comic-sm hover:translate-y-[-1px] transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                  <button
                    onClick={() => handleShare(activePhoto)}
                    className="p-2.5 bg-white text-ink rounded-full border-2 border-ink shadow-comic-sm hover:bg-comic-yellow/30 transition-colors"
                    aria-label="Share photo"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
