import { DisplayText } from "@/components/comic/ComicPrimitives"

export default function AdminContent() {
  return (
    <div className="px-4 py-8 space-y-4">
      <DisplayText as="h1" className="text-4xl mb-4">Content Management</DisplayText>
      <p className="text-ink/60">Manage approved festival highlights, winner declarations, and gallery assets.</p>
    </div>
  )
}
