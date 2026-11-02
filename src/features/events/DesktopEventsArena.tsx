import { Link } from 'react-router-dom'
import type { ComponentType } from 'react'
import { Search } from 'lucide-react'
import {
  ArtsIllustration,
  LiteratureIllustration,
  SpecialEventsIllustration,
  StageIllustration,
  TheatreIllustration,
} from '@/components/comic/CategoryIllustrations'
import { EventCardSkeleton } from '@/components/ui/Skeleton'
import { cn, formatSlot } from '@/lib/utils'
import type { Event } from '@/types'

interface ArenaCategory {
  slug: string
  title: string
  tagline: string
  bgHex: string
  clipPath: string
  Illustration: ComponentType<{ className?: string }>
}

const ARENA_CATEGORIES: ArenaCategory[] = [
  {
    slug: 'arts',
    title: 'ARTS',
    tagline: 'PAINT. DESIGN. EXPRESS.',
    bgHex: '#ed1e79',
    clipPath: 'polygon(0% 0%, 95% 2%, 100% 100%, 0% 97%)',
    Illustration: ArtsIllustration,
  },
  {
    slug: 'literature',
    title: 'LITERATURE',
    tagline: 'SPEAK. WRITE. THINK.',
    bgHex: '#0088e8',
    clipPath: 'polygon(0% 2%, 95% 4%, 100% 97%, 5% 100%)',
    Illustration: LiteratureIllustration,
  },
  {
    slug: 'stage',
    title: 'STAGE',
    tagline: 'PERFORM. INSPIRE.',
    bgHex: '#fdb813',
    clipPath: 'polygon(0% 4%, 95% 0%, 100% 100%, 5% 97%)',
    Illustration: StageIllustration,
  },
  {
    slug: 'theatre',
    title: 'THEATRE',
    tagline: 'ACT. IMAGINE. BRING STORIES ALIVE.',
    bgHex: '#861ec2',
    clipPath: 'polygon(0% 0%, 95% 3%, 100% 98%, 5% 100%)',
    Illustration: TheatreIllustration,
  },
  {
    slug: 'special-events',
    title: 'SPECIAL',
    tagline: 'CEREMONIES. BATTLES. FINALE.',
    bgHex: '#00966b',
    clipPath: 'polygon(0% 3%, 100% 0%, 100% 100%, 5% 98%)',
    Illustration: SpecialEventsIllustration,
  },
]

const FORMAT_LABELS: Record<string, string> = {
  individual: 'Solo',
  team: 'Team',
}

function EventPanel({ event, onRegister }: { event: Event; onRegister: (id: string) => void }) {
  const firstSlot = event.schedule_slots?.[0]

  return (
    <article className="bg-white border-[3px] border-[#0f0f0f] rounded-[10px] p-4 flex flex-col">
      <span className="self-start bg-[#f8ca16] border-[2px] border-[#0f0f0f] px-2 py-0.5 text-[12px] font-bold text-[#0f0f0f]">
        {FORMAT_LABELS[event.event_format] ?? 'Solo or team'}
      </span>
      <h3 className="font-comic-display text-[28px] leading-[1.05] text-[#0f0f0f] mt-2">
        {event.title}
      </h3>
      <p className="text-[14px] leading-snug text-neutral-700 mt-1 line-clamp-3">
        {event.description}
      </p>
      <dl className="mt-auto pt-3 text-[13px] font-semibold text-neutral-700 space-y-0.5">
        <div>
          <dt className="sr-only">When</dt>
          <dd>{firstSlot?.starts_at ? formatSlot(firstSlot.starts_at, firstSlot.ends_at) : 'Date to be announced'}</dd>
        </div>
        <div>
          <dt className="sr-only">Where</dt>
          <dd>{firstSlot?.venue?.name ?? 'Venue to be announced'}</dd>
        </div>
      </dl>
      <div className="mt-3 pt-3 border-t-[2px] border-[#0f0f0f]/15 flex items-center justify-between gap-3">
        <Link
          to={`/events/${event.slug}`}
          className="text-[14px] font-bold text-[#0f0f0f] underline underline-offset-2 hover:text-[#df1b23]"
        >
          See rules
        </Link>
        <button
          type="button"
          onClick={() => onRegister(event.id)}
          className="bg-[#f8ca16] hover:bg-[#df1b23] hover:text-white border-[2.5px] border-[#0f0f0f] px-4 py-1 font-comic-sub text-[17px] text-[#0f0f0f] cursor-pointer active:scale-95 focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#0f0f0f]"
        >
          REGISTER
        </button>
      </div>
    </article>
  )
}

interface DesktopEventsArenaProps {
  activeCategory: string
  search: string
  isLoading: boolean
  eventCount: number
  eventsByCategory: Record<string, Event[]>
  onCategoryChange: (slug: string) => void
  onSearchChange: (value: string) => void
  onRegister: (id: string) => void
}

