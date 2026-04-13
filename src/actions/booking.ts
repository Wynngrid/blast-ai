'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createMeetingWithLink, cancelMeeting } from '@/lib/google-calendar'
import { spendCoins } from '@/actions/coins'
import { createBookingSchema, type CreateBookingInput } from '@/lib/validations/booking'
import { getSessionCoinCost, calculatePractitionerEarnings } from '@/lib/constants/coins'
import { addMinutes, parseISO } from 'date-fns'

export type BookingResult<T = void> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Create a new booking with payment and Meet link
 * Per D-04 through D-09
 */
export async function createBooking(
  input: CreateBookingInput
): Promise<BookingResult<{ bookingId: string }>> {
  // Validate input
  const validated = createBookingSchema.safeParse(input)
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get enterprise
  const { data: enterprise } = await supabase
    .from('enterprises')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!enterprise) {
    return { success: false, error: 'Enterprise not found' }
  }

  // Get practitioner with name and rate (name revealed on confirmation per D-08)
  const { data: practitioner } = await supabase
    .from('practitioners')
    .select('id, full_name, hourly_rate')
    .eq('id', input.practitionerId)
    .eq('application_status', 'approved')
    .single()

  if (!practitioner) {
    return { success: false, error: 'Practitioner not found' }
  }

  // Calculate coins required
  const coinsRequired = getSessionCoinCost(practitioner.hourly_rate || 100, input.sessionDuration as 20 | 40 | 60 | 90)

  // Parse scheduled time
  const scheduledAt = parseISO(`${input.slot.date}T${input.slot.startTime}:00`)
  const endsAt = addMinutes(scheduledAt, input.sessionDuration)

  // Create booking record first (pending status)
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      enterprise_id: enterprise.id,
      practitioner_id: input.practitionerId,
      session_duration: input.sessionDuration,
      scheduled_at: scheduledAt.toISOString(),
      ends_at: endsAt.toISOString(),
      timezone: input.timezone,
      status: 'pending',
      brief_stuck_on: input.brief.stuckOn,
      brief_desired_outcome: input.brief.desiredOutcome,
      brief_context: input.brief.context || null,
      coins_spent: coinsRequired,
    })
    .select()
    .single()

  if (bookingError || !booking) {
    return { success: false, error: bookingError?.message || 'Failed to create booking' }
  }

  // Spend coins per PAY-02 (payment before confirmation)
  const coinResult = await spendCoins(booking.id, coinsRequired)
  if (!coinResult.success) {
    // Rollback: delete the booking
    await supabase.from('bookings').delete().eq('id', booking.id)
    return { success: false, error: coinResult.error || 'Payment failed' }
  }

  // Update booking with coin transaction ID
  // Note: spendCoins would ideally return the transaction ID
  // For now, we'll query for it
  const { data: coinTx } = await supabase
    .from('coin_transactions')
    .select('id')
    .eq('reference_id', booking.id)
    .single()

  if (coinTx) {
    await supabase
      .from('bookings')
      .update({ coin_transaction_id: coinTx.id })
      .eq('id', booking.id)
  }

  // Create Google Meet link per D-09
  const meetResult = await createMeetingWithLink({
    title: `BLAST AI Session: ${input.sessionDuration}min`,
    description: `Session Brief:\n\nStuck on: ${input.brief.stuckOn}\n\nDesired outcome: ${input.brief.desiredOutcome}${input.brief.context ? `\n\nContext: ${input.brief.context}` : ''}`,
    startTime: scheduledAt,
    endTime: endsAt,
    attendeeEmails: [user.email || ''], // Enterprise email
    timezone: input.timezone,
  })

  // Update booking with meet link and confirm
  const updateData: { status: string; meet_link?: string; calendar_event_id?: string } = {
    status: 'confirmed',
  }

  if (meetResult.success && meetResult.meetLink) {
    updateData.meet_link = meetResult.meetLink
    updateData.calendar_event_id = meetResult.eventId
  }

  const { error: updateError } = await supabase
    .from('bookings')
    .update(updateData)
    .eq('id', booking.id)

  if (updateError) {
    console.error('Failed to update booking:', updateError)
    // Booking still created, just without meet link - continue
  }

  // Create practitioner earnings record per PAY-03
  const earnings = calculatePractitionerEarnings(coinsRequired)

  await supabase.from('practitioner_earnings').insert({
    practitioner_id: input.practitionerId,
    booking_id: booking.id,
    gross_amount_inr: earnings.grossInr,
    commission_inr: earnings.commissionInr,
    net_amount_inr: earnings.netInr,
    status: 'pending', // Becomes 'available' after session completion
  })

  revalidatePath('/dashboard')
  revalidatePath('/portal/sessions')
  revalidatePath(`/booking/${booking.id}/confirmation`)

  return { success: true, data: { bookingId: booking.id } }
}

