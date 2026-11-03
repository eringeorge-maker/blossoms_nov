import { useParams, Link, useNavigate } from 'react-router-dom'
import { DisplayText, ComicPanel, ComicCaptionBox } from '@/components/comic/ComicPrimitives'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Users, Crown, ArrowLeft, CalendarDays, MapPin, UserCheck } from 'lucide-react'
import { getTeamDetails } from '@/lib/api/registration'
import { formatSlot } from '@/lib/utils'

export default function TeamPage() {
  const { teamId } = useParams()
  const navigate = useNavigate()
  const { team, event } = getTeamDetails(teamId || '')

  if (!team) {
    return (
      <div className="mx-auto max-w-[800px] px-4 py-12 text-center space-y-4">
        <Users className="w-16 h-16 mx-auto text-ink/40" />
        <DisplayText as="h1" className="text-3xl text-ink">Team Dossier Not Found</DisplayText>
        <p className="text-ink/60 text-sm">
          No team registration was found for identifier <code className="font-bold">{teamId}</code>.
        </p>
        <Button asChild variant="outline">
          <Link to="/app/my-events">Return to My Entries</Link>
        </Button>
      </div>
    )
  }

  const firstSlot = event?.schedule_slots?.[0]

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6 space-y-6">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link
          to="/app/my-events"
          className="inline-flex items-center gap-2 text-sm font-display tracking-wider uppercase text-ink hover:text-[#793f98] font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Entries
        </Link>
        <ComicCaptionBox>
          OFFICIAL CREW ROSTER · BLOSSOMS 2026
        </ComicCaptionBox>
      </div>

      {/* Team Hero Header */}
      <div className="bg-white p-6 rounded-2xl border-2 border-ink shadow-[4px_4px_0px_#151515] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Badge variant="blue">Crew Registration</Badge>
            <Badge variant="registered">Confirmed Entry ✓</Badge>
          </div>
          <DisplayText as="h1" className="text-3xl sm:text-4xl text-ink">
            {team.team_name}
          </DisplayText>
          <p className="text-sm font-semibold text-ink/70 mt-1">
            Registered for <strong className="text-ink">{event?.title || 'Festival Event'}</strong>
          </p>
        </div>

        <div className="bg-[#FFF8E8] p-3 rounded-xl border border-ink text-center">
          <p className="text-xs uppercase font-bold text-ink/50 tracking-wider">Total Performers</p>
          <p className="font-display text-3xl text-ink">{team.members?.length || 1}</p>
        </div>
      </div>

      {/* Event Details Panel */}
      {event && (
        <ComicPanel panelNumber="DETAILS" caption="PERFORMANCE TIMETABLE">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wider font-bold text-ink/50">Category &amp; Arena</p>
              <p className="font-semibold text-ink">{event.category?.name || 'Festival'} Arena</p>
            </div>
            {firstSlot && (
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider font-bold text-ink/50">Scheduled Slot</p>
                <p className="font-semibold text-ink flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-[#793f98]" />
                  {formatSlot(firstSlot.starts_at, firstSlot.ends_at)}
                </p>
                {firstSlot.venue && (
                  <p className="text-xs text-ink/70 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {firstSlot.venue.name} ({firstSlot.venue.building || 'Campus'})
                  </p>
                )}
              </div>
            )}
          </div>
        </ComicPanel>
      )}

      {/* Team Roster Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <DisplayText as="h2" className="text-2xl text-ink">
            Performer Line-Up
          </DisplayText>
          <span className="text-xs font-bold text-ink/50 uppercase tabular-nums">
            {team.members?.length} Verified Students
          </span>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {team.members?.map((member, index) => {
            const isLeader = member.is_leader || member.student_id === team.leader_student_id
            return (
              <div
                key={member.id || member.student_id}
                className="bg-white p-4 rounded-xl border-2 border-ink shadow-[2px_2px_0px_#151515] flex items-center gap-3.5"
              >
                <div
                  className={`w-12 h-12 rounded-xl border-2 border-ink flex items-center justify-center font-display text-lg ${
                    isLeader ? 'bg-[#FFD43B] text-ink' : 'bg-[#FFF8E8] text-ink'
                  }`}
                >
                  {isLeader ? <Crown className="w-6 h-6 text-ink" /> : index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-display text-base text-ink truncate">
                      {member.student?.full_name || `Student ${member.student_id}`}
                    </p>
                    {isLeader && (
                      <span className="bg-[#151515] text-[#FFD43B] text-[9px] font-bold uppercase px-1.5 py-0.5 rounded">
                        Leader
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink/60 font-semibold tabular-nums">
                    Register #{member.student_id || member.student?.register_number}
                  </p>
                  <p className="text-[11px] text-[#793f98] font-bold truncate">
                    {member.student?.department_id || 'Department of Commerce'}
                  </p>
                </div>

                <UserCheck className="w-4 h-4 text-[#26A69A] flex-shrink-0" />
              </div>
            )
          })}
        </div>
      </section>

      {/* Back Button */}
      <div className="pt-4 flex gap-3">
        <Button onClick={() => navigate('/app/my-events')} variant="primary">
          View All My Registrations →
        </Button>
        {event?.slug && (
          <Button asChild variant="outline">
            <Link to={`/events/${event.slug}`}>View Event Page</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
