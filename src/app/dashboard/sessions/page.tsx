import { getSessionHistory } from '@/actions/dashboard'
import { SessionCard } from '@/components/dashboard/session-card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

export default async function SessionsPage() {
  const [upcomingResult, pastResult] = await Promise.all([
    getSessionHistory('upcoming'),
    getSessionHistory('past'),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Sessions</h2>
        <p className="text-muted-foreground">
          View your scheduled and completed mentorship sessions.
        </p>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingResult.sessions.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastResult.sessions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          {upcomingResult.sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No upcoming sessions scheduled.</p>
              <p className="text-sm mt-1">
                <a href="/discover" className="text-primary hover:underline">
                  Browse practitioners
                </a>{' '}
                to book your next session.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingResult.sessions.map((session) => (
                <SessionCard key={session.id} session={session} showRebook={false} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4">
          {pastResult.sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No completed sessions yet.
            </div>
          ) : (
            <div className="space-y-3">
              {pastResult.sessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
