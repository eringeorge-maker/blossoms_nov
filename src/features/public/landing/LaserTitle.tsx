import { useRef } from 'react'
import { scrollTimeline, useScrollScene } from '@/features/public/landing/useScrollScene'
import heroUrl from '@/assets/brand/hero-b.jpg'

export const LASER_TITLE_ID = 'landing-about-title'

const EYES = [0, 1]
// The beams take their time: eyes charge, beams reach the title, then a long slow burn across it.
const FIRE_AT = 340
const SWEEP_AT = 560
const SWEEP_LENGTH = 560

function centreOf(element: Element, origin: DOMRect) {
  const rect = element.getBoundingClientRect()
  return { x: rect.left + rect.width / 2 - origin.left, y: rect.top + rect.height / 2 - origin.top }
}

function buildLaser(section: HTMLElement) {
  const stage = section.querySelector('.laser-stage')!
  const origin = stage.getBoundingClientRect()
  const title = section.querySelector('.laser-title')!.getBoundingClientRect()
  const beams = section.querySelector('.laser-beams')!
  const eyes = Array.from(section.querySelectorAll('.laser-eye'), (eye) => centreOf(eye, origin))

  // Beams are drawn in the stage's own pixel space, measured with the face panel at rest.
  beams.setAttribute('viewBox', `0 0 ${origin.width} ${origin.height}`)
  const targetY = title.top + title.height / 2 - origin.top
  const startX = title.left - origin.left
  const endX = title.right - origin.left

  const timeline = scrollTimeline(section)
    .add('.laser-stage, .laser-cover', { backgroundColor: ['#2b1238', '#793F98'], duration: 320 }, 0)
    .add('.laser-face', { x: ['-70%', '0%'], opacity: [0, 1], rotate: [-12, -2], ease: 'outQuad', duration: 200 }, 0)
    .add('.laser-eye', { opacity: [0, 1], scale: [0, 1.3, 1], duration: 160 }, 180)
    .add('.laser-beam', { opacity: [0, 1], duration: 60 }, FIRE_AT)

  EYES.forEach((index) => {
    const { x, y } = eyes[index]
    section.querySelectorAll(`.laser-beam[data-eye="${index}"]`).forEach((line) => {
      line.setAttribute('x1', String(x))
      line.setAttribute('y1', String(y))
    })
    timeline.add(`.laser-beam[data-eye="${index}"]`, { x2: [x, startX], y2: [y, targetY], ease: 'outQuad', duration: SWEEP_AT - FIRE_AT }, FIRE_AT)
  })

  timeline
    .add('.laser-beam', { x2: [startX, endX], duration: SWEEP_LENGTH }, SWEEP_AT)
    .add('.laser-cover', { scaleX: [1, 0], duration: SWEEP_LENGTH }, SWEEP_AT)
    .add('.laser-spark', { opacity: [0, 1], x: [startX, endX], y: [targetY, targetY], duration: SWEEP_LENGTH }, SWEEP_AT)
    .add('.laser-beam, .laser-spark', { opacity: [1, 0], duration: 90 }, SWEEP_AT + SWEEP_LENGTH)
    .add('.laser-eye', { opacity: [1, 0], duration: 130 }, SWEEP_AT + SWEEP_LENGTH + 20)
    // The burnt-in title cools from hot yellow to white.
    .add('.laser-title', { color: ['#FFD43B', '#FFFFFF'], duration: 160 }, SWEEP_AT + SWEEP_LENGTH)
    .add('.laser-lede', { opacity: [0, 1], y: [24, 0], duration: 150 }, SWEEP_AT + SWEEP_LENGTH + 40)
}

/** Opens the about section: the hero's laser eyes burn the heading in as you scroll. */
export function LaserTitle() {
  const root = useRef<HTMLElement>(null)
  useScrollScene(root, buildLaser)

  return (
    <section ref={root} className="laser" aria-labelledby={LASER_TITLE_ID}>
      <div className="laser-stage">
        <div className="laser-face">
          <div className="laser-face-art">
            <img src={heroUrl} alt="" />
            <span className="laser-eye" style={{ left: '43.6%', top: '29.3%' }} aria-hidden="true" />
            <span className="laser-eye" style={{ left: '51.8%', top: '29.1%' }} aria-hidden="true" />
          </div>
        </div>

        <div className="laser-copy">
          <h2 id={LASER_TITLE_ID} className="laser-title font-comic-display comic-title-white">
            About Blossoms
            <span className="laser-cover" aria-hidden="true" />
          </h2>
          <p className="laser-lede">
            Blossoms is the annual cultural festival of CHRIST (Deemed to be University), Central Campus. It
            celebrates student creativity, artistic expression and the culture of the CHRIST community.
          </p>
        </div>

        <svg className="laser-beams" aria-hidden="true">
          {EYES.map((index) => (
            <g key={index}>
              <line className="laser-beam laser-beam--glow" data-eye={index} />
              <line className="laser-beam laser-beam--core" data-eye={index} />
            </g>
          ))}
        </svg>
        <span className="laser-spark" aria-hidden="true" />
      </div>
    </section>
  )
}
