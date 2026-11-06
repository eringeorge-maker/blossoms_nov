import { confirmDialog } from '@/components/ui/ConfirmDialog'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { MapPin, MessageCircle, Users } from 'lucide-react'
import { DisplayText } from '@/components/comic/ComicPrimitives'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/States'
import { cn } from '@/lib/utils'
import { getStudentRegistrations, cancelRegistration, type MyRegistration } from '@/lib/api/registration'
import { formatDateTime, slotLabel } from '@/lib/eventDisplay'

type Filter = 'active' | 'cancelled'

export default function MyEventsPage() {
  const [filter, setFilter] = useState<Filter>('active')
  const queryClient = useQueryClient()

  const { data: registrations = [], isLoading, isError, refetch } = useQuery({
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

  const filtered = registrations.filter((r) =>
    filter === 'active' ? r.registration_status !== 'cancelled' : r.registration_status === 'cancelled'
  )

  return (
    <div className="mx-auto max-w-[800px] px-4 py-6 space-y-6">
      <div>
        <DisplayText as="h1" className="text-4xl">My events</DisplayText>
        <p className="text-ink/60 text-sm mt-1">Everything you're registered for, including teams others added you to.</p>
      </div>

      <div role="group" aria-label="Filter registrations" className="flex gap-2">
        {(['active', 'cancelled'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={cn(
              'px-4 py-1.5 rounded-full border-2 border-ink text-sm font-semibold transition-colors capitalize',
              filter === f ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-gutter'
            )}
          >
            {f === 'active' ? 'Registered' : 'Cancelled'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : isError ? (
        <ErrorState description="Could not load your registrations." retry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <div className="comic-card p-12 text-center">
          <p className="font-display text-2xl text-ink mb-2">{filter === 'active' ? 'No events yet' : 'Nothing cancelled'}</p>
          {filter === 'active' && (
            <>
              <p className="text-ink/60 text-sm mb-6">Every student takes part in at least one Blossoms event.</p>
              <Button asChild>
                <Link to="/events">Find an event</Link>
              </Button>
            </>
          )}
        </div>
      ) : (
        <ul className="space-y-4" aria-label="Your registrations">
          {filtered.map((reg) => (
            <RegistrationCard key={reg.id} reg={reg} onCancel={() => cancelMutation.mutate(reg.id)} cancelling={cancelMutation.isPending} />
          ))}
        </ul>
      )}
    </div>
  )
}

function RegistrationCard({ reg, onCancel, cancelling }: { reg: MyRegistration; onCancel: () => void; cancelling: boolean }) {
  const slot = reg.event?.schedule_slots?.[0]
  const active = reg.registration_status !== 'cancelled'
  const canCancel = active && (!reg.team || reg.team.is_leader)

  return (
    <li className="comic-card p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
        <div>
          <Badge variant="outline">{reg.event?.category?.name ?? 'Event'}</Badge>
          <h2 className="font-display text-2xl text-ink mt-2">{reg.event?.title ?? 'Event'}</h2>
          <p className="text-sm text-ink/70 mt-1">{slotLabel(slot)}</p>
          {slot?.venue && (
            <p className="text-sm text-ink/70 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" /> {slot.venue.name}
            </p>
          )}
          <p className="text-xs text-ink/40 mt-1">Registered {formatDateTime(reg.registered_at)}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Badge variant={reg.registration_status === 'confirmed' ? 'registered' : reg.registration_status === 'waitlisted' ? 'waitlist' : 'cancelled'}>
            {reg.registration_status === 'confirmed' ? 'Confirmed' : reg.registration_status === 'waitlisted' ? 'Waitlisted' : 'Cancelled'}
          </Badge>
          {reg.attendance_status && (
            <Badge variant={reg.attendance_status === 'present' ? 'green' : 'red'}>
              {reg.attendance_status === 'present' ? 'Attended' : 'Marked absent'}
            </Badge>
          )}
        </div>
      </div>

      {reg.team && (
        <div className="mb-3 rounded-xl border-2 border-ink/20 bg-paper p-3">
          <p className="text-sm font-bold text-ink flex items-center gap-1.5">
            <Users className="w-4 h-4 text-primary" aria-hidden="true" /> Team {reg.team.team_name}
          </p>
          <ul className="mt-1.5 grid sm:grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-ink/80">
            {reg.team.members.map((m) => (
              <li key={m.register_number}>
                {m.full_name} <span className="text-ink/50 tabular-nums">· {m.register_number}</span>
                {m.is_leader && <span className="ml-1 font-bold text-primary">(leader)</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-2 flex-wrap pt-2 border-t border-ink/10">
        {active && reg.whatsapp_group_url && (
          <Button size="sm" variant="secondary" asChild>
            <a href={reg.whatsapp_group_url} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-4 h-4" /> Join WhatsApp group
            </a>
          </Button>
        )}
        {reg.event?.slug && (
          <Button size="sm" variant="outline" asChild>
            <Link to={`/events/${reg.event.slug}`}>Event page</Link>
          </Button>
        )}
        {canCancel && (
          <Button
            size="sm"
            variant="ghost"
            className="text-comic-red-deep"
            isLoading={cancelling}
            onClick={() => {
              const msg = reg.team ? `Withdraw team ${reg.team.team_name} from ${reg.event?.title}? Every member is removed.` : `Cancel your registration for ${reg.event?.title}?`
              void confirmDialog(msg, { danger: true, title: reg.team ? 'Withdraw team' : 'Cancel registration', confirmLabel: reg.team ? 'Withdraw team' : 'Cancel registration', cancelLabel: 'Keep it' }).then((ok) => ok && onCancel())
            }}
          >
            {reg.team ? 'Withdraw team' : 'Cancel registration'}
          </Button>
        )}
        {active && reg.team && !reg.team.is_leader && (
          <p className="text-xs text-ink/50 self-center">Only your team leader can withdraw this entry.</p>
        )}
      </div>
    </li>
  )
}
