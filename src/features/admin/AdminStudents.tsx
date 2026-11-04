import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/States'
import { getClassList, getStudentDetail, searchStudentsAdmin, setStudentEmail } from '@/lib/api/admin'
import { useAuth } from '@/lib/auth/authStore'
import { formatDateTime } from '@/lib/eventDisplay'
import { cn } from '@/lib/utils'
import { ClassSelect, DataTable, Muted, PageHeader, Panel, SearchBox, percent } from './AdminUI'

type Tab = 'students' | 'classes'

export default function AdminStudents() {
  const [tab, setTab] = useState<Tab>('students')
  return (
    <div className="space-y-6">
      <PageHeader title="Students & classes" description="2026-27 Department of Commerce student list. Search a student to see their events and account status." />
      <div role="tablist" className="flex gap-2">
        {(['students', 'classes'] as Tab[]).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn('px-4 py-2 rounded-xl border-2 border-ink text-sm font-semibold capitalize', tab === t ? 'bg-primary text-white' : 'bg-paper hover:bg-gutter')}
          >
            {t === 'students' ? 'Student search' : 'Class list'}
          </button>
        ))}
      </div>
      {tab === 'students' ? <StudentSearch /> : <ClassList />}
    </div>
  )
}

function useDebounced<T>(value: T, ms = 300): T {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

function StudentSearch() {
  const [query, setQuery] = useState('')
  const [className, setClassName] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const q = useDebounced(query)
  const enabled = q.trim().length >= 2 || Boolean(className)

  const { data: rows = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-students', q, className],
    queryFn: () => searchStudentsAdmin(q.trim(), className || null, 200),
    enabled,
  })

  return (
    <>
      <div className="flex flex-wrap items-end gap-3">
        <SearchBox value={query} onChange={setQuery} placeholder="Name, register number or email" />
        <ClassSelect value={className} onChange={setClassName} />
      </div>
      {!enabled ? (
        <Muted>Type at least 2 characters or pick a class.</Muted>
      ) : isLoading ? (
        <Skeleton className="h-80 w-full" />
      ) : isError ? (
        <ErrorState description={(error as Error).message} retry={() => refetch()} />
      ) : rows.length === 0 ? (
        <Muted>No students match.</Muted>
      ) : (
        <Panel title={`${rows.length}${rows.length === 200 ? '+' : ''} students`}>
          <DataTable>
            <thead>
              <tr>
                <th>Student</th>
                <th>Class</th>
                <th>Account</th>
                <th>Phone</th>
                <th className="text-right">Events</th>
                <th className="text-right">Attended</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.student_id} className="cursor-pointer hover:bg-paper" onClick={() => setOpenId(r.student_id)}>
                  <td>
                    <button type="button" className="text-left font-semibold hover:underline" onClick={() => setOpenId(r.student_id)}>
                      {r.full_name}
                    </button>
                    <p className="text-xs text-ink/50 tabular-nums">{r.register_number}</p>
                  </td>
                  <td className="text-xs">{r.class_name}</td>
                  <td>{r.linked ? <Badge variant="green">Signed in</Badge> : <Badge variant="outline">Not yet</Badge>}</td>
                  <td className="text-xs tabular-nums">{r.phone ?? '—'}</td>
                  <td className="text-right tabular-nums">{r.registered_count}</td>
                  <td className="text-right tabular-nums">{r.attended_count}</td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </Panel>
      )}
      {openId && <StudentDrawer id={openId} onClose={() => setOpenId(null)} />}
    </>
  )
}

function StudentDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const { admin } = useAuth()
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['admin-student', id], queryFn: () => getStudentDetail(id) })
  const [email, setEmail] = useState('')
  useEffect(() => setEmail(data?.student.institutional_email ?? ''), [data])

  const update = useMutation({
    mutationFn: ({ unlink }: { unlink: boolean }) => setStudentEmail(id, unlink ? null : email.trim() || null, unlink),
    onSuccess: (res) => {
      if (!res.success) return toast.error(res.message ?? 'Failed')
      toast.success('Saved')
      queryClient.invalidateQueries({ queryKey: ['admin-student', id] })
      queryClient.invalidateQueries({ queryKey: ['admin-students'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Student details">
      <button className="flex-1 bg-ink/40" onClick={onClose} aria-label="Close" />
      <aside className="w-full max-w-md bg-paper border-l-2 border-ink overflow-y-auto p-6 space-y-5">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-display text-2xl">{data?.student.full_name ?? '…'}</p>
            <p className="text-sm text-ink/60 tabular-nums">
              {data?.student.register_number} · {data?.student.class_name}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg border border-ink bg-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {isLoading || !data ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <>
            <dl className="text-sm space-y-1">
              <Row label="Account">{data.linked ? 'Signed in' : 'Not signed in yet'}</Row>
              <Row label="Email">{data.student.institutional_email ?? '—'}</Row>
              <Row label="Phone">{data.student.phone ?? '—'}</Row>
              <Row label="Programme">
                {data.student.programme} · Year {data.student.year_of_study}
              </Row>
            </dl>

            <section>
              <h3 className="font-display text-lg mb-2">Events ({data.registrations.length})</h3>
              {data.registrations.length === 0 ? (
                <p className="text-sm text-ink/60">Not registered for any event.</p>
              ) : (
                <ul className="space-y-2">
                  {data.registrations.map((r) => (
                    <li key={r.event_id} className="rounded-xl border-2 border-ink/20 bg-white p-3 text-sm">
                      <p className="font-semibold">{r.event_title}</p>
                      <p className="text-xs text-ink/60">
                        {r.registration_status} · {formatDateTime(r.registered_at)}
                        {r.team_name ? ` · team ${r.team_name}` : ''}
                      </p>
                      {r.attendance_status && <Badge variant={r.attendance_status === 'present' ? 'green' : 'red'} className="mt-1">{r.attendance_status}</Badge>}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {admin?.role === 'super_admin' && (
              <section className="space-y-3 border-t-2 border-ink/10 pt-4">
                <h3 className="font-display text-lg">Account fixes</h3>
                <p className="text-xs text-ink/60">
                  Set the email this student must sign in with (use when their CHRIST email does not contain their name), or
                  unlink an account someone else claimed.
                </p>
                <Input label="Sign-in email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@bcom.christuniversity.in" />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" isLoading={update.isPending} onClick={() => update.mutate({ unlink: false })}>
                    Save email
                  </Button>
                  {data.linked && (
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={update.isPending}
                      onClick={() => {
                        if (window.confirm('Unlink this account? The student signs in again with their own email.')) update.mutate({ unlink: true })
                      }}
                    >
                      Unlink account
                    </Button>
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </aside>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 py-1.5 border-b border-ink/10">
      <dt className="text-ink/60">{label}</dt>
      <dd className="font-semibold text-right break-all">{children}</dd>
    </div>
  )
}

function ClassList() {
  const { data: classes = [], isLoading, isError, error, refetch } = useQuery({ queryKey: ['admin-classes'], queryFn: getClassList })
  if (isLoading) return <Skeleton className="h-96 w-full" />
  if (isError) return <ErrorState description={(error as Error).message} retry={() => refetch()} />
  const total = classes.reduce((a, c) => a + c.students, 0)
  return (
    <Panel title={`${classes.length} classes · ${total.toLocaleString()} students`}>
      <DataTable>
        <thead>
          <tr>
            <th>Class</th>
            <th>Programme</th>
            <th className="text-right">Students</th>
            <th className="text-right">Signed in</th>
            <th className="text-right">Registered</th>
            <th className="text-right">Attended</th>
          </tr>
        </thead>
        <tbody>
          {classes.map((c) => (
            <tr key={c.class_name}>
              <td className="font-semibold">{c.class_name}</td>
              <td className="text-xs">
                {c.programme} · Year {c.year_of_study}
              </td>
              <td className="text-right tabular-nums">{c.students}</td>
              <td className="text-right tabular-nums">{c.linked}</td>
              <td className="text-right tabular-nums">
                {c.registered} <span className="text-ink/50">({percent(c.registered, c.students)})</span>
              </td>
              <td className="text-right tabular-nums">
                {c.attended} <span className="text-ink/50">({percent(c.attended, c.students)})</span>
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </Panel>
  )
}
