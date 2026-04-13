'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Clock, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'
import {
  getEarningsSummary,
  requestPayout,
  getPayoutHistory,
} from '@/actions/earnings'
import { MIN_PAYOUT_INR } from '@/lib/constants/coins'

const bankDetailsSchema = z.object({
  accountName: z.string().min(3, 'Account name is required'),
  accountNumber: z.string().min(8, 'Valid account number required'),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format'),
  bankName: z.string().min(2, 'Bank name is required'),
})

type BankDetailsInput = z.infer<typeof bankDetailsSchema>

interface PayoutRequest {
  id: string
  amount_inr: number
  status: string
  requested_at: string
  processed_at: string | null
}

export function PayoutRequestForm() {
  const [summary, setSummary] = useState<{ availableBalance: number; canRequestPayout: boolean } | null>(null)
  const [payoutHistory, setPayoutHistory] = useState<PayoutRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<BankDetailsInput>({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: {
      accountName: '',
      accountNumber: '',
      ifscCode: '',
      bankName: '',
    },
  })

  useEffect(() => {
    async function loadData() {
      const [summaryRes, historyRes] = await Promise.all([
        getEarningsSummary(),
        getPayoutHistory(),
      ])

      if (summaryRes.success && summaryRes.data) {
        setSummary({
          availableBalance: summaryRes.data.availableBalance,
          canRequestPayout: summaryRes.data.canRequestPayout,
        })
      }
      if (historyRes.success && historyRes.data) {
        setPayoutHistory(historyRes.data.requests)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  const onSubmit = async (data: BankDetailsInput) => {
    setSubmitting(true)
    try {
      const result = await requestPayout(data)

      if (!result.success) {
        throw new Error(result.error || 'Payout request failed')
      }

      toast.success('Payout request submitted successfully')
      // Reload data
      const [summaryRes, historyRes] = await Promise.all([
        getEarningsSummary(),
        getPayoutHistory(),
      ])
      if (summaryRes.success && summaryRes.data) {
        setSummary({
          availableBalance: summaryRes.data.availableBalance,
          canRequestPayout: summaryRes.data.canRequestPayout,
        })
      }
      if (historyRes.success && historyRes.data) {
        setPayoutHistory(historyRes.data.requests)
      }
      form.reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Request failed')
    } finally {
      setSubmitting(false)
    }
  }

  const formatInr = (amount: number) =>
    `Rs ${amount.toLocaleString('en-IN')}`

  const hasPendingRequest = payoutHistory.some(r => r.status === 'pending')

  if (loading) {
    return <div className="h-64 bg-muted animate-pulse rounded-lg" />
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Request Payout</CardTitle>
          <CardDescription>
            Minimum payout amount is {formatInr(MIN_PAYOUT_INR)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!summary?.canRequestPayout && !hasPendingRequest && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Your available balance ({formatInr(summary?.availableBalance || 0)}) is below the minimum payout threshold of {formatInr(MIN_PAYOUT_INR)}.
              </AlertDescription>
            </Alert>
          )}

          {hasPendingRequest && (
            <Alert className="mb-4 border-blue-200 bg-blue-50">
              <Clock className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                You have a pending payout request. Please wait for it to be processed.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="accountName">Account Holder Name</Label>
                <Input
                  id="accountName"
                  {...form.register('accountName')}
                  placeholder="As per bank records"
                />
                {form.formState.errors.accountName && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.accountName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  {...form.register('accountNumber')}
                  placeholder="Enter account number"
                />
                {form.formState.errors.accountNumber && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.accountNumber.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ifscCode">IFSC Code</Label>
                <Input
                  id="ifscCode"
                  {...form.register('ifscCode')}
                  placeholder="e.g., HDFC0001234"
                  className="uppercase"
                />
                {form.formState.errors.ifscCode && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.ifscCode.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  {...form.register('bankName')}
                  placeholder="e.g., HDFC Bank"
                />
                {form.formState.errors.bankName && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.bankName.message}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Payout amount</p>
                <p className="text-xl font-bold">{formatInr(summary?.availableBalance || 0)}</p>
              </div>
              <Button
                type="submit"
                disabled={!summary?.canRequestPayout || hasPendingRequest || submitting}
              >
                {submitting ? 'Submitting...' : 'Request Payout'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Payout history */}
      {payoutHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payout History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payoutHistory.map((request) => (
                <div key={request.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div>
                    <p className="font-medium">{formatInr(request.amount_inr)}</p>
                    <p className="text-sm text-muted-foreground">
                      Requested {format(parseISO(request.requested_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      request.status === 'completed' ? 'bg-green-100 text-green-800' :
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }
                  >
                    {request.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
