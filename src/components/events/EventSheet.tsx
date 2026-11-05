import { useEffect } from 'react'
import { Award, Calendar, CalendarClock, MapPin, Users, X } from 'lucide-react'
import { DisplayText } from '@/components/comic/ComicPrimitives'
import { QuickRegisterBox } from '@/components/events/QuickRegisterBox'
import { registrationState } from '@/lib/api/events'
import { formatDateTime, slotLabel, teamSizeLabel } from '@/lib/eventDisplay'
import type { Event } from '@/types'

/**
 * The one place students read about an event and register for it.
 * Used by the Events page and the Schedule page: details, schedule, every rule, and the register box.
 */
export function EventSheet({ event, onClose }: { event: Event; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [onClose])

  const rules = (event.rules_markdown ?? '')
    .split('\n')
    .map((l) => l.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean)
  const faculty = (event.contacts ?? []).filter((c) => c.role === 'faculty_coordinator')
  const heads = (event.contacts ?? []).filter((c) => c.role === 'student_head')
  const reg = registrationState(event)

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[120] p-3 sm:p-6 flex items-end md:items-center justify-center bg-black/60 animate-in fade-in duration-200"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={event.title}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-paper border-[3px] md:border-[4px] border-ink rounded-2xl shadow-[6px_6px_0px_var(--color-ink)] p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white border-2 border-ink flex items-center justify-center text-ink hover:bg-blossoms-yellow transition-colors shadow-[1.5px_1.5px_0px_var(--color-ink)]"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="inline-block bg-blossoms-yellow border-2 border-ink px-2.5 py-0.5 rounded shadow-[1.5px_1.5px_0px_var(--color-ink)] mb-2 -rotate-1">
          <span className="font-display text-[10px] sm:text-xs tracking-wider uppercase font-black">{event.category?.name ?? 'Event'}</span>
        </div>

        <DisplayText as="h3" className="text-2xl sm:text-3xl text-ink font-black leading-tight mb-2 pr-10">
          {event.title}
        </DisplayText>
        <p className="text-ink/80 text-sm leading-relaxed mb-4">{event.description}</p>

        <div className="bg-white border-2 border-ink rounded-xl p-3 shadow-[2px_2px_0px_var(--color-ink)] space-y-2 mb-4 text-sm">
          {(event.schedule_slots?.length ? event.schedule_slots : [undefined]).map((slot, i) => (
            <div key={slot?.id ?? i} className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-ink">
                <Calendar className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                <span>{slotLabel(slot)}</span>
              </div>
              {slot?.venue && (
                <div className="flex items-center gap-1.5 text-ink/70">
                  <MapPin className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                  <span>{slot.venue.name}</span>
                </div>
              )}
            </div>
          ))}
          <div className="flex items-center gap-1.5 text-ink/70 pt-1 border-t border-ink/10">
            <Users className="w-4 h-4 text-blossoms-blue shrink-0" aria-hidden="true" />
            <span>{teamSizeLabel(event)}</span>
          </div>
          {event.registration_enabled !== false && (
            <div className="flex items-center gap-1.5 text-ink/70">
              <CalendarClock className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
              <span>
                {event.registration_closed || !reg.open
                  ? reg.label
                  : `Registration closes ${formatDateTime(event.registration_closes_at)}`}
              </span>
            </div>
          )}
          {event.points ? (
            <div className="flex items-center gap-1.5 text-ink/70">
              <Award className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
              <span>{event.points} deanery points</span>
            </div>
          ) : null}
        </div>

        <QuickRegisterBox event={event} />

        {(faculty.length > 0 || heads.length > 0 || event.finals_rule) && (
          <dl className="bg-white border-2 border-ink/20 rounded-xl p-3 mb-4 text-sm space-y-2">
            {faculty.length > 0 && <InfoRow label="Faculty coordinator">{faculty.map((c) => c.name).join(', ')}</InfoRow>}
            {heads.length > 0 && <InfoRow label="Event heads">{heads.map((c) => c.name).join(', ')}</InfoRow>}
            {event.finals_rule && <InfoRow label="Finals (January 2027)">{event.finals_rule}</InfoRow>}
          </dl>
        )}

        {rules.length > 0 && (
          <section aria-labelledby="sheet-rules" className="mb-4">
            <h4 id="sheet-rules" className="font-display text-lg uppercase tracking-wide text-ink mb-2">
              Rules &amp; regulations
            </h4>
            <ol className="list-decimal list-outside pl-5 space-y-1.5 text-sm text-ink/85 leading-relaxed">
              {rules.map((rule, i) => (
                <li key={i} className="pl-1">
                  {rule}
                </li>
              ))}
            </ol>
          </section>
        )}

        <div className="flex justify-end text-xs">
          <button onClick={onClose} className="text-ink/60 hover:text-ink font-semibold">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-ink/60">{label}</dt>
      <dd className="font-semibold text-ink">{children}</dd>
    </div>
  )
}
