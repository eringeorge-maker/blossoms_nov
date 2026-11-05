import { useQuery } from '@tanstack/react-query'
import { Pin } from 'lucide-react'
import { DisplayText } from '@/components/comic/ComicPrimitives'
import { Skeleton } from '@/components/ui/Skeleton'
import { RecapStrip } from '@/features/announcements/RecapStrip'
import { getAnnouncements, getWeeklyRecaps } from '@/lib/api/announcements'
import { formatISTDate } from '@/lib/utils'
import type { Announcement } from '@/types'
import './announcements.css'

const SEVERITY = {
  urgent: { label: 'Urgent!', className: 'notice--urgent' },
  important: { label: 'Important', className: 'notice--important' },
  normal: { label: 'Notice', className: 'notice--normal' },
}

function Notice({ notice, index }: { notice: Announcement; index: number }) {
  const severity = SEVERITY[notice.severity]
  return (
    <li className={`notice ${severity.className} ${index % 2 ? 'notice--tilt-right' : 'notice--tilt-left'}`}>
      <div className="notice-tag font-comic-display">
        {notice.is_pinned && <Pin className="w-3.5 h-3.5" aria-label="Pinned" />}
        {severity.label}
      </div>
      <h3 className="notice-title font-comic-display">{notice.title}</h3>
      <p className="notice-body">{notice.body}</p>
      <time className="notice-date font-comic-sub" dateTime={notice.created_at}>
        {formatISTDate(notice.created_at)}
      </time>
    </li>
  )
}

export default function AnnouncementsPage() {
  const { data: notices = [], isLoading: noticesLoading } = useQuery({ queryKey: ['announcements'], queryFn: getAnnouncements })
  const { data: recaps = [], isLoading: recapsLoading } = useQuery({ queryKey: ['weekly-recaps'], queryFn: getWeeklyRecaps })

  const [latest, ...earlier] = recaps

  return (
    <div className="notice-board">
      <div className="mx-auto max-w-[1100px] px-4 py-8 md:py-12">
        <DisplayText as="h1" className="text-5xl md:text-6xl mb-2">
          Notice Board
        </DisplayText>
        <p className="text-ink/70 mb-10 max-w-xl">The weekly recap as a comic strip, plus official updates and schedule changes.</p>

        <section aria-labelledby="recap-heading" className="mb-14">
          <h2 id="recap-heading" className="sr-only">
            Weekly recap
          </h2>
          {recapsLoading ? (
            <Skeleton className="h-72 w-full" />
          ) : latest ? (
            <RecapStrip recap={latest} />
          ) : (
            <div className="recap-empty font-comic-sub">
              <p className="font-comic-display text-3xl mb-1">To be continued...</p>
              <p>The first weekly recap lands after the first week of Blossoms.</p>
            </div>
          )}

          {earlier.length > 0 && (
            <div className="mt-10 space-y-4">
              <h3 className="font-comic-display text-3xl text-ink">Earlier issues</h3>
              {earlier.map((recap) => (
                <details key={recap.id} className="recap-archive">
                  <summary className="font-comic-display">
                    <span className="recap-ribbon recap-ribbon--small">{recap.week_label}</span> {recap.title}
                  </summary>
                  <div className="pt-5">
                    <RecapStrip recap={recap} headingLevel="h3" />
                  </div>
                </details>
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="notices-heading">
          <h2 id="notices-heading" className="font-comic-display text-4xl text-ink mb-6">
            Bulletin
          </h2>
          {noticesLoading ? (
            <div className="grid md:grid-cols-2 gap-5">
              <Skeleton className="h-36 w-full" />
              <Skeleton className="h-36 w-full" />
            </div>
          ) : notices.length === 0 ? (
            <p className="text-ink/60">No announcements right now.</p>
          ) : (
            <ul className="grid md:grid-cols-2 gap-6">
              {notices.map((notice, index) => (
                <Notice key={notice.id} notice={notice} index={index} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
