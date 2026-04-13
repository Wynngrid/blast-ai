'use server'

import { createClient } from '@/lib/supabase/server'

export type SessionsResult<T = void> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Get practitioner's upcoming sessions with briefs per BOOK-05
 */
export async function getUpcomingSessions(): Promise<SessionsResult<{
  sessions: Array<{
    id: string
    session_duration: number
    scheduled_at: string
    ends_at: string
    timezone: string
    status: string
    brief_stuck_on: string
    brief_desired_outcome: string
    brief_context: string | null
    meet_link: string | null
    enterprise_company: string
  }>
}>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data: practitioner } = await supabase
    .from('practitioners')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!practitioner) {
    return { success: false, error: 'Practitioner not found' }
  }

  // Get upcoming confirmed sessions
  const now = new Date().toISOString()
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      id,
      session_duration,
      scheduled_at,
      ends_at,
      timezone,
      status,
      brief_stuck_on,
      brief_desired_outcome,
      brief_context,
      meet_link,
      enterprises (
        company_name
      )
    `)
    .eq('practitioner_id', practitioner.id)
    .eq('status', 'confirmed')
    .gte('scheduled_at', now)
    .order('scheduled_at', { ascending: true })

  if (error) {
    return { success: false, error: error.message }
  }

  const sessions = (bookings || []).map(b => ({
    id: b.id,
    session_duration: b.session_duration,
    scheduled_at: b.scheduled_at,
    ends_at: b.ends_at,
    timezone: b.timezone,
    status: b.status,
    brief_stuck_on: b.brief_stuck_on,
    brief_desired_outcome: b.brief_desired_outcome,
    brief_context: b.brief_context,
    meet_link: b.meet_link,
    enterprise_company: (b.enterprises as { company_name: string }).company_name,
  }))

  return { success: true, data: { sessions } }
}

/**
 * Get practitioner's past sessions
 */
export async function getPastSessions(): Promise<SessionsResult<{
  sessions: Array<{
    id: string
    session_duration: number
    scheduled_at: string
    status: string
    enterprise_company: string
  }>
}>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data: practitioner } = await supabase
    .from('practitioners')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!practitioner) {
    return { success: false, error: 'Practitioner not found' }
  }

  const now = new Date().toISOString()
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      id,
      session_duration,
      scheduled_at,
      status,
      enterprises (
        company_name
      )
    `)
    .eq('practitioner_id', practitioner.id)
    .or(`status.eq.completed,scheduled_at.lt.${now}`)
    .order('scheduled_at', { ascending: false })
    .limit(20)

  if (error) {
    return { success: false, error: error.message }
  }

  const sessions = (bookings || []).map(b => ({
    id: b.id,
    session_duration: b.session_duration,
    scheduled_at: b.scheduled_at,
    status: b.status,
    enterprise_company: (b.enterprises as { company_name: string }).company_name,
  }))

  return { success: true, data: { sessions } }
}
