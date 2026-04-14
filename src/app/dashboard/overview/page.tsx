import { getDashboardStats } from '@/actions/dashboard'
import { OverviewStats } from '@/components/dashboard/overview-stats'

export default async function OverviewPage() {
  const { stats, error } = await getDashboardStats()

  if (error || !stats) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error || 'Failed to load dashboard stats'}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Team Overview</h2>
        <p className="text-muted-foreground">
          Track your team's AI upskilling progress and learning outcomes.
        </p>
      </div>

      <OverviewStats stats={stats} />
    </div>
  )
}
