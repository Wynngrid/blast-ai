import { getDashboardStats } from '@/actions/dashboard'
import { OverviewStats } from '@/components/dashboard/overview-stats'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function OverviewPage() {
  const { stats, error } = await getDashboardStats()

  // Get enterprise ID for download link
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: enterprise } = user
    ? await supabase
        .from('enterprises')
        .select('id')
        .eq('user_id', user.id)
        .single()
    : { data: null }

  if (error || !stats) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error || 'Failed to load dashboard stats'}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Team Overview</h2>
          <p className="text-muted-foreground">
            Track your team's AI upskilling progress and learning outcomes.
          </p>
        </div>
        {enterprise && (
          <Button asChild variant="outline">
            <a href={`/api/reports/${enterprise.id}?period=month`} download>
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </a>
          </Button>
        )}
      </div>

      <OverviewStats stats={stats} />
    </div>
  )
}
