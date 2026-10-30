import { DisplayText } from "@/components/comic/ComicPrimitives"

export default function AdminCoordinators() {
  return (
    <div className="px-4 py-8 space-y-4">
      <DisplayText as="h1" className="text-4xl mb-4">Event Coordinators</DisplayText>
      <p className="text-ink/60">Assign student and faculty coordinators to specific events with scoped viewing permissions.</p>
    </div>
  )
}
