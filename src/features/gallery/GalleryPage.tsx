import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  X,
  Share2,
  Download,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { FESTIVAL_PHOTOS, type GalleryPhoto } from './galleryData'

export default function GalleryPage() {
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null)

  const activePhoto = activePhotoIndex !== null ? FESTIVAL_PHOTOS[activePhotoIndex] : null

  const handlePrev = useCallback(() => {
    if (activePhotoIndex === null) return
    setActivePhotoIndex((prev) => (prev! > 0 ? prev! - 1 : FESTIVAL_PHOTOS.length - 1))
  }, [activePhotoIndex])

  const handleNext = useCallback(() => {
    if (activePhotoIndex === null) return
    setActivePhotoIndex((prev) => (prev! < FESTIVAL_PHOTOS.length - 1 ? prev! + 1 : 0))
  }, [activePhotoIndex])

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
      {/* ── Photo Masonry Grid: Only images are displayed ────────────────── */}
      <main className="mx-auto max-w-[1240px] px-4 pt-6 md:pt-10">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {FESTIVAL_PHOTOS.map((photo, index) => (
            <motion.div
              key={photo.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
              className="break-inside-avoid group cursor-pointer"
              onClick={() => setActivePhotoIndex(index)}
            >
              <div className="relative bg-white border-3 border-ink rounded-[16px] overflow-hidden shadow-comic-md transition-all duration-200 group-hover:translate-y-[-4px] group-hover:shadow-comic-lg">
                {/* Photo frame - Pure image display */}
                <div className="overflow-hidden bg-[#e5e5e5]">
                  <img
                    src={photo.src}
                    alt={photo.title}
                    loading="lazy"
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
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
              className="relative max-w-5xl w-full max-h-[92vh] bg-white border-3 border-ink rounded-[20px] overflow-hidden shadow-2xl flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close control */}
              <button
                onClick={handleClose}
                aria-label="Close modal"
                className="absolute top-4 right-4 z-20 p-2 bg-white border-2 border-ink rounded-full text-ink hover:bg-comic-red hover:text-white transition-colors shadow-comic-sm"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Photo View Area */}
              <div className="relative w-full bg-[#0f0f0f] flex items-center justify-center p-3 md:p-6 min-h-[340px] max-h-[82vh]">
                <img
                  src={activePhoto.src}
                  alt={activePhoto.title}
                  className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-lg"
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
                  {activePhotoIndex! + 1} of {FESTIVAL_PHOTOS.length}
                </div>

                {/* Top Action buttons */}
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <a
                    href={activePhoto.src}
                    download={activePhoto.title.toLowerCase().replace(/\s+/g, '-') + '.png'}
                    className="p-2 bg-white/90 hover:bg-white text-ink rounded-full border-2 border-ink shadow-comic-sm transition-transform hover:scale-105 flex items-center justify-center"
                    aria-label="Download image"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleShare(activePhoto)}
                    className="p-2 bg-white/90 hover:bg-white text-ink rounded-full border-2 border-ink shadow-comic-sm transition-transform hover:scale-105 flex items-center justify-center"
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
