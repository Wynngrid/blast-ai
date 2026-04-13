# Phase 3: Discovery, Booking & Payments - Research

**Researched:** 2026-04-13
**Domain:** Marketplace discovery, booking flow, payment processing, notifications
**Confidence:** HIGH

## Summary

Phase 3 transforms BLAST AI from a supply-side platform into a functioning marketplace by implementing the discovery browse page with filters, multi-step booking wizard, Razorpay payment integration for a coin-based currency system, Google Meet link generation, practitioner earnings dashboard, and email notifications via Resend.

The core technical challenges are: (1) implementing the BLAST Coins virtual currency system with proper ledger design and FIFO expiration, (2) integrating Razorpay for coin purchases with webhook-based confirmation, (3) generating Google Meet links via Calendar API, and (4) building the multi-step booking wizard with slot selection using the existing FullCalendar infrastructure.

**Primary recommendation:** Build the coin system with an immutable credit ledger pattern (append-only transactions), use Server Actions for all mutations, extend the existing FullCalendar component for enterprise-facing slot selection, and use nuqs for shareable/bookmarkable filter URLs on the browse page.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Card grid layout for practitioner browse — 3-column responsive grid, scannable, image-forward. Reuses existing Card component.
- **D-02:** Sidebar + pills filter presentation — Left sidebar with filter groups (specialization, industry, tier). Active filters shown as dismissible pills above results.
- **D-03:** Sorting options: Relevance (default, spec match + tier + NPS), highest rated, most sessions, newest. No price sorting for MVP.
- **D-04:** Multi-step wizard — Step-by-step progression: Session type -> Brief -> Slot picker -> Payment -> Confirmation.
- **D-05:** Session types: Single sessions (20, 40, 60, 90 min) active. Sprint packages shown as "Coming soon" teaser.
- **D-06:** Structured session brief form — Required fields: "What are you stuck on?", "What outcome do you want?", "Any context to share?". All required with validation.
- **D-07:** Calendar view for slot selection — Week view showing available slots using FullCalendar.
- **D-08:** Full prep package on confirmation — Summary card + prep instructions + calendar invite (.ics download) + Google Meet link + practitioner name revealed.
- **D-09:** Auto-generated Google Meet links — Platform generates unique meeting link per session via Google Calendar API.
- **D-10:** 24-hour cancellation window — Full refund if cancelled 24+ hours before. No refund within 24 hours.
- **D-11:** Rescheduling supported at MVP — Enterprise can reschedule if done 24+ hours before.
- **D-12:** Platform currency: BLAST Coins — 1 coin = $10 (~830 INR). Enterprises buy coins, practitioners earn money.
- **D-13:** Two-sided visibility model — Enterprises see coins, practitioners see money (net after commission).
- **D-14:** Target session pricing: ~10,000 INR average (~12 coins). Platform keeps 3,000 INR (30%), practitioner gets 7,000 INR.
- **D-15:** Bulk coin purchases with tiered discounts: 12-49 (0%), 50-99 (5%), 100-249 (10%), 250+ (custom).
- **D-16:** Coin expiration: 12 months from purchase date.
- **D-17:** Minimum purchase: 12 coins ($120/10k INR) — one session worth.
- **D-18:** Embedded Razorpay checkout — Popup/embedded form for coin purchases.
- **D-19:** Manual payout request — Practitioner requests payout when balance reaches 5,000 INR threshold.
- **D-20:** Full analytics earnings dashboard — Current balance (in INR), pending payouts, transaction history, monthly trend chart.
- **D-21:** Email provider: Resend.
- **D-22:** Full notification set — Booking confirmation (both), practitioner new booking alert, 24-hour reminder (both).
- **D-23:** Minimal branded email templates — Clean, text-focused with brand color accent (#D97757).

### Claude's Discretion
- Discovery card grid exact layout and responsive breakpoints
- Empty states for no results, no filters match
- Loading skeletons across all views
- Error states and retry patterns
- Slot picker timezone display format
- Meeting link placement in confirmation email
- Earnings chart visualization style

### Deferred Ideas (OUT OF SCOPE)
- Sprint/package booking — Show as "Coming soon" in session type selector
- Stripe international payments — India-first with Razorpay only
- In-app notifications — Email only for MVP
- SMS reminders — Email only
- Invoice generation — Manual for now
- Price sorting in discovery — Not needed for curated marketplace

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DISC-01 | Enterprise can browse practitioners by specialization | nuqs for URL state, existing SPECIALIZATION_CATEGORIES constant, Server Components data fetching |
| DISC-02 | Enterprise can filter practitioners by industry | nuqs for multi-select URL state, Supabase array containment queries |
| DISC-03 | Enterprise can filter practitioners by tier level | nuqs parseAsStringLiteral for tier enum |
| DISC-04 | Practitioner cards show anonymized info (skill-first, no name until booking) | Existing pattern in practitioners/[id]/page.tsx — show primarySpec not full_name |
| DISC-05 | Enterprise can sort practitioners by rating, sessions completed, or availability | nuqs parseAsString for sort key, Supabase order() with different columns |
| DISC-06 | Enterprise can view full practitioner profile from card | Existing /practitioners/[id] route with Link component |
| BOOK-01 | Enterprise can select session type (single session) | SESSION_DURATIONS constant, wizard state with Zustand |
| BOOK-02 | Enterprise can submit session brief (what they're stuck on) | react-hook-form + zod validation, required fields per D-06 |
| BOOK-03 | Enterprise can pick available time slot | FullCalendar dateClick/select handlers, calculateBookableSlots utility |
| BOOK-04 | Enterprise receives booking confirmation with prep instructions | Resend email + confirmation page |
| BOOK-05 | Practitioner can view session brief before session | Session detail page in portal/sessions, Server Component fetch |
| BOOK-06 | External meeting link (Google Meet) included in booking confirmation | Google Calendar API conferenceData.createRequest |
| PAY-01 | Enterprise can pay for session via Razorpay | razorpay npm + react-razorpay hook for embedded checkout |
| PAY-02 | Platform collects payment before session is confirmed | Webhook verification before coin_transactions insert |
| PAY-03 | Platform commission (30%) calculated automatically | Practitioner earnings = coin_value * 0.7, commission baked into coin price |
| PAY-04 | Practitioner receives payout after session completion | Manual payout request per D-19, payout_requests table |
| PAY-05 | Practitioner can view earnings dashboard with payout history | Earnings page enhancement with transactions, balance, chart |
| MENT-03 | Practitioner can track earnings and payout status | Same as PAY-05, portal/earnings page |
| NOTF-01 | Enterprise receives email when booking is confirmed | Resend + React Email template |
| NOTF-02 | Practitioner receives email when new booking is made | Resend + React Email template |
| NOTF-03 | Both parties receive reminder 24 hours before session | Scheduled job (Supabase pg_cron or external cron) |

</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| FullCalendar | 6.1.20 | Slot selection in booking | Already installed Phase 2, reuse for enterprise booking view |
| date-fns | 4.1.0 | Date manipulation | Already installed, FIFO expiry calculations |
| date-fns-tz | 3.2.0 | Timezone handling | Already installed, slot display in user timezone |
| Zustand | 5.0.12 | Booking wizard state | Already installed, multi-step form state |
| react-hook-form | 7.72.1 | Session brief form | Already installed, form validation |
| zod | 4.3.6 | Schema validation | Already installed, brief and payment validation |

### New Dependencies (To Install)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| razorpay | 2.9.6 | Server-side order creation, verification | [VERIFIED: npm registry] Official Razorpay SDK |
| react-razorpay | 3.0.1 | Client-side checkout hook | [VERIFIED: npm registry] useRazorpay hook for Next.js |
| resend | 6.11.0 | Transactional email sending | [VERIFIED: npm registry] Developer-friendly, React Email compatible |
| @react-email/components | 1.0.12 | Email template components | [VERIFIED: npm registry] Type-safe email templates |
| nuqs | 2.8.9 | URL state for filters/sort | [VERIFIED: npm registry] Type-safe search params, RSC compatible |
| googleapis | 171.4.0 | Google Calendar API for Meet links | [VERIFIED: npm registry] Official Google API client |
| ics | 3.11.0 | Generate .ics calendar invites | [VERIFIED: npm registry] iCalendar file generation |

### Installation
```bash
pnpm add razorpay react-razorpay resend @react-email/components nuqs googleapis ics
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── browse/                    # Discovery page
│   │   └── page.tsx               # Server Component with filters
│   ├── book/
│   │   └── [practitioner_id]/     # Booking wizard
│   │       └── page.tsx
│   ├── booking/
│   │   └── [id]/
│   │       └── confirmation/      # Post-payment confirmation
│   │           └── page.tsx
│   ├── coins/                     # Coin purchase flow
│   │   └── page.tsx
│   └── api/
│       ├── razorpay/
│       │   ├── create-order/      # Create Razorpay order
│       │   │   └── route.ts
│       │   └── webhook/           # Payment confirmation webhook
│       │       └── route.ts
│       └── calendar/
│           └── create-event/      # Create Google Calendar + Meet
│               └── route.ts
├── actions/
│   ├── booking.ts                 # Book session, cancel, reschedule
│   ├── coins.ts                   # Purchase coins, check balance
│   └── notifications.ts           # Send emails via Resend
├── components/
│   ├── browse/
│   │   ├── practitioner-grid.tsx  # Card grid with loading states
│   │   ├── filter-sidebar.tsx     # Specialization/industry/tier filters
│   │   ├── active-filters.tsx     # Pills above results
│   │   └── sort-select.tsx        # Sort dropdown
│   ├── booking/
│   │   ├── wizard-container.tsx   # Multi-step wizard shell
│   │   ├── step-session-type.tsx  # Duration selection
│   │   ├── step-brief.tsx         # Session brief form
│   │   ├── step-slot-picker.tsx   # Calendar slot selection
│   │   ├── step-payment.tsx       # Razorpay checkout
│   │   └── booking-confirmation.tsx
│   └── coins/
│       ├── coin-balance.tsx       # Display balance
│       ├── purchase-packages.tsx  # Tier pricing display
│       └── razorpay-button.tsx    # Embedded checkout trigger
├── emails/                        # React Email templates
│   ├── booking-confirmation.tsx
│   ├── new-booking-alert.tsx
│   └── session-reminder.tsx
├── lib/
│   ├── razorpay.ts               # Razorpay client singleton
│   ├── resend.ts                 # Resend client singleton
│   ├── google-calendar.ts        # Google API client
│   └── coins/
│       ├── constants.ts          # Coin value, tiers, expiry
│       └── ledger.ts             # Balance calculation, FIFO expiry
└── types/
    └── database.ts               # Extended with new tables
```

### Pattern 1: Coin Ledger with FIFO Expiry
**What:** Immutable append-only ledger for all coin transactions with FIFO-based expiration tracking.
**When to use:** Any coin balance operation (purchase, spend, expire).
**Example:**
```typescript
// Source: SaaS Credits System patterns [CITED: colorwhistle.com/saas-credits-system-guide/]

// Ledger entry types
type TransactionType = 'purchase' | 'spend' | 'expire' | 'refund'

interface CoinTransaction {
  id: string
  enterprise_id: string
  type: TransactionType
  amount: number              // Positive for purchase/refund, negative for spend/expire
  unit_price_inr: number      // Price per coin at time of transaction (for purchases)
  expires_at: string | null   // For purchases: 12 months from purchase date
  reference_id: string | null // booking_id for spend, razorpay_order_id for purchase
  created_at: string
}

// Calculate balance with FIFO expiry awareness
async function getAvailableBalance(enterpriseId: string): Promise<{
  total: number
  expiringSoon: number  // Within 30 days
}> {
  // Get all non-expired purchase transactions
  // Subtract all spend transactions
  // Return available balance
}
```

### Pattern 2: Multi-Step Booking Wizard with Zustand
**What:** Persist wizard state across steps without losing data on navigation.
**When to use:** Booking flow where user moves back/forth between steps.
**Example:**
```typescript
// Source: Established pattern from profile-wizard in Phase 2

import { create } from 'zustand'

interface BookingWizardState {
  step: number
  practitionerId: string | null
  sessionType: 20 | 40 | 60 | 90 | null
  brief: {
    stuckOn: string
    desiredOutcome: string
    context: string
  } | null
  selectedSlot: {
    date: string
    startTime: string
  } | null

  // Actions
  setStep: (step: number) => void
  setSessionType: (type: 20 | 40 | 60 | 90) => void
  setBrief: (brief: BookingWizardState['brief']) => void
  setSelectedSlot: (slot: BookingWizardState['selectedSlot']) => void
  reset: () => void
}

export const useBookingWizard = create<BookingWizardState>((set) => ({
  step: 1,
  practitionerId: null,
  sessionType: null,
  brief: null,
  selectedSlot: null,

  setStep: (step) => set({ step }),
  setSessionType: (sessionType) => set({ sessionType }),
  setBrief: (brief) => set({ brief }),
  setSelectedSlot: (selectedSlot) => set({ selectedSlot }),
  reset: () => set({ step: 1, practitionerId: null, sessionType: null, brief: null, selectedSlot: null }),
}))
```

### Pattern 3: nuqs for Shareable Filter URLs
**What:** Type-safe URL state for discovery filters that syncs with React state.
**When to use:** Browse page filters that should be shareable/bookmarkable.
**Example:**
```typescript
// Source: nuqs documentation [CITED: nuqs.dev]

'use client'

import { useQueryState, useQueryStates, parseAsArrayOf, parseAsString, parseAsStringLiteral } from 'nuqs'

const SORT_OPTIONS = ['relevance', 'rating', 'sessions', 'newest'] as const
const TIER_OPTIONS = ['rising', 'expert', 'master'] as const

export function useBrowseFilters() {
  return useQueryStates({
    specializations: parseAsArrayOf(parseAsString).withDefault([]),
    industries: parseAsArrayOf(parseAsString).withDefault([]),
    tier: parseAsStringLiteral(TIER_OPTIONS),
    sort: parseAsStringLiteral(SORT_OPTIONS).withDefault('relevance'),
    q: parseAsString, // Search query
  })
}

// Usage in component:
// const [filters, setFilters] = useBrowseFilters()
// filters.specializations // string[]
// setFilters({ specializations: [...filters.specializations, 'llm-genai'] })
```

### Pattern 4: Razorpay Server Action + Webhook Flow
**What:** Create order server-side, verify payment via webhook, then credit coins.
**When to use:** All coin purchases.
**Example:**
```typescript
// Source: Razorpay docs [CITED: razorpay.com/docs/payments/server-integration/nodejs/integration-steps/]

// 1. Server Action: Create Order
'use server'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function createCoinOrder(coins: number) {
  const priceInr = calculatePrice(coins) // Apply tier discounts

  const order = await razorpay.orders.create({
    amount: priceInr * 100, // Razorpay uses paise
    currency: 'INR',
    receipt: `coins_${Date.now()}`,
    notes: { coins, enterprise_id: '...' },
  })

  return { orderId: order.id, amount: order.amount }
}

// 2. Webhook: Verify and Credit
// app/api/razorpay/webhook/route.ts
import crypto from 'crypto'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('x-razorpay-signature')

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex')

  if (signature !== expectedSignature) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(body)
  if (event.event === 'payment.captured') {
    // Credit coins to enterprise wallet
    await creditCoins(event.payload.payment.entity)
  }

  return Response.json({ received: true })
}
```

### Pattern 5: Google Calendar API for Meet Links
**What:** Create calendar event with conferenceData to auto-generate Meet link.
**When to use:** After booking is confirmed (payment captured).
**Example:**
```typescript
// Source: Google Calendar API docs [CITED: developers.google.com/workspace/meet/api/guides/overview]

import { google } from 'googleapis'

const calendar = google.calendar('v3')

async function createMeetingWithLink(booking: {
  title: string
  startTime: Date
  endTime: Date
  attendees: string[]
}) {
  const auth = await getGoogleAuth() // Service account or OAuth

  const event = await calendar.events.insert({
    auth,
    calendarId: 'primary',
    conferenceDataVersion: 1, // Required for Meet link
    requestBody: {
      summary: booking.title,
      start: { dateTime: booking.startTime.toISOString() },
      end: { dateTime: booking.endTime.toISOString() },
      attendees: booking.attendees.map(email => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: `blast-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    },
  })

  return event.data.conferenceData?.entryPoints?.[0]?.uri // Meet link
}
```

### Anti-Patterns to Avoid
- **Direct balance calculation in UI:** Always use server-side balance calculation to prevent race conditions and ensure FIFO expiry is applied correctly.
- **Storing coin balance as a single field:** Use ledger pattern with transactions, calculate balance on-demand.
- **Trusting client-side payment confirmation:** Always verify via Razorpay webhook signature before crediting coins.
- **Hardcoding Meet links:** Auto-generate unique links per session for security and tracking.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Payment processing | Custom payment form | Razorpay Checkout SDK | PCI compliance, fraud detection, UPI/cards/wallets support |
| Email delivery | SMTP client | Resend | Deliverability, bounce handling, React templates |
| URL state sync | Manual URLSearchParams | nuqs | Race conditions, type safety, RSC compatibility |
| Calendar invite generation | Manual iCal strings | ics package | Timezone handling, recurrence rules, escaping |
| Meet link generation | Manual URL construction | Google Calendar API | Link expiry, access control, calendar integration |
| Signature verification | Manual HMAC | Razorpay SDK verify() | Constant-time comparison, correct algorithm |

**Key insight:** Payment, email, and calendar integrations have edge cases (webhooks, retries, timezones) that third-party SDKs handle correctly. Hand-rolling leads to subtle bugs.

## Database Schema Design

### New Tables Required

```sql
-- BLAST Coins ledger (immutable, append-only)
CREATE TABLE coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES enterprises(id),
  type TEXT NOT NULL CHECK (type IN ('purchase', 'spend', 'expire', 'refund')),
  amount INTEGER NOT NULL, -- Positive for purchase/refund, negative for spend/expire
  unit_price_inr INTEGER, -- For purchases: price per coin at time of purchase
  expires_at TIMESTAMPTZ, -- For purchases: 12 months from created_at
  reference_id TEXT, -- booking_id, razorpay_order_id, etc.
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for balance calculation
CREATE INDEX idx_coin_transactions_enterprise ON coin_transactions(enterprise_id, created_at);
CREATE INDEX idx_coin_transactions_expiry ON coin_transactions(expires_at) WHERE type = 'purchase';

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES enterprises(id),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id),
  session_duration INTEGER NOT NULL CHECK (session_duration IN (20, 40, 60, 90)),
  scheduled_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled')),

  -- Session brief (required per D-06)
  brief_stuck_on TEXT NOT NULL,
  brief_desired_outcome TEXT NOT NULL,
  brief_context TEXT,

  -- Meeting details
  meet_link TEXT,
  calendar_event_id TEXT,

  -- Payment
  coins_spent INTEGER NOT NULL,
  coin_transaction_id UUID REFERENCES coin_transactions(id),

  -- Cancellation
  cancelled_at TIMESTAMPTZ,
  cancelled_by TEXT CHECK (cancelled_by IN ('enterprise', 'practitioner', 'admin')),
  refunded BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_bookings_enterprise ON bookings(enterprise_id, status);
