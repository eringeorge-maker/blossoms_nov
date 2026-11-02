import { DisplayText, ComicPanel } from "@/components/comic/ComicPrimitives"
import { BarChart2, Users, List, CheckCircle } from "lucide-react"

const STATS = [
  { label: "Published Events",        value: 12,   icon: List,        color: "text-blossoms-blue"   },
  { label: "Confirmed Registrations", value: 248,  icon: CheckCircle, color: "text-blossoms-green"  },
  { label: "Registered Students",     value: 183,  icon: Users,       color: "text-primary"    },
  { label: "Open Registrations",      value: 8,    icon: BarChart2,   color: "text-blossoms-yellow" },
]

export default function AdminOverview() {
  return (
    <div className="space-y-8">
      <DisplayText as="h1" className="text-4xl">Overview</DisplayText>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ label, value, icon: Icon, color }) => (
          <ComicPanel key={label} className="text-center">
            <Icon className={`w-8 h-8 mx-auto mb-2 ${color}`} aria-hidden="true" />
            <p className="font-display text-4xl text-ink">{value}</p>
            <p className="text-xs font-semibold text-ink/60 mt-1">{label}</p>
          </ComicPanel>
        ))}
      </div>
      <div className="comic-card p-6">
        <p className="font-display text-xl text-ink mb-2">Registration Metrics</p>
        <p className="text-sm text-ink/50">Charts and detailed analytics will appear here after Supabase integration (Phase 6).</p>
      </div>
    </div>
  )
}
