import { DisplayText } from "@/components/comic/ComicPrimitives"

export default function AdminRegistrations() {
  return (
    <div className="px-4 py-8 space-y-4">
      <DisplayText as="h1" className="text-4xl mb-4">Registration Reports</DisplayText>
      <p className="text-ink/60">Search, filter, and audit registrations across categories, campuses, and departments.</p>
    </div>
  )
}