CREATE INDEX idx_bookings_practitioner ON bookings(practitioner_id, status);
CREATE INDEX idx_bookings_scheduled ON bookings(scheduled_at) WHERE status = 'confirmed';

-- Practitioner earnings (derived from completed bookings)
CREATE TABLE practitioner_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id),
  booking_id UUID NOT NULL REFERENCES bookings(id) UNIQUE,
  gross_amount_inr INTEGER NOT NULL, -- Before commission
  commission_inr INTEGER NOT NULL, -- 30% platform fee
  net_amount_inr INTEGER NOT NULL, -- What practitioner earns
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'available', 'requested', 'paid')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payout requests
CREATE TABLE payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id),
  amount_inr INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  bank_details JSONB, -- Stored securely, admin-only access
  admin_notes TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Notification log (for debugging and audit)
CREATE TABLE notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'booking_confirmed', 'new_booking', 'reminder_24h'
  recipient_id UUID NOT NULL,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('enterprise', 'practitioner')),
  email TEXT NOT NULL,
  booking_id UUID REFERENCES bookings(id),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resend_id TEXT -- Resend API response ID
);
```

### RLS Policies

```sql
-- coin_transactions: Enterprises can only see their own
CREATE POLICY "Enterprises view own coin transactions"
  ON coin_transactions FOR SELECT
  USING (enterprise_id IN (
    SELECT id FROM enterprises WHERE user_id = auth.uid()
  ));

