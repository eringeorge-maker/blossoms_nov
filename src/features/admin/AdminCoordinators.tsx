import { DisplayText } from '@/components/comic/ComicPrimitives'
import { Badge } from '@/components/ui/Badge'
import { UserCog, Mail } from 'lucide-react'

const COORDINATORS = [
  { name: 'Dr. Kavitha S', role: 'Fine Arts Coordinator', department: 'Department of Commerce', email: 'kavitha.s@christuniversity.in', arena: 'Fine Arts' },
  { name: 'Prof. Rajesh Nair', role: 'Literature Coordinator', department: 'Department of Commerce', email: 'rajesh.nair@christuniversity.in', arena: 'Literature' },
  { name: 'Dr. Priya Varghese', role: 'Stage & Music Coordinator', department: 'Department of Commerce', email: 'priya.v@christuniversity.in', arena: 'Stage' },
  { name: 'Prof. Joseph Mathew', role: 'Theatre & Dramatics Coordinator', department: 'Department of Commerce', email: 'joseph.m@christuniversity.in', arena: 'Theatre' },
  { name: 'Student Core Committee', role: 'Campus Operations & Logistics', department: 'Central Campus', email: 'blossoms.doc@christuniversity.in', arena: 'All Arenas' },
]

export default function AdminCoordinators() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <DisplayText as="h1" className="text-4xl">Event Coordinators Directory</DisplayText>
          <p className="text-sm text-ink/60 mt-1">
            Faculty and student coordinator assignments across competition divisions
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {COORDINATORS.map((c) => (
          <div key={c.name} className="comic-card p-5 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline">{c.arena}</Badge>
              <UserCog className="w-5 h-5 text-[#793f98]" />
            </div>

            <div>
              <p className="font-display text-xl text-ink">{c.name}</p>
              <p className="text-xs font-bold text-[#793f98] uppercase mt-0.5">{c.role}</p>
              <p className="text-xs text-ink/60 mt-1">{c.department}</p>
            </div>

            <div className="pt-2 border-t border-ink/10 text-xs text-ink/70 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-ink/40" />
              <span className="truncate">{c.email}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
