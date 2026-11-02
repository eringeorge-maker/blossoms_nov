import artsUrl from '@/assets/brand/panel-arts.png'
import literatureUrl from '@/assets/brand/panel-literature.png'
import stageUrl from '@/assets/brand/panel-stage.png'
import theatreUrl from '@/assets/brand/panel-theatre.png'

/** Each export carries part of its neighbour's gutter, so the crop pushes that edge out of the panel. */
const ART = {
  arts: { src: artsUrl, scale: 1.27, wideScale: 1.3, origin: 'left center', position: '0% 100%', widePosition: '0% 64%', height: '100%' },
  literature: { src: literatureUrl, scale: 1.08, wideScale: 1.3, origin: 'center top', position: '70% 0%', widePosition: '70% 0%', height: '100%' },
  stage: { src: stageUrl, scale: 1.18, wideScale: 1.4, origin: 'right top', position: '100% 0%', widePosition: '100% 0%', height: '100%' },
  // Very wide art: sits lower in tall panels so both masks fit, with the title on the category ground above.
  theatre: { src: theatreUrl, scale: 1, wideScale: 1.15, origin: 'center bottom', position: '76% 100%', widePosition: '62% 100%', height: '72%' },
} as const

/** `wide` is for the short, landscape panels of the phone layout. */
export function CategoryArt({ category, wide = false }: { category: keyof typeof ART; wide?: boolean }) {
  const { src, scale, wideScale, origin, position, widePosition, height } = ART[category]
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 w-full object-cover pointer-events-none"
      style={{
        height: wide ? '100%' : height,
        objectPosition: wide ? widePosition : position,
        transform: `scale(${wide ? wideScale : scale})`,
        transformOrigin: origin,
      }}
    />
  )
}
