---
phase: 03-discovery-booking-payments
reviewed: 2026-04-14T00:00:00Z
depth: quick
files_reviewed: 39
files_reviewed_list:
  - src/actions/booking.ts
  - src/actions/browse.ts
  - src/actions/coins.ts
  - src/actions/earnings.ts
  - src/actions/notifications.ts
  - src/actions/sessions.ts
  - src/app/api/cron/reminders/route.ts
  - src/app/api/razorpay/create-order/route.ts
  - src/app/api/razorpay/webhook/route.ts
  - src/app/book/[practitioner_id]/page.tsx
  - src/app/booking/[id]/confirmation/page.tsx
  - src/app/browse/page.tsx
  - src/app/coins/page.tsx
  - src/app/portal/earnings/page.tsx
  - src/app/portal/sessions/page.tsx
  - src/components/booking/booking-confirmation.tsx
  - src/components/booking/step-brief.tsx
  - src/components/booking/step-payment.tsx
  - src/components/booking/step-session-type.tsx
  - src/components/booking/step-slot-picker.tsx
  - src/components/booking/wizard-container.tsx
  - src/components/browse/active-filters.tsx
  - src/components/browse/filter-sidebar.tsx
  - src/components/browse/practitioner-card.tsx
  - src/components/browse/practitioner-grid.tsx
  - src/components/browse/sort-select.tsx
  - src/components/coins/coin-balance.tsx
  - src/components/coins/purchase-packages.tsx
  - src/components/portal/earnings-dashboard.tsx
  - src/components/portal/payout-request-form.tsx
  - src/components/portal/session-list.tsx
  - src/lib/constants/coins.ts
  - src/lib/constants/industries.ts
  - src/lib/google-calendar.ts
  - src/lib/razorpay.ts
  - src/lib/resend.ts
  - src/lib/stores/booking-wizard.ts
  - src/lib/validations/booking.ts
findings:
  critical: 2
  warning: 2
  info: 3
  total: 7
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-04-14T00:00:00Z
**Depth:** quick
**Files Reviewed:** 39
**Status:** issues_found

## Summary

Reviewed 39 source files implementing discovery, booking, and payment features. Found 2 critical security issues related to environment variable handling and webhook idempotency, 2 warnings around error handling patterns, and 3 informational items (console.log statements).

The codebase demonstrates good structure with proper validation, type safety, and separation of concerns. However, critical attention is needed for production environment variable checks and webhook race condition handling.

## Critical Issues

### CR-01: Missing Environment Variable Validation in Client-Side Razorpay Integration

**File:** `src/components/coins/purchase-packages.tsx:73`
**Issue:** Using non-null assertion operator (!) on `process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID` without runtime validation. If this environment variable is not set, the Razorpay checkout will fail silently or throw at runtime.
**Fix:**
```typescript
// Before Razorpay initialization, add validation:
const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
if (!razorpayKeyId) {
  throw new Error('Razorpay is not configured. Please contact support.')
}

const options: RazorpayOptions = {
  key: razorpayKeyId,
  // ... rest of options
}
```

### CR-02: Webhook Idempotency Race Condition

**File:** `src/app/api/razorpay/webhook/route.ts:47-56`
**Issue:** The idempotency check queries for existing transaction by `reference_id` (paymentId), but there's a potential race condition where two webhook deliveries could both pass the check before either inserts. This could result in duplicate coin credits.
**Fix:**
```typescript
// Use a database-level unique constraint on reference_id column in coin_transactions table
// Then catch the unique violation error:

const { error: insertError } = await supabaseAdmin
  .from('coin_transactions')
  .insert({
    enterprise_id: enterpriseId,
    type: 'purchase',
    amount: coins,
    unit_price_inr: Math.round(payment.amount / 100 / coins),
    expires_at: getCoinExpiryDate().toISOString(),
    reference_id: paymentId, // This should have UNIQUE constraint in DB
    metadata: {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
    },
  })

if (insertError) {
  // Check if it's a unique constraint violation (duplicate)
  if (insertError.code === '23505') { // PostgreSQL unique violation
    console.log('Payment already processed (concurrent webhook):', paymentId)
    return NextResponse.json({ received: true, duplicate: true })
  }
  console.error('Failed to credit coins:', insertError)
  return NextResponse.json({ error: 'Failed to credit coins' }, { status: 500 })
}
```

## Warnings

### WR-01: Incomplete Error Logging in Cron Job

**File:** `src/app/api/cron/reminders/route.ts:91-93`
**Issue:** When enterprise or practitioner data is missing, the error is logged but execution continues silently. This could result in missed notifications without visibility in monitoring.
**Fix:**
```typescript
if (!enterprise || !practitioner) {
  console.error(`Missing enterprise or practitioner data for booking ${booking.id}`, {
    hasEnterprise: !!enterprise,
    hasPractitioner: !!practitioner,
    bookingId: booking.id,
  })
  // Consider tracking these failures in a monitoring table
  continue
}
```

### WR-02: Missing Null Check on Razorpay Script Load

**File:** `src/components/coins/purchase-packages.tsx:67-69`
**Issue:** The code checks if `window.Razorpay` is undefined, but doesn't handle the case where the script loads but fails to initialize properly (e.g., network error, CSP block). This could lead to silent failures.
**Fix:**
```typescript
// Check if Razorpay script is loaded AND can be instantiated
if (typeof window.Razorpay === 'undefined') {
  throw new Error('Razorpay SDK not loaded. Please refresh the page.')
}

try {
  const rzp = new window.Razorpay(options)
  rzp.open()
} catch (sdkError) {
  console.error('Razorpay SDK error:', sdkError)
  throw new Error('Failed to initialize payment. Please try again or contact support.')
}
```

## Info

### IN-01: Development Console.log Statements Left in Production Code

**File:** `src/actions/booking.ts:182`
**Issue:** Console.log statement documenting that practitioner booking alerts are not yet implemented.
**Fix:** Remove console.log or convert to structured logging:
```typescript
// Use a logger service instead of console.log
logger.warn('Practitioner booking alert not implemented', {
  practitionerId: input.practitionerId,
  bookingId: booking.id,
})
```

### IN-02: Webhook Processing Logging

**File:** `src/app/api/razorpay/webhook/route.ts:54`
**Issue:** Console.log used for duplicate payment detection logging.
**Fix:** Acceptable for MVP, but consider structured logging for production:
```typescript
logger.info('Duplicate webhook delivery detected', {
  paymentId,
  event: 'payment.captured',
})
```

### IN-03: Success Logging in Webhook Handler

**File:** `src/app/api/razorpay/webhook/route.ts:80`
**Issue:** Console.log for successful coin credit.
**Fix:** Acceptable for MVP, but consider structured logging with alerting:
```typescript
logger.info('Coins credited successfully', {
  enterpriseId,
  coins,
  paymentId,
})
```

---

_Reviewed: 2026-04-14T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: quick_
