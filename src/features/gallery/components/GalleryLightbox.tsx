import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, Download, Share2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { GalleryPhoto } from '../galleryData'

interface GalleryLightboxProps {
  photos: GalleryPhoto[]
  activeIndex: number | null
  onClose: () => void
  onChangeIndex: (index: number) => void
}

export function GalleryLightbox({
  photos,
  activeIndex,
  onClose,
  onChangeIndex,
}: GalleryLightboxProps) {
  const activePhoto = activeIndex !== null ? photos[activeIndex] : null

  const handlePrev = useCallback(() => {
    if (activeIndex === null) return
    onChangeIndex(activeIndex > 0 ? activeIndex - 1 : photos.length - 1)
  }, [activeIndex, onChangeIndex, photos.length])

  const handleNext = useCallback(() => {
    if (activeIndex === null) return
    onChangeIndex(activeIndex < photos.length - 1 ? activeIndex + 1 : 0)
  }, [activeIndex, onChangeIndex, photos.length])

  // Keyboard navigation
  useEffect(() => {
    if (activeIndex === null) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeIndex, onClose, handleNext, handlePrev])

  const handleShare = () => {
    if (!activePhoto) return
    if (navigator.share) {
      navigator
        .share({
          title: `Blossoms '26: ${activePhoto.title}`,
          text: activePhoto.caption,
          url: window.location.href,
        })
        .catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Gallery link copied to clipboard!')
    }
  }

  return (
    <AnimatePresence>
      {activePhoto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 md:p-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative max-w-5xl w-full max-h-[92vh] bg-[#111115] border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Toolbar */}
            <div className="w-full flex items-center justify-between p-4 border-b border-white/10 z-20 bg-black/40">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/10 text-white/90">
                  {activePhoto.categoryLabel}
                </span>
                <span className="text-xs text-white/50 hidden sm:inline">•</span>
                <span className="text-xs text-white/70 hidden sm:inline">{activePhoto.venue}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Share photo"
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <a
                  href={activePhoto.src}
                  download={`${activePhoto.id}.png`}
                  aria-label="Download photo"
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close modal"
                  className="p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Photo Viewing Stage */}
            <div className="relative w-full flex-1 flex items-center justify-center p-4 md:p-6 min-h-[300px] max-h-[72vh] overflow-hidden">
              <img
                src={activePhoto.src}
                alt={activePhoto.title}
                className="max-h-[66vh] max-w-full object-contain rounded-xl shadow-2xl"
              />

              {/* Prev / Next overlay arrows */}
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous photo"
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-white text-white hover:text-black rounded-full border border-white/20 shadow-xl transition-all cursor-pointer active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next photo"
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-white text-white hover:text-black rounded-full border border-white/20 shadow-xl transition-all cursor-pointer active:scale-95"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Bottom Details Footer */}
            <div className="w-full p-4 border-t border-white/10 bg-black/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-white">
              <div className="min-w-0">
                <h3 className="font-sans font-bold text-base text-white truncate">
                  {activePhoto.title}
                </h3>
                <p className="text-xs text-white/70 line-clamp-1 mt-0.5">{activePhoto.caption}</p>
              </div>
              <div className="text-xs text-white/40 shrink-0">
                {activeIndex! + 1} / {photos.length}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
