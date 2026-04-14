import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Calendar, Coins, TrendingUp } from 'lucide-react'
import { type DashboardStats } from '@/actions/dashboard'

interface OverviewStatsProps {
  stats: DashboardStats
}

export function OverviewStats({ stats }: OverviewStatsProps) {
  const utilizationPercent = stats.totalCoinsPurchased > 0
    ? Math.round((stats.totalCoinsSpent / stats.totalCoinsPurchased) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Key metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sessionsCompleted}</div>
            <p className="text-xs text-muted-foreground">Total mentorship sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingSessions}</div>
            <p className="text-xs text-muted-foreground">Scheduled this period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coin Balance</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.coinBalance}</div>
            <p className="text-xs text-muted-foreground">Available BLAST Coins</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positive Outcomes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.positiveOutcomeRate}%</div>
            <p className="text-xs text-muted-foreground">Skills learned or blockers resolved</p>
          </CardContent>
        </Card>
      </div>

      {/* Budget utilization per D-02 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Budget Utilization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Coins Used</span>
            <span className="font-medium">{stats.totalCoinsSpent} / {stats.totalCoinsPurchased}</span>
          </div>
          <Progress value={utilizationPercent} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {utilizationPercent}% of purchased coins utilized
          </p>
        </CardContent>
      </Card>

      {/* Outcome breakdown per D-05 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Session Outcomes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <OutcomeBar label="Skills Learned" value={stats.outcomeBreakdown.skill_learned} color="bg-green-500" />
            <OutcomeBar label="Blockers Resolved" value={stats.outcomeBreakdown.blocker_resolved} color="bg-blue-500" />
            <OutcomeBar label="Need Follow-up" value={stats.outcomeBreakdown.need_followup} color="bg-yellow-500" />
            <OutcomeBar label="Not Helpful" value={stats.outcomeBreakdown.not_helpful} color="bg-red-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function OutcomeBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 text-sm text-muted-foreground">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full`}
          style={{ width: `${Math.min(value * 10, 100)}%` }}
        />
      </div>
      <span className="w-8 text-sm font-medium text-right">{value}</span>
    </div>
  )
}
