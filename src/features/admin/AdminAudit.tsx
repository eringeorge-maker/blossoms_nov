import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/States'
import { listAuditLogs } from '@/lib/api/admin'
import { formatDateTime } from '@/lib/eventDisplay'
import { DataTable, Muted, PageHeader, Panel, SearchBox } from './AdminUI'

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

export default function AdminAudit() {
  const [q, setQ] = useState('')
  const { data: rows = [], isLoading, isError, error, refetch } = useQuery({ queryKey: ['admin-audit'], queryFn: () => listAuditLogs(300) })
  const filtered = rows.filter((r) => !q || JSON.stringify(r).toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="space-y-6">
      <PageHeader title="Audit log" description="The latest 300 actions recorded by the database: sign-ins, registrations, attendance and winners." />
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
                <th>When</th>
                <th>Who</th>
                <th>Action</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td className="text-xs whitespace-nowrap">{formatDateTime(r.created_at)}</td>
                  <td className="text-xs">{r.actor_role ?? '—'}</td>
                  <td className="text-sm font-semibold">{ACTION_LABELS[r.action] ?? r.action}</td>
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
