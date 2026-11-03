import { DisplayText, ComicPanel, ComicCaptionBox } from '@/components/comic/ComicPrimitives'
import { Badge } from '@/components/ui/Badge'
import { Trophy, Sparkles } from 'lucide-react'

const WINNERS_PODIUM = [
  {
    arena: 'Fine Arts Arena',
    event: 'Pot Art & Comic Mural',
    rank: '1st Place · Champions',
    winner: 'Team Rangoli Arts (4BCOM A)',
    members: 'Pooja V, Sneha R, Rahul M',
    badge: 'gold',
  },
  {
    arena: 'Stage & Music Arena',
    event: 'Western Acoustic Band',
    rank: '1st Place · Champions',
    winner: 'The Central Resonance (2BCOM B)',
    members: 'Aaditya Sharma, Aanchal R, Aarav Nair',
    badge: 'gold',
  },
  {
    arena: 'Theatre Arena',
    event: 'Street Play (Nukkad Natak)',
    rank: '1st Place · Champions',
    winner: 'Parivartan Dramatics (4BCOM F&I A)',
    members: 'Varun K, Ananya P, Divya S',
    badge: 'gold',
  },
  {
    arena: 'Literature Arena',
    event: 'Debate & Air Crash',
    rank: '1st Place · Champions',
    winner: 'Rohan Deshmukh (2MCOM)',
    members: 'Solo Performer',
    badge: 'gold',
  },
]

export default function WinnersPage() {
  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <DisplayText as="h1" className="text-4xl sm:text-5xl text-ink">Hall of Fame</DisplayText>
          <p className="text-ink/70 text-sm mt-1">
            Official winner declarations and podium champions across all Blossoms 2026 panels
          </p>
        </div>
        <ComicCaptionBox>
          OFFICIAL ADJUDICATION · 2026–27
        </ComicCaptionBox>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {WINNERS_PODIUM.map((w) => (
          <div key={w.event} className="comic-card p-5 bg-white space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline">{w.arena}</Badge>
                <Trophy className="w-5 h-5 text-blossoms-yellow" />
              </div>
              <p className="font-display text-xl text-ink">{w.event}</p>
              <div className="inline-block mt-1 px-2 py-0.5 bg-[#FFD43B] text-ink text-[11px] font-bold rounded border border-ink">
                {w.rank}
              </div>
            </div>

            <div className="p-3 bg-[#FFF8E8] rounded-xl border border-ink space-y-1">
              <p className="font-bold text-sm text-ink">{w.winner}</p>
              <p className="text-xs text-ink/60">{w.members}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Standby notice */}
      <ComicPanel className="p-6 text-center bg-[#FFF8E8]">
        <Sparkles className="w-8 h-8 text-[#793f98] mx-auto mb-2" />
        <p className="font-display text-2xl text-ink">Remaining Results In Adjudication</p>
        <p className="text-sm text-ink/60 mt-1 max-w-xl mx-auto">
          Final stage showdown rankings will be posted live here as judges complete official evaluation scoring.
        </p>
      </ComicPanel>
    </div>
  )
}
