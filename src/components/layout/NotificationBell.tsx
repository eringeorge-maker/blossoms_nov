import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getMyNotifications, markAllNotificationsRead, markNotification, type StudentNotification } from '@/lib/api/notifications'
import { formatDateTime } from '@/lib/eventDisplay'

/** Bell with the signed-in student's notifications. */
export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: getMyNotifications,
    refetchInterval: 60_000,
  })
  const unread = items.filter((n) => !n.read_at).length

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['notifications'] })

  async function openItem(n: StudentNotification) {
    if (!n.read_at) await markNotification(n.id, 'read').catch(() => undefined)
    refresh()
    setOpen(false)
    if (n.link) navigate(n.link)
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-expanded={open}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl border-2 border-ink bg-white hover:bg-gutter text-ink shadow-[1.5px_1.5px_0px_var(--color-ink)]"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-comic-red-deep text-white text-[10px] font-bold flex items-center justify-center border border-ink tabular-nums">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[min(92vw,360px)] max-h-[70vh] overflow-y-auto bg-white border-2 border-ink rounded-2xl shadow-[4px_4px_0px_var(--color-ink)] z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b-2 border-ink">
            <p className="font-display text-lg text-ink">Notifications</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={async () => {
                  await markAllNotificationsRead().catch(() => undefined)
                  refresh()
                }}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          {isLoading ? (
            <p className="px-4 py-6 text-sm text-ink/60">Loading…</p>
          ) : items.length === 0 ? (
            <p className="px-4 py-6 text-sm text-ink/60">Nothing new. Team invites, results and updates show up here.</p>
          ) : (
            <ul className="divide-y divide-ink/10">
              {items.map((n) => (
                <li key={n.id} className={cn('flex gap-2 px-4 py-3', !n.read_at && 'bg-paper')}>
                  <button type="button" onClick={() => openItem(n)} className="flex-1 text-left">
                    <p className={cn('text-sm text-ink', !n.read_at && 'font-bold')}>{n.title}</p>
                    <p className="text-xs text-ink/70 mt-0.5">{n.body}</p>
                    <p className="text-[11px] text-ink/40 mt-1">{formatDateTime(n.created_at)}</p>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await markNotification(n.id, 'dismiss').catch(() => undefined)
                      refresh()
                    }}
                    aria-label={`Dismiss ${n.title}`}
                    className="self-start p-1 rounded text-ink/40 hover:text-ink"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
