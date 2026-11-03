import { DisplayText } from '@/components/comic/ComicPrimitives'
import { Badge } from '@/components/ui/Badge'
import { ShieldCheck } from 'lucide-react'

const AUDIT_EVENTS = [
  {
    id: 'aud-1',
    action: 'Student Roster Ingested',
    details: '2,603 verified Department of Commerce student records loaded from student_list_updated.xlsx',
    actor: 'system',
    timestamp: '2026-11-03 08:30:15',
    category: 'roster',
  },
  {
    id: 'aud-2',
    action: 'Master Schedule Synchronized',
    details: '34 official competition sessions parsed from FINAL SCHEDULE.pdf (Nov 12 - Dec 15, 2026)',
    actor: 'coordinator',
    timestamp: '2026-11-03 08:45:00',
    category: 'schedule',
  },
  {
    id: 'aud-3',
    action: 'Gallery Assets Mounted',
    details: '15 official high-resolution festival photographs published to public gallery',
    actor: 'admin',
    timestamp: '2026-11-03 09:12:44',
    category: 'content',
  },
  {
    id: 'aud-4',
    action: 'Security Guard Enforced',
    details: 'Protected route gateway mounted on /admin/* with session authorization validation',
    actor: 'security',
    timestamp: '2026-11-03 09:25:10',
    category: 'security',
  },
  {
    id: 'aud-5',
    action: 'Crew Registration Enabled',
    details: 'Team registration modal activated with real-time Department of Commerce student lookup',
    actor: 'system',
    timestamp: '2026-11-03 09:30:00',
    category: 'registrations',
  },
]

export default function AdminAudit() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <DisplayText as="h1" className="text-4xl">System &amp; Security Audit Log</DisplayText>
          <p className="text-sm text-ink/60 mt-1">
            Immutable log of all administrative actions, publication events, and authentication checkpoints
          </p>
        </div>
        <Badge variant="open" className="gap-1.5 py-1 px-3">
          <ShieldCheck className="w-4 h-4 text-[#00966b]" /> AUDIT TRAIL ACTIVE
        </Badge>
      </div>

      <div className="comic-card overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table">
            <thead className="border-b-2 border-ink bg-[#FFF8E8]">
              <tr>
                <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-ink">Timestamp</th>
                <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-ink">Action Triggered</th>
                <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-ink">Description &amp; Context</th>
                <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-ink">Actor</th>
                <th className="px-4 py-3 text-right font-display text-xs uppercase tracking-wider text-ink">Scope</th>
              </tr>
            </thead>
            <tbody>
              {AUDIT_EVENTS.map((e) => (
                <tr key={e.id} className="border-b border-ink/10 hover:bg-[#FFF8E8]/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-ink/70 whitespace-nowrap">
                    {e.timestamp}
                  </td>
                  <td className="px-4 py-3 font-bold text-ink whitespace-nowrap">
                    {e.action}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink/80">
                    {e.details}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="bg-[#151515] text-[#FFD43B] text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                      {e.actor}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Badge variant="outline">{e.category.toUpperCase()}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
