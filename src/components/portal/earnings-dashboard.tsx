'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Wallet, TrendingUp, Clock } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import {
  getEarningsSummary,
  getEarningsHistory,
  getMonthlyEarnings,
} from '@/actions/earnings'

interface EarningsSummary {
  availableBalance: number
  pendingEarnings: number
  totalEarned: number
  canRequestPayout: boolean
  minPayoutAmount: number
}

interface Transaction {
  id: string
  amount_inr: number
  status: string
  session_duration: number
  session_date: string
  created_at: string
}

interface MonthlyData {
  month: string
  total_inr: number
}

export function EarningsDashboard() {
  const [summary, setSummary] = useState<EarningsSummary | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [monthly, setMonthly] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const [summaryRes, historyRes, monthlyRes] = await Promise.all([
        getEarningsSummary(),
        getEarningsHistory(),
        getMonthlyEarnings(),
      ])

      if (summaryRes.success && summaryRes.data) {
        setSummary(summaryRes.data)
      }
      if (historyRes.success && historyRes.data) {
        setTransactions(historyRes.data.transactions)
      }
      if (monthlyRes.success && monthlyRes.data) {
        setMonthly(monthlyRes.data.monthly)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  const formatInr = (amount: number) =>
    `Rs ${amount.toLocaleString('en-IN')}`

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    available: 'bg-green-100 text-green-800',
    requested: 'bg-blue-100 text-blue-800',
    paid: 'bg-gray-100 text-gray-800',
  }

  return (
    <div className="space-y-6">
      {/* Summary cards per D-20 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatInr(summary?.availableBalance || 0)}</p>
            <p className="text-xs text-muted-foreground">
              Ready for payout
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatInr(summary?.pendingEarnings || 0)}</p>
            <p className="text-xs text-muted-foreground">
              From upcoming sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatInr(summary?.totalEarned || 0)}</p>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly trend chart per D-20 */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          {monthly.length > 0 ? (
            <div className="flex items-end gap-2 h-40">
              {monthly.map((m) => {
                const maxAmount = Math.max(...monthly.map(x => x.total_inr), 1)
                const height = (m.total_inr / maxAmount) * 100
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-primary/80 rounded-t"
                      style={{ height: `${Math.max(height, 4)}%` }}
                      title={formatInr(m.total_inr)}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(parseISO(m.month + '-01'), 'MMM')}
                    </p>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No earnings data yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Transaction history per D-20 */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div>
                    <p className="font-medium">{tx.session_duration} min session</p>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(tx.session_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatInr(tx.amount_inr)}</p>
                    <Badge variant="outline" className={statusColors[tx.status] || ''}>
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No transactions yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
