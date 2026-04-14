'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { COIN_PURCHASE_TIERS, MIN_COIN_PURCHASE, calculateDiscountedPrice } from '@/lib/constants/coins'

// Suggested packages per D-15
const SUGGESTED_PACKAGES = [
  { coins: 12, label: 'Single Session' },
  { coins: 50, label: 'Growth Pack' },
  { coins: 100, label: 'Scale Pack' },
]

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: { razorpay_payment_id: string }) => void
  theme: { color: string }
}

interface RazorpayInstance {
  open: () => void
}

export function PurchasePackages() {
  const [customCoins, setCustomCoins] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePurchase = async (coins: number) => {
    if (coins < MIN_COIN_PURCHASE) {
      toast.error(`Minimum purchase is ${MIN_COIN_PURCHASE} coins`)
      return
    }

    setLoading(true)
    try {
      // Create order
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coins }),
      })

      if (!orderRes.ok) {
        const error = await orderRes.json()
        throw new Error(error.error || 'Failed to create order')
      }

      const { orderId, amount } = await orderRes.json()

      // Check if Razorpay script is loaded
      if (typeof window.Razorpay === 'undefined') {
        throw new Error('Razorpay SDK not loaded. Please refresh the page.')
      }

      // Validate Razorpay key before initialization
      const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
      if (!razorpayKeyId) {
        throw new Error('Razorpay is not configured. Please contact support.')
      }

      // Open Razorpay checkout per D-18 (embedded)
      const options: RazorpayOptions = {
        key: razorpayKeyId,
        amount,
        currency: 'INR',
        name: 'BLAST AI',
        description: `${coins} BLAST Coins`,
        order_id: orderId,
        handler: function (response: { razorpay_payment_id: string }) {
          toast.success(`Successfully purchased ${coins} coins!`)
          // Reload to show updated balance
          window.location.reload()
        },
        theme: {
          color: '#D97757', // Brand color
        },
      }

      // Wrap Razorpay instantiation to catch SDK initialization errors
      try {
        const rzp = new window.Razorpay(options)
        rzp.open()
      } catch (sdkError) {
        console.error('Razorpay SDK error:', sdkError)
        throw new Error('Failed to initialize payment. Please try again or contact support.')
      }
    } catch (error) {
      console.error('Purchase error:', error)
      toast.error(error instanceof Error ? error.message : 'Purchase failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Purchase BLAST Coins</h2>

      {/* Suggested packages */}
      <div className="grid gap-4 sm:grid-cols-3">
        {SUGGESTED_PACKAGES.map((pkg) => {
          const pricing = calculateDiscountedPrice(pkg.coins, 'INR')
          return (
            <Card key={pkg.coins} className="relative">
              {pricing.discount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-green-500">
                  {Math.round(pricing.tier.discount * 100)}% off
                </Badge>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{pkg.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-2xl font-bold">{pkg.coins} coins</p>
                  {pricing.discount > 0 ? (
                    <>
                      <p className="text-sm text-muted-foreground line-through">
                        Rs {pricing.basePrice.toLocaleString('en-IN')}
                      </p>
                      <p className="text-lg font-semibold text-green-600">
                        Rs {pricing.finalPrice.toLocaleString('en-IN')}
                      </p>
                    </>
                  ) : (
                    <p className="text-lg font-semibold">
                      Rs {pricing.finalPrice.toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => handlePurchase(pkg.coins)}
                  disabled={loading}
                  className="w-full"
                >
                  Buy Now
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Custom amount */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Custom Amount</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="customCoins">Number of coins</Label>
              <Input
                id="customCoins"
                type="number"
                min={MIN_COIN_PURCHASE}
                value={customCoins}
                onChange={(e) => setCustomCoins(e.target.value)}
                placeholder={`Min ${MIN_COIN_PURCHASE}`}
              />
            </div>
            <Button
              onClick={() => handlePurchase(parseInt(customCoins, 10))}
              disabled={loading || !customCoins || parseInt(customCoins, 10) < MIN_COIN_PURCHASE}
            >
              Purchase
            </Button>
          </div>
          {customCoins && parseInt(customCoins, 10) >= MIN_COIN_PURCHASE && (
            <div className="text-sm">
              {(() => {
                const pricing = calculateDiscountedPrice(parseInt(customCoins, 10), 'INR')
                return (
                  <>
                    <p>Tier: {pricing.tier.label}</p>
                    {pricing.discount > 0 && (
                      <p className="text-green-600">
                        You save Rs {pricing.discount.toLocaleString('en-IN')}!
                      </p>
                    )}
                    <p className="font-semibold">
                      Total: Rs {pricing.finalPrice.toLocaleString('en-IN')}
                    </p>
                  </>
                )
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tier info */}
      <div className="text-sm text-muted-foreground">
        <p className="font-medium mb-2">Volume Discounts:</p>
        <ul className="space-y-1">
          {COIN_PURCHASE_TIERS.filter(t => t.discount > 0).map((tier) => (
            <li key={tier.label}>
              {tier.min}-{tier.max === Infinity ? '+' : tier.max} coins: {Math.round(tier.discount * 100)}% off
            </li>
          ))}
          <li>250+ coins: Contact us for enterprise pricing</li>
        </ul>
      </div>
    </div>
  )
}
