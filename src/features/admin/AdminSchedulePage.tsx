import { DisplayText } from "@/components/comic/ComicPrimitives"

export default function AdminSchedulePage() {
  return (
    <div className="px-4 py-8 space-y-4">
      <DisplayText as="h1" className="text-4xl mb-4">Festival Timetable Manager</DisplayText>
      <p className="text-ink/60">Configure venue allocations, session start/end intervals, and conflict prevention.</p>
    </div>
  )
}
