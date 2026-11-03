import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter } from 'lucide-react'
import { DisplayText } from '@/components/comic/ComicPrimitives'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EVENTS } from '@/lib/data/eventsData'
import { getStoredRegistrations } from '@/lib/api/registration'

export default function AdminEventsPage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const registrations = useMemo(() => getStoredRegistrations(), [])

  // Calculate live registration counts per event
  const regCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const r of registrations) {
      if (r.registration_status !== 'cancelled') {
        counts[r.event_id] = (counts[r.event_id] || 0) + 1
      }
    }
    return counts
  }, [registrations])

  const filteredEvents = useMemo(() => {
    return EVENTS.filter((e) => {
      if (categoryFilter !== 'all' && e.category?.slug !== categoryFilter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        return (
          e.title.toLowerCase().includes(q) ||
          e.category?.name?.toLowerCase().includes(q) ||
          e.event_format.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [search, categoryFilter])

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <DisplayText as="h1" className="text-4xl">Event Directory Manager</DisplayText>
          <p className="text-sm text-ink/60 mt-1">
            Displaying {filteredEvents.length} official festival events across 5 arenas
          </p>
        </div>
        <Button asChild variant="primary">
          <Link to="/admin/events/new" className="gap-2">
            <Plus className="w-4 h-4" /> Create New Event
          </Link>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border-2 border-ink shadow-[3px_3px_0px_#151515] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            type="text"
            placeholder="Search events by title or keywords…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FFF8E8] border border-ink rounded-xl text-sm font-semibold text-ink placeholder:text-ink/40 focus:outline-none focus:ring-1 focus:ring-[#793f98]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-ink/50" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-[#FFF8E8] border border-ink rounded-xl text-xs font-bold text-ink uppercase tracking-wider focus:outline-none"
          >
            <option value="all">All Arenas</option>
            <option value="arts">Fine Arts</option>
            <option value="literature">Literature</option>
            <option value="stage">Stage</option>
            <option value="theatre">Theatre</option>
            <option value="special">Special Events</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="comic-card overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table">
            <thead className="border-b-2 border-ink bg-[#FFF8E8]">
              <tr>
                <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-ink">Event Title</th>
                <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-ink">Arena</th>
                <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-ink">Format</th>
                <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-ink">Status</th>
                <th className="px-4 py-3 text-center font-display text-xs uppercase tracking-wider text-ink">Entries</th>
                <th className="px-4 py-3 text-right font-display text-xs uppercase tracking-wider text-ink">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((e) => {
                const count = regCounts[e.id] || 0
                return (
                  <tr key={e.id} className="border-b border-ink/10 hover:bg-[#FFF8E8]/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-display text-base text-ink">{e.title}</p>
                      <p className="text-xs text-ink/50 line-clamp-1">{e.description?.slice(0, 75)}…</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant="outline">{e.category?.name || 'General'}</Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs font-bold capitalize text-ink/70">
                        {e.event_format === 'team' ? `Team (${e.min_team_size}-${e.max_team_size})` : 'Solo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant={e.status === 'published' ? 'open' : 'soon'}>
                        {e.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap font-display text-base">
                      {count}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/admin/events/${e.id}`}>Edit / Manage</Link>
                        </Button>
                        <Button size="sm" variant="ghost" asChild>
                          <Link to={`/events/${e.slug}`} target="_blank">View</Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
