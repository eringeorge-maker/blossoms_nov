import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { DisplayText } from '@/components/comic/ComicPrimitives'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Users, List, CalendarDays, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react'
import { MASTER_SCHEDULE } from '@/lib/data/masterSchedule'
import { STUDENT_ROSTER } from '@/lib/data/studentsRoster'
import { EVENTS } from '@/lib/data/eventsData'
import { getStoredRegistrations } from '@/lib/api/registration'

export default function AdminOverview() {
  const registrations = useMemo(() => getStoredRegistrations(), [])
  const confirmedCount = registrations.filter((r) => r.registration_status === 'confirmed').length

  const STATS = [
    {
      label: 'Scheduled Sessions',
      value: MASTER_SCHEDULE.length,
      sub: 'Nov 12 – Dec 15, 2026',
      icon: CalendarDays,
      color: 'text-[#793f98]',
      href: '/admin/schedule',
    },
    {
      label: 'Verified Students',
      value: Object.keys(STUDENT_ROSTER).length.toLocaleString(),
      sub: 'Dept of Commerce Roster',
      icon: Users,
      color: 'text-[#0088e8]',
      href: '/admin/students',
    },
    {
      label: 'Festival Events',
      value: EVENTS.length,
      sub: '5 Competition Arenas',
      icon: List,
      color: 'text-[#ed1e79]',
      href: '/admin/events',
    },
    {
      label: 'Active Registrations',
      value: registrations.length,
      sub: `${confirmedCount} confirmed`,
      icon: CheckCircle,
      color: 'text-[#00966b]',
      href: '/admin/registrations',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <DisplayText as="h1" className="text-4xl">Developer &amp; Admin Console</DisplayText>
          <p className="text-sm text-ink/60 mt-1">
            Operational mission control for KALA · Blossoms Festival 2026–27
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="open" className="gap-1.5 py-1 px-3">
            <ShieldCheck className="w-4 h-4 text-[#00966b]" /> ALL SERVICES HEALTHY
          </Badge>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ label, value, sub, icon: Icon, color, href }) => (
          <Link
            key={label}
            to={href}
            className="comic-card p-5 bg-white hover:-translate-y-1 hover:shadow-[4px_4px_0px_#151515] transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <Icon className={`w-7 h-7 ${color}`} aria-hidden="true" />
              <ArrowRight className="w-4 h-4 text-ink/30 group-hover:text-ink transition-colors" />
            </div>
            <p className="font-display text-4xl text-ink tabular-nums">{value}</p>
            <p className="text-sm font-bold text-ink mt-1">{label}</p>
            <p className="text-xs text-ink/50 mt-0.5">{sub}</p>
          </Link>
        ))}
      </div>

      {/* Quick Launch Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="comic-card p-6 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-ink">Master Schedule Control</h2>
            <Badge variant="outline">2026 Timetable</Badge>
          </div>
          <p className="text-sm text-ink/70 leading-relaxed">
            Review the official 34 sessions across Central Campus auditoriums, Bird's Park Amphitheatre, and open arenas.
          </p>
          <div className="pt-2 flex gap-2">
            <Button asChild variant="primary">
              <Link to="/admin/schedule">Open Schedule Manager →</Link>
            </Button>
            <Button asChild variant="outline">
              <a href="/FINAL SCHEDULE.pdf" target="_blank" rel="noopener noreferrer">
                View PDF
              </a>
            </Button>
          </div>
        </div>

        <div className="comic-card p-6 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-ink">Student Roster Audit</h2>
            <Badge variant="registered">2,603 Verified</Badge>
          </div>
          <p className="text-sm text-ink/70 leading-relaxed">
            Search, lookup, and verify student records across all sections of BCOM, BCOM F&amp;I, and MCOM programs.
          </p>
          <div className="pt-2 flex gap-2">
            <Button asChild variant="primary">
              <Link to="/admin/students">Search Student Roster →</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/registrations">Registration Reports</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
