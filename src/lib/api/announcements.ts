import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import type { Announcement } from '@/types'

/** Published notice-board announcements (RLS returns only published, in-window rows to the public). */
export async function getAnnouncements(): Promise<Announcement[]> {
  if (!isSupabaseConfigured) return []
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_published', true)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as Announcement[]
}
