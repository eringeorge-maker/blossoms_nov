import { useRef } from 'react'
import { scrollTimeline, useScrollScene } from '@/features/public/landing/useScrollScene'
import boltsUrl from '@/assets/brand/lightning-bolts.png'

const BURST_POINTS = Array.from({ length: 18 }, (_, index) => {
  const angle = (index / 18) * Math.PI * 2
  const radius = index % 2 === 0 ? 158 : 96
  return `${(160 + Math.cos(angle) * radius).toFixed(1)},${(160 + Math.sin(angle) * radius).toFixed(1)}`
}).join(' ')

// Timeline units: the clash is scrubbed by scroll, so these are shares of the section's scroll length.
const IMPACT = 420

function buildClash(section: HTMLElement) {
  const size = section.querySelector<HTMLElement>('.clash-hammer')!.offsetWidth
  const offscreen = window.innerWidth / 2 + size
  // Hammer head and shield rim meet at the centre line.
  const meet = size * 0.44

  scrollTimeline(section)
    .add('.clash-hammer', { x: [-offscreen, -meet], y: [-size * 1.2, 0], rotate: [-620, 18], ease: 'inQuad', duration: IMPACT }, 0)
    .add('.clash-shield', { x: [offscreen, meet], y: [size * 0.5, 0], rotate: [480, 0], ease: 'inQuad', duration: IMPACT }, 0)
    .add('.clash-lines', { opacity: [0, 0.9, 0], duration: IMPACT }, 0)
    .add('.clash-flash', { opacity: [0, 0.85, 0], ease: 'outQuad', duration: 80 }, IMPACT)
    .add('.clash-ring', { scale: [0.2, 4.2], opacity: [1, 0], ease: 'outQuad', duration: 180 }, IMPACT)
    .add('.clash-burst', { opacity: [0, 1], scale: [0, 1.15, 1], rotate: [-40, 0], ease: 'outBack', duration: 100 }, IMPACT)
    .add('.clash-bolts', { opacity: [0, 1], scale: [0.5, 1.1], duration: 90 }, IMPACT + 5)
    .add('.clash-sfx', { opacity: [0, 1], scale: [0.2, 1], rotate: [-24, -8], ease: 'outBack(2)', duration: 110 }, IMPACT + 10)
    .add('.clash-shake', { x: [0, -24, 18, -12, 8, -3, 0], y: [0, 12, -9, 6, -3, 0], ease: 'linear', duration: 130 }, IMPACT)
    // Recoil: both bounce apart and settle while the caption lands.
    .add('.clash-hammer', { x: [-meet, -meet - size * 0.28], rotate: [18, -26], ease: 'outQuad', duration: 240 }, IMPACT + 80)
    .add('.clash-shield', { x: [meet, meet + size * 0.22], rotate: [0, 30], ease: 'outQuad', duration: 240 }, IMPACT + 80)
    .add('.clash-caption', { opacity: [0, 1], y: [40, 0], duration: 170 }, IMPACT + 200)
    // Darken into the comic book section that follows.
    .add('.clash-dim', { opacity: [0, 1], duration: 200 }, 800)
}

function Hammer() {
  return (
    <svg viewBox="0 0 300 320" aria-hidden="true">
      <rect x="34" y="22" width="232" height="128" rx="14" fill="#9aa4b0" stroke="#0f0f0f" strokeWidth="8" />
      <rect x="34" y="22" width="40" height="128" rx="10" fill="#6c7682" stroke="#0f0f0f" strokeWidth="6" />
      <rect x="226" y="22" width="40" height="128" rx="10" fill="#6c7682" stroke="#0f0f0f" strokeWidth="6" />
      <rect x="84" y="36" width="132" height="22" rx="6" fill="#d7dde3" />
      <path d="M96 118 L204 118" stroke="#0f0f0f" strokeWidth="5" strokeLinecap="round" />
      <rect x="128" y="150" width="44" height="132" rx="6" fill="#8a5330" stroke="#0f0f0f" strokeWidth="8" />
      {[176, 202, 228, 254].map((y) => (
        <path key={y} d={`M130 ${y} L170 ${y - 14}`} stroke="#0f0f0f" strokeWidth="5" strokeLinecap="round" />
      ))}
      <rect x="118" y="278" width="64" height="26" rx="8" fill="#6c7682" stroke="#0f0f0f" strokeWidth="7" />
      <path d="M150 304 C120 320 112 318 108 300" fill="none" stroke="#0f0f0f" strokeWidth="6" strokeLinecap="round" />
    </svg>
  )
}

function Shield() {
  return (
    <svg viewBox="0 0 300 300" aria-hidden="true">
      <circle cx="150" cy="150" r="140" fill="#793F98" stroke="#0f0f0f" strokeWidth="8" />
      <circle cx="150" cy="150" r="112" fill="#F8CA16" stroke="#0f0f0f" strokeWidth="6" />
      <circle cx="150" cy="150" r="84" fill="#FDFAF0" stroke="#0f0f0f" strokeWidth="6" />
      <circle cx="150" cy="150" r="58" fill="#793F98" stroke="#0f0f0f" strokeWidth="6" />
      <text
        x="150"
        y="178"
        textAnchor="middle"
        fontFamily="Bangers, Impact, sans-serif"
        fontSize="84"
        fill="#F8CA16"
        stroke="#0f0f0f"
        strokeWidth="5"
        paintOrder="stroke"
      >
        B
      </text>
      <path d="M58 92 A110 110 0 0 1 122 40" fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="10" strokeLinecap="round" />
    </svg>
  )
}

/** Between the hero and the comic book: a thrown hammer slams into a shield as you scroll. */
export function ClashScene() {
  const root = useRef<HTMLElement>(null)
  useScrollScene(root, buildClash)

  return (
    <section ref={root} className="clash" aria-label="Four wings, one festival">
      <div className="clash-stage">
        <div className="clash-shake">
          <svg className="clash-lines" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
            {[120, 220, 300, 380, 470].map((y, index) => (
              <path key={y} d={`M0 ${y} L${420 - index * 30} ${y + 60}`} stroke="#FDFAF0" strokeWidth="6" strokeLinecap="round" />
            ))}
          </svg>
          <span className="clash-ring" aria-hidden="true" />
          <svg className="clash-burst" viewBox="0 0 320 320" aria-hidden="true">
            <polygon points={BURST_POINTS} fill="#F8CA16" stroke="#0f0f0f" strokeWidth="8" strokeLinejoin="round" />
          </svg>
          <img className="clash-bolts" src={boltsUrl} alt="" />
          <div className="clash-hammer">
            <Hammer />
          </div>
          <div className="clash-shield">
            <Shield />
          </div>
          <p className="clash-sfx font-comic-display" aria-hidden="true">
            Kra-koom!
          </p>
        </div>
        <span className="clash-flash" aria-hidden="true" />
        <h2 className="clash-caption font-comic-display comic-title-white">Four wings. One festival.</h2>
        <span className="clash-dim" aria-hidden="true" />
      </div>
    </section>
  )
}
