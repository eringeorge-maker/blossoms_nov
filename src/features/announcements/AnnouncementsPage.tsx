import { useQuery } from '@tanstack/react-query'
import { DisplayText } from '@/components/comic/ComicPrimitives'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { getAnnouncements } from '@/lib/api/announcements'
import { formatISTDate } from '@/lib/utils'

const SEVERITY_MAP = {
  urgent:    { label: 'Urgent',    variant: 'red'  as const, border: 'border-blossoms-red' },
  important: { label: 'Important', variant: 'yellow' as const, border: 'border-blossoms-yellow' },
  normal:    { label: 'Notice',    variant: 'outline' as const, border: 'border-ink' },
}

export default function AnnouncementsPage() {
  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: getAnnouncements,
  })

  const pinned = announcements.filter((a) => a.is_pinned)
  const regular = announcements.filter((a) => !a.is_pinned)

  return (
    <div className="mx-auto max-w-[800px] px-4 py-8">
      <DisplayText as="h1" className="text-5xl mb-1">Announcements</DisplayText>
      <p className="text-ink/60 mb-8">Official updates, schedule adjustments, and news for Blossoms.</p>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : (
        <>
          {pinned.length > 0 && (
            <section aria-labelledby="pinned-heading" className="mb-8">
              <h2 id="pinned-heading" className="font-display text-2xl mb-4 flex items-center gap-2">
                📌 Pinned Notices
              </h2>
              <ul className="space-y-4">
                {pinned.map((a) => {
                  const s = SEVERITY_MAP[a.severity]
                  return (
                    <li key={a.id} className={`comic-card p-5 border-2 ${s.border}`}>
                      <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                        <Badge variant={s.variant}>{s.label}</Badge>
                        <time className="text-xs text-ink/40" dateTime={a.created_at}>
                          {formatISTDate(a.created_at)}
                        </time>
                      </div>
                      <h3 className="font-display text-2xl text-ink mb-2">{a.title}</h3>
                      <p className="text-sm text-ink/80 leading-relaxed">{a.body}</p>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          <section aria-labelledby="all-announcements-heading">
            <h2 id="all-announcements-heading" className="font-display text-2xl mb-4">All Announcements</h2>
            <ul className="space-y-4">
              {regular.map((a) => {
                const s = SEVERITY_MAP[a.severity]
                return (
                  <li key={a.id} className="comic-card p-5">
                    <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                      <Badge variant={s.variant}>{s.label}</Badge>
                      <time className="text-xs text-ink/40" dateTime={a.created_at}>
                        {formatISTDate(a.created_at)}
                      </time>
                    </div>
                    <h3 className="font-display text-2xl text-ink mb-2">{a.title}</h3>
                    <p className="text-sm text-ink/80 leading-relaxed">{a.body}</p>
                  </li>
                )
              })}
            </ul>
          </section>
        </>
      )}
    </div>
  )
}
