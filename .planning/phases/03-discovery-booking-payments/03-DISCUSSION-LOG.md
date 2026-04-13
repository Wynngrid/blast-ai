# Phase 3: Discovery, Booking & Payments - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-13
**Phase:** 03-discovery-booking-payments
**Areas discussed:** Discovery UI, Booking Flow, Payment Integration, Notifications

---

## Discovery UI

| Option | Description | Selected |
|--------|-------------|----------|
| Card Grid (Recommended) | 3-column grid of practitioner cards (like Awesomic/Toptal). Scannable, image-forward. | |
| Compact List | Single-column list with smaller cards. Faster scanning, less visual weight. | |
| You decide | Claude picks based on design references. | ✓ |

**User's choice:** You decide (Claude picks based on Awesomic, Contra, Stan Store references)
**Notes:** User specifically mentioned Stan Store as design inspiration for creator/practitioner side.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Sidebar + Pills (Recommended) | Left sidebar with filter groups. Active filters shown as dismissible pills above results. | ✓ |
| Dropdown Bar | Horizontal bar of dropdowns. More compact, filters hidden until clicked. | |
| You decide | Claude picks based on filter dimensions. | |

**User's choice:** Sidebar + Pills

---

| Option | Description | Selected |
|--------|-------------|----------|
| Relevance + Rating + Sessions | Default: relevance. Also: highest rated, most sessions, newest. | ✓ |
| Relevance + Price | Add price sorting for budget-conscious enterprises. | |
| You decide | Claude decides based on requirements. | |

**User's choice:** Relevance + Rating + Sessions (no price sorting)

---

## Booking Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Single Page (Recommended) | All steps on one page. Minimal navigation friction. | |
| Multi-step Wizard | Step-by-step progression with clear stages. | ✓ |
| Modal Flow | Booking in overlay modal. Quick but cramped. | |

**User's choice:** Multi-step Wizard

---

| Option | Description | Selected |
|--------|-------------|----------|
| Single sessions only (Recommended) | 20, 40, 60, 90 min sessions. Sprint packages deferred to v2. | |
| Sessions + Sprint preview | Single sessions active, sprints shown as 'Coming soon'. | ✓ |
| You decide | Claude picks based on timeline. | |

**User's choice:** Sessions + Sprint preview (show "Coming soon" for interest validation)

---

| Option | Description | Selected |
|--------|-------------|----------|
| Structured form (Recommended) | Fields: stuck on?, outcome?, context? Required with validation. | ✓ |
| Free-form textarea | Single open text field. Less friction. | |
| Template prompts | Guided templates per specialization. | |

**User's choice:** Structured form

---

| Option | Description | Selected |
|--------|-------------|----------|
| Calendar view (Recommended) | Week view with FullCalendar. Click to select. | ✓ |
| List of slots | Date picker + list. Simpler but harder to compare. | |
| You decide | Claude picks based on Phase 2 setup. | |

**User's choice:** Calendar view

---

| Option | Description | Selected |
|--------|-------------|----------|
| Full prep package (Recommended) | Summary + prep instructions + calendar invite + meeting link. | ✓ |
| Simple receipt | Just confirmation number, date/time, practitioner name. | |
| You decide | Claude picks based on success criteria. | |

**User's choice:** Full prep package

---

| Option | Description | Selected |
|--------|-------------|----------|
| Practitioner provides (Recommended) | Practitioner adds Zoom/Meet link to profile. | |
| Auto-generate per booking | Platform generates unique link via API. | ✓ |
| Enterprise provides | Enterprise submits their meeting link. | |

**User's choice:** Auto-generate per booking

---

| Option | Description | Selected |
|--------|-------------|----------|
| Google Meet (Recommended) | Google Calendar API integration. Free tier. | ✓ |
| Zoom | More features but requires paid API tier. | |
| You decide | Claude picks based on complexity. | |

**User's choice:** Google Meet

---

