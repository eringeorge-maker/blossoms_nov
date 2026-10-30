import { Link, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { Search, Sparkles } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { DisplayText, ComicCaptionBox, HalftoneAccent } from '@/components/comic/ComicPrimitives'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EventCardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/States'
import { cn, formatSlot } from '@/lib/utils'
import { getEvents, getCategories } from '@/lib/api/events'

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') || 'all'
  const [search, setSearch] = useState('')

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events', activeCategory, search],
    queryFn: () => getEvents({ categorySlug: activeCategory, search }),
  })

  function handleCategoryClick(slug: string) {
    if (slug === 'all') {
      searchParams.delete('category')
    } else {
      searchParams.set('category', slug)
    }
    setSearchParams(searchParams)
  }

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8">
      {/* Top Banner */}
      <div className="mb-4">
        <ComicCaptionBox>
          ANTHOLOGY CATALOGUE · ALL 5 PANELS
        </ComicCaptionBox>
      </div>

      <DisplayText as="h1" className="text-4xl sm:text-5xl mb-2">
        Find Your Panel
      </DisplayText>
      <p className="text-ink/70 text-base mb-8 max-w-xl">
        Browse all Blossoms events across Arts, Literature, Stage, Theatre, and Special Showcases. Filter by category or search by keyword.
      </p>

      {/* Search bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search band battles, mono act, debate, slam poetry…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border-2 border-ink bg-white pl-10 pr-4 py-3 text-base text-ink placeholder:text-ink/40 focus:outline-none focus:border-[#F04438] shadow-[2px_2px_0px_#151515]"
            aria-label="Search events"
          />
        </div>
      </div>

      {/* Category chips */}
      <div
        className="flex gap-2.5 overflow-x-auto pb-3 mb-8 -mx-4 px-4 snap-x"
        role="group"
        aria-label="Filter by category"
      >
        <button
          onClick={() => handleCategoryClick('all')}
          className={cn(
            'flex-shrink-0 snap-start px-5 py-2 rounded-xl border-2 border-ink font-display text-base tracking-wider uppercase transition-all shadow-[2px_2px_0px_#151515]',
            activeCategory === 'all'
              ? 'bg-[#151515] text-white'
              : 'bg-white text-ink hover:bg-[#F5EBD4]'
          )}
          aria-pressed={activeCategory === 'all'}
        >
          All Panels
        </button>
        {categories.map((cat) => {
          const isActive = activeCategory === cat.slug
          return (
            <button
              key={cat.slug}
              onClick={() => handleCategoryClick(cat.slug)}
              className={cn(
                'flex-shrink-0 snap-start px-5 py-2 rounded-xl border-2 border-ink font-display text-base tracking-wider uppercase transition-all shadow-[2px_2px_0px_#151515]',
                isActive
                  ? 'bg-[#F04438] text-white'
                  : 'bg-white text-ink hover:bg-[#F5EBD4]'
              )}
              aria-pressed={isActive}
            >
              {cat.name}
            </button>
          )
        })}
      </div>

      {/* Result count */}
      {!isLoading && (
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-semibold text-ink/70" aria-live="polite">
            <span className="font-display text-lg text-[#F04438] font-bold mr-1">{events.length}</span>
            event{events.length !== 1 ? 's' : ''} available in this panel
          </p>
          <span className="text-xs font-mono font-bold text-ink/40 uppercase hidden sm:inline">
            ★ CENTRAL CAMPUS FESTIVAL EDITION ★
          </span>
        </div>
      )}

      {/* Event list */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <EventCardSkeleton key={i} />)}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          title="No events in this panel yet"
          description="Try selecting a different category or clearing your search keywords."
          action={{
            label: 'Show all panels',
            onClick: () => {
              setSearch('')
              handleCategoryClick('all')
            },
          }}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event, idx) => {
            const firstSlot = event.schedule_slots?.[0]
            const formatPill =
              event.event_format === 'team'
                ? { label: 'Team Event', variant: 'blue' as const }
                : event.event_format === 'individual'
                ? { label: 'Solo Event', variant: 'pink' as const }
                : { label: 'Solo / Team', variant: 'yellow' as const }

            return (
              <article
                key={event.id}
                className="comic-card group p-5 flex flex-col justify-between bg-white overflow-hidden"
              >
                <HalftoneAccent color="yellow" className="opacity-0 group-hover:opacity-20 transition-opacity" />

                <div>
                  {/* Comic top strip */}
                  <div className="flex items-center justify-between border-b-2 border-ink pb-2 mb-3">
                    <span className="comic-caption-box text-[11px] py-0 px-2 bg-[#FFD43B]">
                      {event.category?.name?.toUpperCase() || 'GENERAL'}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-ink/40">
                      NO. {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </span>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
                    <Badge variant={formatPill.variant}>
                      {formatPill.label}
                    </Badge>
                    <Badge variant="open">
                      Registration Open
                    </Badge>
                  </div>

                  {/* Title & description */}
                  <DisplayText as="h2" className="text-2xl sm:text-3xl text-ink leading-tight mb-2 group-hover:text-[#F04438] transition-colors">
                    {event.title}
                  </DisplayText>
                  <p className="text-sm text-ink/70 line-clamp-2 leading-relaxed mb-4">
                    {event.description}
                  </p>

                  {/* Slot + venue */}
                  <div className="bg-[#FFF8E8] border border-ink/20 p-2.5 rounded-lg text-xs space-y-1 mb-4 font-medium">
                    <p className="text-ink flex items-center gap-1">
                      <span>📅</span>
                      <span>{firstSlot ? formatSlot(firstSlot.starts_at, firstSlot.ends_at) : 'Slot TBA'}</span>
                    </p>
                    <p className="text-ink/70 flex items-center gap-1">
                      <span>📍</span>
                      <span>{firstSlot?.venue?.name || 'Central Campus Grounds'}</span>
                    </p>
                  </div>
                </div>

                {/* CTA */}
                <div className="pt-3 border-t-2 border-ink/15">
                  <Button size="sm" variant="primary" className="w-full text-sm font-display tracking-wider uppercase gap-1" asChild>
                    <Link to={`/events/${event.slug}`}>
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                      View Details &amp; Register →
                    </Link>
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
