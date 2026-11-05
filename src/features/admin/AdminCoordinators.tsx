import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Trash2, UserPlus } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  assignCoordinator,
  inviteAdmin,
  listAdmins,
  listAssignments,
  listClassReps,
  removeInvite,
  setAdminActive,
  setAdminRole,
  unassignCoordinator,
} from '@/lib/api/admin'
import { ROLE_LABELS, useAuth } from '@/lib/auth/authStore'
import { formatDateTime } from '@/lib/eventDisplay'
import type { UserRole } from '@/types'
import { DataTable, EventSelect, Muted, PageHeader, Panel, SearchBox, SortTh, selectClass, useAdminEvents, useSort } from './AdminUI'

const ROLES: UserRole[] = ['super_admin', 'content_editor', 'event_coordinator', 'analyst']
const ROLE_HELP: Record<string, string> = {
  super_admin: 'Everything, including admins and account fixes',
  content_editor: 'All events, announcements, winners, attendance',
  event_coordinator: 'Attendance and winners for assigned events',
  analyst: 'Read-only reports',
}

export default function AdminCoordinators() {
  return (
    <div className="space-y-6">
      <PageHeader title="Admins & contacts" description="Who can sign in to this console, which events coordinators manage, and the class reps list." />
      <AdminsPanel />
      <AssignmentsPanel />
      <RepsPanel />
    </div>
  )
}

