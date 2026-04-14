'use server'

import { createClient } from '@/lib/supabase/server'
import { resend, EMAIL_FROM } from '@/lib/resend'
import { BookingConfirmationEmail } from '@/emails/booking-confirmation'
import { NewBookingAlertEmail } from '@/emails/new-booking-alert'
import { SessionReminderEmail } from '@/emails/session-reminder'
import { parseISO } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'

export type NotificationResult = {
  success: boolean
  error?: string
}

/**
 * Send booking confirmation to enterprise per NOTF-01
 */
export async function sendBookingConfirmation(
  bookingId: string,
  enterpriseEmail: string,
  data: {
    practitionerName: string
    scheduledAt: string
    sessionDuration: number
    timezone: string
    meetLink: string | null
  }
): Promise<NotificationResult> {
  try {
    const supabase = await createClient()

    // Format date/time in booking timezone
    const scheduledDate = parseISO(data.scheduledAt)
    const sessionDate = formatInTimeZone(scheduledDate, data.timezone, 'EEEE, MMMM d, yyyy')
    const sessionTime = formatInTimeZone(scheduledDate, data.timezone, 'h:mm a zzz')

    // Send email
    const { data: emailResponse, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [enterpriseEmail],
      subject: `Session confirmed with ${data.practitionerName}`,
      react: BookingConfirmationEmail({
        practitionerName: data.practitionerName,
        sessionDate,
        sessionTime,
        sessionDuration: data.sessionDuration,
        meetLink: data.meetLink,
        bookingId,
      }),
    })

    if (error) {
      console.error('Email send failed:', error)
      return { success: false, error: error.message }
    }

    // Log notification
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: enterprise } = await supabase
        .from('enterprises')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (enterprise) {
        await supabase.from('notification_log').insert({
          type: 'booking_confirmed',
          recipient_id: enterprise.id,
          recipient_type: 'enterprise',
          email: enterpriseEmail,
          booking_id: bookingId,
          resend_id: emailResponse?.id || null,
        })
      }
    }

    return { success: true }
  } catch (error) {
    console.error('sendBookingConfirmation error:', error)
    return { success: false, error: 'Failed to send confirmation email' }
  }
}

/**
 * Send new booking alert to practitioner per NOTF-02
 */
export async function sendNewBookingAlert(
  bookingId: string,
  practitionerEmail: string,
  practitionerId: string,
  data: {
    scheduledAt: string
    sessionDuration: number
    timezone: string
    briefStuckOn: string
    briefDesiredOutcome: string
    briefContext: string | null
  }
): Promise<NotificationResult> {
  try {
    const supabase = await createClient()

    // Format date/time
    const scheduledDate = parseISO(data.scheduledAt)
    const sessionDate = formatInTimeZone(scheduledDate, data.timezone, 'EEEE, MMMM d, yyyy')
    const sessionTime = formatInTimeZone(scheduledDate, data.timezone, 'h:mm a zzz')

    const { data: emailResponse, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [practitionerEmail],
      subject: `New ${data.sessionDuration} minute session booked`,
      react: NewBookingAlertEmail({
        sessionDate,
        sessionTime,
        sessionDuration: data.sessionDuration,
        briefStuckOn: data.briefStuckOn,
        briefDesiredOutcome: data.briefDesiredOutcome,
        briefContext: data.briefContext,
        bookingId,
      }),
    })

    if (error) {
      console.error('Email send failed:', error)
      return { success: false, error: error.message }
    }

    // Log notification
    await supabase.from('notification_log').insert({
      type: 'new_booking',
      recipient_id: practitionerId,
      recipient_type: 'practitioner',
      email: practitionerEmail,
      booking_id: bookingId,
      resend_id: emailResponse?.id || null,
    })

    return { success: true }
  } catch (error) {
    console.error('sendNewBookingAlert error:', error)
    return { success: false, error: 'Failed to send alert email' }
  }
}

/**
 * Send 24-hour reminder to both parties per NOTF-03
 */
export async function sendSessionReminder(
  bookingId: string,
  recipientType: 'enterprise' | 'practitioner',
  recipientEmail: string,
  recipientId: string,
  data: {
    otherPartyName: string
    scheduledAt: string
    sessionDuration: number
    timezone: string
    meetLink: string | null
    briefStuckOn: string
  }
): Promise<NotificationResult> {
  try {
    const supabase = await createClient()

    // Format date/time
    const scheduledDate = parseISO(data.scheduledAt)
    const sessionDate = formatInTimeZone(scheduledDate, data.timezone, 'EEEE, MMMM d, yyyy')
    const sessionTime = formatInTimeZone(scheduledDate, data.timezone, 'h:mm a zzz')

    const { data: emailResponse, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [recipientEmail],
      subject: `Reminder: Session tomorrow at ${sessionTime}`,
      react: SessionReminderEmail({
        recipientType,
        otherPartyName: data.otherPartyName,
        sessionDate,
        sessionTime,
        sessionDuration: data.sessionDuration,
        meetLink: data.meetLink,
        briefStuckOn: data.briefStuckOn,
      }),
    })

    if (error) {
      console.error('Email send failed:', error)
      return { success: false, error: error.message }
    }

    // Log notification
    await supabase.from('notification_log').insert({
      type: 'reminder_24h',
      recipient_id: recipientId,
      recipient_type: recipientType,
      email: recipientEmail,
      booking_id: bookingId,
      resend_id: emailResponse?.id || null,
    })

    return { success: true }
  } catch (error) {
    console.error('sendSessionReminder error:', error)
    return { success: false, error: 'Failed to send reminder email' }
  }
}
