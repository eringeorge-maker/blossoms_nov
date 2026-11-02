import { DisplayText, ComicPanel, ActionBurst, SpeechBubble, HalftoneAccent } from "@/components/comic/ComicPrimitives"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Skeleton, EventCardSkeleton } from "@/components/ui/Skeleton"
import { EmptyState, ErrorState } from "@/components/ui/States"

export default function DesignSystemPage() {
  return (
    <div className="mx-auto max-w-[1240px] px-4 py-10 space-y-12">
      <div>
        <DisplayText as="h1" className="text-5xl mb-2">Design System &amp; Tokens</DisplayText>
        <p className="text-ink/60">
          The comic-book visual design system for Blossoms Fest: panels, ink outlines, halftone patterns, speech bubbles, and accessible primitives.
        </p>
      </div>

      {/* Palette */}
      <section className="space-y-4">
        <DisplayText as="h2" className="text-3xl">Color Palette &amp; Tokens</DisplayText>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {[
            { name: "paper", hex: "#FFF8E8", label: "Paper / Primary Surface" },
            { name: "ink", hex: "#151515", label: "Ink / Outlines & Text" },
            { name: "blossoms-purple", hex: "#793F98", label: "Blossoms Purple / Main" },
            { name: "blossoms-yellow", hex: "#FFD43B", label: "Yellow / Bursts" },
            { name: "blossoms-blue", hex: "#3478F6", label: "Blue / Secondary" },
            { name: "blossoms-green", hex: "#26A69A", label: "Green / Confirmed" },
          ].map((c) => (
            <div key={c.name} className="comic-card p-3 text-center space-y-2">
              <div
                className="h-16 w-full rounded-lg border-2 border-ink"
                style={{ backgroundColor: c.hex }}
              />
              <p className="font-bold text-xs font-mono">{c.name}</p>
              <p className="text-[11px] text-ink/60">{c.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Buttons */}
      <section className="space-y-4">
        <DisplayText as="h2" className="text-3xl">Buttons</DisplayText>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary">Primary Action</Button>
          <Button variant="secondary">Secondary Accent</Button>
          <Button variant="outline">Outline Paper</Button>
          <Button variant="ghost">Ghost Link</Button>
          <Button variant="danger">Destructive Action</Button>
          <Button isLoading>Loading State</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      {/* Badges / Status */}
      <section className="space-y-4">
        <DisplayText as="h2" className="text-3xl">Badges &amp; Status Indicators</DisplayText>
        <div className="flex flex-wrap gap-3">
          <Badge variant="open">Open for Registration</Badge>
          <Badge variant="soon">Coming Soon</Badge>
          <Badge variant="full">Full / Waitlist Only</Badge>
          <Badge variant="waitlist">Waitlist Open</Badge>
          <Badge variant="registered">Confirmed ✓</Badge>
          <Badge variant="closed">Closed</Badge>
          <Badge variant="cancelled">Cancelled</Badge>
          <Badge variant="red">Comic Red</Badge>
          <Badge variant="yellow">Comic Yellow</Badge>
          <Badge variant="blue">Comic Blue</Badge>
          <Badge variant="outline">Neutral Tag</Badge>
        </div>
      </section>

      {/* Comic Primitives */}
      <section className="space-y-6">
        <DisplayText as="h2" className="text-3xl">Comic Primitives</DisplayText>
        <div className="grid md:grid-cols-2 gap-6 items-start">
          <ComicPanel>
            <h3 className="font-display text-2xl mb-2">ComicPanel Container</h3>
            <p className="text-sm text-ink/70">
              High-contrast white interior bounded by a 2px ink outline, rounded corners, offset ink shadow, and subtle 4-8% halftone overlay.
            </p>
          </ComicPanel>

          <div className="space-y-4">
            <SpeechBubble direction="down">
              ⚡ Flash announcement: Registration opens Nov 1st!
            </SpeechBubble>

            <div className="pt-2 flex items-center gap-6">
              <ActionBurst color="yellow">
                BOOM!<br />NEW EVENT
              </ActionBurst>
              <ActionBurst color="red">
                FINAL<br />CALL
              </ActionBurst>
            </div>

            <div className="relative h-20 rounded-xl border-2 border-ink overflow-hidden bg-paper flex items-center justify-center">
              <HalftoneAccent size="sm" className="opacity-30" />
              <span className="relative z-10 text-xs font-semibold text-ink/80">Halftone Accent Pattern Preview</span>
            </div>
          </div>
        </div>
      </section>

      {/* Cards & Inputs */}
      <section className="space-y-4">
        <DisplayText as="h2" className="text-3xl">Forms &amp; Input Controls</DisplayText>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Standard Input Field</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Student Register Number"
                placeholder="e.g. 2212001"
                hint="Assigned by Central Campus Office of Admissions."
                required
              />
              <Input
                label="Full Name with Error"
                defaultValue="Invalid Name@"
                error="Name can only contain alphabet characters."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skeleton &amp; Loading States</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <EventCardSkeleton />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Empty & Error States */}
      <section className="space-y-4">
        <DisplayText as="h2" className="text-3xl">Feedback &amp; Empty States</DisplayText>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="comic-card">
            <EmptyState
              title="No Registrations Yet"
              description="Explore events and join with your friends to get on the board."
              action={{ label: "Browse Line-up", onClick: () => {} }}
            />
          </div>
          <div className="comic-card">
            <ErrorState
              title="Connection Timeout"
              description="Could not verify student directory record. Please verify and retry."
              retry={() => {}}
            />
          </div>
        </div>
      </section>
    </div>
  )
}
