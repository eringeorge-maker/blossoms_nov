import { DisplayText } from '@/components/comic/ComicPrimitives'
import { EmptyState } from '@/components/ui/States'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { CalendarDays, AlertTriangle, Clock, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getStudentRegistrations } from '@/lib/api/registration'
import { formatISTDate, formatISTTime } from '@/lib/utils'
import type { EventScheduleSlot, Event } from '@/types'

interface ScheduleItem extends EventScheduleSlot {
  event: Event
  hasConflict?: boolean
}

export default function StudentSchedulePage() {
  const { data: registrations = [], isLoading } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: getStudentRegistrations,
  })

  // Extract slots from active confirmed registrations
  const items: ScheduleItem[] = []
  const activeRegs = registrations.filter((r) => r.registration_status === 'confirmed')

  for (const reg of activeRegs) {
    if (reg.event?.schedule_slots) {
      for (const slot of reg.event.schedule_slots) {
        if (slot.status !== 'cancelled' && slot.starts_at && slot.ends_at) {
          items.push({
            ...slot,
            event: reg.event,
          })
        }
      }
    }
  }

  // Sort chronologically by starts_at
  items.sort((a, b) => new Date(a.starts_at!).getTime() - new Date(b.starts_at!).getTime())

  // Detect time interval conflicts: slotA.starts_at < slotB.ends_at AND slotB.starts_at < slotA.ends_at
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const aStart = new Date(items[i].starts_at!).getTime()
      const aEnd   = new Date(items[i].ends_at!).getTime()
      const bStart = new Date(items[j].starts_at!).getTime()
      const bEnd   = new Date(items[j].ends_at!).getTime()

      if (aStart < bEnd && bStart < aEnd) {
        items[i].hasConflict = true
        items[j].hasConflict = true
      }
    }
  }

  const conflictCount = items.filter((i) => i.hasConflict).length

  return (
    <div className="mx-auto max-w-[800px] px-4 py-6 space-y-6">
      <div>
        <DisplayText as="h1" className="text-4xl">My Personal Timetable</DisplayText>
        <p className="text-ink/60 text-sm mt-1">
          Chronological sessions compiled from your confirmed event registrations. All times in Asia/Kolkata (IST).
        </p>
      </div>

      {conflictCount > 0 && (
        <div className="comic-card p-4 border-2 border-blossoms-yellow bg-paper flex items-start gap-3" role="alert">
          <AlertTriangle className="w-5 h-5 text-comic-red-deep flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-sm">
            <p className="font-bold text-ink">Schedule Overlap Advisory</p>
            <p className="text-ink/70 mt-0.5">
              Two or more of your registered events have overlapping time windows. Please coordinate with your team or coordinators.
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="w-16 h-16" />}
          title="No events scheduled yet"
          description="Register for festival events to build your personal Blossoms timetable."
          action={{ label: 'Explore Events', onClick: () => {} }}
        />
      ) : (
        <ul className="space-y-3" aria-label="Personal timetable">
          {items.map((slot) => (
            <li
              key={`${slot.event_id}-${slot.id}`}
              className="comic-card p-4 flex gap-4 items-start hover:shadow-[3px_3px_0px_0px_#151515] transition-all"
            >
              {/* Time */}
              <div className="flex-shrink-0 text-center w-28 bg-gutter p-2 rounded-lg border border-ink/10">
                <Clock className="w-4 h-4 text-primary mx-auto mb-1" aria-hidden="true" />
                <p className="text-xs font-bold text-ink">{formatISTTime(slot.starts_at)}</p>
                <p className="text-[11px] text-ink/50">to {formatISTTime(slot.ends_at)}</p>
                <p className="text-[10px] text-ink/70 font-semibold mt-1">{formatISTDate(slot.starts_at)}</p>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  <Badge variant="outline">{slot.event.category?.name || 'Category'}</Badge>
                  {slot.slot_title && <Badge variant="blue">{slot.slot_title}</Badge>}
                  {slot.hasConflict && (
                    <Badge variant="yellow" className="text-primary font-bold">
                      ⚠ Conflict
                    </Badge>
                  )}
                </div>
                <h2 className="font-display text-2xl text-ink leading-tight">{slot.event.title}</h2>
                <p className="text-xs text-ink/60 flex items-center gap-1 mt-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                  {slot.venue?.name || 'Central Campus'}
                  {slot.venue?.room && ` (${slot.venue.room})`}
                </p>
                <div className="mt-2">
                  <Button size="sm" variant="ghost" className="text-xs p-0 h-auto" asChild>
                    <Link to={`/events/${slot.event.slug}`}>View event info →</Link>
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
