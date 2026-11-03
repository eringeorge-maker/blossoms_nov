import { useState, useMemo } from 'react'
import { DisplayText } from '@/components/comic/ComicPrimitives'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Download, Search, Filter, Users } from 'lucide-react'
import { getAllRegistrations, cancelRegistration } from '@/lib/api/registration'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

export default function AdminRegistrations() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { data: registrations = [], isLoading } = useQuery({
    queryKey: ['admin-all-registrations'],
    queryFn: getAllRegistrations,
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancelRegistration(id, 'Admin manual cancellation'),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message)
        queryClient.invalidateQueries({ queryKey: ['admin-all-registrations'] })
      } else {
        toast.error(res.message)
      }
    },
  })

  const filtered = useMemo(() => {
    return registrations.filter((r) => {
      if (statusFilter !== 'all' && r.registration_status !== statusFilter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchStudent = r.student_id.toLowerCase().includes(q)
        const matchEvent = r.event?.title.toLowerCase().includes(q) || false
        const matchTeam = r.team?.team_name.toLowerCase().includes(q) || false
        return matchStudent || matchEvent || matchTeam
      }
      return true
    })
  }, [registrations, statusFilter, search])

  // CSV Export utility
  function handleExportCSV() {
    if (registrations.length === 0) {
      toast.error('No registrations to export.')
      return
    }
    const headers = ['Registration ID', 'Register Number', 'Event Title', 'Format', 'Team Name', 'Status', 'Registered At']
    const rows = filtered.map((r) => [
      r.id,
      r.student_id,
      `"${r.event?.title || 'Unknown'}"`,
      r.team_id ? 'Team' : 'Solo',
      r.team?.team_name ? `"${r.team.team_name}"` : 'N/A',
      r.registration_status,
      r.registered_at,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `blossoms_2026_registrations_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Registration report exported as CSV!')
  }

  const confirmedCount = registrations.filter((r) => r.registration_status === 'confirmed').length
  const teamCount = registrations.filter((r) => Boolean(r.team_id)).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <DisplayText as="h1" className="text-4xl">Registration Reports</DisplayText>
          <p className="text-sm text-ink/60 mt-1">
            Audit, inspect, and export all festival entries across fine arts, stage, and theatre panels
          </p>
        </div>
        <Button onClick={handleExportCSV} variant="primary" className="gap-2">
          <Download className="w-4 h-4" /> Export CSV Roster
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border-2 border-ink shadow-[2px_2px_0px_#151515]">
          <p className="text-xs uppercase font-bold text-ink/50 tracking-wider">Total Entries</p>
          <p className="font-display text-3xl text-ink mt-0.5">{registrations.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border-2 border-ink shadow-[2px_2px_0px_#151515]">
          <p className="text-xs uppercase font-bold text-[#26A69A] tracking-wider">Confirmed</p>
          <p className="font-display text-3xl text-[#26A69A] mt-0.5">{confirmedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border-2 border-ink shadow-[2px_2px_0px_#151515]">
          <p className="text-xs uppercase font-bold text-[#3478F6] tracking-wider">Crew Teams</p>
          <p className="font-display text-3xl text-[#3478F6] mt-0.5">{teamCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border-2 border-ink shadow-[2px_2px_0px_#151515]">
          <p className="text-xs uppercase font-bold text-amber-700 tracking-wider">Waitlist / Others</p>
          <p className="font-display text-3xl text-amber-800 mt-0.5">{registrations.length - confirmedCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border-2 border-ink shadow-[3px_3px_0px_#151515] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            type="text"
            placeholder="Search by student roll number, event title, or team name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FFF8E8] border border-ink rounded-xl text-sm font-semibold text-ink placeholder:text-ink/40 focus:outline-none focus:ring-1 focus:ring-[#793f98]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-ink/50" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#FFF8E8] border border-ink rounded-xl text-xs font-bold text-ink uppercase tracking-wider focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="waitlisted">Waitlisted</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="comic-card overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table">
            <thead className="border-b-2 border-ink bg-[#FFF8E8]">
              <tr>
                <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-ink">Student / Crew</th>
                <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-ink">Competition Event</th>
                <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-ink">Format</th>
                <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-ink">Status</th>
                <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-ink">Date Registered</th>
                <th className="px-4 py-3 text-right font-display text-xs uppercase tracking-wider text-ink">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-ink/50">Loading registration database…</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-ink/50 font-medium">No registrations match current search criteria.</td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-b border-ink/10 hover:bg-[#FFF8E8]/50 transition-colors">
                    <td className="px-4 py-3">
                      {r.team ? (
                        <div>
                          <p className="font-display text-base text-ink flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-[#3478F6]" />
                            {r.team.team_name}
                          </p>
                          <p className="text-xs text-ink/50 tabular-nums font-semibold">
                            Leader Roll #{r.student_id} · {r.team.members?.length || 1} members
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-display text-base text-ink">Roll #{r.student_id}</p>
                          <span className="text-xs text-ink/50">Solo Registrant</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">{r.event?.title || 'Unknown Event'}</p>
                      <span className="text-xs text-ink/50">{r.event?.category?.name || 'General Arena'}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant={r.team_id ? 'blue' : 'outline'}>
                        {r.team_id ? 'Team Crew' : 'Solo'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant={r.registration_status === 'confirmed' ? 'registered' : 'soon'}>
                        {r.registration_status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-ink/70 tabular-nums">
                      {new Date(r.registered_at).toLocaleDateString()} {new Date(r.registered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {r.registration_status !== 'cancelled' && (
                        <button
                          onClick={() => cancelMutation.mutate(r.id)}
                          className="text-xs font-bold text-red-600 hover:text-red-800 hover:underline"
                        >
                          Cancel Entry
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
