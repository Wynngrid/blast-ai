import { google } from 'googleapis'

// Service account auth for Calendar API
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/calendar'],
})

const calendar = google.calendar({ version: 'v3', auth })

interface MeetingInput {
  title: string
  description: string
  startTime: Date
  endTime: Date
  attendeeEmails: string[]
  timezone: string
}

interface MeetingResult {
  success: boolean
  meetLink?: string
  eventId?: string
  error?: string
}

/**
 * Create a Google Calendar event with Meet link per D-09
 */
export async function createMeetingWithLink(input: MeetingInput): Promise<MeetingResult> {
  try {
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary'

    const event = await calendar.events.insert({
      calendarId,
      conferenceDataVersion: 1, // Required for Meet link
      requestBody: {
        summary: input.title,
        description: input.description,
        start: {
          dateTime: input.startTime.toISOString(),
          timeZone: input.timezone,
        },
        end: {
          dateTime: input.endTime.toISOString(),
          timeZone: input.timezone,
        },
        attendees: input.attendeeEmails.map((email) => ({ email })),
        conferenceData: {
          createRequest: {
            requestId: `blast-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 24 hours
            { method: 'popup', minutes: 30 }, // 30 minutes
          ],
        },
      },
    })

    const meetLink = event.data.conferenceData?.entryPoints?.find(
      (e) => e.entryPointType === 'video'
    )?.uri

    if (!meetLink) {
      console.error('No Meet link in calendar event:', event.data)
      return { success: false, error: 'Failed to generate Meet link' }
    }

    return {
      success: true,
      meetLink,
      eventId: event.data.id || undefined,
    }
  } catch (error) {
    console.error('Google Calendar error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Calendar API error',
    }
  }
}

/**
 * Cancel a calendar event (for booking cancellation)
 */
export async function cancelMeeting(eventId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary'

    await calendar.events.delete({
      calendarId,
      eventId,
    })

    return { success: true }
  } catch (error) {
    console.error('Calendar delete error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel meeting',
    }
  }
}