function AdminsPanel() {
  const { admin } = useAuth()
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['admin-accounts'], queryFn: listAdmins })
  const accounts = useMemo(() => data?.accounts ?? [], [data])
  const {
    sorted: sortedAdmins,
    sort: adminSort,
    toggle: toggleAdminSort,
  } = useSort(accounts, {
    name: (a) => a.full_name,
    role: (a) => ROLE_LABELS[a.role],
    status: (a) => (a.is_active ? 0 : 1),
  })
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<UserRole>('event_coordinator')
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin-accounts'] })
  const onError = (e: Error) => toast.error(e.message)

  const invite = useMutation({
    mutationFn: () => inviteAdmin(email, name, role, admin!.id),
    onSuccess: () => {
      toast.success(`Invited ${email}. They sign in on the Admin tab with that email.`)
      setEmail('')
      setName('')
      refresh()
    },
    onError,
  })
  const uninvite = useMutation({ mutationFn: removeInvite, onSuccess: refresh, onError })
  const toggle = useMutation({ mutationFn: ({ id, active }: { id: string; active: boolean }) => setAdminActive(id, active), onSuccess: refresh, onError })
  const changeRole = useMutation({ mutationFn: ({ id, r }: { id: string; r: UserRole }) => setAdminRole(id, r), onSuccess: refresh, onError })

  const pending = (data?.invites ?? []).filter((i) => !i.claimed_at)

  return (
    <Panel title="Admins">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || !name.trim()) return toast.error('Add a name and a valid email.')
          invite.mutate()
        }}
        className="grid sm:grid-cols-[1fr_1fr_auto_auto] gap-3 items-end mb-6"
      >
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Role
          <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className={selectClass} title={ROLE_HELP[role]}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit" isLoading={invite.isPending}>
          <UserPlus className="w-4 h-4" /> Invite
        </Button>
      </form>
      <p className="text-xs text-ink/60 -mt-4 mb-4">{ROLE_HELP[role]}.</p>

      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : (
        <DataTable>
          <thead>
            <tr>
              <SortTh label="Admin" sortKey="name" sort={adminSort} onSort={toggleAdminSort} />
              <SortTh label="Role" sortKey="role" sort={adminSort} onSort={toggleAdminSort} />
              <SortTh label="Status" sortKey="status" sort={adminSort} onSort={toggleAdminSort} />
              <th />
            </tr>
          </thead>
          <tbody>
            {sortedAdmins.map((a) => (
              <tr key={a.id}>
                <td>
                  <p className="font-semibold">{a.full_name}</p>
                  <p className="text-xs text-ink/50">{a.email}</p>
                </td>
                <td>
                  <select
                    value={a.role}
                    disabled={a.id === admin?.id}
                    onChange={(e) => changeRole.mutate({ id: a.id, r: e.target.value as UserRole })}
                    className={selectClass}
                    aria-label={`Role for ${a.full_name}`}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{a.is_active ? <Badge variant="green">Active</Badge> : <Badge variant="closed">Disabled</Badge>}</td>
                <td>
                  {a.id !== admin?.id && (
                    <button onClick={() => toggle.mutate({ id: a.id, active: !a.is_active })} className="text-xs font-semibold text-primary hover:underline">
                      {a.is_active ? 'Disable' : 'Enable'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {pending.map((i) => (
              <tr key={i.email}>
                <td>
                  <p className="font-semibold">{i.full_name}</p>
                  <p className="text-xs text-ink/50">{i.email}</p>
                </td>
                <td className="text-xs">{ROLE_LABELS[i.role]}</td>
                <td>
                  <Badge variant="soon">Invited {formatDateTime(i.created_at)}</Badge>
                </td>
                <td>
                  <button onClick={() => uninvite.mutate(i.email)} aria-label={`Cancel invite for ${i.email}`} className="p-1 text-ink/50 hover:text-comic-red-deep">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </Panel>
  )
}

function AssignmentsPanel() {
  const queryClient = useQueryClient()
  const { data: events = [] } = useAdminEvents()
  const { data: admins } = useQuery({ queryKey: ['admin-accounts'], queryFn: listAdmins })
  const { data: assignments = [], isLoading } = useQuery({ queryKey: ['admin-assignments'], queryFn: listAssignments })
  const [eventId, setEventId] = useState('')
  const [adminId, setAdminId] = useState('')
  const coordinators = (admins?.accounts ?? []).filter((a) => a.role === 'event_coordinator' && a.is_active)
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin-assignments'] })

  const add = useMutation({
    mutationFn: () => assignCoordinator(eventId, adminId),
    onSuccess: () => {
      toast.success('Assigned')
      refresh()
    },
    onError: (e: Error) => toast.error(e.message.includes('duplicate') ? 'Already assigned' : e.message),
  })
  const remove = useMutation({ mutationFn: unassignCoordinator, onSuccess: refresh, onError: (e: Error) => toast.error(e.message) })

  return (
    <Panel title="Event coordinators">
      {coordinators.length === 0 ? (
        <Muted>Invite someone with the Event coordinator role, and once they have signed in you can assign them events here.</Muted>
      ) : (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (eventId && adminId) add.mutate()
            }}
            className="flex flex-wrap gap-3 items-end mb-4"
          >
            <div className="min-w-[240px]">
              <EventSelect value={eventId} onChange={setEventId} id="assign-event" />
            </div>
            <label className="flex flex-col gap-1 text-sm font-semibold">
              Coordinator
              <select value={adminId} onChange={(e) => setAdminId(e.target.value)} className={selectClass}>
                <option value="">Choose…</option>
                {coordinators.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name}
                  </option>
                ))}
              </select>
            </label>
            <Button type="submit" disabled={!eventId || !adminId} isLoading={add.isPending}>
              Assign
            </Button>
          </form>
          {isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : assignments.length === 0 ? (
            <Muted>No assignments yet.</Muted>
          ) : (
            <ul className="divide-y divide-ink/10">
              {assignments.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-2 text-sm">
                  <span>
                    <strong>{(admins?.accounts ?? []).find((x) => x.id === a.admin_profile_id)?.full_name ?? 'Admin'}</strong> →{' '}
                    {events.find((e) => e.id === a.event_id)?.title ?? 'Event'}
                  </span>
                  <button onClick={() => remove.mutate(a.id)} aria-label="Remove assignment" className="p-1 text-ink/50 hover:text-comic-red-deep">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Panel>
  )
}

function RepsPanel() {
  const { data: reps = [], isLoading } = useQuery({ queryKey: ['admin-reps'], queryFn: listClassReps })
  const [q, setQ] = useState('')
  const filtered = reps.filter((r) => !q || `${r.full_name} ${r.class_name} ${r.register_number ?? ''}`.toLowerCase().includes(q.toLowerCase()))
  const { sorted, sort, toggle } = useSort(filtered, {
    class: (r) => r.class_name,
    rep: (r) => r.full_name,
    register: (r) => r.register_number,
    phone: (r) => r.phone,
  })
  return (
    <Panel title={`Class representatives (${reps.length})`}>
      <div className="mb-3 max-w-sm">
        <SearchBox value={q} onChange={setQ} placeholder="Name or class" id="reps-search" />
      </div>
      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <DataTable>
          <thead>
            <tr>
              <SortTh label="Class" sortKey="class" sort={sort} onSort={toggle} />
              <SortTh label="Rep" sortKey="rep" sort={sort} onSort={toggle} />
              <SortTh label="Register no." sortKey="register" sort={sort} onSort={toggle} />
              <SortTh label="Phone" sortKey="phone" sort={sort} onSort={toggle} />
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.id}>
                <td className="font-semibold">{r.class_name}</td>
                <td>{r.full_name}</td>
                <td className="tabular-nums text-xs">{r.register_number ?? '—'}</td>
                <td className="tabular-nums text-xs">
                  {r.phone ? (
                    <a href={`tel:+91${r.phone}`} className="hover:underline">
                      {r.phone}
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </Panel>
  )
}
