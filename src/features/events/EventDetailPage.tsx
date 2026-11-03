import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, MapPin, Users, CheckCircle2, X, Plus, Trash2, AlertCircle } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { DisplayText, ComicCaptionBox, ComicPanel } from '@/components/comic/ComicPrimitives'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { getEventBySlug } from '@/lib/api/events'
import { registerIndividualEvent, registerTeamEvent, getStudentRegistrations } from '@/lib/api/registration'
import { getActiveStudent } from '@/lib/auth/authStore'
import { findStudentByRegisterNo } from '@/lib/data/studentsRoster'
import { formatIST, formatISTDate, formatISTTime } from '@/lib/utils'
import type { Event } from '@/types'

export default function EventDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [teamModalOpen, setTeamModalOpen] = useState(false)

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', slug],
    queryFn: () => getEventBySlug(slug || ''),
    enabled: Boolean(slug),
  })

  const { data: registrations = [] } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: getStudentRegistrations,
  })

  const userReg = registrations.find(
    (r) => r.event_id === event?.id && r.registration_status !== 'cancelled'
  )
  const isRegistered = Boolean(userReg)

  const registerSoloMutation = useMutation({
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

  function handleRegisterClick() {
    const active = getActiveStudent()
    if (!active) {
      toast('Please sign in with your register number first', { icon: '🔒' })
      navigate(`/login?role=student&redirect=/events/${slug}`)
      return
    }

    if (event?.event_format === 'team') {
      setTeamModalOpen(true)
    } else {
      registerSoloMutation.mutate()
    }
  }

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
              <div className="space-y-3">
                {event.schedule_slots.map((slot) => (
                  <div key={slot.id} className="p-4 bg-white rounded-xl border border-ink/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="font-bold text-ink">{slot.slot_title || 'Session'}</p>
                      {slot.starts_at && (
                        <p className="text-sm text-ink/70 flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-[#793f98]" />
                          {formatISTDate(slot.starts_at)} · {formatISTTime(slot.starts_at)} – {slot.ends_at ? formatISTTime(slot.ends_at) : 'TBD'}
                        </p>
                      )}
                    </div>
                    {slot.venue && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-[#FFF8E8] border border-ink rounded-lg text-ink self-start sm:self-auto">
                        <MapPin className="w-3.5 h-3.5 text-[#e51e25]" />
                        {slot.venue.name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ComicPanel>
        </div>

        {/* Sidebar specs */}
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
              {userReg?.team_id ? (
                <Button size="sm" variant="outline" onClick={() => navigate(`/app/teams/${userReg.team_id}`)}>
                  View Team Dossier →
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => navigate('/app/my-events')}>
                  View My Events →
                </Button>
              )}
            </div>
          ) : (
            <Button
              size="lg"
              variant="primary"
              className="w-full text-lg font-display tracking-wider uppercase shadow-[4px_4px_0px_#151515]"
              isLoading={registerSoloMutation.isPending}
              onClick={handleRegisterClick}
            >
              {event.event_format === 'team' ? 'Register Your Crew →' : 'Register Now (Solo) →'}
            </Button>
          )}
        </div>
      </div>

      {/* Team Registration Modal */}
      {teamModalOpen && (
        <TeamRegistrationModal
          event={event}
          onClose={() => setTeamModalOpen(false)}
          onSuccess={(teamId) => {
            setTeamModalOpen(false)
            queryClient.invalidateQueries({ queryKey: ['my-registrations'] })
            navigate(`/app/teams/${teamId}`)
          }}
        />
      )}
    </div>
  )
}

function TeamRegistrationModal({
  event,
  onClose,
  onSuccess,
}: {
  event: Event
  onClose: () => void
  onSuccess: (teamId: string) => void
}) {
  const activeStudent = getActiveStudent()
  const minPerformers = event.min_team_size || 2
  const maxPerformers = event.max_team_size || 10

  // Start with (minPerformers - 1) teammate slots
  const [teamName, setTeamName] = useState('')
  const [teammateRolls, setTeammateRolls] = useState<string[]>(() => {
    const slotsNeeded = Math.max(1, minPerformers - 1)
    return Array(slotsNeeded).fill('')
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateRoll(index: number, val: string) {
    const cleaned = val.replace(/\D/g, '').slice(0, 7)
    const next = [...teammateRolls]
    next[index] = cleaned
    setTeammateRolls(next)
    if (error) setError(null)
  }

  function addSlot() {
    if (teammateRolls.length + 1 < maxPerformers) {
      setTeammateRolls([...teammateRolls, ''])
    }
  }

  function removeSlot(index: number) {
    if (teammateRolls.length + 1 > minPerformers) {
      setTeammateRolls(teammateRolls.filter((_, i) => i !== index))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!teamName.trim()) {
      setError('Please enter a team name.')
      return
    }

    const filledTeammates = teammateRolls.map((r) => r.trim()).filter(Boolean)
    const totalTeamCount = filledTeammates.length + 1 // leader + teammates

    if (totalTeamCount < minPerformers) {
      setError(`This event requires at least ${minPerformers} performers. Please fill in all teammate slots.`)
      return
    }

    // Verify all roll numbers
    for (const roll of filledTeammates) {
      if (roll === activeStudent?.rollNumber) {
        setError(`You are already the team leader. Do not re-enter your own roll number #${roll}.`)
        return
      }
      const verified = findStudentByRegisterNo(roll)
      if (!verified) {
        setError(`Teammate register number "${roll}" was not found in the official CHRIST student list.`)
        return
      }
    }

    setSubmitting(true)
    const res = await registerTeamEvent({
      eventId: event.id,
      teamName: teamName.trim(),
      memberRollNumbers: filledTeammates,
    })
    setSubmitting(false)

    if (res.success && res.team_id) {
      toast.success(res.message)
      onSuccess(res.team_id)
    } else {
      setError(res.message || 'Team registration failed.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#FFF8E8] border-2 border-ink rounded-2xl max-w-lg w-full p-6 shadow-[6px_6px_0px_#151515] my-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg border border-ink bg-white hover:bg-neutral-100"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-ink" />
        </button>

        <div className="mb-4">
          <span className="text-[11px] font-bold text-[#793f98] uppercase tracking-wider">
            CREW REGISTRATION · {event.title}
          </span>
          <DisplayText as="h2" className="text-2xl sm:text-3xl text-ink mt-0.5">
            Register Your Team
          </DisplayText>
          <p className="text-xs text-ink/70 mt-1">
            Allowed team size: <strong>{minPerformers} to {maxPerformers} members</strong> (including team leader).
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl border border-red-500 bg-red-100 text-xs font-semibold text-red-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
              Team / Crew Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. The Central Resonance"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border-2 border-ink rounded-xl font-bold text-ink focus:outline-none focus:ring-2 focus:ring-[#793f98]"
            />
          </div>

          {/* Team Leader (Locked) */}
          <div className="p-3 bg-white rounded-xl border-2 border-ink">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase text-ink/50">Team Leader (You)</span>
              <span className="bg-[#FFD43B] text-ink text-[10px] font-bold px-1.5 py-0.5 rounded border border-ink">
                CAPTAIN
              </span>
            </div>
            <p className="font-display text-base text-ink">{activeStudent?.name}</p>
            <p className="text-xs text-ink/60 tabular-nums font-semibold">
              Register #{activeStudent?.rollNumber} · {activeStudent?.className}
            </p>
          </div>

          {/* Teammates section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-ink">
                Teammate Register Numbers ({teammateRolls.length + 1}/{maxPerformers})
              </label>
              {teammateRolls.length + 1 < maxPerformers && (
                <button
                  type="button"
                  onClick={addSlot}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#793f98] hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Teammate Slot
                </button>
              )}
            </div>

            {teammateRolls.map((roll, idx) => {
              const matchedStudent = roll.length >= 6 ? findStudentByRegisterNo(roll) : null
              return (
                <div key={idx} className="p-2.5 bg-white rounded-xl border border-ink space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-ink/50 w-5">#{idx + 2}</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={7}
                      placeholder="7-digit Register No."
                      value={roll}
                      onChange={(e) => updateRoll(idx, e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-[#FFF8E8] border border-ink rounded-lg text-sm tabular-nums font-bold text-ink focus:outline-none focus:ring-1 focus:ring-[#793f98]"
                    />
                    {teammateRolls.length + 1 > minPerformers && (
                      <button
                        type="button"
                        onClick={() => removeSlot(idx)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 rounded"
                        aria-label="Remove slot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {/* Real-time roster feedback */}
                  {roll.length >= 6 && (
                    <div className="pl-7 text-[11px] font-semibold">
                      {matchedStudent ? (
                        <span className="text-[#00966b]">
                          ✓ {matchedStudent.name} ({matchedStudent.className})
                        </span>
                      ) : (
                        <span className="text-amber-700">
                          ⚠ Register number not in Department of Commerce roster
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="pt-2 flex gap-2">
            <Button
              type="submit"
              variant="primary"
              className="flex-1 text-base font-display uppercase tracking-wider"
              isLoading={submitting}
            >
              Confirm Crew Registration →
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