| Option | Description | Selected |
|--------|-------------|----------|
| 24-hour window (Recommended) | Full refund if cancelled 24+ hours before. | ✓ |
| 48-hour window | More practitioner-friendly. | |
| No refunds, only reschedule | Credits stay in system. | |
| You decide | Claude picks based on best practices. | |

**User's choice:** 24-hour window

---

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, within 24 hours (Recommended) | Enterprise can reschedule if done 24+ hours before. | ✓ |
| Defer to v2 | MVP: cancel + rebook only. | |
| You decide | Claude picks based on scope. | |

**User's choice:** Yes, within 24 hours

---

## Payment Integration

| Option | Description | Selected |
|--------|-------------|----------|
| Embedded checkout (Recommended) | Razorpay popup/embedded form. User never leaves. | ✓ |
| Redirect to Razorpay | Full page redirect. Simpler but breaks flow. | |
| You decide | Claude picks based on best practices. | |

**User's choice:** Embedded checkout

---

| Option | Description | Selected |
|--------|-------------|----------|
| Calculated at booking (Recommended) | Commission calculated when confirmed. Stored per session. | ✓ |
| Calculated at payout | Calculated when practitioner requests payout. | |
| You decide | Claude picks based on transparency. | |

**User's choice:** Calculated at booking

---

| Option | Description | Selected |
|--------|-------------|----------|
| 30% fixed | Simple, predictable. Standard for curated marketplaces. | ✓ |
| Tiered by tier | Rising: 40%, Expert: 35%, Master: 30%. | |
| You decide | Claude picks based on benchmarks. | |

**User's choice:** 30% fixed

---

| Option | Description | Selected |
|--------|-------------|----------|
| Manual request (Recommended) | Practitioner requests payout at threshold. Admin approves. | ✓ |
| Auto-payout weekly | Automatic weekly transfer. | |
| Auto-payout per session | Instant transfer after session. | |
| You decide | Claude picks based on MVP scope. | |

**User's choice:** Manual request

---

| Option | Description | Selected |
|--------|-------------|----------|
| Balance + History (Recommended) | Current balance, pending, transaction history. | |
| Simple balance only | Just balance and payout button. | |
| Full analytics | Balance + charts (monthly trend, revenue by type). | ✓ |
| You decide | Claude picks based on MENT-03. | |

**User's choice:** Full analytics

---

| Option | Description | Selected |
|--------|-------------|----------|
| ₹2,000 (~$25) | Low threshold, keeps practitioners motivated. | |
| ₹5,000 (~$60) | More substantial, fewer transactions. | ✓ |
| You decide | Claude picks based on fees and norms. | |

**User's choice:** ₹5,000 (~$60)

---

## Notifications

| Option | Description | Selected |
|--------|-------------|----------|
| Resend (Recommended) | Developer-friendly, React Email templates. | ✓ |
| SendGrid | Enterprise-grade, more features. | |
| You decide | Claude picks based on stack. | |

**User's choice:** Resend

---

| Option | Description | Selected |
|--------|-------------|----------|
| Full set (Recommended) | Booking confirmation, practitioner alert, 24-hour reminder. | ✓ |
| Confirmations only | Just booking confirmation. | |
| You decide | Claude picks based on requirements. | |

**User's choice:** Full set

---

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal branded (Recommended) | Clean, text-focused with brand color accent. Linear-style. | ✓ |
| Rich HTML | Full graphics, session card preview. | |
| Plain text | No HTML. Maximum deliverability. | |
| You decide | Claude picks based on brand. | |

**User's choice:** Minimal branded

---

## Claude's Discretion

- Discovery card grid exact layout and responsive breakpoints
- Empty states for no results, no filters match
- Loading skeletons across all views
- Error states and retry patterns
- Slot picker timezone display format
- Meeting link placement in confirmation email
- Earnings chart visualization style

## Deferred Ideas

- Sprint/package booking (show "Coming soon" teaser)
- Stripe international payments
- In-app notifications
- SMS reminders
- Invoice generation
- Price sorting in discovery
