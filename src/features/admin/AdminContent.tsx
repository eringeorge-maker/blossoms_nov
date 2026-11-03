import { useState } from 'react'
import { DisplayText } from '@/components/comic/ComicPrimitives'
import { Button } from '@/components/ui/Button'
import { Image, Trophy } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminContent() {
  const [winnerTitle, setWinnerTitle] = useState('')
  const [winnerTeam, setWinnerTeam] = useState('')
  const [winnerCategory, setWinnerCategory] = useState('Arts')

  function handleDeclare(e: React.FormEvent) {
    e.preventDefault()
    if (!winnerTitle.trim() || !winnerTeam.trim()) {
      toast.error('Event title and winning crew are required.')
      return
    }
    toast.success(`Winner declaration for "${winnerTitle}" saved!`)
    setWinnerTitle('')
    setWinnerTeam('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <DisplayText as="h1" className="text-4xl">Content &amp; Winners Management</DisplayText>
          <p className="text-sm text-ink/60 mt-1">
            Manage festival highlights, official winner declarations, and gallery assets
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Declare Winner Form */}
        <div className="comic-card p-6 bg-white space-y-4">
          <h2 className="font-display text-2xl text-ink flex items-center gap-2">
            <Trophy className="w-5 h-5 text-blossoms-yellow" /> Declare Panel Winner
          </h2>

          <form onSubmit={handleDeclare} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-ink block mb-1">
                Event Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Battle of the Bands"
                value={winnerTitle}
                onChange={(e) => setWinnerTitle(e.target.value)}
                className="w-full rounded-xl border border-ink bg-[#FFF8E8] px-3.5 py-2 text-sm font-bold text-ink"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-ink block mb-1">
                Arena Division
              </label>
              <select
                value={winnerCategory}
                onChange={(e) => setWinnerCategory(e.target.value)}
                className="w-full rounded-xl border border-ink bg-[#FFF8E8] px-3.5 py-2 text-xs font-bold text-ink uppercase tracking-wider"
              >
                <option value="Arts">Fine Arts Arena</option>
                <option value="Literature">Literature Arena</option>
                <option value="Stage">Stage Arena</option>
                <option value="Theatre">Theatre Arena</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-ink block mb-1">
                Winning Performer / Crew &amp; Class *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. The Acoustic Echoes (4BCOM A)"
                value={winnerTeam}
                onChange={(e) => setWinnerTeam(e.target.value)}
                className="w-full rounded-xl border border-ink bg-[#FFF8E8] px-3.5 py-2 text-sm font-bold text-ink"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full">
              Publish Winner to Hall of Fame →
            </Button>
          </form>
        </div>

        {/* Gallery Assets Status */}
        <div className="comic-card p-6 bg-white space-y-4">
          <h2 className="font-display text-2xl text-ink flex items-center gap-2">
            <Image className="w-5 h-5 text-[#0088e8]" /> Gallery Asset Library
          </h2>
          <p className="text-xs text-ink/70 leading-relaxed">
            15 official photography assets (<code className="font-bold">g1.PNG</code> through <code className="font-bold">g15.PNG</code>) are mounted in the public gallery.
          </p>

          <div className="p-4 bg-[#FFF8E8] rounded-xl border border-ink space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span>Mounted Assets</span>
              <span className="text-[#00966b]">15 Photos Active</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold">
              <span>Aspect Ratios</span>
              <span>Masonry Comic Layout</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold">
              <span>Lightbox Modal</span>
              <span className="text-[#00966b]">Enabled</span>
            </div>
          </div>

          <Button asChild variant="outline" className="w-full">
            <a href="/gallery" target="_blank" rel="noopener noreferrer">
              View Live Gallery Page →
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
