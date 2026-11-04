export type GalleryStance = 'tilt' | 'deck' | 'depth' | 'plain' | 'skew' | 'turn' | 'sweep'

export interface StanceOption {
  key: GalleryStance
  label: string
}

const STANCES: StanceOption[] = [
  { key: 'tilt', label: 'Tilt' },
  { key: 'deck', label: 'Deck' },
  { key: 'depth', label: 'Depth' },
  { key: 'plain', label: 'Plain' },
  { key: 'skew', label: 'Skew' },
  { key: 'turn', label: 'Turn' },
  { key: 'sweep', label: 'Sweep' },
]

interface StanceBarPillProps {
  activeStance: GalleryStance
  onSelectStance: (stance: GalleryStance) => void
}

/**
 * Top-center floating stance selector pill:
 * [Tilt | Deck | Depth | Plain | Skew | Turn | Sweep]
 * Matches the Framer Strata stance bar with clean pill buttons and smooth active indicator.
 */
export function StanceBarPill({ activeStance, onSelectStance }: StanceBarPillProps) {
  return (
    <div
      role="group"
      aria-label="3D Perspective Presets"
      className="inline-flex items-center gap-1 p-1 bg-black/60 backdrop-blur-xl border border-white/15 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] select-none overflow-x-auto max-w-[92vw] scrollbar-none transition-all duration-200"
    >
      {STANCES.map((stance) => {
        const isActive = stance.key === activeStance
        return (
          <button
            key={stance.key}
            type="button"
            onClick={() => onSelectStance(stance.key)}
            aria-pressed={isActive}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer active:scale-95 ${
              isActive
                ? 'bg-white text-[#0f0f11] shadow-[0_2px_12px_rgba(255,255,255,0.25)]'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            {stance.label}
          </button>
        )
      })}
    </div>
  )
}