/**
 * Get booking details for confirmation page
 */
export async function getBookingDetails(bookingId: string): Promise<BookingResult<{
  booking: {
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
    coins_spent: number
  }
  practitioner: {
    full_name: string // Revealed per D-08
    specializations: string[] | null
    tier: string | null
  }
}>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get booking with practitioner details
  const { data: booking, error } = await supabase
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
      coins_spent,
      practitioners (
        full_name,
        specializations,
        tier
      )
    `)
    .eq('id', bookingId)
    .single()

  if (error || !booking) {
    return { success: false, error: error?.message || 'Booking not found' }
  }

  // Verify user has access (enterprise who booked or practitioner)
  // RLS should handle this, but we cast types for safety

  return {
    success: true,
    data: {
      booking: {
        id: booking.id,
        session_duration: booking.session_duration,
        scheduled_at: booking.scheduled_at,
        ends_at: booking.ends_at,
        timezone: booking.timezone,
        status: booking.status,
        brief_stuck_on: booking.brief_stuck_on,
        brief_desired_outcome: booking.brief_desired_outcome,
        brief_context: booking.brief_context,
        meet_link: booking.meet_link,
        coins_spent: booking.coins_spent,
      },
      practitioner: {
        full_name: (booking.practitioners as { full_name: string }).full_name,
        specializations: (booking.practitioners as { specializations: string[] | null }).specializations,
        tier: (booking.practitioners as { tier: string | null }).tier,
      },
    },
  }
}

/**
 * Cancel a booking per D-10, D-11
 */
export async function cancelBooking(
  bookingId: string
): Promise<BookingResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get booking
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single()

  if (error || !booking) {
    return { success: false, error: 'Booking not found' }
  }

  // Check 24-hour window per D-10
  const scheduledAt = new Date(booking.scheduled_at)
  const now = new Date()
  const hoursUntil = (scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (hoursUntil < 24) {
    return {
      success: false,
      error: 'Cannot cancel within 24 hours of session. Contact support for assistance.',
    }
  }

  // Cancel calendar event
  if (booking.calendar_event_id) {
    await cancelMeeting(booking.calendar_event_id)
  }

  // Update booking status
  await supabase
    .from('bookings')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancelled_by: 'enterprise',
    })
    .eq('id', bookingId)

  // Issue refund (create refund transaction)
  const { data: enterprise } = await supabase
    .from('enterprises')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (enterprise) {
    await supabase.from('coin_transactions').insert({
      enterprise_id: enterprise.id,
      type: 'refund',
      amount: booking.coins_spent, // Positive = credit
      reference_id: bookingId,
      metadata: { reason: 'cancellation' },
    })

    // Mark booking as refunded
    await supabase
      .from('bookings')
      .update({ refunded: true })
      .eq('id', bookingId)
  }

  // Update practitioner earnings to cancelled
  await supabase
    .from('practitioner_earnings')
    .delete()
    .eq('booking_id', bookingId)

  revalidatePath('/dashboard')
  revalidatePath('/portal/sessions')

  return { success: true }
}
