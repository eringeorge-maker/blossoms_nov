import { useState, useEffect, useRef, useMemo } from 'react'
import type { GalleryPhoto } from '../galleryData'
import type { GalleryStance } from './StanceBarPill'

interface Infinite3DGalleryProps {
  photos: GalleryPhoto[]
  stance: GalleryStance
  backdropColor?: string
  onSelectPhoto: (index: number) => void
}

interface CameraPose {
  depth: number
  x: number
  y: number
  z: number
  zoom: number
}

/**
 * 3D Camera Angles & Stance Poses
 * Extracted directly from Framer Strata's projection engine.
 */
function getPoseForStance(stance: GalleryStance): CameraPose {
  switch (stance) {
    case 'deck':
      return { depth: 1200, x: 55, y: 0, z: 0, zoom: 1 }
    case 'depth':
      return { depth: 420, x: 0, y: 0, z: 0, zoom: 0.82 }
    case 'plain':
      return { depth: 20000, x: 0, y: 0, z: 0, zoom: 1 }
    case 'skew':
      return { depth: 1200, x: 0, y: 0, z: 10, zoom: 0.95 }
    case 'turn':
      return { depth: 1000, x: 0, y: 28, z: 0, zoom: 0.9 }
    case 'sweep':
      return { depth: 850, x: 0, y: -28, z: 0, zoom: 0.9 }
    case 'tilt':
    default:
      return { depth: 1200, x: 20, y: -15, z: 5, zoom: 1 }
  }
}

interface TileItem {
  photo: GalleryPhoto
  originalIndex: number
  height: number
}

interface Lane {
  tiles: TileItem[]
  totalHeight: number
}

/**
 * Distributes photos across columns so lane heights are balanced.
 * Tailored with proportional heights for mobile vs desktop.
 */
function packLanes(photos: GalleryPhoto[], laneCount: number, gap: number, isMobile: boolean): Lane[] {
  const lanes: Lane[] = Array.from({ length: laneCount }, () => ({
    tiles: [],
    totalHeight: 0,
  }))

  photos.forEach((photo, idx) => {
    let tileHeight = 380
    if (isMobile) {
      // Proportional mobile tile heights: 140px to 255px
      if (photo.aspect === 'portrait') {
        tileHeight = 220 + ((idx * 17) % 35) // 220px - 255px
      } else if (photo.aspect === 'landscape') {
        tileHeight = 140 + ((idx * 13) % 25) // 140px - 165px
      } else {
        tileHeight = 175 + ((idx * 11) % 25) // 175px - 200px
      }
    } else {
      // Proportional desktop tile heights: 310px to 530px
      if (photo.aspect === 'portrait') {
        tileHeight = 470 + ((idx * 37) % 60)
      } else if (photo.aspect === 'landscape') {
        tileHeight = 310 + ((idx * 29) % 50)
      } else {
        tileHeight = 380 + ((idx * 19) % 40)
      }
    }

    // Assign to shortest lane
    let shortest = lanes[0]
    for (let i = 1; i < lanes.length; i++) {
      if (lanes[i].totalHeight < shortest.totalHeight) {
        shortest = lanes[i]
      }
    }

    shortest.tiles.push({
      photo,
      originalIndex: idx,
      height: tileHeight,
    })
    shortest.totalHeight += tileHeight + gap
  })

  return lanes
}

