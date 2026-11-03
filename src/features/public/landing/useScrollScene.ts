import { useEffect, type RefObject } from 'react'
import { createScope, createTimeline, type Timeline } from 'animejs'

const HEADER_HEIGHT = 64
// How long the animation takes to catch up with the scroll position. Higher feels heavier and slower.
const CATCH_UP_MS = 260

/**
 * `pin`: progress runs while the section's sticky stage is pinned under the header.
 * `exit`: progress runs while the section scrolls up and out from under the header.
 */
export type ScrollRange = 'pin' | 'exit'

let pendingCleanups: Array<() => void> | null = null

function progressOf(section: HTMLElement, range: ScrollRange) {
  const { top, height } = section.getBoundingClientRect()
  const travel = range === 'pin' ? height - (window.innerHeight - HEADER_HEIGHT) : height
  if (travel <= 0) return top <= HEADER_HEIGHT ? 1 : 0
  return Math.min(1, Math.max(0, (HEADER_HEIGHT - top) / travel))
}

/**
 * A timeline scrubbed by how far `section` has scrolled. It eases towards the scroll position instead of jumping
 * there, so one flick of the wheel glides rather than snaps, and it always settles exactly where the scroll is.
 * Only call it inside a `useScrollScene` build.
 */
export function scrollTimeline(section: HTMLElement, range: ScrollRange = 'pin'): Timeline {
  // No composition: anime's shared-property bookkeeping skips tweens that start later when scrubbing backwards,
  // leaving them stuck. Every follow-up tween on a property therefore states its own from value.
  const timeline = createTimeline({ autoplay: false, defaults: { ease: 'inOutSine', composition: 'none' } })
  let current = progressOf(section, range)
  let frame = 0
  let last = 0

  const step = (now: number) => {
    const target = progressOf(section, range)
    const elapsed = last ? now - last : 16
    last = now
    current += (target - current) * (1 - Math.exp(-elapsed / CATCH_UP_MS))
    if (Math.abs(target - current) < 0.0005) current = target
    timeline.seek(current * timeline.duration)
    frame = current === target ? 0 : window.requestAnimationFrame(step)
    if (!frame) last = 0
  }

  const onScroll = () => {
    if (!frame) frame = window.requestAnimationFrame(step)
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  // Tweens are added after this returns, so the first frame is placed once they exist.
  window.requestAnimationFrame(() => timeline.seek(current * timeline.duration))

  pendingCleanups?.push(() => {
    window.removeEventListener('scroll', onScroll)
    window.cancelAnimationFrame(frame)
  })
  return timeline
}

/**
 * Builds a scroll scene inside `root` and rebuilds it when the viewport width changes, since scenes measure the
 * layout. Height-only resizes (a phone's address bar) are ignored so scrolling never restarts a scene.
 * `build` must be stable (defined outside the component).
 */
export function useScrollScene(root: RefObject<HTMLElement | null>, build: (section: HTMLElement) => void) {
  useEffect(() => {
    const section = root.current
    if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const make = () => {
      const cleanups: Array<() => void> = []
      pendingCleanups = cleanups
      const scope = createScope({ root: section }).add(() => build(section))
      pendingCleanups = null
      return () => {
        cleanups.forEach((cleanup) => cleanup())
        scope.revert()
      }
    }

    let teardown = make()
    let width = window.innerWidth
    let timer = 0
    let active = true

    const rebuild = () => {
      if (!active) return
      teardown()
      teardown = make()
    }

    const onResize = () => {
      if (window.innerWidth === width) return
      width = window.innerWidth
      window.clearTimeout(timer)
      timer = window.setTimeout(rebuild, 200)
    }

    // The display face changes text widths once it loads, and some scenes measure text.
    document.fonts?.ready.then(rebuild)
    window.addEventListener('resize', onResize)
    return () => {
      active = false
      window.removeEventListener('resize', onResize)
      window.clearTimeout(timer)
      teardown()
    }
  }, [root, build])
}
