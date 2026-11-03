import { DisplayText, ComicPanel } from "@/components/comic/ComicPrimitives"
import { Users } from "lucide-react"

export default function MeetTheTeamPage() {
  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 space-y-6">
      <DisplayText as="h1" className="text-4xl mb-2">Meet the Team</DisplayText>
      <p className="text-ink/60">The organisers, coordinators and volunteers bringing the Blossoms universe to life.</p>
      <ComicPanel className="p-8 text-center">
        <Users className="w-12 h-12 text-primary mx-auto mb-3" aria-hidden="true" />
        <p className="font-display text-2xl text-ink">Team Roster Coming Soon</p>
        <p className="text-sm text-ink/60 mt-2">Profiles of the Department of Commerce organising committee will appear here.</p>
      </ComicPanel>
    </div>
  )
}
