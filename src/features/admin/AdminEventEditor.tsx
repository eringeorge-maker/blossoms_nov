import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { DisplayText } from '@/components/comic/ComicPrimitives'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EVENTS } from '@/lib/data/eventsData'
import type { Event, EventFormat, EventStatus } from '@/types'

export default function AdminEventEditor() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()

  // Find existing event if editing
  const existingEvent = !isNew ? EVENTS.find((e) => e.id === id || e.slug === id) : null

  const [title, setTitle] = useState(existingEvent?.title || '')
  const [categoryId, setCategoryId] = useState(existingEvent?.category_id || 'cat-1')
  const [description, setDescription] = useState(existingEvent?.description || '')
  const [eventFormat, setEventFormat] = useState<EventFormat>(existingEvent?.event_format || 'individual')
  const [minTeamSize, setMinTeamSize] = useState(existingEvent?.min_team_size ? String(existingEvent.min_team_size) : '2')
  const [maxTeamSize, setMaxTeamSize] = useState(existingEvent?.max_team_size ? String(existingEvent.max_team_size) : '6')
  const [capacity, setCapacity] = useState(existingEvent?.capacity ? String(existingEvent.capacity) : '50')
  const [waitlistEnabled, setWaitlistEnabled] = useState(existingEvent?.waitlist_enabled ?? true)
  const [cancellationAllowed, setCancellationAllowed] = useState(existingEvent?.cancellation_allowed ?? true)
  const [status] = useState<EventStatus>(existingEvent?.status || 'published')



  function handleSave(saveStatus?: EventStatus) {
    if (!title.trim()) {
      toast.error('Event title is required.')
      return
    }

    const targetStatus = saveStatus || status

    // Persist custom admin event to local storage
    try {
      const stored = localStorage.getItem('blossoms_custom_events')
      const customEvents: Record<string, Partial<Event>> = stored ? JSON.parse(stored) : {}
      const targetId = isNew ? `custom-${Date.now()}` : id!

      customEvents[targetId] = {
        id: targetId,
        title: title.trim(),
        category_id: categoryId,
        description: description.trim(),
        event_format: eventFormat,
        min_team_size: eventFormat === 'team' ? parseInt(minTeamSize, 10) || 2 : null,
        max_team_size: eventFormat === 'team' ? parseInt(maxTeamSize, 10) || 6 : null,
        capacity: parseInt(capacity, 10) || 50,
        waitlist_enabled: waitlistEnabled,
        cancellation_allowed: cancellationAllowed,
        status: targetStatus,
        updated_at: new Date().toISOString(),
      }

      localStorage.setItem('blossoms_custom_events', JSON.stringify(customEvents))
    } catch {
      // ignore
    }

    toast.success(
      targetStatus === 'published'
        ? `Event "${title}" published successfully!`
        : `Draft for "${title}" saved!`
    )
    navigate('/admin/events')
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <DisplayText as="h1" className="text-4xl">
            {isNew ? 'New Competition Event' : 'Edit Competition Event'}
          </DisplayText>
          <p className="text-xs text-ink/60 mt-0.5">
            {isNew ? 'Create an official entry in the Blossoms 2026 directory' : `Modifying event ID: ${id}`}
          </p>
        </div>
        {!isNew && (
          <Badge variant={status === 'published' ? 'open' : 'soon'}>
            {status.toUpperCase()}
          </Badge>
        )}
      </div>

      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault()
          handleSave()
        }}
      >
        {/* Basics */}
        <section className="comic-card p-6 space-y-4 bg-white">
          <h2 className="font-display text-2xl">Basic Information</h2>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-ink block mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Western Acoustic Band Showcase"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border-2 border-ink bg-[#FFF8E8] px-4 py-2.5 text-base font-bold text-ink focus:outline-none focus:ring-2 focus:ring-[#793f98]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider text-ink">Arena Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-xl border-2 border-ink bg-[#FFF8E8] px-4 py-2.5 text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-[#793f98]"
            >
              <option value="cat-1">Fine Arts Arena</option>
              <option value="cat-2">Literature Arena</option>
              <option value="cat-3">Stage Arena</option>
              <option value="cat-4">Theatre Arena</option>
              <option value="cat-5">Special Events Arena</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider text-ink">Synopsis / Description</label>
            <textarea
              rows={4}
              placeholder="Detailed briefing for participants..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border-2 border-ink bg-[#FFF8E8] px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-[#793f98] resize-y font-medium"
            />
          </div>
        </section>

        {/* Format */}
        <section className="comic-card p-6 space-y-4 bg-white">
          <h2 className="font-display text-2xl">Performer Format</h2>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider text-ink">Participation Format</label>
            <select
              value={eventFormat}
              onChange={(e) => setEventFormat(e.target.value as EventFormat)}
              className="w-full rounded-xl border-2 border-ink bg-[#FFF8E8] px-4 py-2.5 text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-[#793f98]"
            >
              <option value="individual">Solo Performer (Individual)</option>
              <option value="team">Crew Performer (Team)</option>
              <option value="either">Either (Open Format)</option>
            </select>
          </div>

          {eventFormat !== 'individual' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-ink block mb-1">
                  Min Team Size
                </label>
                <input
                  type="number"
                  min="2"
                  max="30"
                  value={minTeamSize}
                  onChange={(e) => setMinTeamSize(e.target.value)}
                  className="w-full rounded-xl border-2 border-ink bg-[#FFF8E8] px-4 py-2.5 text-sm font-bold text-ink"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-ink block mb-1">
                  Max Team Size
                </label>
                <input
                  type="number"
                  min="2"
                  max="30"
                  value={maxTeamSize}
                  onChange={(e) => setMaxTeamSize(e.target.value)}
                  className="w-full rounded-xl border-2 border-ink bg-[#FFF8E8] px-4 py-2.5 text-sm font-bold text-ink"
                />
              </div>
            </div>
          )}
        </section>

        {/* Registration Limits */}
        <section className="comic-card p-6 space-y-4 bg-white">
          <h2 className="font-display text-2xl">Capacity &amp; Policies</h2>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-ink block mb-1">
              Seat / Slot Capacity Limit
            </label>
            <input
              type="number"
              min="1"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full rounded-xl border-2 border-ink bg-[#FFF8E8] px-4 py-2.5 text-sm font-bold text-ink"
            />
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={waitlistEnabled}
                onChange={(e) => setWaitlistEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-ink"
              />
              Enable Automatic Waitlisting when capacity is reached
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={cancellationAllowed}
                onChange={(e) => setCancellationAllowed(e.target.checked)}
                className="w-4 h-4 rounded border-ink"
              />
              Allow Student Self-Cancellation before deadline
            </label>
          </div>
        </section>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <Button type="button" variant="primary" onClick={() => handleSave('published')}>
            {isNew ? 'Publish Event' : 'Save & Publish'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => handleSave('draft')}>
            Save as Draft
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/events')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
