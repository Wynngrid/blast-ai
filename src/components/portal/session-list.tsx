'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Video, Building2, ChevronDown, ChevronUp } from 'lucide-react'
import { format, parseISO, differenceInHours } from 'date-fns'
import { getUpcomingSessions, getPastSessions } from '@/actions/sessions'

interface UpcomingSession {
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
}

interface PastSession {
  id: string
  session_duration: number
  scheduled_at: string
  status: string
  enterprise_company: string
}

export function SessionList() {
  const [upcoming, setUpcoming] = useState<UpcomingSession[]>([])
  const [past, setPast] = useState<PastSession[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    async function loadSessions() {
      const [upcomingRes, pastRes] = await Promise.all([
        getUpcomingSessions(),
        getPastSessions(),
      ])

      if (upcomingRes.success && upcomingRes.data) {
        setUpcoming(upcomingRes.data.sessions)
      }
      if (pastRes.success && pastRes.data) {
        setPast(pastRes.data.sessions)
      }
      setLoading(false)
    }
    loadSessions()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    )
  }

  const getTimeUntilSession = (scheduledAt: string) => {
    const hours = differenceInHours(parseISO(scheduledAt), new Date())
    if (hours < 1) return 'Starting soon'
    if (hours < 24) return `In ${hours} hours`
    return `In ${Math.ceil(hours / 24)} days`
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="space-y-8">
      {/* Upcoming sessions per BOOK-05 */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Upcoming Sessions</h2>
        {upcoming.length > 0 ? (
          <div className="space-y-4">
            {upcoming.map((session) => (
              <Card key={session.id} className="overflow-hidden">
                <button
                  onClick={() => toggleExpand(session.id)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">
                        {session.session_duration} min session
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {session.enterprise_company}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">{getTimeUntilSession(session.scheduled_at)}</Badge>
                    <div className="text-right text-sm">
                      <p>{format(parseISO(session.scheduled_at), 'MMM d')}</p>
                      <p className="text-muted-foreground">
                        {format(parseISO(session.scheduled_at), 'h:mm a')}
                      </p>
                    </div>
                    {expandedId === session.id ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>
                {expandedId === session.id && (
                  <CardContent className="pt-0 pb-4 border-t">
                    {/* Session brief per BOOK-05 */}
                    <div className="space-y-4 pt-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">What they're stuck on</p>
                        <p className="mt-1">{session.brief_stuck_on}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Desired outcome</p>
                        <p className="mt-1">{session.brief_desired_outcome}</p>
                      </div>
                      {session.brief_context && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Context</p>
                          <p className="mt-1">{session.brief_context}</p>
                        </div>
                      )}
                      {session.meet_link && (
                        <a
                          href={session.meet_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium h-7 gap-1 px-2.5 hover:bg-primary/80 transition-all"
                        >
                          <Video className="h-4 w-4 mr-2" />
                          Join Meeting
                        </a>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No upcoming sessions</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Past sessions */}
      {past.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Past Sessions</h2>
          <div className="space-y-2">
            {past.map((session) => (
              <Card key={session.id}>
                <CardContent className="py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{session.session_duration} min session</p>
                    <p className="text-sm text-muted-foreground">
                      {session.enterprise_company} - {format(parseISO(session.scheduled_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <Badge variant={session.status === 'completed' ? 'default' : 'outline'}>
                    {session.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