-- bookings: Enterprises see their bookings, practitioners see bookings with them
CREATE POLICY "Enterprises view own bookings"
  ON bookings FOR SELECT
  USING (enterprise_id IN (
    SELECT id FROM enterprises WHERE user_id = auth.uid()
  ));

CREATE POLICY "Practitioners view their bookings"
  ON bookings FOR SELECT
  USING (practitioner_id IN (
    SELECT id FROM practitioners WHERE user_id = auth.uid()
  ));

-- practitioner_earnings: Practitioners see only their earnings
CREATE POLICY "Practitioners view own earnings"
  ON practitioner_earnings FOR SELECT
  USING (practitioner_id IN (
    SELECT id FROM practitioners WHERE user_id = auth.uid()
  ));
```

## Common Pitfalls

### Pitfall 1: Race Conditions in Coin Balance
**What goes wrong:** Two concurrent bookings both check balance, both see sufficient coins, both proceed, resulting in negative balance.
**Why it happens:** SELECT then INSERT without transaction isolation.
**How to avoid:** Use Postgres advisory locks or serializable transactions for balance operations.
**Warning signs:** Negative balances appearing in production.

```typescript
// Correct pattern: Use Postgres function with row-level locking
await supabase.rpc('spend_coins', {
  p_enterprise_id: enterpriseId,
  p_amount: coinsRequired,
  p_reference_id: bookingId,
})
```

### Pitfall 2: Webhook Idempotency
**What goes wrong:** Razorpay retries webhook, coins credited multiple times.
**Why it happens:** Not tracking processed webhooks.
**How to avoid:** Store razorpay_payment_id in transactions, check before insert.
**Warning signs:** Duplicate coin_transactions with same reference_id.

### Pitfall 3: Timezone Confusion in Slot Selection
**What goes wrong:** Enterprise selects 2pm in their timezone, practitioner sees wrong time.
**Why it happens:** Mixing timezone-aware and naive timestamps.
**How to avoid:** Store all times in UTC, convert only at display layer using date-fns-tz.
**Warning signs:** Sessions scheduled at wrong times, off-by-hours issues.

### Pitfall 4: FIFO Expiry Calculation Errors
**What goes wrong:** Coins from recent purchase expire before older purchase.
**Why it happens:** Not tracking expiry per-transaction, using simple total balance.
**How to avoid:** Ledger pattern with expires_at per purchase, FIFO deduction logic.
**Warning signs:** Customer complaints about unexpired coins disappearing.

### Pitfall 5: Missing Brief Validation
**What goes wrong:** Enterprises submit empty briefs, practitioners unprepared for sessions.
**Why it happens:** Optional fields or weak validation.
**How to avoid:** Zod schema with .min(10) or similar, required fields per D-06.
**Warning signs:** High session cancellation rate, low NPS.

### Pitfall 6: Google API Rate Limits
**What goes wrong:** Many concurrent bookings hit Calendar API rate limits.
**Why it happens:** Creating Meet links synchronously in booking flow.
**How to avoid:** Queue Meet link creation, retry with exponential backoff.
**Warning signs:** 429 errors from Google, bookings stuck in "pending meet link" state.

## Code Examples

### Example 1: Session Brief Form with Validation
```typescript
// Source: react-hook-form + zod pattern established in Phase 2

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const sessionBriefSchema = z.object({
  stuckOn: z.string()
    .min(20, 'Please describe what you are stuck on (at least 20 characters)')
    .max(500, 'Please keep your response under 500 characters'),
  desiredOutcome: z.string()
    .min(20, 'Please describe your desired outcome (at least 20 characters)')
    .max(500, 'Please keep your response under 500 characters'),
  context: z.string()
    .max(1000, 'Context should be under 1000 characters')
    .optional(),
})

