import { Link } from 'react-router-dom'
import { BookMarked, Compass, ArrowRight, Clock, MapPin, Sparkles } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { DisplayText, ComicPanel, ComicCaptionBox } from '@/components/comic/ComicPrimitives'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { getStudentRegistrations } from '@/lib/api/registration'
import { formatSlot } from '@/lib/utils'
import { getActiveStudent } from '@/lib/auth/authStore'

export default function StudentDashboard() {
  const student = getActiveStudent()
  const { data: registrations = [], isLoading } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: getStudentRegistrations,
  })

  if (!student) return null

  const activeRegistrations = registrations.filter((r) => r.registration_status !== 'cancelled')
  const confirmed = activeRegistrations.filter((r) => r.registration_status === 'confirmed')
  const nextEvent = activeRegistrations[0]

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-6 space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <ComicCaptionBox>
          STUDENT DOSSIER · 2025 EDITION
        </ComicCaptionBox>
      </div>

      {/* Greeting */}
      <div className="bg-white p-5 rounded-2xl border-2 border-ink shadow-[3px_3px_0px_#151515] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <DisplayText as="h1" className="text-4xl text-ink">
            Hey, {student.name.split(' ')[0]}!
          </DisplayText>
          <p className="text-ink/70 mt-1 font-medium text-sm">
            {student.className ? `${student.className} · ` : ''}Roll #{student.rollNumber}
          </p>
        </div>
        <div className="comic-caption-box bg-[#FFD43B] text-ink text-xs">
          ★ VERIFIED ROLL NUMBER
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="comic-card p-5 text-center bg-white">
          <p className="font-display text-xs text-[#793f98] uppercase tracking-wider font-bold mb-1">
            Registered
          </p>
          <p className="font-display text-5xl text-[#793f98]">{activeRegistrations.length}</p>
          <p className="text-[11px] font-semibold text-ink/50 mt-1 uppercase tabular-nums">Total Panels</p>
        </div>

        <div className="comic-card p-5 text-center bg-white">
          <p className="font-display text-xs text-[#26A69A] uppercase tracking-wider font-bold mb-1">
            Confirmed
          </p>
          <p className="font-display text-5xl text-[#26A69A]">{confirmed.length}</p>
          <p className="text-[11px] font-semibold text-ink/50 mt-1 uppercase tabular-nums">Roster Verified</p>
        </div>

        <div className="comic-card p-5 col-span-2 sm:col-span-1 bg-[#FFF8E8] flex flex-col justify-center items-center text-center">
          <p className="font-display text-base text-ink mb-2">Want to join more?</p>
          <Button size="sm" variant="outline" className="w-full text-sm font-display tracking-wider uppercase gap-1" asChild>
            <Link to="/app/events">
              <Compass className="w-4 h-4 text-[#793f98]" /> Explore Panels →
            </Link>
          </Button>
        </div>
      </div>

      {/* Next event */}
      {nextEvent && nextEvent.event && (
        <section aria-labelledby="next-event-heading">
          <div className="flex items-center gap-2 mb-3">
            <ComicCaptionBox>
              UPCOMING SHOWDOWN
            </ComicCaptionBox>
          </div>

          <ComicPanel
            panelNumber="NEXT ACT"
            caption={nextEvent.event.category?.name?.toUpperCase() || 'STAGE'}
            className="p-6"
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <DisplayText as="h3" className="text-3xl sm:text-4xl text-ink leading-tight">
                  {nextEvent.event.title}
                </DisplayText>
                {nextEvent.event.schedule_slots?.[0] && (
                  <p className="text-sm text-ink/80 mt-2 flex items-center gap-2 font-semibold">
                    <Clock className="w-4 h-4 text-[#793f98]" />
                    {formatSlot(nextEvent.event.schedule_slots[0].starts_at, nextEvent.event.schedule_slots[0].ends_at)}
                  </p>
                )}
                {nextEvent.event.schedule_slots?.[0]?.venue && (
                  <p className="text-sm text-ink/70 flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-[#3478F6]" />
                    <span className="font-bold text-ink">{nextEvent.event.schedule_slots[0].venue.name}</span>
                  </p>
                )}
              </div>
              <Badge variant={nextEvent.registration_status === 'confirmed' ? 'registered' : 'waitlist'}>
                {nextEvent.registration_status === 'confirmed' ? 'Confirmed Entry ✓' : 'Waitlisted'}
              </Badge>
            </div>

            <div className="mt-5 pt-4 border-t-2 border-ink/15 flex gap-3 flex-wrap">
              <Button size="sm" variant="primary" asChild className="gap-1.5 font-display tracking-wider uppercase">
                <Link to={`/events/${nextEvent.event.slug}`}>
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  View Event Rules &amp; Details →
                </Link>
              </Button>
              <Button size="sm" variant="outline" asChild className="font-display tracking-wider uppercase">
                <Link to="/app/schedule">
                  Personal Timetable →
                </Link>
              </Button>
            </div>
          </ComicPanel>
        </section>
      )}

      {/* My registrations */}
      <section aria-labelledby="my-regs-heading">
        <div className="flex items-center justify-between mb-4">
          <DisplayText as="h2" id="my-regs-heading" className="text-3xl">
            My Registered Panels
          </DisplayText>
          <Link
            to="/app/my-events"
            className="font-display text-sm uppercase tracking-wider text-[#793f98] hover:underline flex items-center gap-1 font-bold"
          >
            See all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <Skeleton className="h-28 w-full" />
        ) : activeRegistrations.length === 0 ? (
          <div className="comic-card p-10 text-center bg-white">
            <BookMarked className="w-12 h-12 text-ink/20 mx-auto mb-3" />
            <DisplayText as="p" className="text-2xl text-ink mb-1">No panels registered yet</DisplayText>
            <p className="text-sm text-ink/60 mb-5 max-w-sm mx-auto">
              Choose from 30+ events across Arts, Literature, Stage, Theatre, and Special Showcases.
            </p>
            <Button size="md" variant="primary" asChild className="font-display tracking-wider uppercase">
              <Link to="/app/events">Pick Your First Panel →</Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-3">
            {activeRegistrations.map((reg) => (
              <li key={reg.id} className="comic-card p-4 flex items-center justify-between gap-4 flex-wrap bg-white">
                <div>
                  <p className="font-display text-2xl text-ink leading-tight">{reg.event?.title || 'Registered Event'}</p>
                  <p className="text-xs font-semibold text-ink/60 mt-0.5">
                    Registered on {new Date(reg.registered_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={reg.registration_status === 'confirmed' ? 'registered' : 'waitlist'}>
                  {reg.registration_status === 'confirmed' ? 'Confirmed Entry ✓' : 'Waitlisted'}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
