import { DisplayText } from "@/components/comic/ComicPrimitives"

export default function AdminStudents() {
  return (
    <div className="px-4 py-8 space-y-4">
      <DisplayText as="h1" className="text-4xl mb-4">Student Roster</DisplayText>
      <p className="text-ink/60">Lookup verified student records and inspect roster batch import logs.</p>
    </div>
  )
}