type SessionBriefInput = z.infer<typeof sessionBriefSchema>

export function StepBrief({ onNext }: { onNext: (data: SessionBriefInput) => void }) {
  const form = useForm<SessionBriefInput>({
    resolver: zodResolver(sessionBriefSchema),
    defaultValues: {
      stuckOn: '',
      desiredOutcome: '',
      context: '',
    },
  })

  return (
    <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
      <div>
        <Label htmlFor="stuckOn">What are you stuck on? *</Label>
        <Textarea
          {...form.register('stuckOn')}
          placeholder="Describe the specific challenge or blocker you're facing..."
        />
        {form.formState.errors.stuckOn && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.stuckOn.message}
          </p>
        )}
      </div>
      {/* Similar for desiredOutcome and context */}
      <Button type="submit">Continue to Slot Selection</Button>
    </form>
  )
}
```

### Example 2: Slot Selection with FullCalendar
```typescript
// Source: FullCalendar docs [CITED: fullcalendar.io/docs/date-clicking-selecting]

'use client'

import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { calculateBookableSlots } from '@/lib/utils/timezone'

interface SlotPickerProps {
  practitionerRules: AvailabilityRule[]
  bookedSlots: { start: string; end: string }[]
  sessionDuration: 20 | 40 | 60 | 90
  onSelectSlot: (date: string, startTime: string) => void
}

