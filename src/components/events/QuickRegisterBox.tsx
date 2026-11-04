import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { CheckCircle2, Info, LogIn, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth/authStore'
import { registrationState } from '@/lib/api/events'
import { getStudentRegistrations, registerIndividualEvent } from '@/lib/api/registration'
import type { Event } from '@/types'

/** Compact register box for event sheets: sign-in prompt, one-tap solo register, or team link. */
export function QuickRegisterBox({ event }: { event: Event }) {
  const auth = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const reg = registrationState(event)
  const detailHref = `/events/${event.slug}`

  const { data: mine = [] } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: getStudentRegistrations,
    enabled: Boolean(auth.student),
  })
  const existing = mine.find((r) => r.event_id === event.id && r.registration_status !== 'cancelled')

  const register = useMutation({
    mutationFn: () => registerIndividualEvent(event.id),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message)
        queryClient.invalidateQueries({ queryKey: ['my-registrations'] })
      } else if (res.error_code === 'PROFILE_INCOMPLETE') {
        toast.error(res.message)
        navigate(`/app/profile?next=${detailHref}`)
      } else {
        toast.error(res.message)
      }
    },
  })

  const box = 'bg-blossoms-yellow/40 border-2 border-ink rounded-xl p-3 shadow-[2px_2px_0px_var(--color-ink)] mb-3'

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
        <p className="text-sm font-semibold text-ink">Sign in with your register number and CHRIST email to register.</p>
        <Button size="sm" asChild className="font-display uppercase tracking-wider">
          <Link to={`/login?role=student&redirect=${detailHref}`}>
            <LogIn className="w-4 h-4" /> Sign in
          </Link>
        </Button>
      </div>
    )
  }

  if (existing) {
    return (
      <div className={box}>
        <p className="flex items-center gap-1.5 text-sm font-bold text-ink">
          <CheckCircle2 className="w-4 h-4 text-blossoms-green" aria-hidden="true" />
          {existing.team ? `Registered with team ${existing.team.team_name}` : 'You are registered'}
        </p>
      </div>
    )
  }

  return (
    <div className={`${box} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
      <div>
        <p className="text-xs font-bold text-ink">{auth.student.name}</p>
        <p className="text-[11px] text-ink/70 tabular-nums">
          {auth.student.registerNumber} · {auth.student.className}
        </p>
      </div>
      {event.event_format === 'individual' ? (
        <Button
          size="sm"
          isLoading={register.isPending}
          onClick={() => register.mutate()}
          className="font-display tracking-wider uppercase text-xs sm:text-sm"
        >
          Register
        </Button>
      ) : (
        <Button size="sm" asChild className="font-display tracking-wider uppercase text-xs sm:text-sm">
          <Link to={detailHref}>
            <Users className="w-4 h-4" /> {event.event_format === 'team' ? 'Build your team' : 'Register'}
          </Link>
        </Button>
      )}
    </div>
  )
}
