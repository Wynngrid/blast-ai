# Phase 3: Discovery, Booking & Payments - Context

**Gathered:** 2026-04-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Enterprise can find practitioners, book sessions, and pay through the platform. This phase delivers the discovery browse page with filters/sorting, the multi-step booking wizard, Razorpay payment integration, Google Meet link generation, practitioner earnings dashboard, and email notifications. It does NOT include enterprise dashboards, reviews/ratings, or sprint packages — those are Phase 4 and v2 respectively.

</domain>

<decisions>
## Implementation Decisions

### Discovery UI
- **D-01:** Card grid layout for practitioner browse — 3-column responsive grid, scannable, image-forward. Reuses existing Card component. (Claude's discretion on exact layout based on Awesomic, Contra, and Stan Store references)
- **D-02:** Sidebar + pills filter presentation — Left sidebar with filter groups (specialization, industry, tier). Active filters shown as dismissible pills above results.
- **D-03:** Sorting options: Relevance (default, spec match + tier + NPS), highest rated, most sessions, newest. No price sorting for MVP.

### Booking Flow
- **D-04:** Multi-step wizard — Step-by-step progression: Session type → Brief → Slot picker → Payment → Confirmation. Clear stages with progress indicator.
- **D-05:** Session types: Single sessions (20, 40, 60, 90 min) active. Sprint packages shown as "Coming soon" teaser for interest validation.
- **D-06:** Structured session brief form — Required fields: "What are you stuck on?", "What outcome do you want?", "Any context to share?". All required with validation. This is core to session quality.
- **D-07:** Calendar view for slot selection — Week view showing available slots using FullCalendar (already integrated in Phase 2). Click to select.
- **D-08:** Full prep package on confirmation — Summary card + prep instructions + calendar invite (.ics download) + Google Meet link + practitioner name (revealed on confirmation per Phase 2 D-07).
- **D-09:** Auto-generated Google Meet links — Platform generates unique meeting link per session via Google Calendar API integration. No manual practitioner link management.
- **D-10:** 24-hour cancellation window — Full refund if cancelled 24+ hours before session. No refund within 24 hours.
- **D-11:** Rescheduling supported at MVP — Enterprise can reschedule if done 24+ hours before. Uses existing availability slots.

### Payment Integration — Coin System
- **D-12:** Platform currency: BLAST Coins — 1 coin = $10 (~₹830). Enterprises buy coins, practitioners earn money.
- **D-13:** Two-sided visibility model:
  - **Enterprises see coins** — "Session costs 12 coins" (includes 30% commission baked in)
  - **Practitioners see money** — "You earned ₹7,000" (net after commission, never see coins or commission %)
- **D-14:** Target session pricing: ~₹10,000 average (~12 coins). Platform keeps ₹3,000 (30%), practitioner gets ₹7,000.
- **D-15:** Bulk coin purchases with tiered discounts:
  - 12-49 coins: No discount (base rate)
  - 50-99 coins: 5% off
  - 100-249 coins: 10% off
  - 250+ coins: Custom enterprise pricing
- **D-16:** Coin expiration: 12 months from purchase date. Standard enterprise contract cycle.
- **D-17:** Minimum purchase: 12 coins ($120/₹10k) — one session worth. Low barrier for pilots.
- **D-18:** Embedded Razorpay checkout — Popup/embedded form for coin purchases. User never leaves BLAST AI domain.
- **D-19:** Manual payout request — Practitioner requests payout when balance reaches ₹5,000 threshold. Admin approves.
- **D-20:** Full analytics earnings dashboard — Current balance (in ₹), pending payouts, transaction history (each session showing money earned, NOT coins or commission), monthly trend chart, revenue breakdown.

### Notifications
- **D-21:** Email provider: Resend — Developer-friendly, React Email templates, Server Actions integration.
- **D-22:** Full notification set — Booking confirmation (both parties), practitioner new booking alert, 24-hour reminder (both parties). Per NOTF-01/02/03.
- **D-23:** Minimal branded email templates — Clean, text-focused with brand color accent (#D97757). Logo, key info, CTA button. Linear-style aesthetic.

### Claude's Discretion
- Discovery card grid exact layout and responsive breakpoints
- Empty states for no results, no filters match
- Loading skeletons across all views
- Error states and retry patterns
- Slot picker timezone display format
- Meeting link placement in confirmation email
- Earnings chart visualization style

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Core value prop (vetted matching), constraints, design references (Awesomic, Linear, Contra, Stan Store)
- `.planning/REQUIREMENTS.md` — DISC-01 through DISC-06, BOOK-01 through BOOK-06, PAY-01 through PAY-05, MENT-03, NOTF-01 through NOTF-03

### Phase 2 Decisions (carry forward)
- `.planning/phases/02-practitioner-supply/02-CONTEXT.md` — D-07 (anonymous by default), D-08 (tier badges), D-09 (stats: sessions + NPS), D-04/D-05 (30-min slots, 15-min buffers)

### Existing Implementation
- `src/types/database.ts` — Current schema (practitioners, availability_rules, availability_exceptions, portfolio_items)
- `src/app/practitioners/[id]/page.tsx` — Public profile page (booking CTA placeholder exists)
- `src/components/ui/card.tsx` — Card component with size variants
- `src/components/portal/tier-badge.tsx` — TierBadge component
- `src/lib/constants/specializations.ts` — SPECIALIZATION_CATEGORIES taxonomy

### External Documentation
- Razorpay Web Integration: https://razorpay.com/docs/payments/server-integration/nodejs/
- Google Calendar API (for Meet links): https://developers.google.com/calendar/api
- Resend Next.js: https://resend.com/docs/send-with-nextjs
- FullCalendar React: https://fullcalendar.io/docs/react

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Card component** (`src/components/ui/card.tsx`): Use for practitioner cards in browse grid
- **Badge component** (`src/components/ui/badge.tsx`): For filter pills, specialization tags
- **TierBadge component** (`src/components/portal/tier-badge.tsx`): Tier display on cards
- **Select component** (`src/components/ui/select.tsx`): For sort dropdown
- **Checkbox component** (`src/components/ui/checkbox.tsx`): For filter multi-select
- **Progress component** (`src/components/ui/progress.tsx`): For wizard step indicator
- **Skeleton component** (`src/components/ui/skeleton.tsx`): For loading states
- **FullCalendar** (installed in Phase 2): Reuse for slot selection in booking flow

### Established Patterns
- **Server Components + Server Actions**: Auth and profile editing use this pattern. Booking flow should follow.
- **Supabase RLS**: All tables have RLS policies. New `bookings`, `payments`, `sessions` tables will need policies.
- **TypeScript types**: `database.ts` defines table types. Extend for bookings/payments.

### Integration Points
- `/practitioners/[id]` — Profile page needs "Book Session" CTA that launches booking wizard
- `/dashboard` — Enterprise dashboard layout exists (will need booking history in Phase 4)
- `/portal` — Practitioner portal needs earnings tab added to sidebar
- New routes needed: `/browse`, `/book/[practitioner_id]`, `/booking/[id]/confirmation`

</code_context>

<specifics>
## Specific Ideas

- **Design reference:** Stan Store for creator/practitioner-side inspiration (earnings, payouts)
- **Design reference:** Awesomic for marketplace browse layout
- **Design reference:** Linear for dashboard aesthetic
- **Brand color:** #D97757 (terracotta) for CTAs, tier badges, active states
- **Session durations:** 20, 40, 60, 90 minutes (from Phase 2)
- **Sprint packages:** Show "Coming soon" teaser to validate interest

</specifics>

<deferred>
## Deferred Ideas

- **Sprint/package booking** — Show as "Coming soon" in session type selector. Full implementation deferred to v2.
- **Stripe international payments** — India-first with Razorpay. Stripe for international is v2.
- **In-app notifications** — Email only for MVP. In-app notification center is v2.
- **SMS reminders** — Email reminders only for MVP.
- **Invoice generation** — Manual for now. Auto-invoicing deferred to v2.
- **Price sorting in discovery** — Not needed for curated marketplace positioning.

</deferred>

---

*Phase: 03-discovery-booking-payments*
*Context gathered: 2026-04-13*
