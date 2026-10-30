import { useParams } from 'react-router-dom'
import { DisplayText } from '@/components/comic/ComicPrimitives'
import { EmptyState } from '@/components/ui/States'
import { Users } from 'lucide-react'

export default function TeamPage() {
  const { teamId } = useParams()
  // Phase 4: fetch team from Supabase
  return (
    <div className="mx-auto max-w-[800px] px-4 py-6">
      <DisplayText as="h1" className="text-4xl mb-2">Team Details</DisplayText>
      <p className="text-ink/60 text-sm mb-6">Team ID: {teamId}</p>
      <EmptyState icon={<Users className="w-16 h-16" />} title="Loading team…" description="Team details will appear here." />
    </div>
  )
}
