import heroUrl from '@/assets/brand/hero-b.jpg'
import burstUrl from '@/assets/brand/bg-purple-burst.png'
import boltsUrl from '@/assets/brand/lightning-bolts.png'
import lockupUrl from '@/assets/brand/blossoms-2026-27-lockup.png'
import artsUrl from '@/assets/brand/panel-arts.png'
import literatureUrl from '@/assets/brand/panel-literature.png'
import stageUrl from '@/assets/brand/panel-stage.png'
import theatreUrl from '@/assets/brand/panel-theatre.png'

const LANDING_IMAGES = [heroUrl, burstUrl, boltsUrl, lockupUrl, artsUrl, literatureUrl, stageUrl, theatreUrl]

let pending: Promise<void> | null = null

/** Loads every landing image and the display face once; later calls share the same promise. */
export function preloadLanding(): Promise<void> {
  pending ??= Promise.all([
    ...LANDING_IMAGES.map(
      (src) =>
        new Promise<void>((resolve) => {
          const image = new Image()
          image.onload = () => resolve()
          image.onerror = () => resolve()
          image.src = src
        })
    ),
    document.fonts?.ready,
  ]).then(() => undefined)
  return pending
}
