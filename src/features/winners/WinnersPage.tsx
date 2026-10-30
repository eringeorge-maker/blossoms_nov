import { DisplayText, ComicPanel } from "@/components/comic/ComicPrimitives"
import { Trophy } from "lucide-react"

export default function WinnersPage() {
  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 space-y-6">
      <DisplayText as="h1" className="text-4xl mb-2">Hall of Fame</DisplayText>
      <p className="text-ink/60">Official winners declared across all competition panels.</p>
      <ComicPanel className="p-8 text-center">
        <Trophy className="w-12 h-12 text-blossoms-yellow mx-auto mb-3" aria-hidden="true" />
        <p className="font-display text-2xl text-ink">Results Awaiting Adjudication</p>
        <p className="text-sm text-ink/60 mt-2">Competition rankings will be published following event conclusions and official sign-off.</p>
      </ComicPanel>
    </div>
  )
}
