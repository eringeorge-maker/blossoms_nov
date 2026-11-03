import { useState } from 'react'
import { DisplayText } from '@/components/comic/ComicPrimitives'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Megaphone, Pin } from 'lucide-react'
import { getAnnouncements } from '@/lib/api/announcements'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { Announcement, AnnouncementSeverity } from '@/types'

export default function AdminAnnouncements() {
  const queryClient = useQueryClient()
  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements'],
    queryFn: getAnnouncements,
  })

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [severity, setSeverity] = useState<AnnouncementSeverity>('normal')
  const [isPinned, setIsPinned] = useState(false)

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) {
      toast.error('Title and message body are required.')
      return
    }

    const newAnnouncement: Announcement = {
      id: `ann-${Date.now()}`,
      title: title.trim(),
      body: body.trim(),
      severity,
      is_pinned: isPinned,
      is_published: true,
      publish_at: new Date().toISOString(),
      expires_at: null,
      created_by: 'admin',
      created_at: new Date().toISOString(),
    }

    // Save to local announcements store
    try {
      const stored = localStorage.getItem('blossoms_custom_announcements')
      const existing: Announcement[] = stored ? JSON.parse(stored) : []
      existing.unshift(newAnnouncement)
      localStorage.setItem('blossoms_custom_announcements', JSON.stringify(existing))
    } catch {
      // ignore
    }

    toast.success('Announcement published to public notice board!')
    setTitle('')
    setBody('')
    setIsPinned(false)
    queryClient.invalidateQueries({ queryKey: ['announcements'] })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <DisplayText as="h1" className="text-4xl">Announcements Manager</DisplayText>
          <p className="text-sm text-ink/60 mt-1">
            Broadcast official festival notices, venue updates, and urgent schedule changes
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Create Announcement Form */}
        <div className="comic-card p-6 bg-white space-y-4">
          <h2 className="font-display text-2xl text-ink flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#793f98]" /> Broadcast Notice
          </h2>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-ink block mb-1">
                Notice Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Schedule Update for Street Dance"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-ink bg-[#FFF8E8] px-3.5 py-2 text-sm font-bold text-ink focus:outline-none focus:ring-1 focus:ring-[#793f98]"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-ink block mb-1">
                Severity Level
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as AnnouncementSeverity)}
                className="w-full rounded-xl border border-ink bg-[#FFF8E8] px-3.5 py-2 text-xs font-bold text-ink uppercase tracking-wider focus:outline-none"
              >
                <option value="normal">Normal Notice</option>
                <option value="important">Important (Amber)</option>
                <option value="urgent">Urgent / Alert (Red)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-ink block mb-1">
                Announcement Body *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Type the announcement text to appear on the public notice board..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full rounded-xl border border-ink bg-[#FFF8E8] px-3.5 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-[#793f98] resize-y"
              />
            </div>

            <label className="flex items-center gap-2 text-xs font-bold text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4 rounded border-ink"
              />
              Pin to top of public notice board
            </label>

            <Button type="submit" variant="primary" className="w-full">
              Publish Announcement →
            </Button>
          </form>
        </div>

        {/* Live Announcements List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <DisplayText as="h2" className="text-2xl text-ink">
              Current Live Notices
            </DisplayText>
            <span className="text-xs font-bold text-ink/50 uppercase">
              {announcements.length} Published
            </span>
          </div>

          <div className="space-y-3">
            {announcements.map((ann) => (
              <div key={ann.id} className="bg-white p-5 rounded-2xl border-2 border-ink shadow-[2px_2px_0px_#151515] space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    {ann.is_pinned && (
                      <span className="bg-[#FFD43B] text-ink text-[10px] font-bold px-2 py-0.5 rounded border border-ink flex items-center gap-1">
                        <Pin className="w-3 h-3" /> PINNED
                      </span>
                    )}
                    <Badge variant={ann.severity === 'urgent' ? 'red' : ann.severity === 'important' ? 'soon' : 'outline'}>
                      {ann.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-ink/50 tabular-nums">
                    {new Date(ann.created_at).toLocaleDateString()}
                  </span>
                </div>

                <p className="font-display text-lg text-ink">{ann.title}</p>
                <p className="text-xs text-ink/80 leading-relaxed">{ann.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
