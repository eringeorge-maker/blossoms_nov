import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import cover1Url from '@/assets/covers/cover-1.jpg'
import cover2Url from '@/assets/covers/cover-2.jpg'
import cover3Url from '@/assets/covers/cover-3.jpg'
import cover4Url from '@/assets/covers/cover-4.jpg'
import cover5Url from '@/assets/covers/cover-5.jpg'
import cover6Url from '@/assets/covers/cover-6.jpg'
import cover7Url from '@/assets/covers/cover-7.jpg'
import cover8Url from '@/assets/covers/cover-8.jpg'
import cover9Url from '@/assets/covers/cover-9.jpg'
import cover10Url from '@/assets/covers/cover-10.jpg'
import cover11Url from '@/assets/covers/cover-11.jpg'
import blossomsLogoUrl from '@/assets/brand/blossoms-2026-27-lockup.webp'
import backdropUrl from '@/assets/brand/opening-backdrop.webp'

const COVERS = [
  cover1Url,
  cover2Url,
  cover3Url,
  cover4Url,
  cover5Url,
  cover6Url,
  cover7Url,
  cover8Url,
  cover9Url,
  cover10Url,
  cover11Url,
]
const FIRST_TURN_MS = 250
const TURN_GAP_MS = 190
const LEAVE_MS = 300
// The whole opening runs 3s. The last flip ends around 2.51s, then a short hold on the logo and the fade out.
const LEAVE_AT_MS = 3000 - LEAVE_MS
const PRELOAD_LIMIT_MS = 2000

// Resets on every full page load, so in-app navigation back to home doesn't replay it.
let playedThisLoad = false

/** Plays once per page load, and never for people who ask for less motion. */
export function shouldPlayOpening(): boolean {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  return !playedThisLoad
}

export function ComicOpening({ onDone }: { onDone: () => void }) {
  const [running, setRunning] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const onDoneRef = useRef(onDone)
  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  // Hold the first flip until the covers can actually show.
  useEffect(() => {
    let cancelled = false
    const start = () => {
      if (!cancelled) setRunning(true)
    }
    const limit = window.setTimeout(start, PRELOAD_LIMIT_MS)
    Promise.all(
      [backdropUrl, ...COVERS].map(
        (src) =>
          new Promise((resolve) => {
            const image = new Image()
            image.onload = resolve
            image.onerror = resolve
            image.src = src
          })
      )
    ).then(start)
    return () => {
      cancelled = true
      window.clearTimeout(limit)
    }
  }, [])

  useEffect(() => {
    if (!running) return
    const timer = window.setTimeout(() => setLeaving(true), LEAVE_AT_MS)
    return () => window.clearTimeout(timer)
  }, [running])

  useEffect(() => {
    if (!leaving) return
    playedThisLoad = true
    const timer = window.setTimeout(() => onDoneRef.current(), LEAVE_MS)
    return () => window.clearTimeout(timer)
  }, [leaving])

  return (
    <div
      className={cn('comic-opening', running && 'comic-opening--running', leaving && 'comic-opening--leaving')}
      style={{ backgroundImage: `url(${backdropUrl})` }}
    >
      <div className="comic-opening-book" aria-hidden="true">
        <div className="comic-opening-page comic-opening-page--last">
          <img src={blossomsLogoUrl} alt="" />
        </div>
        {COVERS.map((src, index) => (
          <div
            key={src}
            className="comic-opening-page comic-opening-page--turn"
            style={{
              zIndex: COVERS.length - index,
              animationDelay: `${FIRST_TURN_MS + TURN_GAP_MS * index}ms`,
            }}
          >
            <img src={src} alt="" />
          </div>
        ))}
      </div>
      <button type="button" className="comic-opening-skip" onClick={() => setLeaving(true)}>
        Skip
      </button>
    </div>
  )
}
