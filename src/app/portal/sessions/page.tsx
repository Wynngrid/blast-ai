import { SessionList } from '@/components/portal/session-list'

export default function SessionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Sessions</h2>
        <p className="text-muted-foreground">
          View your upcoming and past sessions with briefs
        </p>
      </div>

      <SessionList />
    </div>
  )
}
