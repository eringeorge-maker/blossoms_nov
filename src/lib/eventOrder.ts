import type { Event } from '@/types'

// Display order inside each category, as listed in "Blossoms 26 Event heads.pdf".
const EVENT_ORDER = [
  'digital-poster-making', 'greeting-card', 'pot-art', 'pencil-sketching', 'reel-making', 'collage',
  'mehendi-design', 'rangoli-design', 'painting', 'photography',
  'quiz', 'pot-pourri', 'extempore', 'dumb-charades', 'air-crash-shipwreck', 'debate', 'jam', 'creative-writing',
  'impulse', 'indian-dance-classical-group', 'non-theme', 'bob-w', 'bob-i', 'western-acoustic',
  'western-singing-solo', 'indian-folk-film-singing-solo', 'dance-duet',
  'mono-act', 'proscenium', 'street-play', 'short-film-making', 'mime',
]

export function eventOrderIndex(e: Pick<Event, 'slug'>): number {
  const i = EVENT_ORDER.indexOf(e.slug)
  return i === -1 ? 99 : i
}
