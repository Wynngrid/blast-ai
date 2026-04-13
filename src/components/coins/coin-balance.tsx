'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Coins, AlertTriangle } from 'lucide-react'
import { getAvailableBalance } from '@/actions/coins'

export function CoinBalance() {
  const [balance, setBalance] = useState<{ total: number; expiringSoon: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadBalance() {
      const result = await getAvailableBalance()
      if (result.success && result.data) {
        setBalance(result.data)
      }
      setLoading(false)
    }
    loadBalance()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-12 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Your Balance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">
          {balance?.total || 0}
          <span className="text-lg font-normal text-muted-foreground ml-2">coins</span>
        </p>
        {balance && balance.expiringSoon > 0 && (
          <p className="text-sm text-amber-600 flex items-center gap-1 mt-2">
            <AlertTriangle className="h-4 w-4" />
            {balance.expiringSoon} coins expiring within 30 days
          </p>
        )}
      </CardContent>
    </Card>
  )
}