export function SlotPicker({
  practitionerRules,
  bookedSlots,
  sessionDuration,
  onSelectSlot,
}: SlotPickerProps) {
  // Generate available events from rules
  const availableEvents = practitionerRules.flatMap((rule) => {
    const slots = calculateBookableSlots(
      rule.start_time,
      rule.end_time,
      sessionDuration
    )
    return slots.map((startTime) => ({
      daysOfWeek: [rule.day_of_week],
      startTime,
      endTime: addMinutes(startTime, sessionDuration),
      display: 'background',
      color: '#22c55e',
    }))
  })

  // Mark booked slots
  const blockedEvents = bookedSlots.map((slot) => ({
    start: slot.start,
    end: slot.end,
    display: 'background',
    color: '#ef4444',
  }))

  return (
    <FullCalendar
      plugins={[timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      selectable={true}
      selectConstraint="businessHours"
      events={[...availableEvents, ...blockedEvents]}
      select={(info) => {
        // Validate selection is on available slot
        const date = info.startStr.split('T')[0]
        const time = info.startStr.split('T')[1].slice(0, 5)
        onSelectSlot(date, time)
      }}
      slotDuration="00:30:00"
      slotMinTime="06:00:00"
      slotMaxTime="22:00:00"
    />
  )
}
```

### Example 3: Razorpay Checkout Button
```typescript
// Source: react-razorpay docs [CITED: npmjs.com/package/react-razorpay]

'use client'

import { useRazorpay, RazorpayOrderOptions } from 'react-razorpay'
import { createCoinOrder, verifyCoinPayment } from '@/actions/coins'
import { toast } from 'sonner'

interface CoinPurchaseButtonProps {
  coins: number
  priceInr: number
}

export function CoinPurchaseButton({ coins, priceInr }: CoinPurchaseButtonProps) {
  const { error, isLoading, Razorpay } = useRazorpay()

  const handlePurchase = async () => {
    // 1. Create order server-side
    const { orderId } = await createCoinOrder(coins)

    // 2. Open Razorpay checkout
    const options: RazorpayOrderOptions = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      amount: priceInr * 100, // paise
      currency: 'INR',
      name: 'BLAST AI',
      description: `${coins} BLAST Coins`,
      order_id: orderId,
      handler: async (response) => {
        // 3. Verify payment (webhook handles coin credit)
        const result = await verifyCoinPayment({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        })
        if (result.success) {
          toast.success(`${coins} coins added to your account!`)
        }
      },
      prefill: {
        email: 'user@company.com', // From session
      },
      theme: {
        color: '#D97757', // Brand color
      },
    }

    const rzp = new Razorpay(options)
    rzp.open()
  }

  return (
    <Button onClick={handlePurchase} disabled={isLoading}>
      Buy {coins} Coins - Rs {priceInr.toLocaleString('en-IN')}
    </Button>
  )
}
```

### Example 4: Resend Email Template
```typescript
// Source: Resend docs [CITED: resend.com/docs/send-with-nextjs]

// emails/booking-confirmation.tsx
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
} from '@react-email/components'