export function Infinite3DGallery({
  photos,
  stance,
  backdropColor = '#0a0a0c',
  onSelectPhoto,
}: Infinite3DGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Track responsive viewport width
  const [viewportWidth, setViewportWidth] = useState<number>(() => {
    if (typeof window === 'undefined') return 1200
    return window.innerWidth
  })

  useEffect(() => {
    function handleResize() {
      setViewportWidth(window.innerWidth)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobile = viewportWidth < 640
  const isTablet = viewportWidth >= 640 && viewportWidth < 1024

  const laneCount = isMobile ? 2 : isTablet ? 3 : 4
  const gap = isMobile ? 12 : 24

  // Perfectly calculate lane width on mobile so 2 lanes fit inside screen with padding
  const laneWidth = useMemo(() => {
    if (isMobile) {
      // 12px outer padding each side + gap between lanes
      const calculated = Math.floor((viewportWidth - 24 - gap) / 2)
      return Math.max(140, Math.min(185, calculated))
    }
    if (isTablet) return 220
    return 290
  }, [isMobile, isTablet, viewportWidth, gap])

  const lanes = useMemo(
    () => packLanes(photos, laneCount, gap, isMobile),
    [photos, laneCount, gap, isMobile]
  )

  // Camera pose for current stance
  const pose = useMemo(() => getPoseForStance(stance), [stance])

  // Pan offsets & physics
  const [panOffset, setPanOffset] = useState({ x: 0, y: -200 })
  const offsetRef = useRef({ x: 0, y: -200 })
  const velocityRef = useRef({ x: 0, y: 0 })
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0, time: 0 })
  const totalDragDistanceRef = useRef(0)

  const animIdRef = useRef<number>(0)

  // Physics animation loop for smooth drag momentum & subtle drift
  useEffect(() => {
    function updatePhysics() {
      if (!isDraggingRef.current) {
        // Apply momentum friction
        offsetRef.current.x += velocityRef.current.x
        offsetRef.current.y += velocityRef.current.y

        velocityRef.current.x *= 0.94
        velocityRef.current.y *= 0.94

        // Gentle continuous ambient drift when stopped
        if (Math.abs(velocityRef.current.y) < 0.05 && Math.abs(velocityRef.current.x) < 0.05) {
          offsetRef.current.y -= 0.35 // slow upward floating drift
        }

        setPanOffset({ ...offsetRef.current })
      }

      animIdRef.current = requestAnimationFrame(updatePhysics)
    }

    animIdRef.current = requestAnimationFrame(updatePhysics)
    return () => {
      cancelAnimationFrame(animIdRef.current)
    }
  }, [])

  // Pointer event handlers for pan & inertia
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true
    velocityRef.current = { x: 0, y: 0 }
    totalDragDistanceRef.current = 0
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      offsetX: offsetRef.current.x,
      offsetY: offsetRef.current.y,
      time: performance.now(),
    }
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return

    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y
    const now = performance.now()
    const dt = Math.max(1, now - dragStartRef.current.time)

    totalDragDistanceRef.current += Math.hypot(dx, dy)

    // Calculate instantaneous velocity (px/frame)
    velocityRef.current = {
      x: (dx / dt) * 14,
      y: (dy / dt) * 14,
    }

    offsetRef.current.x = dragStartRef.current.offsetX + dx
    offsetRef.current.y = dragStartRef.current.offsetY + dy
    setPanOffset({ ...offsetRef.current })

    dragStartRef.current.x = e.clientX
    dragStartRef.current.y = e.clientY
    dragStartRef.current.offsetX = offsetRef.current.x
    dragStartRef.current.offsetY = offsetRef.current.y
    dragStartRef.current.time = now
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    try {
      ;(e.target as HTMLElement).releasePointerCapture?.(e.pointerId)
    } catch {
      // ignore
    }
  }

  const handleCardClick = (idx: number) => {
    // If the user was dragging the canvas, do not trigger a photo click
    if (totalDragDistanceRef.current > 8) return
    onSelectPhoto(idx)
  }

  // Camera 3D Transform String with mobile optical adjustment
  const zoomFactor = isMobile ? pose.zoom * 0.95 : pose.zoom
  const transformString = `perspective(${pose.depth}px) rotateX(${pose.x}deg) rotateY(${pose.y}deg) rotateZ(${pose.z}deg) scale(${zoomFactor})`

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="relative w-full h-[calc(100dvh-64px)] sm:h-[88vh] sm:min-h-[640px] max-h-[1050px] overflow-hidden select-none cursor-grab active:cursor-grabbing flex items-center justify-center touch-none"
      style={{ backgroundColor: backdropColor, touchAction: 'none' }}
    >
      {/* ── 3D Scene Viewport ────────────────────────────────────────── */}
      <div
        className="w-full h-full flex items-center justify-center transition-transform duration-700 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: transformString,
          willChange: 'transform',
        }}
      >
        {/* ── Multi-Lane Continuous Canvas ───────────────────────────── */}
        <div
          className="flex justify-center pointer-events-auto"
          style={{
            gap: `${gap}px`,
            width: `${laneCount * laneWidth + (laneCount - 1) * gap}px`,
            maxWidth: '100%',
            transform: `translate3d(${panOffset.x * (isMobile ? 0.25 : 0.4)}px, 0px, 0px)`,
          }}
        >
          {lanes.map((lane, laneIdx) => {
            const laneSpan = Math.max(lane.totalHeight, isMobile ? 500 : 800)
            // Infinite vertical loop wrapping
            const rawY = panOffset.y + (laneIdx % 2 === 1 ? (isMobile ? -60 : -120) : 0) // alternate offset
            const wrappedY = ((rawY % laneSpan) - laneSpan) % laneSpan

            // Render 4 stacked repeats for seamless infinite scrolling
            const repeatCount = 4

            return (
              <div
                key={`lane-${laneIdx}`}
                className="flex flex-col shrink-0"
                style={{
                  gap: `${gap}px`,
                  width: `${laneWidth}px`,
                  minWidth: `${laneWidth}px`,
                  maxWidth: `${laneWidth}px`,
                  transform: `translate3d(0px, ${wrappedY}px, 0px)`,
                  willChange: 'transform',
                }}
              >
                {Array.from({ length: repeatCount }).map((_, repeatIdx) => (
                  <div
                    key={`repeat-${repeatIdx}`}
                    className="flex flex-col"
                    style={{ gap: `${gap}px` }}
                  >
                    {lane.tiles.map(({ photo, originalIndex, height }) => (
                      <div
                        key={`${photo.id}-${repeatIdx}`}
                        onClick={() => handleCardClick(originalIndex)}
                        style={{ height: `${height}px` }}
                        className="group relative w-full rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.6)] cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:border-white/30 hover:shadow-[0_20px_45px_rgba(0,0,0,0.8)]"
                      >
                        <img
                          src={photo.src}
                          alt={photo.title}
                          loading="lazy"
                          draggable={false}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* Subtle dark gradient overlay on hover / tap */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2.5 sm:p-4 text-white">
                          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white/70">
                            {photo.categoryLabel}
                          </span>
                          <h4 className="font-sans font-bold text-xs sm:text-sm text-white leading-tight mt-0.5 truncate">
                            {photo.title}
                          </h4>
                          <span className="text-[10px] sm:text-[11px] text-white/60 truncate mt-0.5">
                            {photo.venue}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
