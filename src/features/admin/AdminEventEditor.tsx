import { useParams, useNavigate } from 'react-router-dom'
import { DisplayText } from '@/components/comic/ComicPrimitives'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export default function AdminEventEditor() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()

  return (
    <div className="max-w-3xl space-y-6">
      <DisplayText as="h1" className="text-4xl">{isNew ? 'New Event' : 'Edit Event'}</DisplayText>
      {!isNew && <Badge variant="open">Published</Badge>}

      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); navigate('/admin/events') }}>
        {/* Basics */}
        <section className="comic-card p-6 space-y-4">
          <h2 className="font-display text-2xl">Basics</h2>
          <Input label="Event Title" placeholder="e.g. Battle of Bands" required />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-ink">Category</label>
            <select className="w-full rounded-xl border-2 border-ink bg-paper px-4 py-2.5 text-base focus:outline-none focus:border-primary">
              <option>Arts</option>
              <option>Literature</option>
              <option>Stage</option>
              <option>Theatre</option>
              <option>Special Events</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-ink">Description</label>
            <textarea
              rows={4}
              placeholder="Event description…"
              className="w-full rounded-xl border-2 border-ink bg-paper px-4 py-2.5 text-base focus:outline-none focus:border-primary resize-y"
            />
          </div>
        </section>

        {/* Format */}
        <section className="comic-card p-6 space-y-4">
          <h2 className="font-display text-2xl">Format</h2>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-ink">Event Format</label>
            <select className="w-full rounded-xl border-2 border-ink bg-paper px-4 py-2.5 text-base focus:outline-none focus:border-primary">
              <option value="individual">Individual</option>
              <option value="team">Team</option>
              <option value="either">Either</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Min Team Size" type="number" min="2" placeholder="e.g. 3" />
            <Input label="Max Team Size" type="number" min="2" placeholder="e.g. 8" />
          </div>
        </section>

        {/* Registration */}
        <section className="comic-card p-6 space-y-4">
          <h2 className="font-display text-2xl">Registration</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Registration Opens" type="datetime-local" />
            <Input label="Registration Closes" type="datetime-local" />
          </div>
          <Input label="Capacity (seats)" type="number" placeholder="e.g. 100" />
          <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
            <input type="checkbox" className="rounded" /> Enable waitlist
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
            <input type="checkbox" className="rounded" /> Allow cancellation
          </label>
        </section>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <Button type="submit" variant="primary">{isNew ? 'Create Draft' : 'Save Changes'}</Button>
          {!isNew && <Button type="button" variant="secondary">Publish</Button>}
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/events')}>Cancel</Button>
        </div>

        <p className="text-xs text-ink/40">
          Schedule slots, eligibility rules, and venue assignments are managed after saving the event.
        </p>
      </form>
    </div>
  )
}
