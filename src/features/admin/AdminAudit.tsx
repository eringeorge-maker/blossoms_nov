import { DisplayText } from "@/components/comic/ComicPrimitives"

export default function AdminAudit() {
  return (
    <div className="px-4 py-8 space-y-4">
      <DisplayText as="h1" className="text-4xl mb-4">Audit Logs</DisplayText>
      <p className="text-ink/60">Immutable log of all administrative actions, publication events, and exports.</p>
    </div>
  )
}
