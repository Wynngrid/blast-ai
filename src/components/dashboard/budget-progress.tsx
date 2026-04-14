import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Coins, TrendingDown, TrendingUp, ShoppingCart } from 'lucide-react'

interface BudgetProgressProps {
  coinBalance: number
  totalPurchased: number
  totalSpent: number
}

export function BudgetProgress({ coinBalance, totalPurchased, totalSpent }: BudgetProgressProps) {
  const utilizationPercent = totalPurchased > 0
    ? Math.round((totalSpent / totalPurchased) * 100)
    : 0

  const coinValueINR = 850 // 1 coin = 850 INR approximately

  return (
    <div className="space-y-6">
      {/* Current balance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Coin Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-4xl font-bold">{coinBalance}</p>
              <p className="text-sm text-muted-foreground">
                ~{(coinBalance * coinValueINR).toLocaleString('en-IN')} INR value
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/buy-coins">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Buy Coins
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Utilization */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Utilization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Used</span>
            <span className="font-medium">{totalSpent} / {totalPurchased} coins</span>
          </div>
          <Progress value={utilizationPercent} className="h-3" />
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-green-100 p-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">{totalPurchased}</p>
                <p className="text-xs text-muted-foreground">Total purchased</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-blue-100 p-2">
                <TrendingDown className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">{totalSpent}</p>
                <p className="text-xs text-muted-foreground">Total spent</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
