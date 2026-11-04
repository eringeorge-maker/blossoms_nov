import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Users } from 'lucide-react'
import { DisplayText, ComicPanel } from '@/components/comic/ComicPrimitives'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { getTeamDetails } from '@/lib/api/registration'
import { slotLabel } from '@/lib/eventDisplay'

export default function StudentTeamPage() {
  const { teamId = '' } = useParams()
  const { data: reg, isLoading } = useQuery({ queryKey: ['team', teamId], queryFn: () => getTeamDetails(teamId) })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[700px] px-4 py-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!reg?.team) {
    return (
      <div className="mx-auto max-w-[600px] px-4 py-16 text-center space-y-4">
        <DisplayText as="h1" className="text-3xl">Team not found</DisplayText>
        <p className="text-ink/60">You can only see teams you are part of.</p>
        <Button asChild>
          <Link to="/app/my-events">My events</Link>
        </Button>
      </div>
    )
  }

  const team = reg.team
  return (
    <div className="mx-auto max-w-[700px] px-4 py-6 space-y-6">
      <Link to="/app/my-events" className="inline-flex items-center gap-2 text-sm font-display uppercase tracking-wider hover:text-primary">
        <ArrowLeft className="w-4 h-4" /> My events
      </Link>
      <div>
        <Badge variant="outline">{reg.event?.title}</Badge>
        <DisplayText as="h1" className="text-4xl mt-2">Team {team.team_name}</DisplayText>
        <p className="text-sm text-ink/70 mt-1">{slotLabel(reg.event?.schedule_slots?.[0])}</p>
      </div>
      <ComicPanel>
        <p className="font-display text-xl mb-3 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" aria-hidden="true" /> {team.members.length} members
        </p>
        <ul className="divide-y divide-ink/10">
          {team.members.map((m) => (
            <li key={m.register_number} className="py-2 flex items-center justify-between gap-2">
              <span>
                <span className="font-semibold">{m.full_name}</span>
                <span className="block text-xs text-ink/60 tabular-nums">
                  {m.register_number} · {m.class_name}
                </span>
              </span>
              {m.is_leader && <Badge variant="yellow">Leader</Badge>}
            </li>
          ))}
        </ul>
      </ComicPanel>
    </div>
  )
}
