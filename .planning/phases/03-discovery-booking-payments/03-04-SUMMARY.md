---
phase: 03-discovery-booking-payments
plan: 04
subsystem: payments
tags: [razorpay, coins, payments, ledger, booking]
dependency_graph:
  requires: [03-01, 03-03]
  provides: [coin-purchase-flow, coin-balance-api, booking-payment-step]
  affects: [booking-wizard, enterprise-dashboard]
tech_stack:
  added: [razorpay, react-razorpay]
  patterns: [immutable-ledger, fifo-expiry, webhook-verification]
key_files:
  created:
    - src/lib/razorpay.ts
    - src/app/api/razorpay/create-order/route.ts
    - src/app/api/razorpay/webhook/route.ts
    - src/actions/coins.ts
    - src/app/coins/page.tsx
    - src/components/coins/coin-balance.tsx
    - src/components/coins/purchase-packages.tsx
    - src/components/booking/step-payment.tsx
    - src/components/ui/alert.tsx
  modified: []
decisions:
  - Lazy Razorpay client initialization to avoid build-time env errors
  - Timing-safe signature comparison for webhook security
  - Mock booking ID in payment step (actual booking creation in Plan 05)
metrics:
  duration: 4m
  completed: 2026-04-13T15:56:35Z
---

# Phase 03 Plan 04: BLAST Coins Payment System Summary

Razorpay integration with coin purchase flow, FIFO balance tracking, and booking payment step.

## What Was Built

### Razorpay Integration (Task 1)
- **razorpay.ts**: SDK client with lazy initialization, HMAC-SHA256 webhook signature verification using timing-safe comparison
- **create-order/route.ts**: Validates MIN_COIN_PURCHASE (12), applies tier discounts via calculateDiscountedPrice, creates Razorpay order with enterprise_id and coins in notes
- **webhook/route.ts**: Verifies x-razorpay-signature, handles payment.captured event, checks idempotency by reference_id, credits coins with 12-month expiry

### Coin Server Actions (Task 2)
- **getAvailableBalance**: Calculates balance from transaction ledger sum, implements FIFO tracking for expiringSoon warning (coins expiring within 30 days)
- **spendCoins**: Validates balance before deducting, inserts negative amount transaction with booking reference
- **getCoinHistory**: Returns last 50 transactions for display
- **getCoinPurchaseInfo**: Returns tier pricing for UI display
- **creditCoins**: Admin-only refund capability

### UI Components (Task 3)
- **coin-balance.tsx**: Displays total balance with expiry warning banner
- **purchase-packages.tsx**: Shows 3 suggested packages (12, 50, 100 coins) with tier discounts, custom amount input, Razorpay checkout trigger
- **coins/page.tsx**: Loads Razorpay checkout script, renders balance and purchase UI
- **step-payment.tsx**: Booking payment confirmation with coin cost display, balance check, insufficient balance link to /coins

## Key Technical Decisions

1. **Immutable Ledger Pattern**: All coin operations are append-only transactions. Balance is calculated server-side (never stored as a field) per T-03-11.

2. **FIFO Expiry Tracking**: Tracks which coins from which purchases are remaining by applying spend transactions in purchase order. Enables accurate "expiring soon" warnings.

3. **Webhook Idempotency**: Checks for existing reference_id before crediting to prevent duplicate credits on Razorpay retries per T-03-12.

4. **Timing-Safe Comparison**: Uses crypto.timingSafeEqual for signature verification to prevent timing attacks per T-03-09.

5. **Mock Booking ID**: Payment step uses temporary booking ID since actual booking creation is in Plan 05. The flow is: select slot -> confirm payment -> create booking (Plan 05).

## Deviations from Plan

### Auto-added (Rule 2 - Missing Critical Functionality)

**1. Alert UI Component**
- **Found during:** Task 3
- **Issue:** Alert component referenced but not present in codebase
- **Fix:** Created src/components/ui/alert.tsx following shadcn/ui pattern
- **Files created:** src/components/ui/alert.tsx

**2. TypeScript Declarations for Razorpay**
- **Found during:** Task 3
- **Issue:** window.Razorpay not typed
- **Fix:** Added RazorpayOptions and RazorpayInstance interfaces in purchase-packages.tsx
- **Files modified:** src/components/coins/purchase-packages.tsx

## Security Mitigations

| Threat ID | Mitigation Implemented |
|-----------|------------------------|
| T-03-09 | HMAC-SHA256 verification with timingSafeEqual |
| T-03-10 | Immutable ledger, razorpay_payment_id logged in metadata |
| T-03-11 | Balance calculated server-side from transactions |
| T-03-12 | Idempotency check prevents duplicate coin credits |

## Commits

| Commit | Message | Files |
|--------|---------|-------|
| 838b5e0 | feat(03-04): add Razorpay client and API routes | 3 files |
| 3185d60 | feat(03-04): add coin server actions for balance and spending | 1 file |
| f7d61cc | feat(03-04): add coin purchase UI and booking payment step | 5 files |

## Integration Points

- **Plan 03-01**: Uses coin constants (COIN_VALUE_INR, tiers, MIN_COIN_PURCHASE)
- **Plan 03-03**: StepPayment integrates with booking-wizard store
- **Plan 03-05** (future): Will create actual bookings, update step-payment to use real booking IDs

## Self-Check: PASSED

Files verified:
- FOUND: src/lib/razorpay.ts
- FOUND: src/app/api/razorpay/create-order/route.ts
- FOUND: src/app/api/razorpay/webhook/route.ts
- FOUND: src/actions/coins.ts
- FOUND: src/app/coins/page.tsx
- FOUND: src/components/coins/coin-balance.tsx
- FOUND: src/components/coins/purchase-packages.tsx
- FOUND: src/components/booking/step-payment.tsx

Commits verified:
- FOUND: 838b5e0
- FOUND: 3185d60
- FOUND: f7d61cc
