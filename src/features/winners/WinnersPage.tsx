import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Trophy, Sparkles } from 'lucide-react'
import { DisplayText, ComicPanel, ComicCaptionBox } from '@/components/comic/ComicPrimitives'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { getTeamLeaderboard, type TeamStanding } from '@/lib/api/admin'

interface PublicWinner {
  event_id: string
  event_title: string
  event_slug: string
  category: string
  position: number
  description: string | null
  winner_name: string
  class_name: string | null
  members: string[] | null
}

async function getPublicWinners(): Promise<PublicWinner[]> {
  if (!isSupabaseConfigured) return []
  const { data, error } = await supabase.rpc('get_public_winners')
  if (error) throw new Error(error.message)
  return (data ?? []) as PublicWinner[]
}

const PLACE = ['', '1st place', '2nd place', '3rd place']

/** The four team totals. Renders nothing while the standings are switched off. */
function TeamStandings() {
  const { data: teams = [] } = useQuery({
    queryKey: ['team-leaderboard'],
    queryFn: () => (isSupabaseConfigured ? getTeamLeaderboard() : Promise.resolve([] as TeamStanding[])),
  })
  if (teams.length === 0) return null
  const ranked = [...teams].sort((a, b) => b.points - a.points)
  const top = Math.max(1, ...ranked.map((t) => t.points))
  return (
    <section aria-labelledby="team-standings" className="comic-card p-5 bg-white space-y-3">
      <h2 id="team-standings" className="font-display text-2xl text-ink">Team standings</h2>
      <ol className="space-y-2">
        {ranked.map((t, i) => (
          <li key={t.team_id} className="flex items-center gap-3">
            <span className="w-6 font-display text-xl text-ink tabular-nums">{i + 1}</span>
            <span className="h-4 w-4 rounded-full border-2 border-ink shrink-0" style={{ background: t.color }} aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-sm font-bold text-ink">
                <span className="truncate">{t.name}</span>
                <span className="tabular-nums">{t.points.toLocaleString()} pts</span>
              </div>
              <div className="mt-1 h-3 rounded-full border-2 border-ink bg-paper overflow-hidden">
                <div className="h-full" style={{ width: `${(t.points / top) * 100}%`, background: t.color }} />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default function WinnersPage() {
  const { data: winners = [], isLoading } = useQuery({ queryKey: ['public-winners'], queryFn: getPublicWinners })

  const byEvent = new Map<string, PublicWinner[]>()
  for (const w of winners) byEvent.set(w.event_id, [...(byEvent.get(w.event_id) ?? []), w])

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <DisplayText as="h1" className="text-4xl sm:text-5xl text-ink">Results</DisplayText>
          <p className="text-ink/70 text-sm mt-1">Winners of the Blossoms 2026-27 Department of Commerce prelims.</p>
        </div>
        <ComicCaptionBox>BLOSSOMS 2026–27</ComicCaptionBox>
      </div>

      <TeamStandings />

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : byEvent.size === 0 ? (
        <ComicPanel className="p-6 text-center bg-paper">
          <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" aria-hidden="true" />
          <p className="font-display text-2xl text-ink">No results yet</p>
          <p className="text-sm text-ink/60 mt-1 max-w-xl mx-auto">
            Results are posted here as each event finishes. The first events run from 14 November.
          </p>
        </ComicPanel>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...byEvent.values()].map((list) => (
            <div key={list[0].event_id} className="comic-card p-5 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline">{list[0].category}</Badge>
                <Trophy className="w-5 h-5 text-blossoms-yellow" aria-hidden="true" />
              </div>
              <Link to={`/events/${list[0].event_slug}`} className="font-display text-xl text-ink hover:text-primary block">
                {list[0].event_title}
              </Link>
              <ol className="space-y-2">
                {list.map((w) => (
                  <li key={w.position} className="p-3 bg-paper rounded-xl border border-ink">
                    <span className="inline-block px-2 py-0.5 bg-blossoms-yellow text-ink text-[11px] font-bold rounded border border-ink mb-1">
                      {PLACE[w.position] ?? `#${w.position}`}
                    </span>
                    <p className="font-bold text-sm text-ink">
                      {w.winner_name}
                      {w.class_name && !w.members && <span className="font-normal text-ink/60"> · {w.class_name}</span>}
                    </p>
                    {w.members && <p className="text-xs text-ink/60">{w.members.join(', ')}</p>}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
