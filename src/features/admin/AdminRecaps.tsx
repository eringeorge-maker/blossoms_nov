import { confirmDialog } from '@/components/ui/ConfirmDialog'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { RECAP_TONES, RecapStrip } from '@/features/announcements/RecapStrip'
import { deleteRecap, listAllRecaps, saveRecap, type RecapInput } from '@/lib/api/admin'
import { useAuth } from '@/lib/auth/authStore'
import { formatDateTime } from '@/lib/eventDisplay'
import type { RecapPanel, WeeklyRecap } from '@/types'
import { Muted, Panel, selectClass } from './AdminUI'

const MAX_PANELS = 9
const BLANK_PANEL: RecapPanel = { caption: '', speech: '', sfx: '', tone: 'yellow' }
const EMPTY: RecapInput = { week_label: '', title: '', panels: [{ ...BLANK_PANEL }], is_published: true }

const textareaClass = 'rounded-xl border-2 border-ink bg-paper px-3 py-2 text-sm font-normal focus:outline-none focus:border-primary'

/** Admin editor for the notice board's weekly comic-strip recaps. */
export function RecapsPanel() {
  const { admin } = useAuth()
  const queryClient = useQueryClient()
  const { data: recaps = [], isLoading } = useQuery({ queryKey: ['admin-recaps'], queryFn: listAllRecaps })
  const [editing, setEditing] = useState<WeeklyRecap | null>(null)
  const [form, setForm] = useState<RecapInput>(EMPTY)

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-recaps'] })
    queryClient.invalidateQueries({ queryKey: ['weekly-recaps'] })
  }
  const reset = () => {
    setEditing(null)
    setForm({ ...EMPTY, panels: [{ ...BLANK_PANEL }] })
  }
  const save = useMutation({
    mutationFn: () => {
      // Drop empty optional text so panels stay clean in the database.
      const panels = form.panels.map((p) => ({
        caption: p.caption.trim(),
        tone: p.tone,
        ...(p.speech?.trim() ? { speech: p.speech.trim() } : {}),
        ...(p.sfx?.trim() ? { sfx: p.sfx.trim() } : {}),
      }))
      return saveRecap({ ...form, week_label: form.week_label.trim(), title: form.title.trim(), panels }, editing?.id, admin?.id)
    },
    onSuccess: () => {
      toast.success(editing ? 'Recap updated' : 'Recap saved')
      reset()
      refresh()
    },
    onError: (e: Error) => toast.error(e.message),
  })
  const remove = useMutation({ mutationFn: deleteRecap, onSuccess: refresh, onError: (e: Error) => toast.error(e.message) })

  const setPanel = (index: number, patch: Partial<RecapPanel>) =>
    setForm({ ...form, panels: form.panels.map((p, i) => (i === index ? { ...p, ...patch } : p)) })
  const movePanel = (index: number, by: number) => {
    const next = [...form.panels]
    const target = index + by
    if (target < 0 || target >= next.length) return
    const moved = next[index]
    next[index] = next[target]
    next[target] = moved
    setForm({ ...form, panels: next })
  }

  const previewReady = form.panels.some((p) => p.caption.trim())
  const preview: WeeklyRecap = {
    id: 'preview',
    week_label: form.week_label || 'Week 1',
    title: form.title || 'Recap title',
    panels: form.panels.map((p) => ({ ...p, caption: p.caption || '...' })),
    is_published: form.is_published,
    published_at: null,
    created_at: '',
  }

  return (
    <Panel title="Weekly recap (comic strip)">
      <p className="text-sm text-ink/60 -mt-2 mb-4">
        Each recap is a strip of panels on the notice board. The newest published recap is shown first; older ones sit under Earlier issues.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!form.week_label.trim() || !form.title.trim()) return toast.error('Add a week label and a title.')
          if (form.panels.some((p) => !p.caption.trim())) return toast.error('Every panel needs a caption.')
          save.mutate()
        }}
        className="space-y-4 mb-6"
      >
        <div className="grid sm:grid-cols-2 gap-3">
          <Input label="Week label" placeholder="Week 1" value={form.week_label} onChange={(e) => setForm({ ...form, week_label: e.target.value })} />
          <Input label="Title" placeholder="The festival kicks off" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>

        <ol className="space-y-3">
          {form.panels.map((panel, index) => (
            <li key={index} className="rounded-xl border-2 border-ink/20 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">Panel {index + 1}</p>
                <div className="flex gap-1">
                  <button type="button" onClick={() => movePanel(index, -1)} aria-label="Move panel up" className="p-1.5 text-ink/50 hover:text-ink">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => movePanel(index, 1)} aria-label="Move panel down" className="p-1.5 text-ink/50 hover:text-ink">
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, panels: form.panels.filter((_, i) => i !== index) })}
                    disabled={form.panels.length === 1}
                    aria-label="Remove panel"
                    className="p-1.5 text-ink/50 hover:text-comic-red-deep disabled:opacity-30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <label className="flex flex-col gap-1 text-sm font-semibold">
                Caption (what happened)
                <textarea rows={2} value={panel.caption} onChange={(e) => setPanel(index, { caption: e.target.value })} className={textareaClass} />
              </label>
              <div className="grid sm:grid-cols-3 gap-3">
                <Input label="Speech bubble (optional)" value={panel.speech ?? ''} onChange={(e) => setPanel(index, { speech: e.target.value })} />
                <Input label="Sound effect (optional)" placeholder="WHAM!" value={panel.sfx ?? ''} onChange={(e) => setPanel(index, { sfx: e.target.value })} />
                <label className="flex flex-col gap-1 text-sm font-semibold">
                  Panel colour
                  <select value={panel.tone} onChange={(e) => setPanel(index, { tone: e.target.value as RecapPanel['tone'] })} className={selectClass}>
                    {RECAP_TONES.map((tone) => (
                      <option key={tone} value={tone}>
                        {tone}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </li>
          ))}
        </ol>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={form.panels.length >= MAX_PANELS}
          onClick={() => setForm({ ...form, panels: [...form.panels, { ...BLANK_PANEL }] })}
        >
          <Plus className="w-4 h-4" /> Add panel
        </Button>

        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="w-4 h-4 accent-[var(--color-primary)]" /> Published
        </label>

        {previewReady && (
          <div>
            <p className="text-sm font-semibold mb-2">Preview</p>
            <RecapStrip recap={preview} headingLevel="h3" />
          </div>
        )}

        <div className="flex gap-2">
          <Button type="submit" isLoading={save.isPending}>
            {editing ? 'Save changes' : 'Save recap'}
          </Button>
          {editing && (
            <Button type="button" variant="outline" onClick={reset}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : recaps.length === 0 ? (
        <Muted>No recaps yet.</Muted>
      ) : (
        <ul className="space-y-2">
          {recaps.map((r) => (
            <li key={r.id} className="rounded-xl border-2 border-ink/20 p-3 flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">
                  {r.week_label}: {r.title}
                </p>
                <div className="flex gap-1.5 mt-1">
                  <Badge variant="outline">{r.panels.length} panels</Badge>
                  {!r.is_published && <Badge variant="closed">Draft</Badge>}
                </div>
                <p className="text-[11px] text-ink/40 mt-1">{formatDateTime(r.created_at)}</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setEditing(r)
                    setForm({ week_label: r.week_label, title: r.title, panels: r.panels.map((p) => ({ ...BLANK_PANEL, ...p })), is_published: r.is_published })
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  aria-label={`Edit ${r.title}`}
                  className="p-1.5 text-ink/50 hover:text-ink"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={async () => (await confirmDialog(`Delete "${r.title}"?`, { danger: true, confirmLabel: 'Delete' })) && remove.mutate(r.id)}
                  aria-label={`Delete ${r.title}`}
                  className="p-1.5 text-ink/50 hover:text-comic-red-deep"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}
