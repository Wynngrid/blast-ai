import { Card, CardContent } from '@/components/ui/card'
import { Clock } from 'lucide-react'

export default function SessionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Sessions</h2>
        <p className="text-muted-foreground">
          View your upcoming and past sessions
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No sessions yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              When enterprises book you, sessions will appear here with their briefs
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
