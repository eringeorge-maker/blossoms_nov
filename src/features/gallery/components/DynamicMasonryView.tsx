import { useState, useMemo } from 'react'
import type { GalleryPhoto } from '../galleryData'

interface DynamicMasonryViewProps {
  photos: GalleryPhoto[]
  onSelectPhoto: (index: number) => void
}

const CATEGORIES = [
  { key: 'all', label: 'All Photos' },
  { key: 'arts', label: 'Fine Arts' },
  { key: 'stage', label: 'Stage & Dance' },
  { key: 'literature', label: 'Literature & Quiz' },
  { key: 'campus', label: 'Campus Energy' },
]

export function DynamicMasonryView({ photos, onSelectPhoto }: DynamicMasonryViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredPhotos = useMemo(() => {
    if (selectedCategory === 'all') return photos
    return photos.filter((p) => p.category === selectedCategory)
  }, [photos, selectedCategory])

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* ── Category Filter Bar ──────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-1.5 flex-wrap mb-8">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.key
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-white text-black shadow-md'
                  : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
              }`}
            >
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* ── Responsive Masonry Columns ───────────────────────────────── */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-5 space-y-5">
        {filteredPhotos.map((photo) => {
          const originalIndex = photos.findIndex((p) => p.id === photo.id)
          return (
            <div
              key={photo.id}
              onClick={() => onSelectPhoto(originalIndex)}
              className="group relative break-inside-avoid rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 cursor-pointer shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-white/30 hover:shadow-2xl"
            >
              <img
                src={photo.src}
                alt={photo.title}
                loading="lazy"
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