interface BookingConfirmationProps {
  practitionerName: string // Revealed on confirmation per D-07
  sessionDate: string
  sessionTime: string
  sessionDuration: number
  meetLink: string
  prepInstructions: string
}

export function BookingConfirmationEmail({
  practitionerName,
  sessionDate,
  sessionTime,
  sessionDuration,
  meetLink,
  prepInstructions,
}: BookingConfirmationProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
          <Text style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
            Your session is confirmed!
          </Text>

          <Section style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px' }}>
            <Text style={{ margin: '0 0 8px' }}>
              <strong>Practitioner:</strong> {practitionerName}
            </Text>
            <Text style={{ margin: '0 0 8px' }}>
              <strong>Date:</strong> {sessionDate}
            </Text>
            <Text style={{ margin: '0 0 8px' }}>
              <strong>Time:</strong> {sessionTime} ({sessionDuration} minutes)
            </Text>
          </Section>

          <Button
            href={meetLink}
            style={{
              backgroundColor: '#D97757',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: '6px',
              marginTop: '24px',
              display: 'inline-block',
            }}
          >
            Join Google Meet
          </Button>

          <Hr style={{ margin: '32px 0' }} />

          <Text style={{ fontWeight: 'bold' }}>Preparation Instructions</Text>
          <Text style={{ color: '#6b7280' }}>{prepInstructions}</Text>
        </Container>
      </Body>
    </Html>
  )
}

