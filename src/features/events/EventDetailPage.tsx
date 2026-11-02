import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, MapPin, Users, CheckCircle2, ShieldCheck } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { DisplayText, ComicCaptionBox, ComicPanel } from '@/components/comic/ComicPrimitives'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { getEventBySlug } from '@/lib/api/events'
import { registerIndividualEvent, getStudentRegistrations } from '@/lib/api/registration'
import { formatIST, formatISTDate, formatISTTime } from '@/lib/utils'

export default function EventDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', slug],
    queryFn: () => getEventBySlug(slug || ''),
    enabled: Boolean(slug),
  })

  const { data: registrations = [] } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: getStudentRegistrations,
  })

  const isRegistered = registrations.some(
    (r) => r.event_id === event?.id && r.registration_status !== 'cancelled'
  )

  const registerMutation = useMutation({
    mutationFn: () => registerIndividualEvent(event!.id),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message || 'Successfully registered!')
        queryClient.invalidateQueries({ queryKey: ['my-registrations'] })
      } else {
        toast.error(result.message || 'Registration could not be completed')
      }
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Registration failed')
    },
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1240px] px-4 py-8 space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-[600px] px-4 py-16 text-center space-y-4">
        <DisplayText as="h1" className="text-3xl">Event Not Found</DisplayText>
        <p className="text-ink/60">This event does not exist or may have been archived.</p>
        <Button asChild><Link to="/events">Back to Directory</Link></Button>
      </div>
    )
  }

  const rulesList = (event.rules_markdown || '')
    .split('\n')
    .filter((l) => l.trim().length > 0)

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 pb-32">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-sm font-display tracking-wider uppercase text-ink hover:text-[#793f98] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </Link>
        <ComicCaptionBox>
          {event.category?.name?.toUpperCase() || 'FESTIVAL'} ARENA · CENTRAL CAMPUS
        </ComicCaptionBox>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        <Badge variant="outline">{event.category?.name || 'General'}</Badge>
        <Badge variant={event.event_format === 'team' ? 'blue' : 'pink'}>
          {event.event_format === 'team' ? 'Team Crew Event' : 'Individual Solo Entry'}
        </Badge>
        <Badge variant="open">Registration Open</Badge>
        {isRegistered && <Badge variant="registered">You're On The List ✓</Badge>}
      </div>

      <DisplayText as="h1" className="text-4xl sm:text-5xl md:text-6xl mb-4 text-ink">
        {event.title}
      </DisplayText>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        {/* Main 2-column description & rules */}
        <div className="md:col-span-2 space-y-6">
          {/* About Panel */}
          <ComicPanel panelNumber="BRIEFING" caption="SYNOPSIS">
            <DisplayText as="h2" className="text-2xl mb-3">
              About This Event
            </DisplayText>
            <p className="text-base text-ink/80 leading-relaxed">
              {event.description}
            </p>
          </ComicPanel>

          {/* Rules Panel */}
          {rulesList.length > 0 && (
            <ComicPanel panelNumber="REGULATIONS" caption="CODE OF CONDUCT">
              <DisplayText as="h2" className="text-2xl mb-4">
                Official Rules &amp; Regulations
              </DisplayText>
              <ol className="space-y-3 list-decimal list-inside text-sm text-ink/80 leading-relaxed">
                {rulesList.map((rule, i) => (
                  <li key={i} className="pl-1">
                    <span className="font-semibold text-ink">
                      {rule.replace(/^\d+\.\s*/, '')}
                    </span>
                  </li>
                ))}
              </ol>
            </ComicPanel>
          )}

          {/* Schedule slots */}
          <ComicPanel panelNumber="SLOTS" caption="TIMETABLE">
            <DisplayText as="h2" className="text-2xl mb-4">
              Schedule &amp; Venues
            </DisplayText>
            {!event.schedule_slots || event.schedule_slots.length === 0 ? (
              <p className="text-sm text-ink/50">Schedule details will be announced shortly.</p>
            ) : (
              <ul className="space-y-3">
                {event.schedule_slots.map((slot) => (
                  <li key={slot.id} className="flex items-start gap-3 p-3.5 bg-[#FFF8E8] rounded-xl border-2 border-ink">
                    <Clock className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#793f98]" aria-hidden="true" />
                    <div>
                      <p className="font-bold text-sm text-ink">
                        {slot.slot_title && <span className="text-[#3478F6] mr-2">[{slot.slot_title}]</span>}
                        {slot.starts_at ? formatISTDate(slot.starts_at) : 'Date TBA'}
                        {slot.starts_at && `, ${formatISTTime(slot.starts_at)} – ${slot.ends_at ? formatISTTime(slot.ends_at) : ''}`}
                      </p>
                      <p className="text-xs text-ink/70 flex items-center gap-1 mt-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#793f98]" aria-hidden="true" />
                        {slot.venue?.name || 'Venue TBA'}
                        {slot.venue?.room && ` (${slot.venue.room})`}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </ComicPanel>

          {/* Universal Eligibility Box */}
          <div className="comic-card p-5 bg-[#FFD43B] border-2 border-ink shadow-[3px_3px_0px_#151515]">
            <div className="flex gap-3 items-start">
              <ShieldCheck className="w-6 h-6 text-[#151515] flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-display text-xl text-ink uppercase tracking-wider mb-1">
                  ★ Universal Cross-Department Eligibility
                </p>
                <p className="text-sm text-ink/90 leading-relaxed font-medium">
                  Open to eligible students across all departments. Department affiliation does not restrict you from registering for this event. Any currently enrolled student at CHRIST Central Campus can participate.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Comic Key Details */}
        <aside className="space-y-6">
          <Card variant="panel" className="bg-[#FFF8E8]">
            <div className="border-b-2 border-ink pb-2 mb-4 flex items-center justify-between">
              <DisplayText as="h2" className="text-2xl text-ink">
                Key Details
              </DisplayText>
              <span className="comic-caption-box text-[10px] py-0 px-1.5 bg-[#FFD43B]">
                SPEC
              </span>
            </div>

            <dl className="space-y-3.5 text-sm">
              <div className="border-b border-ink/10 pb-2">
                <dt className="text-ink/60 font-medium text-xs uppercase tracking-wider tabular-nums">Registration Cutoff</dt>
                <dd className="font-bold text-ink mt-0.5">
                  {event.registration_closes_at ? formatIST(event.registration_closes_at) : 'To be announced'}
                </dd>
              </div>

              {event.event_format !== 'individual' && (
                <div className="border-b border-ink/10 pb-2">
                  <dt className="text-ink/60 font-medium text-xs uppercase tracking-wider tabular-nums">Required Team Size</dt>
                  <dd className="font-bold text-ink flex items-center gap-1.5 mt-0.5">
                    <Users className="w-4 h-4 text-[#3478F6]" aria-hidden="true" />
                    {event.min_team_size} to {event.max_team_size} performers
                  </dd>
                </div>
              )}

              <div className="border-b border-ink/10 pb-2">
                <dt className="text-ink/60 font-medium text-xs uppercase tracking-wider tabular-nums">Capacity Limit</dt>
                <dd className="font-bold text-ink mt-0.5">{event.capacity ? `${event.capacity} total seats` : 'Open enrollment'}</dd>
              </div>

              <div className="border-b border-ink/10 pb-2">
                <dt className="text-ink/60 font-medium text-xs uppercase tracking-wider tabular-nums">Waitlist Status</dt>
                <dd className="font-bold text-ink mt-0.5">{event.waitlist_enabled ? 'Available if seats fill' : 'Direct cut-off'}</dd>
              </div>

              <div>
                <dt className="text-ink/60 font-medium text-xs uppercase tracking-wider tabular-nums">Organiser Contact</dt>
                <dd className="font-bold text-ink break-all mt-0.5 tabular-nums text-xs text-[#3478F6]">
                  {event.organiser_contact || 'doc@christuniversity.in'}
                </dd>
              </div>
            </dl>
          </Card>
        </aside>
      </div>

      {/* Sticky register CTA */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[#FFF8E8] border-t-2 border-ink p-4 shadow-[0_-4px_0_0_rgba(21,21,21,0.06)]">
        <div className="mx-auto max-w-[640px] flex items-center gap-3">
          {isRegistered ? (
            <div className="w-full flex items-center justify-between gap-3 bg-white p-2.5 px-4 rounded-xl border-2 border-ink shadow-[2px_2px_0px_#151515]">
              <span className="flex items-center gap-2 font-bold text-sm text-[#26A69A]">
                <CheckCircle2 className="w-5 h-5 text-[#26A69A]" /> You are on the registered roster
              </span>
              <Button size="sm" variant="outline" onClick={() => navigate('/app/my-events')}>
                View My Events →
              </Button>
            </div>
          ) : (
            <Button
              size="lg"
              variant="primary"
              className="w-full text-lg font-display tracking-wider uppercase shadow-[4px_4px_0px_#151515]"
              isLoading={registerMutation.isPending}
              onClick={() => registerMutation.mutate()}
            >
              {event.event_format === 'team' ? 'Register Your Crew →' : 'Register Now (Solo) →'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
