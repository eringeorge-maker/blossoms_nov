import { DisplayText, ComicPanel } from "@/components/comic/ComicPrimitives"

export default function GalleryPage() {
  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 space-y-6">
      <DisplayText as="h1" className="text-4xl mb-2">Festival Gallery</DisplayText>
      <p className="text-ink/60">Capturing the energy, stages, and creativity across the Blossoms universe.</p>
      <ComicPanel className="p-8 text-center">
        <p className="font-display text-2xl text-ink">Curated Snaps Coming Soon</p>
        <p className="text-sm text-ink/60 mt-2">Approved festival photography and student showcase submissions will appear here.</p>
      </ComicPanel>
    </div>
  )
}