// actions/notifications.ts
import { Resend } from 'resend'
import { BookingConfirmationEmail } from '@/emails/booking-confirmation'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendBookingConfirmation(booking: Booking, enterpriseEmail: string) {
  const { data, error } = await resend.emails.send({
    from: 'BLAST AI <notifications@blastai.com>',
    to: [enterpriseEmail],
    subject: `Session confirmed with ${booking.practitionerName}`,
    react: BookingConfirmationEmail({
      practitionerName: booking.practitionerName,
      sessionDate: formatDate(booking.scheduledAt),
      sessionTime: formatTime(booking.scheduledAt),
      sessionDuration: booking.sessionDuration,
      meetLink: booking.meetLink,
      prepInstructions: 'Come prepared with specific questions...',
    }),
  })

  if (error) {
    console.error('Email send failed:', error)
  }

  return { data, error }
}
```

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | All server code | Check required | 18+ | -- |
| Supabase | Database, auth | Yes | Cloud | -- |
| Razorpay Account | Payments | Needs setup | -- | Cannot proceed without API keys |
| Google Cloud Project | Meet links | Needs setup | -- | Manual Zoom links (not recommended) |
| Resend Account | Email | Needs setup | -- | Cannot send automated emails |
| Verified Domain | Resend production | Needs DNS setup | -- | Use onboarding@resend.dev for dev only |

**Missing dependencies with no fallback:**
- Razorpay API keys (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET)
- Google Calendar API credentials (service account or OAuth)
- Resend API key (RESEND_API_KEY)

**Required Environment Variables:**
```env
# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_WEBHOOK_SECRET=xxx

