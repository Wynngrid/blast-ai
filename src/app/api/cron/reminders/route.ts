import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendSessionReminder } from '@/actions/notifications'
import { addHours } from 'date-fns'

// Use service role for cron job (no user session)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Cron endpoint for 24-hour session reminders per NOTF-03
 *
 * Set up in Vercel: Cron job calling this endpoint every hour
 * vercel.json: { "crons": [{ "path": "/api/cron/reminders", "schedule": "0 * * * *" }] }
 */
export async function GET(req: NextRequest) {
  // Verify cron secret (optional security)
  const authHeader = req.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Find sessions happening in 23-25 hours (to handle hourly cron timing)
    const now = new Date()
    const windowStart = addHours(now, 23)
    const windowEnd = addHours(now, 25)

    // Get confirmed sessions in the reminder window
    const { data: bookings, error } = await supabaseAdmin
      .from('bookings')
      .select(`
        id,
        scheduled_at,
        session_duration,
        timezone,
        meet_link,
        brief_stuck_on,
        enterprise_id,
        practitioner_id,
        enterprises (
          id,
          company_name,
          user_id
        ),
        practitioners (
          id,
          full_name,
          user_id
        )
      `)
      .eq('status', 'confirmed')
      .gte('scheduled_at', windowStart.toISOString())
      .lte('scheduled_at', windowEnd.toISOString())

    if (error) {
      console.error('Failed to fetch sessions for reminders:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ message: 'No sessions requiring reminders', count: 0 })
    }

    // Check which bookings already have reminders sent
    const bookingIds = bookings.map(b => b.id)
    const { data: existingReminders } = await supabaseAdmin
      .from('notification_log')
      .select('booking_id')
      .eq('type', 'reminder_24h')
      .in('booking_id', bookingIds)

    const alreadyReminded = new Set((existingReminders || []).map(r => r.booking_id))

    // Send reminders
    let sentCount = 0
    for (const booking of bookings) {
      // Skip if already reminded
      if (alreadyReminded.has(booking.id)) {
        continue
      }

      // Get enterprise and practitioner data
      // Supabase returns single relations as objects when using foreign key joins
      const enterprise = booking.enterprises as unknown as { id: string; company_name: string; user_id: string } | null
      const practitioner = booking.practitioners as unknown as { id: string; full_name: string; user_id: string } | null

      if (!enterprise || !practitioner) {
        console.error(`Missing enterprise or practitioner data for booking ${booking.id}`, {
          hasEnterprise: !!enterprise,
          hasPractitioner: !!practitioner,
          bookingId: booking.id,
          enterpriseId: booking.enterprise_id,
          practitionerId: booking.practitioner_id,
        })
        continue
      }

      // Get enterprise email from auth
      const { data: enterpriseAuth } = await supabaseAdmin.auth.admin.getUserById(
        enterprise.user_id
      )
      const { data: practitionerAuth } = await supabaseAdmin.auth.admin.getUserById(
        practitioner.user_id
      )

      if (enterpriseAuth?.user?.email) {
        await sendSessionReminder(
          booking.id,
          'enterprise',
          enterpriseAuth.user.email,
          enterprise.id,
          {
            otherPartyName: practitioner.full_name,
            scheduledAt: booking.scheduled_at,
            sessionDuration: booking.session_duration,
            timezone: booking.timezone,
            meetLink: booking.meet_link,
            briefStuckOn: booking.brief_stuck_on,
          }
        )
        sentCount++
      }

      if (practitionerAuth?.user?.email) {
        await sendSessionReminder(
          booking.id,
          'practitioner',
          practitionerAuth.user.email,
          practitioner.id,
          {
            otherPartyName: enterprise.company_name,
            scheduledAt: booking.scheduled_at,
            sessionDuration: booking.session_duration,
            timezone: booking.timezone,
            meetLink: booking.meet_link,
            briefStuckOn: booking.brief_stuck_on,
          }
        )
        sentCount++
      }
    }

    return NextResponse.json({
      message: 'Reminders sent',
      sessionsFound: bookings.length,
      remindersSent: sentCount,
    })
  } catch (error) {
    console.error('Reminder cron error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
