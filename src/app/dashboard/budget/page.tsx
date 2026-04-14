import { getDashboardStats } from '@/actions/dashboard'
import { BudgetProgress } from '@/components/dashboard/budget-progress'

export default async function BudgetPage() {
  const { stats, error } = await getDashboardStats()

  if (error || !stats) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error || 'Failed to load budget data'}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Budget</h2>
        <p className="text-muted-foreground">
          Track your BLAST Coin balance and spending.
        </p>
      </div>

      <BudgetProgress
        coinBalance={stats.coinBalance}
        totalPurchased={stats.totalCoinsPurchased}
        totalSpent={stats.totalCoinsSpent}
      />
    </div>
  )
}
