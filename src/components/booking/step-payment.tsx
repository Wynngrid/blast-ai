'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useBookingWizard } from '@/lib/stores/booking-wizard'
import { getAvailableBalance, spendCoins } from '@/actions/coins'
import { getSessionCoinCost, COIN_VALUE_INR } from '@/lib/constants/coins'
import { AlertTriangle, CheckCircle, Coins } from 'lucide-react'
import Link from 'next/link'

interface StepPaymentProps {
  practitionerHourlyRate: number
  onBookingComplete: (bookingId: string) => void
}

export function StepPayment({ practitionerHourlyRate, onBookingComplete }: StepPaymentProps) {
  const { sessionDuration, brief, selectedSlot, practitionerId, prevStep } = useBookingWizard()
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate coins required per D-12, D-13
  const coinsRequired = sessionDuration
    ? getSessionCoinCost(practitionerHourlyRate, sessionDuration)
    : 0

  const costInInr = coinsRequired * COIN_VALUE_INR

  useEffect(() => {
    async function loadBalance() {
      const result = await getAvailableBalance()
      if (result.success && result.data) {
        setBalance(result.data.total)
      }
      setLoading(false)
    }
    loadBalance()
  }, [])

  const hasEnoughCoins = balance !== null && balance >= coinsRequired

  const handleConfirmPayment = async () => {
    if (!sessionDuration || !brief || !selectedSlot || !practitionerId) {
      setError('Missing booking information')
      return
    }

    setProcessing(true)
    setError(null)

    try {
      // Create booking first (in Plan 05, here we simulate)
      // For now, create a mock booking ID - actual creation in Plan 05
      const mockBookingId = `booking_${Date.now()}`

      // Spend coins
      const result = await spendCoins(mockBookingId, coinsRequired)

      if (!result.success) {
        throw new Error(result.error || 'Failed to process payment')
      }

      onBookingComplete(mockBookingId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Confirm Payment</h2>
        <p className="text-muted-foreground mt-1">
          Review your booking and confirm payment
        </p>
      </div>

      {/* Booking summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Session duration</span>
            <span className="font-medium">{sessionDuration} minutes</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date</span>
            <span className="font-medium">{selectedSlot?.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Time</span>
            <span className="font-medium">{selectedSlot?.startTime}</span>
          </div>
          <hr className="my-4" />
          <div className="flex justify-between text-lg">
            <span className="font-semibold">Total</span>
            <span className="font-bold flex items-center gap-2">
              <Coins className="h-5 w-5" />
              {coinsRequired} coins
            </span>
          </div>
          <p className="text-sm text-muted-foreground text-right">
            (approx. Rs {costInInr.toLocaleString('en-IN')})
          </p>
        </CardContent>
      </Card>

      {/* Balance check */}
      <Card className={hasEnoughCoins ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            {hasEnoughCoins ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            )}
            <div>
              <p className="font-medium">
                Your balance: {balance} coins
              </p>
              {!hasEnoughCoins && (
                <p className="text-sm text-amber-700">
                  You need {coinsRequired - (balance || 0)} more coins
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {!hasEnoughCoins && (
        <Alert>
          <AlertDescription>
            <Link href="/coins" className="text-primary underline">
              Purchase more coins
            </Link>
            {' '}to complete this booking.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep} disabled={processing}>
          Back
        </Button>
        <Button
          onClick={handleConfirmPayment}
          disabled={!hasEnoughCoins || processing}
        >
          {processing ? 'Processing...' : 'Confirm & Pay'}
        </Button>
      </div>
    </div>
  )
}
