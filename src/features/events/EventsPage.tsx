import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useState, useMemo } from 'react'
import { Search, Sparkles, CheckCircle2, Calendar, MapPin, Users, X, Info } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import DesktopEventsShowcase from '@/components/comic/DesktopEventsShowcase'
import { DisplayText, ComicCaptionBox, HalftoneAccent } from '@/components/comic/ComicPrimitives'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EventCardSkeleton } from '@/components/ui/Skeleton'
import { cn, formatSlot } from '@/lib/utils'
import { getEvents, getCategories } from '@/lib/api/events'
import { getActiveStudent, loginStudent, type StudentProfile } from '@/lib/auth/authStore'
import { registerIndividualEvent } from '@/lib/api/registration'
import type { Event } from '@/types'

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') || 'all'
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'matrix' | 'cards'>('matrix')
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [rollInput, setRollInput] = useState('')
  const [student, setStudent] = useState<StudentProfile | null>(getActiveStudent())

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events', activeCategory, search],
    queryFn: () => getEvents({ categorySlug: activeCategory, search }),
  })

  // Predefined exact ordering matching user's reference screenshots
  const ORDER_MAP: Record<string, number> = {
    // Arts
    'Digital Poster Making': 1,
    'Greeting Card': 2,
    'Pot Art': 3,
    'Pencil Sketching': 4,
    'Reel Making': 5,
    'Collage': 6,
    'Mehendi Design': 7,
    'Rangoli Design': 8,
    'Painting': 9,
    'Photography': 10,

    // Literature
    'Quiz': 1,
    'Pot Pourri': 2,
    'Extempore': 3,
    'Dumb Charades': 4,
    'Air Crash / Ship-Wreck': 5,
    'Debate': 6,
    'Jam': 7,
    'Creative Writing': 8,

    // Stage
    'Indian Dance Classical (Group)': 1,
    'Non Theme': 2,
    'BOB (W)': 3,
    'BOB (I)': 4,
    'Indian Folk and Film Singing (Solo)': 5,
    'Western Singing (Solo)': 6,
    'Western Acapella': 7,
    'Duet Dance': 8,

    // Theatre
    'Mono Act': 1,
    'Proscenium': 2,
    'Street Play': 3,
    'Short Film Making': 4,
    'Mime': 5,
  }

  // Group events by category for the Arena Matrix view
  const eventsByCategory = useMemo(() => {
    const grouped: Record<string, Event[]> = {
      arts: [],
      literature: [],
      stage: [],
      theatre: [],
      'special-events': [],
    }
    events.forEach((ev) => {
      const slug = ev.category?.slug || 'special-events'
      if (!grouped[slug]) grouped[slug] = []
      grouped[slug].push(ev)
    })

    // Sort according to user's screenshots
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => {
        const orderA = ORDER_MAP[a.title] ?? 99
        const orderB = ORDER_MAP[b.title] ?? 99
        return orderA - orderB
      })
    })

    return grouped
  }, [events])

  // Active selected event object
  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null
    return events.find((e) => e.id === selectedEventId) || null
  }, [selectedEventId, events])

  useEffect(() => {
    if (!selectedEventId) return
    function closeOnEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setSelectedEventId(null)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [selectedEventId])

  function handleCategoryClick(slug: string) {
    if (slug === 'all') {
      searchParams.delete('category')
    } else {
      searchParams.set('category', slug)
    }
    setSearchParams(searchParams)
    setSelectedEventId(null)
  }

  async function handleQuickRegister(event: Event) {
    let currentStudent = student
    if (!currentStudent) {
      if (!rollInput || !/^\d{6,8}$/.test(rollInput.trim())) {
        toast.error('Please enter your 7-digit register number to register.')
        return
      }
      const res = loginStudent(rollInput)
      if (!res.success || !res.student) {
        toast.error(res.error || 'Invalid roll number.')
        return
      }
      currentStudent = res.student
      setStudent(currentStudent)
      toast.success(`Logged in as #${currentStudent.rollNumber}`)
    }

    try {
      const result = await registerIndividualEvent(event.id)
      if (result.success) {
        toast.success(`Registered #${currentStudent.rollNumber} for ${event.title}!`, {
          
          duration: 4000,
        })
      } else {
        toast(result.message || 'Already registered for this event.', {
          icon: 'ℹ️',
        })
      }
    } catch {
      toast.error('Registration failed. Please try again.')
    }
  }

  // Detail sheet shared by the mobile catalogue and the desktop arena
  const eventSheet = selectedEvent && (
    <div
      onClick={() => setSelectedEventId(null)}
      className="fixed inset-x-0 bottom-0 md:top-0 z-[120] p-3 sm:p-6 flex items-end md:items-center justify-center pointer-events-none md:pointer-events-auto md:bg-black/60 animate-in fade-in slide-in-from-bottom md:slide-in-from-bottom-0 duration-200"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={selectedEvent.title}
        onClick={(e) => e.stopPropagation()}
        className="pointer-events-auto w-full max-w-xl bg-[#FFF8E8] border-[3px] md:border-[4px] border-[#151515] rounded-2xl shadow-[6px_6px_0px_#151515] md:shadow-none p-4 sm:p-6 relative max-h-[85vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={() => setSelectedEventId(null)}
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white border-2 border-[#151515] flex items-center justify-center text-[#151515] hover:bg-[#FFD43B] transition-colors shadow-[1.5px_1.5px_0px_#151515]"
          aria-label="Close event sheet"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Event Category Tag */}
        <div className="inline-block bg-[#FFD43B] border-2 border-[#151515] px-2.5 py-0.5 rounded shadow-[1.5px_1.5px_0px_#151515] mb-2 -rotate-1">
          <span className="font-display text-[10px] sm:text-xs tracking-wider uppercase font-black">
            {selectedEvent.category?.name || 'PANEL'}
          </span>
        </div>

        <DisplayText as="h3" className="text-2xl sm:text-3xl text-[#151515] font-black leading-tight mb-2">
          {selectedEvent.title}
        </DisplayText>

        <p className="text-ink/80 text-xs sm:text-sm leading-relaxed mb-4">
          {selectedEvent.description}
        </p>

        {/* Slots & Venue Info */}
        <div className="bg-white border-2 border-[#151515] rounded-xl p-3 shadow-[2px_2px_0px_#151515] space-y-2 mb-4 text-xs sm:text-sm">
          {selectedEvent.schedule_slots && selectedEvent.schedule_slots.length > 0 ? (
            selectedEvent.schedule_slots.map((slot) => (
              <div key={slot.id} className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#151515]">
                  <Calendar className="w-4 h-4 text-[#793f98]" />
                  <span>{formatSlot(slot.starts_at, slot.ends_at)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-ink/70">
                  <MapPin className="w-4 h-4 text-[#793f98]" />
                  <span>{slot.venue?.name || 'Central Campus Grounds'} ({slot.venue?.room || slot.venue?.building || 'Main Block'})</span>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-1.5 text-ink/70">
              <Calendar className="w-4 h-4 text-[#793f98]" />
              <span>Schedule timings &amp; venue: To Be Decided (TBD)</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-ink/70 pt-1 border-t border-ink/10">
            <Users className="w-4 h-4 text-[#3478F6]" />
            <span className="capitalize">{selectedEvent.event_format} Participation · Capacity: {selectedEvent.capacity || 'Open'}</span>
          </div>
        </div>

        {/* Quick 1-Tap 6-Digit Registration Flow */}
        <div className="bg-[#FCE881]/60 border-2 border-[#151515] rounded-xl p-3 shadow-[2px_2px_0px_#151515] mb-3">
          {student ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1 text-xs font-bold text-[#151515]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Identified as Roll #{student.rollNumber}</span>
                </div>
                <span className="text-[11px] text-ink/70">
                  {student.name} · {student.className} · TRINITY MERLIN A
                </span>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleQuickRegister(selectedEvent)}
                className="font-display tracking-wider uppercase text-xs sm:text-sm bg-[#793f98] hover:bg-[#151515] text-white border-2 border-[#151515] shadow-[2px_2px_0px_#151515]"
              >
                Register with #{student.rollNumber}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-xs font-bold text-[#151515]">
                <Info className="w-3.5 h-3.5 text-[#793f98]" />
                <span>Quick Student Registration (7-digit register number)</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={7}
                  placeholder="e.g. 2610101"
                  value={rollInput}
                  onChange={(e) => setRollInput(e.target.value.replace(/\D/g, '').slice(0, 7))}
                  className="flex-1 bg-white border-2 border-[#151515] rounded-lg px-3 py-1.5 tabular-nums text-sm font-bold text-center shadow-[1.5px_1.5px_0px_#151515] focus:outline-none focus:border-[#793f98]"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleQuickRegister(selectedEvent)}
                  className="font-display tracking-wider uppercase text-xs bg-[#793f98] hover:bg-[#151515] text-white border-2 border-[#151515] shadow-[2px_2px_0px_#151515]"
                >
                  Register Now
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center text-xs">
          <Link
            to={`/events/${selectedEvent.slug}`}
            className="text-[#793f98] font-bold underline hover:text-[#151515] flex items-center gap-1"
          >
            <span>Full Rules &amp; Regulations Page →</span>
          </Link>
          <button
            onClick={() => setSelectedEventId(null)}
            className="text-ink/60 hover:text-ink font-semibold"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {eventSheet}

      {/* ── Desktop & Mobile 4-Panel Comic Events Category Showcase ── */}
      <DesktopEventsShowcase
        hideHeader
        activeCategory={activeCategory}
        onSelectCategory={handleCategoryClick}
        eventsByCategory={eventsByCategory}
        onSelectEvent={setSelectedEventId}
      />

      {/* ── Legacy Events Catalogue View (hidden while 4-panel showcase is active) ── */}
      <div className="hidden mx-auto max-w-[1240px] px-3 sm:px-4 py-6">
      {/* ── Top Comic Caption & Heading ──────────────────────── */}
      <div className="mb-3">
        <ComicCaptionBox>
          ANTHOLOGY CATALOGUE · ALL FESTIVAL PANELS
        </ComicCaptionBox>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <DisplayText as="h1" className="text-3xl sm:text-5xl mb-2 text-[#151515]">
            Events Arena
          </DisplayText>
          <p className="text-ink/70 text-sm sm:text-base max-w-xl">
            Browse all 31 Blossoms competitions across Arts, Literature, Stage, and Theatre. Filter by category, inspect dates &amp; venues, and register with your 6-digit roll number.
          </p>
        </div>

        {/* View Switcher Toggle */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-white border-2 border-[#151515] p-1 rounded-xl shadow-[2px_2px_0px_#151515]">
          <button
            onClick={() => setViewMode('matrix')}
            className={cn(
              'px-3 py-1.5 rounded-lg font-display text-xs sm:text-sm tracking-wider uppercase font-black transition-all',
              viewMode === 'matrix'
                ? 'bg-[#151515] text-[#FFD43B]'
                : 'text-ink hover:bg-[#FFF8E8]'
            )}
          >
            Arena Matrix
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={cn(
              'px-3 py-1.5 rounded-lg font-display text-xs sm:text-sm tracking-wider uppercase font-black transition-all',
              viewMode === 'cards'
                ? 'bg-[#151515] text-[#FFD43B]'
                : 'text-ink hover:bg-[#FFF8E8]'
            )}
          >
            Comic Cards
          </button>
        </div>
      </div>

      {/* ── Search Bar ───────────────────────────────────────── */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" aria-hidden="true" />
        <input
          type="search"
          placeholder="Search greeting card, dumb charades, duet dance, mono act, quiz…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border-2 border-ink bg-white pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base text-ink placeholder:text-ink/40 focus:outline-none focus:border-[#793f98] shadow-[2px_2px_0px_#151515]"
          aria-label="Search events"
        />
      </div>

      {/* ── Category Chips ───────────────────────────────────── */}
      <div
        className="flex gap-2 overflow-x-auto pb-3 mb-6 -mx-3 px-3 sm:mx-0 sm:px-0 snap-x scrollbar-none"
        role="group"
        aria-label="Filter by category"
      >
        <button
          onClick={() => handleCategoryClick('all')}
          className={cn(
            'flex-shrink-0 snap-start px-4 sm:px-5 py-2 rounded-xl border-2 border-ink font-display text-xs sm:text-sm tracking-wider uppercase transition-all shadow-[2px_2px_0px_#151515]',
            activeCategory === 'all'
              ? 'bg-[#151515] text-[#FFD43B]'
              : 'bg-white text-ink hover:bg-[#FFF8E8]'
          )}
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
                'flex-shrink-0 snap-start px-4 sm:px-5 py-2 rounded-xl border-2 border-ink font-display text-xs sm:text-sm tracking-wider uppercase transition-all shadow-[2px_2px_0px_#151515]',
                isActive
                  ? 'bg-[#793f98] text-white'
                  : 'bg-white text-ink hover:bg-[#FFF8E8]'
              )}
            >
              {cat.name}
            </button>
          )
        })}
      </div>

      {/* ── ARENA MATRIX VIEW (Matches User's 4 Screenshots) ──── */}
      {viewMode === 'matrix' ? (
        <div className="space-y-6">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => <EventCardSkeleton key={i} />)}
            </div>
          ) : (
            <>
              {/* Render Selected Categories */}
              {['arts', 'literature', 'stage', 'theatre'].map((catKey) => {
                // If filtering by specific category and this isn't it, skip
                if (activeCategory !== 'all' && activeCategory !== catKey) return null

                const catEvents = eventsByCategory[catKey] || []
                if (catEvents.length === 0 && search) return null

                const categoryTitle = catKey.toUpperCase()

                return (
                  <div
                    key={catKey}
                    className="relative bg-[#111217] border-2 border-[#F5B82E]/30 rounded-2xl p-4 sm:p-6 shadow-2xl overflow-hidden"
                    style={{
                      backgroundImage:
                        'radial-gradient(circle at 50% 0%, rgba(245, 184, 46, 0.08) 0%, rgba(17, 18, 23, 0.98) 75%)',
                    }}
                  >
                    {/* Atmospheric Glow */}
                    <div className="absolute top-0 right-0 w-72 h-72 bg-[#F5B82E]/5 rounded-full filter blur-3xl pointer-events-none" />

                    {/* Category Title Header */}
                    <div className="relative z-10 mb-4 pb-2 border-b border-[#F5B82E]/30 flex items-center justify-between">
                      <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-widest text-[#F5B82E] font-black drop-shadow-[0_2px_8px_rgba(245,184,46,0.2)]">
                        {categoryTitle}
                      </h2>
                      <span className="text-xs tabular-nums text-white/40 tracking-wider">
                        {catEvents.length} COMPETITIONS
                      </span>
                    </div>

                    {/* 3-Column Pill Buttons Grid (Exact match to design screenshot) */}
                    <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3.5">
                      {catEvents.map((ev, index) => {
                        const isSelected = selectedEventId === ev.id
                        // In Stage screenshot: "Indian Dance Classical (Group)" highlighted
                        // In Theatre screenshot: "Short Film Making" highlighted
                        const isDefaultFeatured =
                          !selectedEventId &&
                          ((catKey === 'stage' && ev.title.includes('Classical')) ||
                            (catKey === 'theatre' && ev.title.includes('Short Film')))

                        const isHighlighted = isSelected || isDefaultFeatured
                        const isOdd = index % 2 === 1

                        return (
                          <button
                            key={ev.id}
                            onClick={() => setSelectedEventId(ev.id)}
                            style={{ animationDelay: `${index * 35}ms` }}
                            className={cn(
                              'w-full py-3 sm:py-3.5 px-4 rounded-xl text-center font-medium text-xs sm:text-sm tracking-wide transition-all shadow-md active:scale-[0.98] flex items-center justify-center min-h-[48px] sm:min-h-[52px]',
                              isOdd ? 'animate-panel-settle-odd' : 'animate-panel-settle-even',
                              isHighlighted
                                ? 'bg-[#2a241b] text-[#F5B82E] border-2 border-[#F5B82E] shadow-[0_0_15px_rgba(245,184,46,0.3)] font-bold'
                                : 'bg-[#1e1f26]/90 hover:bg-[#282a34] text-white/90 border border-white/10 hover:border-white/25'
                            )}
                          >
                            <span>{ev.title}</span>
                          </button>
                        )
                      })}

                      {/* Cluster / User Team Pill: TRINITY MERLIN A (placed in column 3 of row 4) */}
                      {catKey === 'arts' && (
                        <>
                          <div className="hidden md:block" aria-hidden="true" />
                          <div className="w-full py-3 sm:py-3.5 px-4 rounded-xl text-center font-bold text-xs sm:text-sm tracking-wide bg-[#2a241b] text-[#F5B82E] border-2 border-[#F5B82E] shadow-[0_0_12px_rgba(245,184,46,0.25)] flex items-center justify-center min-h-[48px] sm:min-h-[52px]">
                            <span>TRINITY MERLIN A</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Special Events (Inauguration & Valedictory) if requested */}
              {(activeCategory === 'all' || activeCategory === 'special-events') &&
                eventsByCategory['special-events']?.length > 0 && (
                  <div className="relative bg-[#111217] border-2 border-[#F5B82E]/30 rounded-2xl p-4 sm:p-6 shadow-2xl overflow-hidden">
                    <div className="relative z-10 mb-4 pb-2 border-b border-[#F5B82E]/30 flex items-center justify-between">
                      <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-widest text-[#F5B82E] font-black">
                        SPECIAL CEREMONIES
                      </h2>
                      <span className="text-xs tabular-nums text-white/40 tracking-wider">
                        {eventsByCategory['special-events'].length} SESSIONS
                      </span>
                    </div>

                    <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3.5">
                      {eventsByCategory['special-events'].map((ev) => (
                        <button
                          key={ev.id}
                          onClick={() => setSelectedEventId(ev.id)}
                          className={cn(
                            'w-full py-3 sm:py-3.5 px-4 rounded-xl text-center font-medium text-xs sm:text-sm tracking-wide transition-all shadow-md flex items-center justify-center min-h-[48px]',
                            selectedEventId === ev.id
                              ? 'bg-[#2a241b] text-[#F5B82E] border-2 border-[#F5B82E] shadow-[0_0_15px_rgba(245,184,46,0.3)]'
                              : 'bg-[#1e1f26]/90 hover:bg-[#282a34] text-white/90 border border-white/10'
                          )}
                        >
                          {ev.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
            </>
          )}

        </div>
      ) : (
        /* ── COMIC CARDS VIEW ───────────────────────────────── */
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                className="comic-card group p-4 sm:p-5 flex flex-col justify-between bg-white overflow-hidden rounded-2xl border-[3px] border-[#151515] shadow-[4px_4px_0px_#151515]"
              >
                <HalftoneAccent color="yellow" className="opacity-0 group-hover:opacity-20 transition-opacity" />

                <div>
                  <div className="flex items-center justify-between border-b-2 border-ink pb-2 mb-3">
                    <span className="comic-caption-box text-[11px] py-0 px-2 bg-[#FFD43B]">
                      {event.category?.name?.toUpperCase() || 'GENERAL'}
                    </span>
                    <span className="text-[10px] tabular-nums font-bold text-ink/40">
                      NO. {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
                    <Badge variant={formatPill.variant}>
                      {formatPill.label}
                    </Badge>
                    <Badge variant="open">
                      Registration Open
                    </Badge>
                  </div>

                  <DisplayText as="h2" className="text-2xl sm:text-3xl text-ink leading-tight mb-2 group-hover:text-[#793f98] transition-colors">
                    {event.title}
                  </DisplayText>
                  <p className="text-sm text-ink/70 line-clamp-2 leading-relaxed mb-4">
                    {event.description}
                  </p>

                  <div className="bg-[#FFF8E8] border border-ink/20 p-2.5 rounded-lg text-xs space-y-1 mb-4 font-medium">
                    <p className="text-ink flex items-center gap-1">
                      <span aria-hidden="true">★</span>
                      <span>{firstSlot ? formatSlot(firstSlot.starts_at, firstSlot.ends_at) : 'Slot TBA'}</span>
                    </p>
                    <p className="text-ink/70 flex items-center gap-1">
                      <span aria-hidden="true">★</span>
                      <span>{firstSlot?.venue?.name || 'Central Campus Grounds'}</span>
                    </p>
                  </div>
                </div>

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
    </>
  )
}
