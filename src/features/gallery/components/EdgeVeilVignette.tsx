interface EdgeVeilVignetteProps {
  backdropColor?: string
  intensity?: number
}

/**
 * Top horizon chromatic dispersion lens and boundary edge fades:
 * Creates the organic, dreamlike atmospheric lens blur and smooth gradient veils
 * seen at the top and borders of Framer's 3D Infinite Gallery.
 */
export function EdgeVeilVignette({ backdropColor = '#0a0a0c', intensity = 0.85 }: EdgeVeilVignetteProps) {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden select-none" aria-hidden="true">
      {/* ── Top Chromatic Dispersion Lens Strip ─────────────────────── */}
      <div
        className="absolute top-0 inset-x-0 h-32 md:h-44 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255, 60, 100, 0.18), rgba(0, 180, 255, 0.14) 40%, rgba(255, 220, 80, 0.12) 70%, transparent 100%)`,
          filter: 'blur(28px)',
          transform: 'translateY(-20%)',
          opacity: intensity,
        }}
      />

      {/* ── Top Horizon Deep Vignette Fade ──────────────────────────── */}
      <div
        className="absolute top-0 inset-x-0 h-28 md:h-36 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, ${backdropColor} 20%, rgba(10, 10, 12, 0.6) 60%, transparent 100%)`,
        }}
      />

      {/* ── Bottom Horizon Deep Vignette Fade ───────────────────────── */}
      <div
        className="absolute bottom-0 inset-x-0 h-28 md:h-36 pointer-events-none"
        style={{
          background: `linear-gradient(to top, ${backdropColor} 20%, rgba(10, 10, 12, 0.6) 60%, transparent 100%)`,
        }}
      />

      {/* ── Left Edge Subtle Falloff ─────────────────────────────────── */}
      <div
        className="absolute inset-y-0 left-0 w-16 md:w-28 pointer-events-none"
        style={{
          background: `linear-gradient(to right, ${backdropColor} 0%, transparent 100%)`,
          opacity: 0.7,
        }}
      />

      {/* ── Right Edge Subtle Falloff ────────────────────────────────── */}
      <div
        className="absolute inset-y-0 right-0 w-16 md:w-28 pointer-events-none"
        style={{
          background: `linear-gradient(to left, ${backdropColor} 0%, transparent 100%)`,
          opacity: 0.7,
        }}
      />
    </div>
  )
}
