import Link from 'next/link'
import { format } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, RefreshCw, Star } from 'lucide-react'
import { type SessionHistoryItem } from '@/actions/dashboard'

interface SessionCardProps {
  session: SessionHistoryItem
  showRebook?: boolean
}

export function SessionCard({ session, showRebook = true }: SessionCardProps) {
  const scheduledDate = new Date(session.scheduled_at)
  const endsDate = new Date(session.ends_at)
  const durationMinutes = Math.round((endsDate.getTime() - scheduledDate.getTime()) / (1000 * 60))

  const statusColors: Record<string, string> = {
    confirmed: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    pending: 'bg-yellow-100 text-yellow-700',
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium truncate">{session.practitioner_name}</h3>
              <Badge variant="secondary" className={statusColors[session.status] || ''}>
                {session.status}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {format(scheduledDate, 'MMM d, yyyy')}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {format(scheduledDate, 'h:mm a')} ({durationMinutes}min)
              </span>
            </div>

            {session.specializations.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {session.specializations.slice(0, 3).map((spec) => (
                  <Badge key={spec} variant="outline" className="text-xs">
                    {spec}
                  </Badge>
                ))}
              </div>
            )}

            <p className="text-sm text-muted-foreground line-clamp-2">
              {session.brief_stuck_on}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className="text-sm font-medium">{session.coins_spent} coins</span>

            {/* Rebook CTA per D-12 */}
            {showRebook && session.status === 'completed' && (
              <Button asChild size="sm" variant="outline">
                <Link
                  href={`/discover/${session.practitioner_id}/book?rebook=true&duration=${durationMinutes}`}
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  Rebook
                </Link>
              </Button>
            )}

            {/* Review prompt for completed sessions needing review */}
            {session.status === 'completed' && session.needs_review && (
              <Button asChild size="sm" variant="default">
                <Link href={`/dashboard/review/${session.id}`}>
                  <Star className="h-3.5 w-3.5 mr-1.5" />
                  Leave Review
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