/** Desktop events page in the mobile home's comic language: slanted panels pick the category. */
export default function DesktopEventsArena({
  activeCategory,
  search,
  isLoading,
  eventCount,
  eventsByCategory,
  onCategoryChange,
  onSearchChange,
  onRegister,
}: DesktopEventsArenaProps) {
  const visibleCategories = ARENA_CATEGORIES.filter(
    ({ slug }) =>
      (activeCategory === 'all' || activeCategory === slug) && (eventsByCategory[slug]?.length ?? 0) > 0
  )

  return (
    <div className="hidden md:block w-full min-h-[calc(100vh-95px)] bg-[#793f98] halftone-dots-light">
      <div className="max-w-[1640px] mx-auto px-6 lg:px-10 py-5">
        <h1 className="sr-only">Blossoms 2026 events</h1>

        {/* Category strip: the chosen panel widens and reveals its tagline */}
        <div role="group" aria-label="Filter by category" className="flex gap-1.5 h-[clamp(190px,26vh,250px)]">
          {ARENA_CATEGORIES.map(({ slug, title, tagline, bgHex, clipPath, Illustration }, index) => {
            const isActive = activeCategory === slug
            return (
              <button
                key={slug}
                type="button"
                aria-pressed={isActive}
                onClick={() => onCategoryChange(isActive ? 'all' : slug)}
                style={{ backgroundColor: bgHex, clipPath }}
                className={cn(
                  'relative min-w-0 flex flex-col justify-start items-start overflow-hidden halftone-dots-dense text-left cursor-pointer select-none transition-[flex-grow] duration-300 ease-out motion-reduce:transition-none focus-visible:outline-[4px] focus-visible:-outline-offset-[10px] focus-visible:outline-[#0f0f0f]',
                  index > 0 && '-ml-[1.2%]',
                  isActive ? 'grow-[2.2] basis-0' : 'grow basis-0'
                )}
              >
                <span className={cn('relative z-20 block pt-4 pr-2', index === 0 ? 'pl-4' : 'pl-[9%]')}>
                  <span className="block font-comic-display comic-title-white leading-[0.9] tracking-wide -rotate-3 origin-left text-[clamp(24px,3.5vw,54px)]">
                    {title}
                  </span>
                  {isActive && (
                    <span className="mt-2 inline-block bg-[#f9d423] border-[3px] border-[#0f0f0f] px-3 py-1 -rotate-3 font-comic-sub text-[#0f0f0f] text-[clamp(14px,1.3vw,18px)] leading-[1.05] animate-fadeIn">
                      {tagline}
                    </span>
                  )}
                </span>
                <Illustration
                  className={cn(
                    'absolute bottom-0 right-[6%] h-[58%] z-10 pointer-events-none',
                    isActive ? 'w-[48%]' : 'w-[78%]'
                  )}
                />
              </button>
            )
          })}
        </div>

        {/* Search */}
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0f0f0f]" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search events, like quiz or mono act"
              aria-label="Search events"
              className="w-full bg-[#fdfaf0] border-[3px] border-[#0f0f0f] rounded-[10px] pl-12 pr-4 py-3 text-[16px] font-semibold text-[#0f0f0f] placeholder:text-neutral-500 focus:outline-[3px] focus:outline-offset-2 focus:outline-[#0f0f0f]"
            />
          </div>
          <p className="font-comic-sub text-[20px] text-[#0f0f0f] shrink-0" aria-live="polite">
            {isLoading ? 'LOADING…' : `${eventCount} ${eventCount === 1 ? 'EVENT' : 'EVENTS'}`}
          </p>
        </div>

        {/* Event panels */}
        <div className="mt-5 space-y-7 pb-8">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <EventCardSkeleton key={i} />)}
            </div>
          ) : visibleCategories.length === 0 ? (
            <div className="bg-[#fdfaf0] border-[3px] border-[#0f0f0f] rounded-[10px] p-8 text-center">
              <p className="font-comic-display text-[30px] text-[#0f0f0f]">
                {search ? `NO EVENTS MATCH "${search.toUpperCase()}"` : 'NO EVENTS HERE YET'}
              </p>
              <button
                type="button"
                onClick={() => { onSearchChange(''); onCategoryChange('all') }}
                className="mt-3 bg-[#f8ca16] border-[2.5px] border-[#0f0f0f] px-4 py-1 font-comic-sub text-[17px] cursor-pointer active:scale-95"
              >
                SHOW ALL EVENTS
              </button>
            </div>
          ) : (
            visibleCategories.map(({ slug, title, bgHex }) => (
              <section key={slug} aria-label={title}>
                {activeCategory === 'all' && (
                  <h2
                    style={{ backgroundColor: bgHex }}
                    className="inline-block border-[3px] border-[#0f0f0f] px-4 py-0.5 mb-3 -rotate-1 font-comic-display comic-title-white text-[32px] leading-tight"
                  >
                    {title}
                  </h2>
                )}
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {eventsByCategory[slug].map((event) => (
                    <EventPanel key={event.id} event={event} onRegister={onRegister} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
