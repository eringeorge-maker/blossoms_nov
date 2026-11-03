import { useState, useMemo } from 'react'
import {
  CalendarDays,
  MapPin,
  Clock,
  Search,
  UserCheck,
  Table as TableIcon,
  LayoutGrid,
  Filter,
} from 'lucide-react'
import { MASTER_SCHEDULE } from '@/lib/data/masterSchedule'

type MonthFilter = 'all' | 'nov' | 'dec'

const DIVISION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Arts: { bg: 'bg-[#ed1e79]/15', text: 'text-[#ed1e79]', border: 'border-[#ed1e79]' },
  Literature: { bg: 'bg-[#0088e8]/15', text: 'text-[#0088e8]', border: 'border-[#0088e8]' },
  Stage: { bg: 'bg-[#fdb813]/25', text: 'text-[#946200]', border: 'border-[#fdb813]' },
  Theatre: { bg: 'bg-[#861ec2]/15', text: 'text-[#861ec2]', border: 'border-[#861ec2]' },
  Inauguration: { bg: 'bg-[#00966b]/15', text: 'text-[#00966b]', border: 'border-[#00966b]' },
  'Off Day': { bg: 'bg-neutral-200/60', text: 'text-neutral-600', border: 'border-neutral-300' },
  Holiday: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
}