# Google Calendar API
GOOGLE_SERVICE_ACCOUNT_EMAIL=xxx@xxx.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
GOOGLE_CALENDAR_ID=primary

# Resend
RESEND_API_KEY=re_xxx
```

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | Yes | Supabase Auth (established Phase 1) |
| V3 Session Management | Yes | Supabase session tokens |
| V4 Access Control | Yes | RLS policies per enterprise_id/practitioner_id |
| V5 Input Validation | Yes | Zod schemas for all user inputs |
| V6 Cryptography | Yes | Razorpay signature verification (HMAC-SHA256) |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Payment replay | Repudiation | Idempotency keys, webhook deduplication |
| Balance manipulation | Tampering | Server-side balance calculation, advisory locks |
| Session brief injection | Tampering | Zod validation, sanitize before display |
| Unauthorized booking view | Information Disclosure | RLS policies on bookings table |
| Webhook spoofing | Spoofing | Razorpay signature verification |
| Meet link scraping | Information Disclosure | Unique links per session, don't expose in public URLs |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Google Calendar API allows service account to create Meet links without additional OAuth consent | Architecture Patterns | May need OAuth flow instead of service account |
| A2 | Razorpay webhook retries for 24 hours on failure | Common Pitfalls | May need additional retry handling |
| A3 | 12-month coin expiry is legally compliant in India | Database Schema | May need legal review of virtual currency regulations |

**Note:** A1 and A2 should be verified during implementation with actual API testing. A3 is a business/legal decision that may require user confirmation.

## Open Questions

1. **Google Calendar API Authentication Method**
   - What we know: Calendar API supports service accounts and OAuth
   - What's unclear: Whether service account can create Meet links without domain-wide delegation
   - Recommendation: Test with service account first; if blocked, implement OAuth consent flow

2. **24-Hour Reminder Scheduling**
   - What we know: Need to send reminders 24 hours before session
   - What's unclear: Best scheduling approach (pg_cron, Vercel cron, external service)
   - Recommendation: Use Supabase pg_cron for MVP, migrate to Inngest/Trigger.dev if scaling issues

3. **Coin Pricing in Multiple Currencies**
   - What we know: D-12 says 1 coin = $10 (~830 INR), but INR fluctuates
   - What's unclear: Whether to fix in INR or USD, how to handle exchange rate changes
   - Recommendation: Fix pricing in INR (India-first), add USD display as reference only

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Stripe Checkout redirect | Embedded Checkout (stays on domain) | 2025 | Better UX, lower abandonment |
| Manual email HTML | React Email components | 2024 | Type-safe templates, better DX |
| Custom URL params | nuqs hooks | 2024 | Type-safe URL state, RSC compatible |
| Direct Google API calls | googleapis SDK | Ongoing | Better error handling, types |

**Deprecated/outdated:**
- Razorpay modal (old) -> Use embedded checkout
- Direct fetch to Google APIs -> Use googleapis SDK with proper auth
- Manual webhook signature verification -> Use SDK verify methods

## Sources

### Primary (HIGH confidence)
- [Razorpay Node.js Integration](https://razorpay.com/docs/payments/server-integration/nodejs/integration-steps/) - Order creation, verification flow
- [Resend Next.js Docs](https://resend.com/docs/send-with-nextjs) - Server Action pattern, React Email
- [nuqs Documentation](https://nuqs.dev/) - URL state management hooks
- [FullCalendar Docs](https://fullcalendar.io/docs/date-clicking-selecting) - dateClick, select callbacks

### Secondary (MEDIUM confidence)
- [SaaS Credits System Guide](https://colorwhistle.com/saas-credits-system-guide/) - Ledger design, FIFO expiry patterns
- [Google Meet API Overview](https://developers.google.com/workspace/meet/api/guides/overview) - Meet link generation via Calendar API
- [react-razorpay npm](https://www.npmjs.com/package/react-razorpay) - useRazorpay hook usage

### Tertiary (LOW confidence)
- Training data on advisory locks and transaction isolation - Should verify Postgres behavior with tests

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All packages verified via npm registry, versions current
- Architecture: HIGH - Patterns match established Phase 2 codebase patterns
- Pitfalls: MEDIUM - Based on training data and documented patterns, not production experience
- Coin system design: MEDIUM - Credit system patterns well-documented but BLAST-specific requirements need validation

**Research date:** 2026-04-13
**Valid until:** 2026-05-13 (30 days - stable domain, but verify Razorpay/Google API changes)
