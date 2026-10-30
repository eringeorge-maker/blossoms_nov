import { useState } from 'react'
import { DisplayText } from '@/components/comic/ComicPrimitives'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { cn, formatSlot } from '@/lib/utils'
import { getStudentRegistrations, cancelRegistration } from '@/lib/api/registration'
import type { RegistrationStatus } from '@/types'

type Filter = 'all' | 'confirmed' | 'waitlisted' | 'cancelled'

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Waitlisted', value: 'waitlisted' },
  { label: 'Cancelled', value: 'cancelled' },
]

export default function MyEventsPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const queryClient = useQueryClient()

  const { data: registrations = [], isLoading } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: getStudentRegistrations,
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancelRegistration(id),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message)
        queryClient.invalidateQueries({ queryKey: ['my-registrations'] })
      } else {
        toast.error(res.message)
      }
    },
  })

  const filtered = registrations.filter((r) => {
    if (filter === 'all') return true
    return r.registration_status === filter
  })

  return (
    <div className="mx-auto max-w-[800px] px-4 py-6 space-y-6">
      <DisplayText as="h1" className="text-4xl">My Registrations</DisplayText>
      <p className="text-ink/60 text-sm">
        Review your registrations for the Blossoms cultural festival. All changes are reflected immediately.
      </p>

      {/* Filter chips */}
      <div
        role="group"
        aria-label="Filter registrations"
        className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4"
      >
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'flex-shrink-0 px-4 py-1.5 rounded-full border-2 border-ink text-sm font-semibold transition-colors',
              filter === f.value ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-gutter'
            )}
            aria-pressed={filter === f.value}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Registration list */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="comic-card p-12 text-center">
          <p className="font-display text-2xl text-ink mb-2">No registrations found</p>
          <p className="text-ink/50 text-sm mb-6">Explore the panel line-ups and register for events.</p>
          <Button asChild><Link to="/app/events">Explore Events</Link></Button>
        </div>
      ) : (
        <ul className="space-y-4" aria-label="Your event registrations">
          {filtered.map((reg) => {
            const firstSlot = reg.event?.schedule_slots?.[0]
            const status: RegistrationStatus = reg.registration_status
            return (
              <li key={reg.id} className="comic-card p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                  <div>
                    <Badge variant="outline">{reg.event?.category?.name || 'Event'}</Badge>
                    <h2 className="font-display text-2xl text-ink mt-2">
                      {reg.event?.title || 'Registered Event'}
                    </h2>
                    {firstSlot && (
                      <p className="text-sm text-ink/70 mt-1">
                        📅 {formatSlot(firstSlot.starts_at, firstSlot.ends_at)}
                      </p>
                    )}
                    {firstSlot?.venue && (
                      <p className="text-sm text-ink/70">
                        📍 {firstSlot.venue.name}
                      </p>
                    )}
                    <p className="text-xs text-ink/40 mt-1">
                      Registration date: {new Date(reg.registered_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={status === 'confirmed' ? 'registered' : status === 'waitlisted' ? 'waitlist' : 'cancelled'}>
                    {status === 'confirmed' ? 'Confirmed ✓' : status === 'waitlisted' ? 'Waitlisted' : 'Cancelled'}
                  </Badge>
                </div>
                <div className="flex gap-2 flex-wrap pt-2 border-t border-ink/10">
                  {reg.event?.slug && (
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/events/${reg.event.slug}`}>Event Page</Link>
                    </Button>
                  )}
                  {status !== 'cancelled' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-blossoms-red border-blossoms-red hover:bg-blossoms-red/10"
                      isLoading={cancelMutation.isPending}
                      onClick={() => cancelMutation.mutate(reg.id)}
                    >
                      Cancel Registration
                    </Button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
