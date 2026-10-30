import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import type { Event, EventCategory, EventScheduleSlot } from '@/types'
import { CATEGORIES, EVENTS } from '@/lib/data/eventsData'

// ── Export mock data references for local dev / tests ─────────
export const MOCK_CATEGORIES: EventCategory[] = CATEGORIES
export const MOCK_EVENTS: Event[] = EVENTS

// ── API Fetchers ───────────────────────────────────────────────
export async function getCategories(): Promise<EventCategory[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('event_categories')
        .select('*')
        .order('display_order', { ascending: true })
      if (!error && data && data.length > 0) return data as EventCategory[]
    } catch (e) {
      console.warn('Failed to fetch categories from Supabase, falling back to mock', e)
    }
  }
  return MOCK_CATEGORIES
}

export async function getEvents(filters?: {
  categorySlug?: string
  search?: string
}): Promise<Event[]> {
  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('events')
        .select('*, category:event_categories(*), schedule_slots:event_schedule_slots(*, venue:venues(*))')
        .in('status', ['published', 'completed', 'cancelled'])
        .order('created_at', { ascending: false })

      if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`)
      }

      const { data, error } = await query
      if (!error && data && data.length > 0) {
        let events = data as Event[]
        if (filters?.categorySlug && filters.categorySlug !== 'all') {
          events = events.filter((e) => e.category?.slug === filters.categorySlug)
        }
        return events
      }
    } catch (e) {
      console.warn('Failed to fetch events from Supabase, falling back to mock', e)
    }
  }

  let result = [...MOCK_EVENTS]
  if (filters?.categorySlug && filters.categorySlug !== 'all') {
    result = result.filter((e) => e.category?.slug === filters.categorySlug)
  }
  if (filters?.search) {
    const term = filters.search.toLowerCase()
    result = result.filter(
      (e) =>
        e.title.toLowerCase().includes(term) ||
        (e.description && e.description.toLowerCase().includes(term))
    )
  }
  return result
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*, category:event_categories(*), schedule_slots:event_schedule_slots(*, venue:venues(*)), eligibility_rules:event_eligibility_rules(*)')
        .eq('slug', slug)
        .single()
      if (!error && data) return data as Event
    } catch (e) {
      console.warn('Failed to fetch event by slug from Supabase, falling back to mock', e)
    }
  }

  const found = MOCK_EVENTS.find((e) => e.slug === slug || e.id === slug)
  return found || null
}

export async function getAllScheduleSlots(): Promise<EventScheduleSlot[]> {
  const events = await getEvents()
  const allSlots: EventScheduleSlot[] = []
  for (const e of events) {
    if (e.schedule_slots) {
      for (const s of e.schedule_slots) {
        allSlots.push({ ...s, event_id: e.id })
      }
    }
  }
  return allSlots
}