export default function SchedulePage() {
  const [monthFilter, setMonthFilter] = useState<MonthFilter>('all')
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline')
  const [search, setSearch] = useState('')
  const [hideOffDays, setHideOffDays] = useState(false)

  const filteredEntries = useMemo(() => {
    return MASTER_SCHEDULE.filter((entry) => {
      // 1. Month filter
      if (monthFilter === 'nov' && !entry.dateStr.includes('-11-')) return false
      if (monthFilter === 'dec' && !entry.dateStr.includes('-12-')) return false

      // 2. Hide off days toggle
      if (hideOffDays && (entry.isOffDay || entry.isHoliday)) return false

      // 3. Search query
      if (search.trim()) {
        const query = search.toLowerCase()
        const matchesName = entry.eventName.toLowerCase().includes(query)
        const matchesVenue = entry.venue.toLowerCase().includes(query)
        const matchesTeacher = entry.teachers.toLowerCase().includes(query)
        const matchesDate = entry.dateStr.toLowerCase().includes(query)
        const matchesDay = entry.day.toLowerCase().includes(query)
        if (!matchesName && !matchesVenue && !matchesTeacher && !matchesDate && !matchesDay) {
          return false
        }
      }

      return true
    })
  }, [monthFilter, hideOffDays, search])

  return (
    <div className="min-h-screen bg-[#faf8f5] text-ink pb-24">
      {/* ── Compact Filter Header Bar ─────────────────────────── */}
      <section className="relative border-b-3 border-ink bg-gradient-to-r from-comic-yellow/30 via-primary/10 to-comic-red/10 py-6 px-4 overflow-hidden">
        {/* Halftone dot pattern overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #0f0f0f 1.5px, transparent 1.5px)',
            backgroundSize: '18px 18px',
          }}
        />

        <div className="relative z-10 mx-auto max-w-[1240px]">
          {/* ── Search & View Mode Toolbar ──────────────────────── */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/50" />
              <input
                type="text"
                placeholder="Search events, teachers, venues..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs font-semibold bg-white border-2 border-ink rounded-full shadow-comic-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-white border-2 border-ink rounded-full p-1 shadow-comic-sm">
              <button
                onClick={() => setViewMode('timeline')}
                className={`cursor-pointer px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'timeline' ? 'bg-ink text-white' : 'text-ink/70 hover:text-ink'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Timeline</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`cursor-pointer px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'table' ? 'bg-ink text-white' : 'text-ink/70 hover:text-ink'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Table View</span>
              </button>
            </div>
          </div>

          {/* Month Filters & Off-day toggle */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink/60 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Month:
            </span>

            {(
              [
                { id: 'all', label: 'All Dates' },
                { id: 'nov', label: 'November 2026' },
                { id: 'dec', label: 'December 2026' },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                onClick={() => setMonthFilter(m.id)}
                className={`cursor-pointer px-3 py-1 text-xs font-bold rounded-full border-2 border-ink transition-all ${
                  monthFilter === m.id
                    ? 'bg-primary text-white shadow-comic-sm'
                    : 'bg-white text-ink hover:bg-neutral-100'
                }`}
              >
                {m.label}
              </button>
            ))}

            <label className="ml-auto flex items-center gap-2 cursor-pointer text-xs font-bold text-ink/70">
              <input
                type="checkbox"
                checked={hideOffDays}
                onChange={(e) => setHideOffDays(e.target.checked)}
                className="rounded border-ink text-primary focus:ring-0"
              />
              <span>Hide Off Days &amp; Holidays</span>
            </label>
          </div>
        </div>
      </section>

      {/* ── Main Schedule Content ─────────────────────────────── */}
      <main className="mx-auto max-w-[1240px] px-4 pt-10">
        {filteredEntries.length === 0 ? (
          <div className="bg-white border-3 border-ink rounded-[16px] p-12 text-center shadow-comic-md">
            <CalendarDays className="w-12 h-12 text-ink/30 mx-auto mb-3" />
            <h3 className="font-display text-2xl text-ink font-bold">No events matched your search</h3>
            <p className="text-xs text-ink/60 mt-1 max-w-md mx-auto">
              Try clearing your search terms or resetting the month filter to see the complete festival schedule.
            </p>
            <button
              onClick={() => {
                setSearch('')
                setMonthFilter('all')
                setHideOffDays(false)
              }}
              className="mt-4 px-4 py-1.5 bg-comic-yellow text-ink text-xs font-bold rounded-full border-2 border-ink shadow-comic-sm"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'timeline' ? (
          /* ── Timeline Cards View ─────────────────────────────── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEntries.map((entry) => {
              const colors = DIVISION_COLORS[entry.division] || DIVISION_COLORS['Off Day']
              const isNonEvent = entry.isOffDay || entry.isHoliday

              return (
                <div
                  key={entry.id}
                  className={`relative bg-white border-3 border-ink rounded-[16px] overflow-hidden shadow-comic-md flex flex-col justify-between transition-all duration-200 hover:translate-y-[-3px] hover:shadow-comic-lg ${
                    isNonEvent ? 'opacity-80 bg-neutral-50' : ''
                  }`}
                >
                  {/* Top Header Strip */}
                  <div className="p-4 pb-3 border-b-2 border-ink bg-[#faf8f5] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-ink text-white font-display text-xs px-2.5 py-1 rounded-md tracking-wider">
                        {entry.dateStr}
                      </div>
                      <span className="font-bold text-xs text-ink/80">{entry.day}</span>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}
                    >
                      {entry.division}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display text-xl text-ink font-bold leading-snug">
                        {entry.eventName}
                      </h3>

                      {!isNonEvent && (
                        <div className="mt-3 space-y-2 text-xs">
                          <div className="flex items-center gap-2 text-ink/80">
                            <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="font-semibold">{entry.timings}</span>
                          </div>
                          <div className="flex items-center gap-2 text-ink/80">
                            <MapPin className="w-3.5 h-3.5 text-comic-red shrink-0" />
                            <span className="font-semibold">{entry.venue}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Teacher Coordinator Footer Strip */}
                    <div className="mt-5 pt-3 border-t border-ink/10 flex items-center justify-between text-[11px]">
                      <span className="text-ink/60 font-semibold flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-ink/50" />
                        <span>Teacher in Charge:</span>
                      </span>
                      <span className="font-bold text-ink truncate max-w-[160px]" title={entry.teachers}>
                        {entry.teachers}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* ── Table View Matching PDF ─────────────────────────── */
          <div className="bg-white border-3 border-ink rounded-[16px] overflow-hidden shadow-comic-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#111217] text-white border-b-3 border-ink font-display text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Day</th>
                    <th className="py-3 px-4">Event Name</th>
                    <th className="py-3 px-4">Venue to Book</th>
                    <th className="py-3 px-4">Timings</th>
                    <th className="py-3 px-4">Division</th>
                    <th className="py-3 px-4">Teachers</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-ink/10 font-body">
                  {filteredEntries.map((entry) => {
                    const colors = DIVISION_COLORS[entry.division] || DIVISION_COLORS['Off Day']
                    const isNonEvent = entry.isOffDay || entry.isHoliday

                    return (
                      <tr
                        key={entry.id}
                        className={`transition-colors hover:bg-comic-yellow/10 ${
                          isNonEvent ? 'bg-neutral-100/60 text-ink/50' : 'bg-white'
                        }`}
                      >
                        <td className="py-3 px-4 font-bold text-ink whitespace-nowrap">
                          {entry.dateStr}
                        </td>
                        <td className="py-3 px-4 font-semibold text-ink/80 whitespace-nowrap">
                          {entry.day}
                        </td>
                        <td className="py-3 px-4 font-bold text-ink text-sm">
                          {entry.eventName}
                        </td>
                        <td className="py-3 px-4 font-semibold text-ink/80">
                          {entry.venue}
                        </td>
                        <td className="py-3 px-4 font-bold text-primary whitespace-nowrap">
                          {entry.timings}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}
                          >
                            {entry.division}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-ink">
                          {entry.teachers}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
