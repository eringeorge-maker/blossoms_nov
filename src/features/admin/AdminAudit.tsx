import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/States'
import { listAuditLogs } from '@/lib/api/admin'
import { formatDateTime } from '@/lib/eventDisplay'
import { DataTable, Muted, PageHeader, Panel, SearchBox, SortTh, useSort } from './AdminUI'

const ACTION_LABELS: Record<string, string> = {
  claim_account: 'Student signed in for the first time',
  admin_claimed: 'Admin signed in for the first time',
  register_individual: 'Registered (solo)',
  register_team: 'Registered a team',
  cancel_registration: 'Cancelled a registration',
  mark_attendance: 'Marked attendance',
  set_winners: 'Declared winners',
  set_student_email: 'Changed a student sign-in',
}

const TABLE_LABELS: Record<string, string> = {
  events: 'event',
  event_schedule_slots: 'schedule slot',
  announcements: 'notice',
  notifications: 'notification',
  weekly_recaps: 'weekly recap',
  fest_teams: 'fest team',
  class_team_assignments: 'class team',
  fest_settings: 'participation rules',
  admin_profiles: 'admin',
  admin_invites: 'admin invite',
  event_coordinator_assignments: 'coordinator assignment',
}
const VERB: Record<string, string> = { insert: 'Added', update: 'Edited', delete: 'Deleted' }

/** "events_update" -> "Edited event"; falls back to the raw action name. */
function actionLabel(action: string): string {
  if (ACTION_LABELS[action]) return ACTION_LABELS[action]
  const m = action.match(/^(.+)_(insert|update|delete)$/)
  if (m && TABLE_LABELS[m[1]]) return `${VERB[m[2]]} ${TABLE_LABELS[m[1]]}`
  return action
}

export default function AdminAudit() {
  const [q, setQ] = useState('')
  const { data: rows = [], isLoading, isError, error, refetch } = useQuery({ queryKey: ['admin-audit'], queryFn: () => listAuditLogs(300) })
  const filtered = useMemo(() => rows.filter((r) => !q || JSON.stringify(r).toLowerCase().includes(q.toLowerCase())), [rows, q])
  const { sorted, sort, toggle } = useSort(filtered, {
    when: (r) => r.created_at,
    who: (r) => r.actor_role,
    action: (r) => actionLabel(r.action),
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Audit log" description="The latest 300 actions recorded by the database: sign-ins, registrations, attendance, winners and every admin edit." />
      <div className="max-w-md">
        <SearchBox value={q} onChange={setQ} placeholder="Action, role or detail" />
      </div>
      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : isError ? (
        <ErrorState description={(error as Error).message} retry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <Muted>No entries.</Muted>
      ) : (
        <Panel>
          <DataTable>
            <thead>
              <tr>
                <SortTh label="When" sortKey="when" sort={sort} onSort={toggle} />
                <SortTh label="Who" sortKey="who" sort={sort} onSort={toggle} />
                <SortTh label="Action" sortKey="action" sort={sort} onSort={toggle} />
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr key={r.id}>
                  <td className="text-xs whitespace-nowrap">{formatDateTime(r.created_at)}</td>
                  <td className="text-xs">{r.actor_role ?? '—'}</td>
                  <td className="text-sm font-semibold">{actionLabel(r.action)}</td>
                  <td className="text-xs text-ink/60 font-mono break-all max-w-[420px]">{r.detail ? JSON.stringify(r.detail) : ''}</td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </Panel>
      )}
    </div>
  )
}
