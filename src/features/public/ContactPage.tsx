import { DisplayText, ComicPanel } from "@/components/comic/ComicPrimitives"
import { MapPin, Mail } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 space-y-6">
      <DisplayText as="h1" className="text-4xl mb-2">Contact Us</DisplayText>
      <p className="text-ink/60">Questions about events, registrations or schedules? Reach the Blossoms organising team.</p>
      <div className="grid gap-6 md:grid-cols-2">
        <ComicPanel className="p-8">
          <MapPin className="w-10 h-10 text-primary mb-3" aria-hidden="true" />
          <p className="font-display text-2xl text-ink">Find Us</p>
          <p className="text-sm text-ink/60 mt-2">
            Department of Commerce<br />
            CHRIST (Deemed to be University), Central Campus
          </p>
        </ComicPanel>
        <ComicPanel className="p-8">
          <Mail className="w-10 h-10 text-primary mb-3" aria-hidden="true" />
          <p className="font-display text-2xl text-ink">Write to Us</p>
          <p className="text-sm text-ink/60 mt-2">Official contact details for the organising committee will be published here.</p>
        </ComicPanel>
      </div>
    </div>
  )
}
