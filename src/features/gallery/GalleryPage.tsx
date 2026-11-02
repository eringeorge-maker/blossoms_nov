import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface GalleryPhoto {
  id: string
  src: string
  alt: string
}

const FESTIVAL_PHOTOS: GalleryPhoto[] = [
  { id: 'g1', src: '/gallery/g1.PNG', alt: 'Festival gallery photo 1' },
  { id: 'g2', src: '/gallery/g2.PNG', alt: 'Festival gallery photo 2' },
  { id: 'g3', src: '/gallery/g3.PNG', alt: 'Festival gallery photo 3' },
  { id: 'g4', src: '/gallery/g4.PNG', alt: 'Festival gallery photo 4' },
  { id: 'g5', src: '/gallery/g5.PNG', alt: 'Festival gallery photo 5' },
  { id: 'g6', src: '/gallery/g6.PNG', alt: 'Festival gallery photo 6' },
  { id: 'g7', src: '/gallery/g7.PNG', alt: 'Festival gallery photo 7' },
  { id: 'g8', src: '/gallery/g8.PNG', alt: 'Festival gallery photo 8' },
  { id: 'g9', src: '/gallery/g9.PNG', alt: 'Festival gallery photo 9' },
  { id: 'g10', src: '/gallery/g10.PNG', alt: 'Festival gallery photo 10' },
  { id: 'g11', src: '/gallery/g11.PNG', alt: 'Festival gallery photo 11' },
  { id: 'g12', src: '/gallery/g12.PNG', alt: 'Festival gallery photo 12' },
  { id: 'g13', src: '/gallery/g13.PNG', alt: 'Festival gallery photo 13' },
  { id: 'g14', src: '/gallery/g14.PNG', alt: 'Festival gallery photo 14' },
  { id: 'g15', src: '/gallery/g15.PNG', alt: 'Festival gallery photo 15' },
]

export default function GalleryPage() {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null)

  const handleCloseModal = useCallback(() => {
    setSelectedPhotoIndex(null)
  }, [])

  const handleNextPhoto = useCallback(() => {
    if (selectedPhotoIndex === null) return
    setSelectedPhotoIndex((prev) => (prev! + 1) % FESTIVAL_PHOTOS.length)
  }, [selectedPhotoIndex])

  const handlePrevPhoto = useCallback(() => {
    if (selectedPhotoIndex === null) return
    setSelectedPhotoIndex((prev) =>
      prev! === 0 ? FESTIVAL_PHOTOS.length - 1 : prev! - 1
    )
  }, [selectedPhotoIndex])

  // Keyboard navigation for the modal
  useEffect(() => {
    if (selectedPhotoIndex === null) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseModal()
      if (e.key === 'ArrowRight') handleNextPhoto()
      if (e.key === 'ArrowLeft') handlePrevPhoto()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedPhotoIndex, handleCloseModal, handleNextPhoto, handlePrevPhoto])

  const activePhoto =
    selectedPhotoIndex !== null ? FESTIVAL_PHOTOS[selectedPhotoIndex] : null

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8">
      {/* ── Photo Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {FESTIVAL_PHOTOS.map((photo, index) => (
          <div
            key={photo.id}
            onClick={() => setSelectedPhotoIndex(index)}
            className="group relative aspect-[4/3] w-full rounded-2xl border-3 border-black bg-neutral-900 overflow-hidden shadow-[4px_4px_0px_#111] hover:shadow-[7px_7px_0px_#111] hover:-translate-y-1.5 transition-all duration-200 cursor-pointer"
          >
            <img
              src={photo.src}
              alt={photo.alt}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ))}
      </div>

      {/* ── Lightbox / Fullscreen Modal ── */}
      {activePhoto && selectedPhotoIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={handleCloseModal}
        >
          {/* Modal Container */}
          <div
            className="relative max-w-5xl max-h-[90vh] bg-black border-3 border-white/80 rounded-2xl overflow-hidden shadow-[8px_8px_0px_rgba(0,0,0,0.5)] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-30 p-2.5 rounded-xl bg-white text-black border-2 border-black hover:bg-neutral-200 transition-all shadow-[2px_2px_0px_#111] cursor-pointer"
              title="Close (Esc)"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Prev Button */}
            <button
              type="button"
              onClick={handlePrevPhoto}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-xl bg-white text-black border-2 border-black hover:bg-neutral-200 transition-all shadow-[2px_2px_0px_#111] cursor-pointer"
              title="Previous photo (Left Arrow)"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Next Button */}
            <button
              type="button"
              onClick={handleNextPhoto}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-xl bg-white text-black border-2 border-black hover:bg-neutral-200 transition-all shadow-[2px_2px_0px_#111] cursor-pointer"
              title="Next photo (Right Arrow)"
              aria-label="Next photo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Main Full-Size Image */}
            <img
              src={activePhoto.src}
              alt={activePhoto.alt}
              className="max-w-full max-h-[85vh] object-contain select-none"
            />

            {/* Counter badge */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/75 border border-white/20 text-white text-xs font-mono font-bold px-3 py-1 rounded-full pointer-events-none">
              {selectedPhotoIndex + 1} / {FESTIVAL_PHOTOS.length}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
