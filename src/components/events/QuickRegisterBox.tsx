import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { CheckCircle2, Info, LogIn, MessageCircle, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TeamRegistrationModal } from '@/components/events/TeamRegistrationModal'
import { useAuth } from '@/lib/auth/authStore'
import { registrationState } from '@/lib/api/events'
import { getStudentRegistrations, registerIndividualEvent } from '@/lib/api/registration'
import type { Event } from '@/types'

/** Register box inside the event popup: sign-in prompt, solo register, team builder, or "you're in". */
export function QuickRegisterBox({ event }: { event: Event }) {
  const auth = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [teamOpen, setTeamOpen] = useState(false)
  const reg = registrationState(event)
  // Where to come back to after signing in or completing the profile
  const returnTo = `/events?event=${event.slug}`

  const { data: mine = [] } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: getStudentRegistrations,
    enabled: Boolean(auth.student),
  })
  const existing = mine.find((r) => r.event_id === event.id && r.registration_status !== 'cancelled')

  const goToProfile = () => navigate(`/app/profile?next=${encodeURIComponent(returnTo)}`)

  const register = useMutation({
    mutationFn: () => registerIndividualEvent(event.id),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message)
        queryClient.invalidateQueries({ queryKey: ['my-registrations'] })
      } else if (res.error_code === 'PROFILE_INCOMPLETE') {
        toast.error(res.message)
        goToProfile()
      } else {
        toast.error(res.message)
      }
    },
  })

  function needsPhone(): boolean {
    if (auth.student?.profileComplete) return false
    toast('Add your phone number first. Event heads use it to reach you.', { icon: '📱' })
    goToProfile()
    return true
  }

  const box = 'bg-blossoms-yellow/40 border-2 border-ink rounded-xl p-3 shadow-[2px_2px_0px_var(--color-ink)] mb-4'
  const canSolo = event.event_format !== 'team'
  const canTeam = event.event_format !== 'individual'

  if (event.registration_enabled === false) return null

  if (!reg.open && !existing) {
    return (
      <div className={box}>
        <p className="flex items-center gap-1.5 text-sm font-bold text-ink">
          <Info className="w-4 h-4 text-primary" aria-hidden="true" /> {reg.label}
        </p>
      </div>
    )
  }

  if (!auth.student) {
    return (
      <div className={`${box} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <p className="text-sm font-semibold text-ink">Sign in with your register number to register.</p>
        <Button size="sm" asChild className="font-display uppercase tracking-wider">
          <Link to={`/login?role=student&redirect=${encodeURIComponent(returnTo)}`}>
            <LogIn className="w-4 h-4" /> Sign in
          </Link>
        </Button>
      </div>
    )
  }

  if (existing) {
    return (
      <div className={`${box} flex flex-wrap items-center justify-between gap-2`}>
        <p className="flex items-center gap-1.5 text-sm font-bold text-ink">
          <CheckCircle2 className="w-4 h-4 text-blossoms-green" aria-hidden="true" />
          {existing.team ? `Registered with team ${existing.team.team_name}` : 'You are registered'}
        </p>
        <div className="flex gap-2">
          {existing.whatsapp_group_url && (
            <Button size="sm" variant="secondary" asChild>
              <a href={existing.whatsapp_group_url} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-4 h-4" /> WhatsApp group
              </a>
            </Button>
          )}
          <Button size="sm" variant="outline" asChild>
            <Link to="/app/my-events">My events</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={`${box} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div>
          <p className="text-xs font-bold text-ink">{auth.student.name}</p>
          <p className="text-[11px] text-ink/70 tabular-nums">
            {auth.student.registerNumber} · {auth.student.className}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canSolo && (
            <Button
              size="sm"
              isLoading={register.isPending}
              onClick={() => !needsPhone() && register.mutate()}
              className="font-display tracking-wider uppercase text-xs sm:text-sm"
            >
              {canTeam ? 'Register solo' : 'Register'}
            </Button>
          )}
          {canTeam && (
            <Button
              size="sm"
              variant={canSolo ? 'secondary' : 'primary'}
              onClick={() => !needsPhone() && setTeamOpen(true)}
              className="font-display tracking-wider uppercase text-xs sm:text-sm"
            >
              <Users className="w-4 h-4" /> {canSolo ? 'Register a team' : 'Build your team'}
            </Button>
          )}
        </div>
      </div>
      {teamOpen && (
        <TeamRegistrationModal
          event={event}
          onClose={() => setTeamOpen(false)}
          onSuccess={() => {
            setTeamOpen(false)
            queryClient.invalidateQueries({ queryKey: ['my-registrations'] })
          }}
        />
      )}
    </>
  )
}
