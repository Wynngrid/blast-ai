'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  availabilityRulesSchema,
  type AvailabilityRulesInput,
} from '@/lib/validations/availability'

export type AvailabilityResult = {
  success: boolean
  error?: string
}

/**
 * Get practitioner's availability rules and exceptions
 */
export async function getAvailability() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated', data: null }
  }

  // Get practitioner ID
  const { data: practitioner } = await supabase
    .from('practitioners')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!practitioner) {
    return { success: false, error: 'Practitioner not found', data: null }
  }

  // Get rules
  const { data: rules, error: rulesError } = await supabase
    .from('availability_rules')
    .select('*')
    .eq('practitioner_id', practitioner.id)
    .order('day_of_week')
    .order('start_time')

  if (rulesError) {
    return { success: false, error: rulesError.message, data: null }
  }

  // Get exceptions (future dates only)
  const today = new Date().toISOString().split('T')[0]
  const { data: exceptions, error: exceptionsError } = await supabase
    .from('availability_exceptions')
    .select('*')
    .eq('practitioner_id', practitioner.id)
    .gte('exception_date', today)
    .order('exception_date')

  if (exceptionsError) {
    return { success: false, error: exceptionsError.message, data: null }
  }

  return {
    success: true,
    data: {
      practitionerId: practitioner.id,
      rules: rules || [],
      exceptions: exceptions || [],
    },
  }
}

/**
 * Save availability rules (replaces all existing rules)
 */
export async function saveAvailabilityRules(
  input: AvailabilityRulesInput
): Promise<AvailabilityResult> {
  const validated = availabilityRulesSchema.safeParse(input)
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get practitioner ID
  const { data: practitioner } = await supabase
    .from('practitioners')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!practitioner) {
    return { success: false, error: 'Practitioner not found' }
  }

  // Delete existing rules
  await supabase
    .from('availability_rules')
    .delete()
    .eq('practitioner_id', practitioner.id)

  // Insert new rules
  if (validated.data.rules.length > 0) {
    const { error } = await supabase
      .from('availability_rules')
      .insert(
        validated.data.rules.map((rule) => ({
          practitioner_id: practitioner.id,
          day_of_week: rule.dayOfWeek,
          start_time: rule.startTime + ':00', // Add seconds
          end_time: rule.endTime + ':00',
          timezone: validated.data.timezone,
        }))
      )

    if (error) {
      return { success: false, error: error.message }
    }
  }

  revalidatePath('/portal/availability')
  return { success: true }
}

/**
 * Add a single availability rule
 */
export async function addAvailabilityRule(
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  timezone: string
): Promise<AvailabilityResult> {
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

  const { error } = await supabase
    .from('availability_rules')
    .insert({
      practitioner_id: practitioner.id,
      day_of_week: dayOfWeek,
      start_time: startTime + ':00',
      end_time: endTime + ':00',
      timezone,
    })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/portal/availability')
  return { success: true }
}

/**
 * Delete an availability rule
 */
export async function deleteAvailabilityRule(ruleId: string): Promise<AvailabilityResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // RLS will prevent deleting other practitioners' rules
  const { error } = await supabase
    .from('availability_rules')
    .delete()
    .eq('id', ruleId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/portal/availability')
  return { success: true }
}

/**
 * Add exception date (block a specific date)
 */
export async function addException(
  date: string,
  reason?: string
): Promise<AvailabilityResult> {
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

  const { error } = await supabase
    .from('availability_exceptions')
    .insert({
      practitioner_id: practitioner.id,
      exception_date: date,
      is_blocked: true,
      reason: reason || null,
    })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/portal/availability')
  return { success: true }
}

/**
 * Delete an exception
 */
export async function deleteException(exceptionId: string): Promise<AvailabilityResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('availability_exceptions')
    .delete()
    .eq('id', exceptionId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/portal/availability')
  return { success: true }
}
