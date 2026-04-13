'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { TierBadge } from '@/components/portal/tier-badge'
import { CheckCircle, Calendar, Clock, Video, Download, User } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { createEvent } from 'ics'
import type { PractitionerTier } from '@/types/database'

interface BookingConfirmationProps {
  booking: {
    id: string
    session_duration: number
    scheduled_at: string
    ends_at: string
    timezone: string
    meet_link: string | null
    brief_stuck_on: string
    brief_desired_outcome: string
    brief_context: string | null
    coins_spent: number
  }
  practitioner: {
    full_name: string
    specializations: string[] | null
    tier: string | null
  }
}

export function BookingConfirmation({ booking, practitioner }: BookingConfirmationProps) {
  const scheduledDate = parseISO(booking.scheduled_at)
  const endDate = parseISO(booking.ends_at)

  // Generate .ics file per D-08
  const handleDownloadCalendar = () => {
    const event = {
      start: [
        scheduledDate.getFullYear(),
        scheduledDate.getMonth() + 1,
        scheduledDate.getDate(),
        scheduledDate.getHours(),
        scheduledDate.getMinutes(),
      ] as [number, number, number, number, number],
      end: [
        endDate.getFullYear(),
        endDate.getMonth() + 1,
        endDate.getDate(),
        endDate.getHours(),
        endDate.getMinutes(),
      ] as [number, number, number, number, number],
      title: `BLAST AI Session with ${practitioner.full_name}`,
      description: `Session Brief:\n\nStuck on: ${booking.brief_stuck_on}\n\nDesired outcome: ${booking.brief_desired_outcome}${booking.brief_context ? `\n\nContext: ${booking.brief_context}` : ''}`,
      location: booking.meet_link || 'Google Meet link pending',
      url: booking.meet_link || undefined,
      organizer: { name: 'BLAST AI', email: 'noreply@blastai.com' },
    }

    createEvent(event, (error, value) => {
      if (error) {
        console.error('ICS generation error:', error)
        return
      }

      const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `blast-session-${booking.id}.ics`
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  return (
    <div className="space-y-6">
      {/* Success banner */}
      <div className="flex items-center gap-4 p-6 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle className="h-10 w-10 text-green-600" />
        <div>
          <h1 className="text-xl font-bold text-green-800">Session Confirmed!</h1>
          <p className="text-green-700">
            Your session has been booked successfully
          </p>
        </div>
      </div>

      {/* Practitioner info - NAME REVEALED per D-08 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Your Practitioner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <span className="text-2xl font-bold">
                {practitioner.full_name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <p className="text-lg font-semibold">{practitioner.full_name}</p>
              <TierBadge tier={practitioner.tier as PractitionerTier} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session details */}
      <Card>
        <CardHeader>
          <CardTitle>Session Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">{format(scheduledDate, 'EEEE, MMMM d, yyyy')}</p>
              <p className="text-sm text-muted-foreground">
                {format(scheduledDate, 'h:mm a')} - {format(endDate, 'h:mm a')} ({booking.timezone})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <p>{booking.session_duration} minute session</p>
          </div>

          {booking.meet_link && (
            <div className="flex items-center gap-3">
              <Video className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Google Meet</p>
                <a
                  href={booking.meet_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {booking.meet_link}
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prep instructions per D-08 */}
      <Card>
        <CardHeader>
          <CardTitle>Preparation Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">1</Badge>
              <div>
                <p className="font-medium">Review your session brief</p>
                <p className="text-sm text-muted-foreground">
                  Your practitioner will review this before the session
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">2</Badge>
              <div>
                <p className="font-medium">Prepare specific questions</p>
                <p className="text-sm text-muted-foreground">
                  Come with 2-3 focused questions to maximize your time
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">3</Badge>
              <div>
                <p className="font-medium">Have your work ready to share</p>
                <p className="text-sm text-muted-foreground">
                  Screen sharing is encouraged - have relevant code/docs open
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">4</Badge>
              <div>
                <p className="font-medium">Join 5 minutes early</p>
                <p className="text-sm text-muted-foreground">
                  Ensure your audio/video works before the session starts
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Your brief (what you submitted) */}
      <Card>
        <CardHeader>
          <CardTitle>Your Session Brief</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">What are you stuck on?</p>
            <p className="mt-1">{booking.brief_stuck_on}</p>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Desired outcome</p>
            <p className="mt-1">{booking.brief_desired_outcome}</p>
          </div>
          {booking.brief_context && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Context</p>
                <p className="mt-1">{booking.brief_context}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={handleDownloadCalendar}>
          <Download className="h-4 w-4 mr-2" />
          Download Calendar Invite
        </Button>
        {booking.meet_link && (
          <a
            href={booking.meet_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium h-8 gap-1.5 px-2.5 hover:bg-primary/80 transition-all"
          >
            <Video className="h-4 w-4 mr-2" />
            Open Google Meet
          </a>
        )}
      </div>
    </div>
  )
}
