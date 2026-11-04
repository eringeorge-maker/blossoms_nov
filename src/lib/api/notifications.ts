import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'

export interface StudentNotification {
  id: string
  title: string
  body: string
  link: string | null
  audience: 'all' | 'event' | 'student'
  event_id: string | null
  created_at: string
  read_at: string | null
}

export async function getMyNotifications(): Promise<StudentNotification[]> {
  if (!isSupabaseConfigured) return []
  const { data, error } = await supabase.rpc('get_my_notifications')
  if (error) throw new Error(error.message)
  return (data ?? []) as StudentNotification[]
}

export async function markNotification(id: string, action: 'read' | 'dismiss'): Promise<void> {
  const { error } = await supabase.rpc('mark_notification', { p_notification_id: id, p_action: action })
  if (error) throw new Error(error.message)
}

export async function markAllNotificationsRead(): Promise<void> {
  const { error } = await supabase.rpc('mark_all_notifications_read')
  if (error) throw new Error(error.message)
}
