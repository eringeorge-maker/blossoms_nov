import { DisplayText } from "@/components/comic/ComicPrimitives"

export default function AdminAnnouncements() {
  return (
    <div className="px-4 py-8 space-y-4">
      <DisplayText as="h1" className="text-4xl mb-4">Announcements Manager</DisplayText>
      <p className="text-ink/60">Create, pin, and manage festival announcements with audience targeting.</p>
    </div>
  )
}
