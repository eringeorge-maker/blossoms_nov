import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/States'
import { getDashboardStats } from '@/lib/api/admin'
import { formatDay } from '@/lib/eventDisplay'
import { DataTable, PageHeader, Panel, StatTile, percent } from './AdminUI'

export default function AdminOverview() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: getDashboardStats,
    refetchInterval: 60_000,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    )
  }
  if (isError || !data) return <ErrorState description={(error as Error)?.message} retry={() => refetch()} />

  const t = data.totals
  const lowClasses = [...data.by_class].sort((a, b) => a.registered / a.students - b.registered / b.students).slice(0, 8)

  return (
    <div className="space-y-8">
      <PageHeader
        title="Overview"
        description="Live numbers from the database. Refreshes every minute."
        actions={
          <Button asChild variant="outline">
            <Link to="/admin/exports">Download reports</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Students on the list" value={t.students.toLocaleString()} sub={`${t.accounts_linked.toLocaleString()} signed in · ${percent(t.accounts_linked, t.students)}`} tone="text-primary" />
        <StatTile label="Students registered" value={t.students_registered.toLocaleString()} sub={`${percent(t.students_registered, t.students)} of all students`} tone="text-blossoms-blue" />
        <StatTile label="Registrations" value={t.registrations.toLocaleString()} sub={`${t.teams} teams · ${t.events} events open`} tone="text-blossoms-pink" />
        <StatTile label="Students attended" value={t.students_present.toLocaleString()} sub={`${t.attendance_marked.toLocaleString()} attendance marks`} tone="text-blossoms-green" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Panel title="By category">
          <ul className="space-y-3">
            {data.by_category
              .filter((c) => c.slug !== 'special-events')
              .map((c) => {
                const max = Math.max(1, ...data.by_category.map((x) => x.registrations))
                return (
                  <li key={c.slug}>
                    <div className="flex justify-between text-sm font-semibold">
                      <span>{c.category}</span>
                      <span className="tabular-nums">
                        {c.registrations} reg · {c.present} present
                      </span>
                    </div>
                    <div className="mt-1 h-3 rounded-full border-2 border-ink bg-paper overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${(c.registrations / max) * 100}%` }} />
                    </div>
                  </li>
                )
              })}
          </ul>
        </Panel>

        <Panel
          title="Classes to chase"
          className="lg:col-span-2"
          actions={
            <Link to="/admin/defaulters" className="text-sm font-semibold text-primary hover:underline">
              Defaulter lists →
            </Link>
          }
        >
          <p className="text-xs text-ink/60 mb-2">Lowest share of students registered for at least one event.</p>
          <DataTable>
            <thead>
              <tr>
                <th>Class</th>
                <th className="text-right">Students</th>
                <th className="text-right">Signed in</th>
                <th className="text-right">Registered</th>
                <th className="text-right">Attended</th>
              </tr>
            </thead>
            <tbody>
              {lowClasses.map((c) => (
                <tr key={c.class_name}>
                  <td className="font-semibold">{c.class_name}</td>
                  <td className="text-right tabular-nums">{c.students}</td>
                  <td className="text-right tabular-nums">{c.linked}</td>
                  <td className="text-right tabular-nums">
                    {c.registered} <span className="text-ink/50">({percent(c.registered, c.students)})</span>
                  </td>
                  <td className="text-right tabular-nums">{c.attended}</td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </Panel>
      </div>

      <Panel title="Events">
        <DataTable>
          <thead>
            <tr>
              <th>Date</th>
              <th>Event</th>
              <th>Status</th>
              <th className="text-right">Registered</th>
              <th className="text-right">Teams</th>
              <th className="text-right">Present</th>
              <th className="text-right">Absent</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data.by_event
              .filter((e) => e.registration_enabled)
              .map((e) => (
                <tr key={e.event_id}>
                  <td className="whitespace-nowrap">{formatDay(e.event_date)}</td>
                  <td className="font-semibold">{e.title}</td>
                  <td>{e.registration_closed ? <Badge variant="closed">Closed</Badge> : <Badge variant="open">Open</Badge>}</td>
                  <td className="text-right tabular-nums">{e.registrations}</td>
                  <td className="text-right tabular-nums">{e.event_format === 'individual' ? '—' : e.teams}</td>
                  <td className="text-right tabular-nums">{e.present}</td>
                  <td className="text-right tabular-nums">{e.absent}</td>
                  <td className="text-right">
                    <Link to={`/admin/attendance?event=${e.event_id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                      Attendance <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </DataTable>
      </Panel>
    </div>
  )
}
