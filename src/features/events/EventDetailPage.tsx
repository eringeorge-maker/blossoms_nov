import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, MapPin, Users, CheckCircle2, X, AlertCircle, Search, UserPlus, MessageCircle, Award } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { DisplayText, ComicCaptionBox, ComicPanel } from '@/components/comic/ComicPrimitives'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { getEventBySlug, registrationState } from '@/lib/api/events'
import {
  registerIndividualEvent,
  registerTeamEvent,
  getStudentRegistrations,
  searchStudents,
  type StudentSearchResult,
} from '@/lib/api/registration'
import { useAuth } from '@/lib/auth/authStore'
import { formatDateTime, slotLabel, teamSizeLabel } from '@/lib/eventDisplay'
import type { Event } from '@/types'

export default function EventDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const auth = useAuth()
  const [teamModalOpen, setTeamModalOpen] = useState(false)

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', slug],
    queryFn: () => getEventBySlug(slug || ''),
    enabled: Boolean(slug),
  })

  const { data: registrations = [] } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: getStudentRegistrations,
    enabled: Boolean(auth.student),
  })

  const userReg = registrations.find((r) => r.event_id === event?.id && r.registration_status !== 'cancelled')

  const registerSolo = useMutation({
    mutationFn: () => registerIndividualEvent(event!.id),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message)
        queryClient.invalidateQueries({ queryKey: ['my-registrations'] })
      } else if (result.error_code === 'PROFILE_INCOMPLETE') {
        toast.error(result.message)
        navigate(`/app/profile?next=/events/${slug}`)
      } else {
        toast.error(result.message)
      }
    },
    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Registration failed'),
  })

  function startRegistration(mode: 'solo' | 'team') {
    if (!auth.student) {
      navigate(`/login?role=student&redirect=/events/${slug}`)
      return
    }
    if (!auth.student.profileComplete) {
      toast('Add your phone number first. Event heads use it to reach you.', { icon: '📱' })
      navigate(`/app/profile?next=/events/${slug}`)
      return
    }
    if (mode === 'team') setTeamModalOpen(true)
    else registerSolo.mutate()
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
        <DisplayText as="h1" className="text-3xl">Event not found</DisplayText>
        <p className="text-ink/60">This event does not exist or has been archived.</p>
        <Button asChild>
          <Link to="/events">Back to events</Link>
        </Button>
      </div>
    )
  }

  const rulesList = (event.rules_markdown || '').split('\n').filter((l) => l.trim().length > 0)
  const reg = registrationState(event)
  const faculty = (event.contacts ?? []).filter((c) => c.role === 'faculty_coordinator')
  const heads = (event.contacts ?? []).filter((c) => c.role === 'student_head')
  const isAdminOnly = Boolean(auth.admin && !auth.student)

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 pb-32">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-sm font-display tracking-wider uppercase text-ink hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> All events
        </Link>
        <ComicCaptionBox>{(event.category?.name ?? 'Festival').toUpperCase()} · CENTRAL CAMPUS</ComicCaptionBox>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <Badge variant="outline">{event.category?.name ?? 'General'}</Badge>
        <Badge variant={event.event_format === 'individual' ? 'pink' : 'blue'}>{teamSizeLabel(event)}</Badge>
        {event.registration_enabled !== false && (
          <Badge variant={reg.open ? 'open' : 'closed'}>{reg.open ? 'Registration open' : reg.label}</Badge>
        )}
        {event.points ? <Badge variant="yellow">{event.points} deanery points</Badge> : null}
        {userReg && <Badge variant="registered">You're registered ✓</Badge>}
      </div>

      <DisplayText as="h1" className="text-4xl sm:text-5xl md:text-6xl mb-4 text-ink">
        {event.title}
      </DisplayText>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="md:col-span-2 space-y-6">
          <ComicPanel panelNumber="BRIEFING" caption="ABOUT">
            <DisplayText as="h2" className="text-2xl mb-3">About this event</DisplayText>
            <p className="text-base text-ink/80 leading-relaxed">{event.description}</p>
          </ComicPanel>

          {rulesList.length > 0 && (
            <ComicPanel panelNumber="RULES" caption="BLOSSOMS 2026-27">
              <DisplayText as="h2" className="text-2xl mb-4">Rules</DisplayText>
              <ol className="space-y-3 list-decimal list-inside text-sm text-ink/80 leading-relaxed">
                {rulesList.map((rule, i) => (
                  <li key={i} className="pl-1">
                    <span className="font-semibold text-ink">{rule.replace(/^\d+\.\s*/, '')}</span>
                  </li>
                ))}
              </ol>
            </ComicPanel>
          )}

          <ComicPanel panelNumber="WHEN" caption="SCHEDULE">
            <DisplayText as="h2" className="text-2xl mb-4">Schedule &amp; venue</DisplayText>
            {!event.schedule_slots?.length ? (
              <p className="text-sm text-ink/50">Schedule details will be announced shortly.</p>
            ) : (
              <div className="space-y-3">
                {event.schedule_slots.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-4 bg-white rounded-xl border-2 border-ink/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <p className="text-sm font-semibold text-ink flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-primary" aria-hidden="true" />
                      {slotLabel(slot)}
                    </p>
                    {slot.venue && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-paper border border-ink rounded-lg text-ink self-start sm:self-auto">
                        <MapPin className="w-3.5 h-3.5 text-comic-red-deep" aria-hidden="true" />
                        {slot.venue.name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ComicPanel>
        </div>

        <aside className="space-y-6">
          <Card variant="panel" className="bg-paper">
            <div className="border-b-2 border-ink pb-2 mb-4">
              <DisplayText as="h2" className="text-2xl text-ink">Key details</DisplayText>
            </div>
            <dl className="space-y-3.5 text-sm">
              {event.registration_enabled !== false && (
                <Detail label="Registration closes">
                  {event.registration_closed ? 'Closed by organisers' : formatDateTime(event.registration_closes_at)}
                </Detail>
              )}
              <Detail label="Entry">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blossoms-blue" aria-hidden="true" /> {teamSizeLabel(event)}
                </span>
              </Detail>
              {event.finals_rule && (
                <Detail label="Finals (January 2027)">
                  <span className="inline-flex items-start gap-1.5 font-semibold">
                    <Award className="w-4 h-4 mt-0.5 shrink-0 text-primary" aria-hidden="true" /> {event.finals_rule}
                  </span>
                </Detail>
              )}
              {faculty.length > 0 && <Detail label="Faculty coordinator">{faculty.map((c) => c.name).join(', ')}</Detail>}
              {heads.length > 0 && <Detail label="Event heads">{heads.map((c) => c.name).join(', ')}</Detail>}
            </dl>
          </Card>
        </aside>
      </div>

      {event.registration_enabled !== false && !isAdminOnly && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-paper border-t-2 border-ink p-4 shadow-[0_-4px_0_0_rgba(21,21,21,0.06)]">
          <div className="mx-auto max-w-[640px] flex items-center gap-3">
            {userReg ? (
              <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 px-4 rounded-xl border-2 border-ink shadow-[2px_2px_0px_var(--color-ink)]">
                <span className="flex items-center gap-2 font-bold text-sm text-blossoms-green">
                  <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                  {userReg.team ? `Registered with team ${userReg.team.team_name}` : 'You are registered'}
                </span>
                <div className="flex gap-2">
                  {userReg.whatsapp_group_url && (
                    <Button size="sm" variant="secondary" asChild>
                      <a href={userReg.whatsapp_group_url} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="w-4 h-4" /> WhatsApp group
                      </a>
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => navigate('/app/my-events')}>
                    My events →
                  </Button>
                </div>
              </div>
            ) : !reg.open ? (
              <p className="w-full text-center font-display text-lg uppercase tracking-wider text-ink/60">{reg.label}</p>
            ) : event.event_format === 'either' ? (
              <>
                <Button size="lg" className="flex-1 font-display uppercase" isLoading={registerSolo.isPending} onClick={() => startRegistration('solo')}>
                  Register solo
                </Button>
                <Button size="lg" variant="secondary" className="flex-1 font-display uppercase" onClick={() => startRegistration('team')}>
                  Register a team
                </Button>
              </>
            ) : (
              <Button
                size="lg"
                className="w-full text-lg font-display tracking-wider uppercase shadow-[4px_4px_0px_var(--color-ink)]"
                isLoading={registerSolo.isPending}
                onClick={() => startRegistration(event.event_format === 'team' ? 'team' : 'solo')}
              >
                {!auth.student ? 'Sign in to register →' : event.event_format === 'team' ? 'Register your team →' : 'Register now →'}
              </Button>
            )}
          </div>
        </div>
      )}

      {teamModalOpen && (
        <TeamRegistrationModal
          event={event}
          onClose={() => setTeamModalOpen(false)}
          onSuccess={() => {
            setTeamModalOpen(false)
            queryClient.invalidateQueries({ queryKey: ['my-registrations'] })
            navigate('/app/my-events')
          }}
        />
      )}
    </div>
  )
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-ink/10 pb-2 last:border-0">
      <dt className="text-ink/60 font-medium text-xs uppercase tracking-wider">{label}</dt>
      <dd className="font-bold text-ink mt-0.5">{children}</dd>
    </div>
  )
}

function TeamRegistrationModal({ event, onClose, onSuccess }: { event: Event; onClose: () => void; onSuccess: () => void }) {
  const auth = useAuth()
  const me = auth.student!
  const min = event.min_team_size ?? 2
  const max = event.max_team_size ?? min
  const [teamName, setTeamName] = useState('')
  const [members, setMembers] = useState<StudentSearchResult[]>([])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<StudentSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const total = members.length + 1
  const full = total >= max

  useEffect(() => {
    const q = query.trim()
    if (q.length < 3) {
      setResults([])
      return
    }
    let cancelled = false
    setSearching(true)
    const t = setTimeout(async () => {
      try {
        const found = await searchStudents(q)
        if (!cancelled) setResults(found)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Search failed')
      } finally {
        if (!cancelled) setSearching(false)
      }
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [query])

  function addMember(s: StudentSearchResult) {
    if (s.register_number === me.registerNumber) return setError('You are already in the team as its leader.')
    if (members.some((m) => m.register_number === s.register_number)) return
    if (full) return setError(`${event.title} allows at most ${max} members.`)
    setMembers([...members, s])
    setQuery('')
    setResults([])
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (teamName.trim().length < 2) return setError('Give your team a name.')
    if (total < min) return setError(`${event.title} needs at least ${min} members including you. Add ${min - total} more.`)
    setSubmitting(true)
    const res = await registerTeamEvent({
      eventId: event.id,
      teamName: teamName.trim(),
      memberRegisterNumbers: members.map((m) => m.register_number),
    })
    setSubmitting(false)
    if (res.success) {
      toast.success(res.message)
      onSuccess()
    } else {
      setError(res.message)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="team-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-paper border-2 border-ink rounded-2xl max-w-lg w-full p-6 shadow-[6px_6px_0px_var(--color-ink)] my-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg border border-ink bg-white hover:bg-gutter"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-ink" />
        </button>

        <p className="text-xs font-bold text-primary uppercase tracking-wider">Team registration · {event.title}</p>
        <DisplayText as="h2" id="team-modal-title" className="text-2xl sm:text-3xl text-ink mt-0.5">
          Build your team
        </DisplayText>
        <p className="text-sm text-ink/70 mt-1 mb-4">
          {min === max ? `Exactly ${min}` : `${min} to ${max}`} members, including you. Everyone you add is registered and
          notified.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Team name" required maxLength={60} placeholder="e.g. The Ledger Lions" value={teamName} onChange={(e) => setTeamName(e.target.value)} />

          <div>
            <p className="text-sm font-semibold text-ink mb-1.5">
              Members ({total}/{max})
            </p>
            <ul className="space-y-1.5">
              <li className="flex items-center justify-between rounded-xl border-2 border-ink bg-white px-3 py-2">
                <span>
                  <span className="font-semibold">{me.name}</span>
                  <span className="block text-xs text-ink/60 tabular-nums">
                    {me.registerNumber} · {me.className}
                  </span>
                </span>
                <Badge variant="yellow">Leader</Badge>
              </li>
              {members.map((m) => (
                <li key={m.register_number} className="flex items-center justify-between rounded-xl border border-ink bg-white px-3 py-2">
                  <span>
                    <span className="font-semibold">{m.full_name}</span>
                    <span className="block text-xs text-ink/60 tabular-nums">
                      {m.register_number} · {m.class_name}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setMembers(members.filter((x) => x.register_number !== m.register_number))}
                    className="p-1.5 rounded text-ink/50 hover:text-comic-red-deep"
                    aria-label={`Remove ${m.full_name}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {!full && (
            <div className="relative">
              <label htmlFor="member-search" className="text-sm font-semibold text-ink">
                Add a member
              </label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" aria-hidden="true" />
                <input
                  id="member-search"
                  type="search"
                  autoComplete="off"
                  placeholder="Register number or name"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-xl border-2 border-ink bg-white pl-9 pr-4 py-2.5 text-base text-ink placeholder:text-ink/40 focus:outline-none focus:border-primary"
                />
              </div>
              {query.trim().length >= 3 && (
                <ul className="mt-1.5 max-h-56 overflow-y-auto rounded-xl border-2 border-ink bg-white divide-y divide-ink/10" aria-live="polite">
                  {searching && results.length === 0 && <li className="px-3 py-2 text-sm text-ink/60">Searching…</li>}
                  {!searching && results.length === 0 && <li className="px-3 py-2 text-sm text-ink/60">No students match.</li>}
                  {results.map((s) => (
                    <li key={s.register_number}>
                      <button
                        type="button"
                        onClick={() => addMember(s)}
                        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left hover:bg-gutter"
                      >
                        <span>
                          <span className="font-semibold text-sm">{s.full_name}</span>
                          <span className="block text-xs text-ink/60 tabular-nums">
                            {s.register_number} · {s.class_name}
                          </span>
                        </span>
                        <UserPlus className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {error && (
            <p role="alert" className="flex items-start gap-2 rounded-xl border-2 border-comic-red-deep bg-white p-3 text-sm font-semibold text-comic-red-deep">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}

          <div className="pt-2 flex gap-2">
            <Button type="submit" className="flex-1 font-display uppercase tracking-wider" isLoading={submitting} disabled={total < min}>
              Register team
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
