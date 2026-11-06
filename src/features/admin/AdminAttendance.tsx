import { confirmDialog } from '@/components/ui/ConfirmDialog'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Check, X, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/States'
import { getEventRoster, markAttendance, type RosterRow } from '@/lib/api/admin'
import { cn } from '@/lib/utils'
import { DataTable, EventSelect, Muted, PageHeader, Panel, SearchBox, SortTh, useSort } from './AdminUI'

export default function AdminAttendance() {
  const [params, setParams] = useSearchParams()
  const eventId = params.get('event') ?? ''
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()

  const { data: roster = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-roster', eventId],
    queryFn: () => getEventRoster(eventId),
    enabled: Boolean(eventId),
  })

  const mark = useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: 'present' | 'absent' | 'clear' }) => markAttendance(eventId, ids, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roster', eventId] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return roster
    return roster.filter(
      (r) => r.full_name.toLowerCase().includes(q) || r.register_number.startsWith(q) || (r.team_name ?? '').toLowerCase().includes(q)
    )
  }, [roster, search])

  const { sorted, sort, toggle } = useSort(filtered, {
    student: (r) => r.full_name,
    class: (r) => r.class_name,
    team: (r) => r.team_name,
    phone: (r) => r.phone,
    attendance: (r) => (r.attendance_status === 'present' ? 0 : r.attendance_status === 'absent' ? 1 : 2),
  })

  const present = roster.filter((r) => r.attendance_status === 'present').length
  const absent = roster.filter((r) => r.attendance_status === 'absent').length
  const unmarked = roster.length - present - absent
  const mandatory = roster[0]?.registration_status === 'mandatory'

  function markRest(status: 'present' | 'absent') {
    const ids = roster.filter((r) => !r.attendance_status).map((r) => r.student_id)
    if (!ids.length) return
    void confirmDialog(`Mark ${ids.length} unmarked students as ${status}?`, { title: 'Mark the rest', confirmLabel: `Mark ${status}` }).then((ok) => ok && mark.mutate({ ids, status }))
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" description="Mark who turned up. Students marked absent, or never marked, show in the defaulter lists." />

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[260px]">
          <EventSelect
            value={eventId}
            onChange={(id) => {
              setParams(id ? { event: id } : {})
              setSearch('')
            }}
          />
        </div>
        {eventId && <SearchBox value={search} onChange={setSearch} placeholder="Name, register number or team" />}
      </div>

      {!eventId ? (
        <Muted>Choose an event to take attendance.</Muted>
      ) : isLoading ? (
        <Skeleton className="h-80 w-full" />
      ) : isError ? (
        <ErrorState description={(error as Error).message} retry={() => refetch()} />
      ) : roster.length === 0 ? (
        <Muted>Nobody has registered for this event yet.</Muted>
      ) : (
        <Panel
          title={mandatory ? `Mandatory event · all ${roster.length} students` : `${roster.length} registered`}
          actions={
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold text-blossoms-green tabular-nums">{present} present</span>
              <span className="font-semibold text-comic-red-deep tabular-nums">{absent} absent</span>
              <span className="font-semibold text-ink/60 tabular-nums">
                {unmarked} {mandatory ? 'unmarked (counted present)' : 'unmarked'}
              </span>
              {unmarked > 0 && !mandatory && (
                <>
                  <Button size="sm" variant="outline" onClick={() => markRest('present')} disabled={mark.isPending}>
                    Rest present
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => markRest('absent')} disabled={mark.isPending}>
                    Rest absent
                  </Button>
                </>
              )}
            </div>
          }
        >
          {mandatory && (
            <p className="text-sm text-ink/60 -mt-2 mb-3">
              Everyone counts as present once the event is held. Only mark the students who were absent.
            </p>
          )}
          <DataTable>
            <thead>
              <tr>
                <SortTh label="Student" sortKey="student" sort={sort} onSort={toggle} />
                <SortTh label="Class" sortKey="class" sort={sort} onSort={toggle} />
                <SortTh label="Team" sortKey="team" sort={sort} onSort={toggle} />
                <SortTh label="Phone" sortKey="phone" sort={sort} onSort={toggle} />
                <SortTh label="Attendance" sortKey="attendance" sort={sort} onSort={toggle} />
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <AttendanceRow key={r.student_id} row={r} busy={mark.isPending} onMark={(status) => mark.mutate({ ids: [r.student_id], status })} />
              ))}
            </tbody>
          </DataTable>
        </Panel>
      )}
    </div>
  )
}

function AttendanceRow({ row, busy, onMark }: { row: RosterRow; busy: boolean; onMark: (s: 'present' | 'absent' | 'clear') => void }) {
  const btn = 'inline-flex items-center gap-1 rounded-lg border-2 px-2.5 py-1 text-xs font-bold disabled:opacity-50'
  return (
    <tr className={cn(row.attendance_status === 'present' && 'bg-blossoms-green/10', row.attendance_status === 'absent' && 'bg-comic-red-deep/5')}>
      <td>
        <p className="font-semibold">{row.full_name}</p>
        <p className="text-xs text-ink/50 tabular-nums">{row.register_number}</p>
      </td>
      <td className="text-xs">{row.class_name}</td>
      <td className="text-xs">
        {row.team_name ?? '—'}
        {row.is_leader && <span className="ml-1 font-bold text-primary">(leader)</span>}
      </td>
      <td className="text-xs tabular-nums">{row.phone ?? '—'}</td>
      <td>
        <div className="flex gap-1.5">
          <button
            type="button"
            disabled={busy}
            onClick={() => onMark('present')}
            aria-pressed={row.attendance_status === 'present'}
            className={cn(btn, row.attendance_status === 'present' ? 'bg-blossoms-green text-white border-ink' : 'border-ink/30 hover:border-ink')}
          >
            <Check className="w-3.5 h-3.5" /> Present
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onMark('absent')}
            aria-pressed={row.attendance_status === 'absent'}
            className={cn(btn, row.attendance_status === 'absent' ? 'bg-comic-red-deep text-white border-ink' : 'border-ink/30 hover:border-ink')}
          >
            <X className="w-3.5 h-3.5" /> Absent
          </button>
          {row.attendance_status && (
            <button type="button" disabled={busy} onClick={() => onMark('clear')} aria-label={`Clear attendance for ${row.full_name}`} className="p-1 text-ink/40 hover:text-ink">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}
