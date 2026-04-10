'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type AdminActionResult = {
  success: boolean
  error?: string
}

export type PendingPractitioner = {
  id: string
  user_id: string
  full_name: string
  bio: string | null
  specializations: string[] | null
  created_at: string
  email?: string
}

/**
 * Fetch all practitioners with pending application status.
 * Only accessible by admin users (enforced by RLS).
 */
export async function getPendingPractitioners(): Promise<{
  practitioners: PendingPractitioner[]
  error?: string
}> {
  const supabase = await createClient()

  // First verify the current user is an admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { practitioners: [], error: 'Not authenticated' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { practitioners: [], error: 'Unauthorized - admin access required' }
  }

  // Fetch pending practitioners
  const { data: practitioners, error } = await supabase
    .from('practitioners')
    .select('id, user_id, full_name, bio, specializations, created_at')
    .eq('application_status', 'pending')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching pending practitioners:', error)
    return { practitioners: [], error: error.message }
  }

  return { practitioners: practitioners || [] }
}

/**
 * Approve a practitioner application.
 * Sets application_status to 'approved' and approved_at timestamp.
 */
export async function approvePractitioner(practitionerId: string): Promise<AdminActionResult> {
  const supabase = await createClient()

  // Verify admin role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { success: false, error: 'Unauthorized - admin access required' }
  }

  // Update practitioner status
  const { error } = await supabase
    .from('practitioners')
    .update({
      application_status: 'approved',
      approved_at: new Date().toISOString(),
    })
    .eq('id', practitionerId)

  if (error) {
    console.error('Error approving practitioner:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  return { success: true }
}

/**
 * Reject a practitioner application.
 * Sets application_status to 'rejected' and rejected_at timestamp.
 * Optionally includes a rejection reason.
 */
export async function rejectPractitioner(
  practitionerId: string,
  reason?: string
): Promise<AdminActionResult> {
  const supabase = await createClient()

  // Verify admin role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { success: false, error: 'Unauthorized - admin access required' }
  }

  // Update practitioner status
  const { error } = await supabase
    .from('practitioners')
    .update({
      application_status: 'rejected',
      rejected_at: new Date().toISOString(),
      rejection_reason: reason || null,
    })
    .eq('id', practitionerId)

  if (error) {
    console.error('Error rejecting practitioner:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  return { success: true }
}
