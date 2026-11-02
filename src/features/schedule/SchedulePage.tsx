import { useState, useMemo } from 'react'
import { CalendarDays, MapPin, Clock, Sparkles, Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { DisplayText, HalftoneAccent } from '@/components/comic/ComicPrimitives'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { Link } from 'react-router-dom'
import { cn, formatISTDate, formatISTTime } from '@/lib/utils'
import { getEvents } from '@/lib/api/events'
import type { Event, EventScheduleSlot } from '@/types'

type MonthFilter = 'all' | 'nov' | 'dec' | 'tbd'

export default function SchedulePage() {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events-schedule'],
    queryFn: () => getEvents(),
  })

  const [monthFilter, setMonthFilter] = useState<MonthFilter>('all')
  const [selectedDate, setSelectedDate] = useState<string>('all')
  const [search, setSearch] = useState('')

  // Flatten all slots with parent event
  const allSlotsWithEvent = useMemo(() => {
    const list: Array<EventScheduleSlot & { event: Event }> = []
    for (const e of events) {
      if (e.schedule_slots && e.schedule_slots.length > 0) {
        for (const s of e.schedule_slots) {
          list.push({ ...s, event: e })
        }
      }
    }
    // Sort chronologically: valid starts_at first, then TBD slots
    return list.sort((a, b) => {
      if (!a.starts_at && !b.starts_at) return 0
      if (!a.starts_at) return 1
      if (!b.starts_at) return -1
      return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
    })
  }, [events])

  // Extract distinct chronological dates (only for scheduled events)
  const chronologicalDates = useMemo(() => {
    const dateMap = new Map<string, { label: string; dateObj: Date; count: number }>()

    for (const s of allSlotsWithEvent) {
      if (s.starts_at && s.status !== 'tbd') {
        const dObj = new Date(s.starts_at)
        const dateKey = `${dObj.getFullYear()}-${String(dObj.getMonth() + 1).padStart(2, '0')}-${String(dObj.getDate()).padStart(2, '0')}`
        const label = formatISTDate(s.starts_at)

        if (!dateMap.has(dateKey)) {
          dateMap.set(dateKey, { label, dateObj: dObj, count: 1 })
        } else {
          dateMap.get(dateKey)!.count += 1
        }
      }
    }

    return Array.from(dateMap.entries())
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, val]) => ({
        key,
        label: val.label,
        dateObj: val.dateObj,
        count: val.count,
        isNov: val.dateObj.getMonth() === 10, // 0-indexed: 10 = Nov
        isDec: val.dateObj.getMonth() === 11, // 11 = Dec
      }))
  }, [allSlotsWithEvent])

  // Filter slots by Month, Date, and Search Query
  const filteredSlots = useMemo(() => {
    return allSlotsWithEvent.filter((slot) => {
      // 1. Month filter
      if (monthFilter === 'tbd') {
        if (slot.status !== 'tbd' && slot.starts_at) return false
      } else if (monthFilter === 'nov') {
        if (!slot.starts_at) return false
        if (new Date(slot.starts_at).getMonth() !== 10) return false
      } else if (monthFilter === 'dec') {
        if (!slot.starts_at) return false
        if (new Date(slot.starts_at).getMonth() !== 11) return false
      }

      // 2. Specific Date filter (if selected)
      if (selectedDate !== 'all') {
        if (!slot.starts_at) return false
        const dObj = new Date(slot.starts_at)
        const dateKey = `${dObj.getFullYear()}-${String(dObj.getMonth() + 1).padStart(2, '0')}-${String(dObj.getDate()).padStart(2, '0')}`
        if (dateKey !== selectedDate) return false
      }

      // 3. Search query filter
      if (search.trim()) {
        const query = search.toLowerCase()
        const titleMatch = slot.event.title.toLowerCase().includes(query)
        const venueMatch = slot.venue?.name?.toLowerCase().includes(query) || false
        const roomMatch = slot.venue?.room?.toLowerCase().includes(query) || false
        const slotTitleMatch = slot.slot_title?.toLowerCase().includes(query) || false
        const categoryMatch = slot.event.category?.name?.toLowerCase().includes(query) || false
        if (!titleMatch && !venueMatch && !roomMatch && !slotTitleMatch && !categoryMatch) {
          return false
        }
      }

      return true
    })
  }, [allSlotsWithEvent, monthFilter, selectedDate, search])

  // Group filtered slots by date string for section headers
  const groupedSlots = useMemo(() => {
    const groups: Record<string, typeof filteredSlots> = {}
    for (const slot of filteredSlots) {
      const headerKey = slot.starts_at && slot.status !== 'tbd'
        ? formatISTDate(slot.starts_at)
        : 'To Be Decided (TBD)'
      if (!groups[headerKey]) {
        groups[headerKey] = []
      }
      groups[headerKey].push(slot)
    }
    return groups
  }, [filteredSlots])

  // Reset selected date when changing month tabs
  function handleMonthChange(tab: MonthFilter) {
    setMonthFilter(tab)
    setSelectedDate('all')
  }

  return (
    <div className="mx-auto max-w-[1060px] px-4 py-3.5">
      {/* ── TOP CONTROLS & SEARCH ──────────────────────────────── */}
      <div className="bg-white border-2 border-ink p-3 rounded-xl shadow-[3px_3px_0px_#151515] mb-4 space-y-2.5">
        {/* Search bar & Quick Stats */}
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink/40" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search by event, venue (e.g. KE doc, 911, Birds park, Classroom, Panel Room)…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#FFF8E8] border-[1.5px] border-ink rounded-lg text-xs font-medium placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-[#793f98]"
            />
          </div>

          {/* Month Segment Tabs */}
          <div className="flex items-center gap-1 p-0.5 bg-[#FFF8E8] border-[1.5px] border-ink rounded-lg overflow-x-auto">
            <button
              onClick={() => handleMonthChange('all')}
              className={cn(
                'px-2.5 py-1 rounded-md text-[11px] font-display tracking-wider uppercase font-bold transition-all',
                monthFilter === 'all'
                  ? 'bg-[#793f98] text-white shadow-[1px_1px_0px_#151515]'
                  : 'text-ink/70 hover:text-ink'
              )}
            >
              All Schedule
            </button>
            <button
              onClick={() => handleMonthChange('nov')}
              className={cn(
                'px-2.5 py-1 rounded-md text-[11px] font-display tracking-wider uppercase font-bold transition-all',
                monthFilter === 'nov'
                  ? 'bg-[#793f98] text-white shadow-[1px_1px_0px_#151515]'
                  : 'text-ink/70 hover:text-ink'
              )}
            >
              November
            </button>
            <button
              onClick={() => handleMonthChange('dec')}
              className={cn(
                'px-2.5 py-1 rounded-md text-[11px] font-display tracking-wider uppercase font-bold transition-all',
                monthFilter === 'dec'
                  ? 'bg-[#793f98] text-white shadow-[1px_1px_0px_#151515]'
                  : 'text-ink/70 hover:text-ink'
              )}
            >
              December
            </button>
            <button
              onClick={() => handleMonthChange('tbd')}
              className={cn(
                'px-2.5 py-1 rounded-md text-[11px] font-display tracking-wider uppercase font-bold transition-all',
                monthFilter === 'tbd'
                  ? 'bg-[#FFD43B] text-ink shadow-[1px_1px_0px_#151515]'
                  : 'text-ink/70 hover:text-ink'
              )}
            >
              TBD / TBA
            </button>
          </div>
        </div>

        {/* Date Pill Selector */}
        {monthFilter !== 'tbd' && (
          <div className="border-t border-ink/15 pt-2">
            <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-display text-ink/70 uppercase font-bold">
              <CalendarDays className="w-3 h-3 text-[#793f98]" />
              <span>Select Exact Day ({chronologicalDates.length} Days)</span>
              {selectedDate !== 'all' && (
                <button
                  onClick={() => setSelectedDate('all')}
                  className="text-[11px] text-[#793f98] underline ml-auto font-sans font-bold"
                >
                  Clear day filter
                </button>
              )}
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1.5 -mx-1 px-1 no-scrollbar">
              <button
                onClick={() => setSelectedDate('all')}
                className={cn(
                  'flex-shrink-0 px-2.5 py-1 rounded-lg border-[1.5px] border-ink text-[11px] font-display tracking-wider uppercase transition-all shadow-[1.5px_1.5px_0px_#151515]',
                  selectedDate === 'all'
                    ? 'bg-[#151515] text-[#FFD43B]'
                    : 'bg-[#FFF8E8] text-ink hover:bg-white'
                )}
              >
                All Days
              </button>

              {chronologicalDates
                .filter((d) => {
                  if (monthFilter === 'nov') return d.isNov
                  if (monthFilter === 'dec') return d.isDec
                  return true
                })
                .map((d) => {
                  const isSelected = selectedDate === d.key
                  const dayName = d.dateObj.toLocaleDateString('en-IN', { weekday: 'short', timeZone: 'Asia/Kolkata' })
                  const dayNum = d.dateObj.getDate()
                  const monthName = d.dateObj.toLocaleDateString('en-IN', { month: 'short', timeZone: 'Asia/Kolkata' })

                  return (
                    <button
                      key={d.key}
                      onClick={() => setSelectedDate(d.key)}
                      className={cn(
                        'flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border-[1.5px] border-ink text-[11px] font-display tracking-wider uppercase transition-all shadow-[1.5px_1.5px_0px_#151515]',
                        isSelected
                          ? 'bg-[#793f98] text-white'
                          : 'bg-white text-ink hover:bg-[#FFF8E8]'
                      )}
                    >
                      <span className="font-sans font-black text-[11px]">{dayName}</span>
                      <span className="font-bold">{dayNum} {monthName}</span>
                      <span className={cn(
                        'w-4 h-4 rounded-full text-[9px] tabular-nums font-bold flex items-center justify-center border',
                        isSelected ? 'bg-white text-[#793f98] border-white' : 'bg-[#FFF8E8] text-ink border-ink'
                      )}>
                        {d.count}
                      </span>
                    </button>
                  )
                })}
            </div>
          </div>
        )}
      </div>

      {/* ── SCHEDULE LISTING ───────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : filteredSlots.length === 0 ? (
        <div className="comic-card p-8 text-center bg-white">
          <DisplayText as="h3" className="text-xl text-ink mb-1.5">No Matching Sessions Found</DisplayText>
          <p className="text-xs text-ink/70 max-w-md mx-auto">
            Try adjusting your search keywords or switching to "All Schedule" to explore the full festival calendar.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(groupedSlots).map(([dateHeader, slots]) => (
            <section key={dateHeader} aria-labelledby={`date-header-${dateHeader}`}>
              {/* Day Header Banner */}
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="bg-[#151515] text-[#FFD43B] px-3 py-1 rounded-lg border-[1.5px] border-ink shadow-[1.5px_1.5px_0px_#151515] flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-[#793f98]" aria-hidden="true" />
                  <span id={`date-header-${dateHeader}`} className="font-display text-xs tracking-wider uppercase font-bold">
                    {dateHeader}
                  </span>
                </div>
                <div className="h-0.5 flex-1 bg-ink/20" />
                <span className="text-[10px] tabular-nums font-bold text-ink/60 bg-white px-2 py-0.5 rounded border border-ink">
                  {slots.length} {slots.length === 1 ? 'EVENT' : 'EVENTS'}
                </span>
              </div>

              {/* Day Slots Grid / Cards */}
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {slots.map((slot) => {
                  const isOnline = slot.venue?.id === 'v-online' || slot.slot_title?.toLowerCase().includes('online') || slot.slot_title?.toLowerCase().includes('upload')
                  const isTbd = slot.status === 'tbd' || !slot.starts_at

                  return (
                    <li key={slot.id} className="h-full">
                      <Link
                        to={`/events/${slot.event.slug}`}
                        className="comic-card group h-full p-3 flex flex-col justify-center bg-white hover:border-[#793f98] transition-all relative overflow-hidden rounded-xl shadow-[2.5px_2.5px_0px_#151515]"
                      >
                        <HalftoneAccent color="yellow" className="opacity-0 group-hover:opacity-20 transition-opacity" />

                        <div className="flex flex-col sm:flex-row gap-2.5 items-start w-full min-w-0">
                          {/* Time Stamp / Format Box */}
                          <div className={cn(
                            'flex-shrink-0 text-center w-full sm:w-24 p-2 rounded-lg border-[1.5px] border-ink shadow-[1.5px_1.5px_0px_#151515]',
                            isTbd
                              ? 'bg-[#FFD43B]/30'
                              : isOnline
                              ? 'bg-[#3478F6]/15'
                              : 'bg-[#FFF8E8]'
                          )}>
                            <Clock className="w-3.5 h-3.5 text-[#793f98] mx-auto mb-0.5" aria-hidden="true" />
                            <p className="font-display text-xs tracking-wider text-ink font-bold leading-tight">
                              {isTbd ? 'TIME TBD' : isOnline ? 'ONLINE' : formatISTTime(slot.starts_at)}
                            </p>
                            <p className="text-[10px] text-ink/70 font-semibold mt-0.5 leading-tight">
                              {isTbd
                                ? 'To Be Announced'
                                : isOnline
                                ? 'Digital Portal'
                                : slot.ends_at
                                ? `to ${formatISTTime(slot.ends_at)}`
                                : 'Session Start'}
                            </p>
                          </div>

                          {/* Event Information */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1.5 mb-1">
                              <div className="flex flex-wrap items-center gap-1">
                                <Badge variant="outline" className="text-[9.5px] px-1.5 py-0">
                                  {slot.event.category?.name || 'Festival'}
                                </Badge>

                                {isTbd && (
                                  <span className="bg-[#FFD43B] text-ink border border-ink text-[9px] font-display font-black px-1.5 py-0 rounded shadow-[1px_1px_0px_#151515]">
                                    ★ SCHEDULE TBA ★
                                  </span>
                                )}
                              </div>

                              <span className="font-display text-xs uppercase tracking-wider text-[#793f98] flex items-center gap-0.5 font-bold shrink-0 group-hover:translate-x-0.5 transition-transform">
                                <Sparkles className="w-3 h-3" />
                                Rules &amp; Entry →
                              </span>
                            </div>

                            <DisplayText
                              as="h2"
                              className="text-base sm:text-lg text-ink leading-tight break-words group-hover:text-[#793f98] transition-colors"
                            >
                              {slot.event.title}
                            </DisplayText>

                            <p className="text-[11px] text-ink/80 flex flex-wrap items-center gap-1 mt-1 font-medium break-words">
                              <MapPin className="w-3 h-3 text-[#793f98] flex-shrink-0" aria-hidden="true" />
                              <span className="font-bold text-ink">
                                {slot.venue?.name || 'Central Campus (TBA)'}
                              </span>
                              {slot.venue?.building && slot.venue.building !== 'Central Campus' && (
                                <span className="text-ink/60">· {slot.venue.building}</span>
                              )}
                              {slot.venue?.room && (
                                <span className="text-ink/60">· {slot.venue.room}</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
