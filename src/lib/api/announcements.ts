import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import type { Announcement } from '@/types'

const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Registration Open for All Panels!',
    body: 'Registration is officially open across Arts, Literature, Stage, Theatre, and Special Events. Make sure to coordinate with your team members and submit before the November 13th cutoff.',
    severity: 'urgent',
    is_pinned: true,
    is_published: true,
    publish_at: '2025-11-01T00:00:00+05:30',
    expires_at: '2025-11-18T00:00:00+05:30',
    created_by: null,
    created_at: '2025-11-01T09:00:00+05:30'
  },
  {
    id: 'ann-2',
    title: 'Street Dance Venue Updated to Open Air Stage',
    body: 'Due to overwhelming registration requests and staging setup requirements, Street Dance has been moved from the Indoor Sports Complex to the Open Air Stage. Timings remain unchanged.',
    severity: 'important',
    is_pinned: false,
    is_published: true,
    publish_at: '2025-11-03T15:00:00+05:30',
    expires_at: '2025-11-18T00:00:00+05:30',
    created_by: null,
    created_at: '2025-11-03T15:00:00+05:30'
  },
  {
    id: 'ann-3',
    title: 'Welcome to Blossoms: Enter the Blossoms Universe',
    body: 'The annual cultural festival of CHRIST (Deemed to be University) Central Campus kicks off with original events, panel showcases, and campus-wide participation. Check out the line-up and get ready!',
    severity: 'normal',
    is_pinned: false,
    is_published: true,
    publish_at: '2025-10-25T10:00:00+05:30',
    expires_at: '2025-11-18T00:00:00+05:30',
    created_by: null,
    created_at: '2025-10-25T10:00:00+05:30'
  }
]

export async function getAnnouncements(): Promise<Announcement[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_published', true)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })

      if (!error && data) return data as Announcement[]
    } catch (e) {
      console.warn('Failed to fetch announcements from Supabase, using mock', e)
    }
  }

  return MOCK_ANNOUNCEMENTS
}
