import { useEffect, useRef } from 'react'

// Each boomerang flies across the screen while the page scrolls through its range (in viewport heights).
const BOOMERANGS = [
  { from: 0.4, span: 0.9, y: 0.28, dir: 1, size: 96 },
  { from: 1.5, span: 1, y: 0.62, dir: -1, size: 80 },
  { from: 2.9, span: 1, y: 0.2, dir: 1, size: 110 },
  { from: 4.4, span: 1, y: 0.7, dir: -1, size: 88 },
  { from: 6.0, span: 1, y: 0.35, dir: 1, size: 100 },
  { from: 7.6, span: 1, y: 0.58, dir: -1, size: 84 },
]

const WEB_ANGLES = [0, 22, 44, 66, 90]
const WEB_RINGS = [40, 80, 120, 160, 200]

const clamp = (value: number) => Math.min(1, Math.max(0, value))

function webPoint(angle: number, radius: number) {
  const rad = (angle * Math.PI) / 180
  return [220 - Math.cos(rad) * radius, Math.sin(rad) * radius] as const
}

// A sagging web ring: each strand between two spokes bows towards the corner.
function ringPath(radius: number) {
  return WEB_ANGLES.map((angle, i) => {
    const [x, y] = webPoint(angle, radius)
    if (i === 0) return `M ${x.toFixed(1)} ${y.toFixed(1)}`
    const [cx, cy] = webPoint((angle + WEB_ANGLES[i - 1]) / 2, radius * 0.9)
    return `Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(' ')
}

function Batarang({ size }: { size: number }) {
  return (
    <svg width={size} viewBox="0 0 120 50" aria-hidden="true">
      <path
        d="M60 8 L68 16 L76 12 L100 3 Q112 13 117 31 Q104 24 94 26 Q84 28 78 38 L72 28 L68 36 L64 28 L60 41 L56 28 L52 36 L48 28 L42 38 Q36 28 26 26 Q16 24 3 31 Q8 13 20 3 L44 12 L52 16 Z"
        fill="#14121a"
        stroke="#aab4c2"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M22 12 Q14 18 11 26" fill="none" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Decoration for the home page, driven by scroll: batarangs spin across the screen and a spider drops
 * down a thread from a web in the corner. Purely visual, so it ignores pointers and is hidden from screen readers.
 */
export function ScrollFx() {
  const container = useRef<HTMLDivElement>(null)
  const boomerangs = useRef<Array<HTMLDivElement | null>>([])
  const thread = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0

    const update = () => {
      frame = 0
      const vh = window.innerHeight
      const vw = window.innerWidth
      const scrolled = window.scrollY / vh
      const narrow = vw < 768

      // Phones: once the animated scenes have scrolled past, fade the decoration out so it never covers
      // the trailer, the info cards or the footer.
      if (container.current) {
        const story = document.querySelector('.flip-story')
        const pastScenes = narrow && story ? story.getBoundingClientRect().bottom < vh * 0.6 : false
        container.current.style.opacity = pastScenes ? '0' : '1'
      }

      BOOMERANGS.forEach((spec, index) => {
        const element = boomerangs.current[index]
        if (!element) return
        const progress = clamp((scrolled - spec.from) / spec.span)
        if (progress <= 0 || progress >= 1) {
          element.style.opacity = '0'
          return
        }
        const scale = narrow ? 0.6 : 1
        const travel = vw + spec.size * 2
        const x = spec.dir === 1 ? -spec.size + progress * travel : vw + spec.size - progress * travel
        // A curved flight path, like a thrown boomerang arcing out and back.
        const y = spec.y * vh + Math.sin(progress * Math.PI) * -vh * 0.12
        element.style.opacity = '1'
        element.style.transform = `translate(${x}px, ${y}px) rotate(${progress * 1080 * spec.dir}deg) scale(${scale})`
      })

      if (thread.current) {
        // The spider lowers as you scroll and bobs back up between sections; on phones it stays near the corner.
        const drop = narrow ? 24 + 40 * Math.abs(Math.sin(scrolled * 0.9)) : 70 + 110 * Math.abs(Math.sin(scrolled * 0.9))
        thread.current.style.setProperty('--drop', `${drop}px`)
      }
    }

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div className="scroll-fx" aria-hidden="true" ref={container}>
      {BOOMERANGS.map((spec, index) => (
        <div
          key={index}
          className="scroll-fx-boomerang"
          ref={(element) => {
            boomerangs.current[index] = element
          }}
        >
          <Batarang size={spec.size} />
        </div>
      ))}

      <svg className="scroll-fx-web" viewBox="0 0 220 220">
        <g stroke="#f4f1ff" strokeOpacity="0.8" strokeWidth="1.6" fill="none" strokeLinecap="round">
          {WEB_ANGLES.map((angle) => {
            const [x, y] = webPoint(angle, 215)
            return <line key={angle} x1="220" y1="0" x2={x} y2={y} />
          })}
          {WEB_RINGS.map((radius) => (
            <path key={radius} d={ringPath(radius)} />
          ))}
        </g>
      </svg>

      <div className="scroll-fx-thread" ref={thread}>
        <span className="scroll-fx-line" />
        <svg className="scroll-fx-spider" viewBox="0 0 60 60">
          <g stroke="#0f0f0f" strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M22 28 L6 16 L2 6 M22 32 L4 32 L0 44 M24 36 L10 50 L8 58 M26 40 L18 56" />
            <path d="M38 28 L54 16 L58 6 M38 32 L56 32 L60 44 M36 36 L50 50 L52 58 M34 40 L42 56" />
          </g>
          <ellipse cx="30" cy="38" rx="11" ry="14" fill="#14121a" stroke="#0f0f0f" strokeWidth="3" />
          <circle cx="30" cy="22" r="8" fill="#14121a" stroke="#0f0f0f" strokeWidth="3" />
          <path d="M30 32 L30 48 M24 38 L36 38" stroke="#e5332a" strokeWidth="3" strokeLinecap="round" />
          <circle cx="27" cy="21" r="2" fill="#fff" />
          <circle cx="33" cy="21" r="2" fill="#fff" />
        </svg>
      </div>
    </div>
  )
}
