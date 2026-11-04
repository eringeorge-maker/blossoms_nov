import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { MoveHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import type { GalleryPhoto } from '@/features/gallery/galleryData'

interface ThreeDMediaGalleryProps {
  photos: GalleryPhoto[]
  onSelectPhoto: (index: number) => void
  initialIndex?: number
  className?: string
}

export function ThreeDMediaGallery({
  photos,
  onSelectPhoto,
  initialIndex = 0,
  className = '',
}: ThreeDMediaGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const count = photos.length
  // Angular step between attached adjacent cards along the concave cylinder
  const [stepAngle, setStepAngle] = useState(15.2)
  const [cylinderRadius, setCylinderRadius] = useState(860)
  const [cardWidth, setCardWidth] = useState(230)
  const [cardHeight, setCardHeight] = useState(360)

  // Continuous rotation angle in degrees
  const [rotation, setRotation] = useState(() => initialIndex * 15.2)
  const [isDragging, setIsDragging] = useState(false)

  // Drag & momentum tracking
  const dragStartX = useRef(0)
  const dragStartRotation = useRef(0)
  const lastX = useRef(0)
  const lastTime = useRef(0)
  const velocity = useRef(0)
  const animFrameId = useRef<number | null>(null)
  const hasDragged = useRef(false)

  // Adjust geometry dynamically based on screen width
  useEffect(() => {
    function updateDimensions() {
      const width = window.innerWidth
      if (width < 640) {
        // Mobile screen
        setCardWidth(165)
        setCardHeight(275)
        setCylinderRadius(560)
        setStepAngle(17.5)
      } else if (width < 1024) {
        // Tablet screen
        setCardWidth(200)
        setCardHeight(320)
        setCylinderRadius(720)
        setStepAngle(16.0)
      } else {
        // Desktop widescreen
        setCardWidth(235)
        setCardHeight(365)
        setCylinderRadius(880)
        setStepAngle(15.2)
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Calculate the currently centered active index (0 to count - 1)
  const activeIndex = useMemo(() => {
    if (count === 0) return 0
    const normalized = ((rotation % (count * stepAngle)) + (count * stepAngle)) % (count * stepAngle)
    return Math.round(normalized / stepAngle) % count
  }, [rotation, stepAngle, count])

  // Momentum physics
  const stopMomentum = useCallback(() => {
    if (animFrameId.current !== null) {
      cancelAnimationFrame(animFrameId.current)
      animFrameId.current = null
    }
  }, [])

  const startMomentum = useCallback(() => {
    stopMomentum()

    function step() {
      velocity.current *= 0.93 // Natural smooth friction glide
      if (Math.abs(velocity.current) > 0.04) {
        setRotation((prev) => prev + velocity.current)
        animFrameId.current = requestAnimationFrame(step)
      } else {
        velocity.current = 0
        animFrameId.current = null
      }
    }

    animFrameId.current = requestAnimationFrame(step)
  }, [stopMomentum])

  // Pointer drag event handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    stopMomentum()
    setIsDragging(true)
    hasDragged.current = false
    dragStartX.current = e.clientX
    lastX.current = e.clientX
    lastTime.current = performance.now()
    dragStartRotation.current = rotation
    velocity.current = 0

    if (containerRef.current) {
      try {
        containerRef.current.setPointerCapture(e.pointerId)
      } catch {
        // Safe fallback
      }
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - dragStartX.current
    if (Math.abs(deltaX) > 6) {
      hasDragged.current = true
    }

    const now = performance.now()
    const dt = Math.max(now - lastTime.current, 1)
    const instantVelocity = ((e.clientX - lastX.current) / dt) * 16

    velocity.current = -instantVelocity * 0.16
    lastX.current = e.clientX
    lastTime.current = now

    // Dragging left moves the ribbon forward (increasing rotation)
    const degreeDelta = -(deltaX / 4.8)
    setRotation(dragStartRotation.current + degreeDelta)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return
    setIsDragging(false)

    if (containerRef.current) {
      try {
        containerRef.current.releasePointerCapture(e.pointerId)
      } catch {
        // Safe fallback
      }
    }

    if (Math.abs(velocity.current) > 0.4) {
      startMomentum()
    }
  }

  // Horizontal wheel / trackpad scroll
  const handleWheel = (e: React.WheelEvent) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
    if (Math.abs(delta) > 4) {
      stopMomentum()
      setRotation((prev) => prev + delta * 0.06)
    }
  }

  // Smooth jump to index
  const rotateTo = (index: number) => {
    stopMomentum()
    setRotation(index * stepAngle)
  }

  return (
    <div
      className={`relative w-full flex flex-col items-center select-none overflow-hidden ${className}`}
      onWheel={handleWheel}
    >
      {/* ── 3D Viewport Stage: Concave IMAX Curved Projection ───────── */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-full h-[480px] sm:h-[540px] md:h-[620px] flex items-center justify-center cursor-grab active:cursor-grabbing touch-none overflow-hidden"
        style={{
          perspective: '1000px',
          perspectiveOrigin: '50% 50%',
        }}
      >
        {/* Soft background ambient gradient */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.8)_0%,_rgba(250,248,245,0.4)_70%,_transparent_100%)] opacity-80"
        />

        {/* ── 3D Concave Panoramic Ribbon Container ─────────────────── */}
        <div
          className="relative flex items-center justify-center"
          style={{
            transformStyle: 'preserve-3d',
            width: cardWidth,
            height: cardHeight,
          }}
        >
          {photos.map((photo, index) => {
            // Calculate relative angle to the center camera
            const baseAngle = index * stepAngle
            const totalAngle = baseAngle - rotation

            // Normalize continuous angle to [-180, 180]
            let relativeAngle = ((totalAngle % 360) + 360) % 360
            if (relativeAngle > 180) relativeAngle -= 360

            // Only render cards currently within the concave field of view
            const isVisible = Math.abs(relativeAngle) < 76
            if (!isVisible) return null

            // Inside-out Concave Cylinder Mathematics:
            // Center (relativeAngle = 0): deepest into the screen, facing forward.
            // Sides (relativeAngle != 0): curve FORWARD toward the viewer and flare taller!
            const rad = (relativeAngle * Math.PI) / 180
            const x = cylinderRadius * Math.sin(rad)
            const z = cylinderRadius * (1 - Math.cos(rad)) * 1.12 // Curves forward toward the camera
            const rotY = -relativeAngle // Angled inward toward the center

            // Cards closer to camera get higher zIndex so edges overlap naturally
            const zIndex = Math.round(Math.abs(relativeAngle) * 10)

            return (
              <div
                key={photo.id}
                onClick={(e) => {
                  e.stopPropagation()
                  if (!hasDragged.current) {
                    onSelectPhoto(index)
                  }
                }}
                className="absolute inset-0 group overflow-hidden rounded-[20px] sm:rounded-[24px] md:rounded-[28px] border-2 border-black/10 bg-neutral-900 shadow-[0_16px_36px_rgba(0,0,0,0.3)] transition-shadow duration-300 hover:shadow-[0_24px_48px_rgba(0,0,0,0.45)] cursor-pointer"
                style={{
                  width: cardWidth,
                  height: cardHeight,
                  transform: `translate3d(${x}px, 0px, ${z}px) rotateY(${rotY}deg)`,
                  zIndex,
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                  willChange: 'transform',
                }}
              >
                {/* Pure Full-Bleed Photograph */}
                <img
                  src={photo.src}
                  alt={photo.title}
                  draggable={false}
                  loading={Math.abs(relativeAngle) < 35 ? 'eager' : 'lazy'}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04] pointer-events-none"
                />

                {/* Subtle soft rim-light border on edges */}
                <div className="absolute inset-0 rounded-[inherit] pointer-events-none ring-1 ring-inset ring-white/20" />
              </div>
            )
          })}
        </div>

        {/* ── Floating Pill Badge: "Drag to Explore" (Matching reference) ── */}
        <div className="absolute bottom-6 left-6 z-20 pointer-events-none">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#151515]/85 text-white backdrop-blur-md border border-white/20 shadow-comic-sm">
            <MoveHorizontal className="w-4 h-4 text-[#FFD43B] animate-pulse" />
            <span className="text-xs font-semibold tracking-wider uppercase">
              Drag to Explore
            </span>
          </div>
        </div>

        {/* ── Left / Right Quick Navigation Arrows ─────────────────── */}
        <button
          type="button"
          onClick={() => {
            stopMomentum()
            setRotation((prev) => prev - stepAngle)
          }}
          className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-white/95 hover:bg-white text-ink border-2 border-ink shadow-comic-sm transition-transform active:scale-90 cursor-pointer"
          aria-label="Previous photo"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => {
            stopMomentum()
            setRotation((prev) => prev + stepAngle)
          }}
          className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-white/95 hover:bg-white text-ink border-2 border-ink shadow-comic-sm transition-transform active:scale-90 cursor-pointer"
          aria-label="Next photo"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* ── Minimal Bottom Progress Track & Photo Indicator ───────────── */}
      <div className="mt-2 flex flex-col items-center gap-2 z-10 w-full max-w-xs px-4">
        {/* Interactive Progress Track */}
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const clickX = e.clientX - rect.left
            const percent = Math.max(0, Math.min(1, clickX / rect.width))
            const targetIdx = Math.round(percent * (count - 1))
            rotateTo(targetIdx)
          }}
          className="relative w-full h-1.5 bg-neutral-300/80 rounded-full overflow-hidden border border-black/10 cursor-pointer shadow-inner"
          title="Click to jump to photo"
        >
          <div
            className="absolute top-0 bottom-0 bg-[#151515] rounded-full transition-all duration-150"
            style={{
              width: `${Math.max(100 / count, 10)}%`,
              left: `${(activeIndex / Math.max(count - 1, 1)) * (100 - Math.max(100 / count, 10))}%`,
            }}
          />
        </div>

        {/* Counter readout */}
        <div className="flex items-center gap-2 text-xs font-bold text-ink/70">
          <span>{activeIndex + 1}</span>
          <span className="text-ink/30">/</span>
          <span>{count} Photos</span>
        </div>
      </div>
    </div>
  )
}

export default ThreeDMediaGallery
