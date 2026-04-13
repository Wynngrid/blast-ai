// BLAST Coins configuration per Phase 3 CONTEXT.md decisions D-12 through D-17

// D-12: 1 coin = $10 (~830 INR based on typical exchange rate)
export const COIN_VALUE_USD = 10
export const COIN_VALUE_INR = 830 // Approximate, actual rate may vary

// D-14: Target session pricing ~10,000 INR (~12 coins)
// Platform keeps 30%, practitioner gets 70%
export const PLATFORM_COMMISSION_RATE = 0.30

// D-15: Bulk purchase tiers with discounts
export const COIN_PURCHASE_TIERS = [
  { min: 12, max: 49, discount: 0, label: 'Starter' },
  { min: 50, max: 99, discount: 0.05, label: 'Growth' },
  { min: 100, max: 249, discount: 0.10, label: 'Scale' },
  { min: 250, max: Infinity, discount: 0, label: 'Enterprise' }, // Custom pricing
] as const

// D-16: Coin expiration: 12 months from purchase
export const COIN_EXPIRY_MONTHS = 12

// D-17: Minimum purchase: 12 coins
export const MIN_COIN_PURCHASE = 12

// D-19: Minimum payout threshold
export const MIN_PAYOUT_INR = 5000

// Helper: Calculate price for coin purchase (before discount)
export function calculateCoinPrice(coins: number, currency: 'USD' | 'INR' = 'INR'): number {
  const basePrice = coins * (currency === 'USD' ? COIN_VALUE_USD : COIN_VALUE_INR)
  return basePrice
}

// Helper: Apply tier discount to coin purchase
export function calculateDiscountedPrice(coins: number, currency: 'USD' | 'INR' = 'INR'): {
  basePrice: number
  discount: number
  finalPrice: number
  tier: typeof COIN_PURCHASE_TIERS[number]
} {
  const tier = COIN_PURCHASE_TIERS.find(t => coins >= t.min && coins <= t.max)!
  const basePrice = calculateCoinPrice(coins, currency)
  const discount = tier.discount > 0 ? Math.round(basePrice * tier.discount) : 0
  const finalPrice = basePrice - discount

  return { basePrice, discount, finalPrice, tier }
}

// Helper: Calculate practitioner earnings from coin value
export function calculatePractitionerEarnings(coinsSpent: number): {
  grossInr: number
  commissionInr: number
  netInr: number
} {
  const grossInr = coinsSpent * COIN_VALUE_INR
  const commissionInr = Math.round(grossInr * PLATFORM_COMMISSION_RATE)
  const netInr = grossInr - commissionInr

  return { grossInr, commissionInr, netInr }
}

// Helper: Get coins required for session duration
// Based on hourly rate converted to coins
export function getSessionCoinCost(hourlyRateUsd: number, durationMinutes: 20 | 40 | 60 | 90): number {
  const hourlyCoins = Math.ceil(hourlyRateUsd / COIN_VALUE_USD)
  const sessionCoins = Math.ceil(hourlyCoins * (durationMinutes / 60))
  return sessionCoins
}

// Helper: Calculate expiry date for new coin purchase
export function getCoinExpiryDate(purchaseDate: Date = new Date()): Date {
  const expiry = new Date(purchaseDate)
  expiry.setMonth(expiry.getMonth() + COIN_EXPIRY_MONTHS)
  return expiry
}
