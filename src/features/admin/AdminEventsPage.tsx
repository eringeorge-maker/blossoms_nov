import { Link } from "react-router-dom"
import { Plus } from "lucide-react"
import { DisplayText } from "@/components/comic/ComicPrimitives"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"

const MOCK_EVENTS = [
  { id:"1", title:"Battle of Bands", category:"Stage", status:"published", registrations:24 },
  { id:"2", title:"Poetry Slam",     category:"Literature", status:"published", registrations:12 },
  { id:"3", title:"New Dance Event", category:"Stage", status:"draft",     registrations:0  },
]

export default function AdminEventsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <DisplayText as="h1" className="text-4xl">Events</DisplayText>
        <Button asChild><Link to="/admin/events/new"><Plus className="w-4 h-4" /> New Event</Link></Button>
      </div>
      <div className="comic-card overflow-hidden">
        <table className="w-full text-sm" role="table">
          <thead className="border-b-2 border-ink bg-gutter">
            <tr>
              {["Title","Category","Status","Registrations","Actions"].map(h=>(
                <th key={h} className="px-4 py-3 text-left font-semibold text-ink">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_EVENTS.map((e)=>(
              <tr key={e.id} className="border-b border-ink/10 hover:bg-gutter/50">
                <td className="px-4 py-3 font-semibold">{e.title}</td>
                <td className="px-4 py-3"><Badge variant="outline">{e.category}</Badge></td>
                <td className="px-4 py-3"><Badge variant={e.status==="published"?"open":"soon"}>{e.status}</Badge></td>
                <td className="px-4 py-3">{e.registrations}</td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="outline" asChild><Link to={`/admin/events/${e.id}`}>Edit</Link></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
