import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/States'
import { getDefaulters, type DefaulterKind, type DefaulterRow } from '@/lib/api/admin'
import { downloadCsv, toCsv } from '@/lib/csv'
import { cn } from '@/lib/utils'
import { ClassSelect, DataTable, Muted, PageHeader, Panel, SortTh, useSort } from './AdminUI'

const KINDS: { kind: DefaulterKind; label: string; help: string }[] = [
  { kind: 'below_minimum', label: 'Below the minimum', help: 'Attended fewer chosen events than the minimum set under Points & teams. Mandatory events are not counted.' },
  { kind: 'registered_none', label: 'Registered for nothing', help: 'Students with no active registration. Mandatory events are not counted.' },
  { kind: 'registered_not_attended', label: 'Registered, did not attend', help: 'Registered for an event where attendance was taken, but not marked present.' },
  { kind: 'attended_none', label: 'Attended nothing', help: 'Not marked present at any event yet.' },
]

export default function AdminDefaulters() {
  const [kind, setKind] = useState<DefaulterKind>('below_minimum')
  const [className, setClassName] = useState('')
  const { data: rows = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-defaulters', kind, className],
    queryFn: () => getDefaulters(kind, className || null),
  })
  const { sorted, sort, toggle } = useSort(rows, {
    student: (r) => r.full_name,
    class: (r) => r.class_name,
    phone: (r) => r.phone,
    registered: (r) => r.registered_count,
    attended: (r) => r.attended_count,
  })
  const current = KINDS.find((k) => k.kind === kind)!

  function exportCsv() {
    const csv = toCsv<DefaulterRow>(rows, [
      { header: 'Register number', value: (r) => r.register_number },
      { header: 'Name', value: (r) => r.full_name },
      { header: 'Class', value: (r) => r.class_name },
      { header: 'Phone', value: (r) => r.phone },
      { header: 'Registrations', value: (r) => r.registered_count },
      { header: 'Attended', value: (r) => r.attended_count },
      { header: 'Missed events', value: (r) => r.missed_events },
    ])
    downloadCsv(`defaulters-${kind}${className ? `-${className.replace(/\W+/g, '_')}` : ''}.csv`, csv)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Defaulters" description="Students to follow up with. Filter by class, then share the list with class teachers and reps." />

      <div role="tablist" aria-label="Defaulter list" className="flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <button
            key={k.kind}
            role="tab"
            aria-selected={kind === k.kind}
            onClick={() => setKind(k.kind)}
            className={cn('px-4 py-2 rounded-xl border-2 border-ink text-sm font-semibold', kind === k.kind ? 'bg-primary text-white shadow-[2px_2px_0px_var(--color-ink)]' : 'bg-paper hover:bg-gutter')}
          >
            {k.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <ClassSelect value={className} onChange={setClassName} />
        <Button variant="outline" onClick={exportCsv} disabled={!rows.length}>
          <Download className="w-4 h-4" /> Download CSV
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : isError ? (
        <ErrorState description={(error as Error).message} retry={() => refetch()} />
      ) : (
        <Panel title={`${rows.length.toLocaleString()} students`}>
          <p className="text-xs text-ink/60 mb-3">{current.help}</p>
          {rows.length === 0 ? (
            <Muted>Nobody on this list. 🎉</Muted>
          ) : (
            <DataTable>
              <thead>
                <tr>
                  <SortTh label="Student" sortKey="student" sort={sort} onSort={toggle} />
                  <SortTh label="Class" sortKey="class" sort={sort} onSort={toggle} />
                  <SortTh label="Phone" sortKey="phone" sort={sort} onSort={toggle} />
                  <SortTh label="Registered" sortKey="registered" sort={sort} onSort={toggle} className="text-right" />
                  <SortTh label="Attended" sortKey="attended" sort={sort} onSort={toggle} className="text-right" />
                  {kind === 'registered_not_attended' && <th>Missed</th>}
                </tr>
              </thead>
              <tbody>
                {sorted.slice(0, 500).map((r) => (
                  <tr key={r.student_id}>
                    <td>
                      <p className="font-semibold">{r.full_name}</p>
                      <p className="text-xs text-ink/50 tabular-nums">{r.register_number}</p>
                    </td>
                    <td className="text-xs">{r.class_name}</td>
                    <td className="text-xs tabular-nums">{r.phone ?? '—'}</td>
                    <td className="text-right tabular-nums">{r.registered_count}</td>
                    <td className="text-right tabular-nums">{r.attended_count}</td>
                    {kind === 'registered_not_attended' && <td className="text-xs">{r.missed_events}</td>}
                  </tr>
                ))}
              </tbody>
            </DataTable>
          )}
          {rows.length > 500 && <p className="text-xs text-ink/60 mt-3">Showing 500 of {rows.length}. Download the CSV for the full list.</p>}
        </Panel>
      )}
    </div>
  )
}
