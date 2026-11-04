import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { MessageCircle, Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/States'
import { updateEvent, type EventPatch } from '@/lib/api/admin'
import { registrationState } from '@/lib/api/events'
import { slotLabel, teamSizeLabel } from '@/lib/eventDisplay'
import { cn } from '@/lib/utils'
import type { Event } from '@/types'
import { DataTable, PageHeader, Panel, SearchBox, useAdminEvents } from './AdminUI'

export default function AdminEventsPage() {
  const { data: events = [], isLoading, isError, error, refetch } = useAdminEvents()
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')

  const categories = [...new Map(events.map((e) => [e.category?.slug ?? '', e.category?.name ?? ''])).entries()].filter(([s]) => s)
  const filtered = events.filter(
    (e) =>
      (category === 'all' || e.category?.slug === category) &&
      (!search || e.title.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Events"
        description="Close or reopen registration, add the WhatsApp group link students see after registering, and edit details."
      />

      <div className="flex flex-wrap items-end gap-3">
        <SearchBox value={search} onChange={setSearch} placeholder="Event name" />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Category">
          {[['all', 'All'], ...categories].map(([slug, name]) => (
            <button
              key={slug}
              onClick={() => setCategory(slug)}
              aria-pressed={category === slug}
              className={cn(
                'px-3 py-1.5 rounded-full border-2 border-ink text-sm font-semibold',
                category === slug ? 'bg-ink text-paper' : 'bg-paper hover:bg-gutter'
              )}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : isError ? (
        <ErrorState description={(error as Error).message} retry={() => refetch()} />
      ) : (
        <Panel>
          <DataTable>
            <thead>
              <tr>
                <th>Event</th>
                <th>When</th>
                <th>Entry</th>
                <th>Registration</th>
                <th>WhatsApp group</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <EventRow key={e.id} event={e} />
              ))}
            </tbody>
          </DataTable>
        </Panel>
      )}
    </div>
  )
}

function EventRow({ event }: { event: Event }) {
  const queryClient = useQueryClient()
  const [link, setLink] = useState(event.whatsapp_group_url ?? '')
  const state = registrationState(event)

  const save = useMutation({
    mutationFn: (patch: EventPatch) => updateEvent(event.id, patch),
    onSuccess: () => {
      toast.success('Saved')
      queryClient.invalidateQueries({ queryKey: ['admin-events'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const linkChanged = (link.trim() || null) !== (event.whatsapp_group_url ?? null)
  const linkValid = !link.trim() || /^https:\/\/(chat\.whatsapp\.com|wa\.me|whatsapp\.com)\//.test(link.trim())

  return (
    <tr>
      <td>
        <p className="font-semibold">{event.title}</p>
        <p className="text-xs text-ink/50">{event.category?.name}</p>
      </td>
      <td className="text-xs whitespace-nowrap">
        {slotLabel(event.schedule_slots?.[0])}
        <span className="block text-ink/50">{event.schedule_slots?.[0]?.venue?.name}</span>
      </td>
      <td className="text-xs">{teamSizeLabel(event)}</td>
      <td>
        {event.registration_enabled === false ? (
          <Badge variant="outline">No registration</Badge>
        ) : (
          <div className="flex flex-col items-start gap-1.5">
            <Badge variant={state.open ? 'open' : 'closed'}>{state.label}</Badge>
            <button
              type="button"
              disabled={save.isPending}
              onClick={() => save.mutate({ registration_closed: !event.registration_closed })}
              className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
            >
              {event.registration_closed ? 'Reopen registration' : 'Close registration'}
            </button>
          </div>
        )}
      </td>
      <td className="min-w-[240px]">
        {event.registration_enabled !== false && (
          <form
            className="flex gap-1.5"
            onSubmit={(e) => {
              e.preventDefault()
              if (!linkValid) return toast.error('Use a chat.whatsapp.com or wa.me link')
              save.mutate({ whatsapp_group_url: link.trim() || null })
            }}
          >
            <label className="sr-only" htmlFor={`wa-${event.id}`}>
              WhatsApp group link for {event.title}
            </label>
            <div className="relative flex-1">
              <MessageCircle className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink/40" aria-hidden="true" />
              <input
                id={`wa-${event.id}`}
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://chat.whatsapp.com/…"
                className={cn(
                  'w-full rounded-lg border-2 bg-paper pl-7 pr-2 py-1.5 text-xs focus:outline-none',
                  linkValid ? 'border-ink/30 focus:border-primary' : 'border-comic-red-deep'
                )}
              />
            </div>
            {linkChanged && (
              <Button type="submit" size="sm" isLoading={save.isPending}>
                Save
              </Button>
            )}
          </form>
        )}
      </td>
      <td>
        <Link to={`/admin/events/${event.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
          <Pencil className="w-3 h-3" /> Edit
        </Link>
      </td>
    </tr>
  )
}
