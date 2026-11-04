import { useState } from 'react'
import toast from 'react-hot-toast'
import { Download, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { getClassList, getParticipationRows, type ParticipationRow } from '@/lib/api/admin'
import { downloadCsv, toCsv, type CsvColumn } from '@/lib/csv'
import { formatDateTime } from '@/lib/eventDisplay'
import { PageHeader, Panel } from './AdminUI'

type ExportKind = 'reg-event' | 'reg-class' | 'att-event' | 'att-class' | 'class-summary'

const EXPORTS: { kind: ExportKind; title: string; description: string }[] = [
  { kind: 'reg-event', title: 'Registrations by event', description: 'Every registration, grouped by event, with team and phone.' },
  { kind: 'reg-class', title: 'Registrations by class', description: 'The same list grouped by class, for class teachers.' },
  { kind: 'att-event', title: 'Attendance by event', description: 'Registrations with present / absent / not marked, grouped by event.' },
  { kind: 'att-class', title: 'Attendance by class', description: 'Attendance grouped by class, for the SWO participation sheet.' },
  { kind: 'class-summary', title: 'Class summary', description: 'One row per class: students, signed in, registered, attended.' },
]

const BASE: CsvColumn<ParticipationRow>[] = [
  { header: 'Event', value: (r) => r.event_title },
  { header: 'Category', value: (r) => r.category },
  { header: 'Event date', value: (r) => r.event_date },
  { header: 'Register number', value: (r) => r.register_number },
  { header: 'Name', value: (r) => r.full_name },
  { header: 'Class', value: (r) => r.class_name },
  { header: 'Phone', value: (r) => r.phone },
  { header: 'Team', value: (r) => r.team_name },
  { header: 'Team leader', value: (r) => (r.team_name ? (r.is_leader ? 'Yes' : 'No') : '') },
]

const byEvent = (a: ParticipationRow, b: ParticipationRow) =>
  a.event_title.localeCompare(b.event_title) || (a.class_name ?? '').localeCompare(b.class_name ?? '') || a.full_name.localeCompare(b.full_name)
const byClass = (a: ParticipationRow, b: ParticipationRow) =>
  (a.class_name ?? '').localeCompare(b.class_name ?? '') || a.full_name.localeCompare(b.full_name) || a.event_title.localeCompare(b.event_title)

export default function AdminExports() {
  const [busy, setBusy] = useState<ExportKind | null>(null)

  async function run(kind: ExportKind) {
    setBusy(kind)
    try {
      const stamp = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
      if (kind === 'class-summary') {
        const classes = await getClassList()
        downloadCsv(
          `blossoms-class-summary-${stamp}.csv`,
          toCsv(classes, [
            { header: 'Class', value: (c) => c.class_name },
            { header: 'Programme', value: (c) => c.programme },
            { header: 'Year', value: (c) => c.year_of_study },
            { header: 'Students', value: (c) => c.students },
            { header: 'Signed in', value: (c) => c.linked },
            { header: 'Registered (1+ event)', value: (c) => c.registered },
            { header: 'Attended (1+ event)', value: (c) => c.attended },
          ])
        )
        return
      }
      const rows = await getParticipationRows()
      const attendance = kind.startsWith('att')
      const sorted = [...rows].sort(kind.endsWith('event') ? byEvent : byClass)
      const columns: CsvColumn<ParticipationRow>[] = attendance
        ? [...BASE, { header: 'Attendance', value: (r) => r.attendance_status ?? 'not marked' }, { header: 'Marked at', value: (r) => (r.marked_at ? formatDateTime(r.marked_at) : '') }]
        : [...BASE, { header: 'Registered at', value: (r) => formatDateTime(r.registered_at) }]
      const name = `${attendance ? 'attendance' : 'registrations'}-by-${kind.endsWith('event') ? 'event' : 'class'}`
      downloadCsv(`blossoms-${name}-${stamp}.csv`, toCsv(sorted, columns))
      toast.success(`${rows.length.toLocaleString()} rows exported`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Export failed')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Exports" description="CSV files that open in Excel or Google Sheets. They contain phone numbers: share them only with staff." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {EXPORTS.map((x) => (
          <Panel key={x.kind}>
            <FileSpreadsheet className="w-7 h-7 text-primary mb-2" aria-hidden="true" />
            <h2 className="font-display text-xl text-ink">{x.title}</h2>
            <p className="text-sm text-ink/60 mt-1 mb-4">{x.description}</p>
            <Button variant="outline" onClick={() => run(x.kind)} isLoading={busy === x.kind} disabled={busy !== null}>
              <Download className="w-4 h-4" /> Download CSV
            </Button>
          </Panel>
        ))}
      </div>
    </div>
  )
}
