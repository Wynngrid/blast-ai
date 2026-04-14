# Roadmap: BLAST AI

## Overview

BLAST AI delivers a vetted AI practitioner marketplace in four phases: establish secure foundation with authentication and RLS, seed practitioner supply with profiles and availability, build the core booking and payment transaction, then add enterprise dashboards and trust systems. This order solves the chicken-and-egg problem by enabling practitioners to onboard before enterprises arrive, establishes security patterns before handling sensitive data, and validates core transactions before building retention features.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, 4): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Authentication** - Supabase setup, RLS on all tables, auth for all user types, RBAC
- [x] **Phase 2: Practitioner Supply** - Profiles, availability calendar, basic mentor portal, admin approval
- [x] **Phase 3: Discovery, Booking & Payments** - Search/browse, booking flow, Razorpay payments, notifications
- [ ] **Phase 4: Enterprise Dashboard & Trust** - Team management, budget tracking, reviews, ratings

## Phase Details

### Phase 1: Foundation & Authentication
**Goal**: All user types can securely access the platform with role-appropriate permissions
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06
**Success Criteria** (what must be TRUE):
  1. Enterprise buyer can create account with email/password and log in
  2. Enterprise buyer can sign up and log in via Google OAuth
  3. Practitioner can apply with email/password and application is visible to admin
  4. Admin can approve or reject practitioner applications
  5. User session persists across browser refresh without re-login
**Plans**: 3 plans
**UI hint**: yes

Plans:
- [x] 01-01-PLAN.md — Bootstrap Next.js 16 + Supabase, database schema with RLS
- [x] 01-02-PLAN.md — Auth UI (login, signup, OAuth) and server actions
- [x] 01-03-PLAN.md — Gap closure: role-based landing pages and admin approval UI

### Phase 2: Practitioner Supply
**Goal**: Practitioners can create complete profiles and manage their availability independently
**Depends on**: Phase 1
**Requirements**: PROF-01, PROF-02, PROF-03, PROF-04, PROF-05, PROF-06, AVAIL-01, AVAIL-02, AVAIL-03, AVAIL-04, MENT-01, MENT-02
**Success Criteria** (what must be TRUE):
  1. Practitioner can create and edit profile with bio, specialization, tools, tier, portfolio, and hourly rate
  2. Practitioner can set available time slots and block specific dates
  3. Availability calendar displays correctly in viewer's local timezone
  4. Practitioner can view their upcoming sessions with session briefs
  5. Practitioner profile displays stats placeholder (sessions: 0, ready for data)
**Plans**: 5 plans
**UI hint**: yes
**Implementation Notes**:
  - **Anonymous-by-default**: Practitioner enters real name (for internal/payment purposes), but public-facing profile shows specialization, tier, bio, portfolio, stats — NO name. Name only reveals after booking is confirmed. This is core design — bake into PROF-01 from the start.

Plans:
- [x] 02-01-PLAN.md — Database schema (availability/portfolio tables), package installation, specialization taxonomy
- [x] 02-02-PLAN.md — Portal sidebar navigation with Linear-style layout
- [x] 02-03-PLAN.md — Profile wizard (4 steps: Bio, Skills, Portfolio, Rates) with validation
- [x] 02-04-PLAN.md — Availability calendar with FullCalendar, recurring rules, timezone handling
- [x] 02-05-PLAN.md — Public profile display, TierBadge, StatsDisplay, profile preview

### Phase 3: Discovery, Booking & Payments
**Goal**: Enterprise can find practitioners, book sessions, and pay through the platform
**Depends on**: Phase 2
**Requirements**: DISC-01, DISC-02, DISC-03, DISC-04, DISC-05, DISC-06, BOOK-01, BOOK-02, BOOK-03, BOOK-04, BOOK-05, BOOK-06, PAY-01, PAY-02, PAY-03, PAY-04, PAY-05, MENT-03, NOTF-01, NOTF-02, NOTF-03
**Success Criteria** (what must be TRUE):
  1. Enterprise can browse practitioners with filters (specialization, industry, tier) and sorting
  2. Practitioner cards show anonymized info (skill-first, no name until booking)
  3. Enterprise can complete booking flow: select session type, submit brief, pick slot, pay
  4. Booking confirmation includes prep instructions and external meeting link
  5. Payment collected via Razorpay before session is confirmed
  6. Practitioner sees earnings in portal with commission calculated
  7. Both parties receive email confirmation and 24-hour reminder
**Plans**: 7 plans
**UI hint**: yes
**Implementation Notes**:
  - **Default sort**: Search results default to "relevance" (specialization match + tier + NPS), NOT "newest" or alphabetical
  - **Mandatory brief**: Session brief (BOOK-02/BOOK-03) is REQUIRED, not optional. This is what makes sessions 10x better than a cold Zoom call. If enterprise doesn't submit a brief, practitioner can't prepare. Make it a required field with validation.
  - **BLAST Coins**: Platform uses coin-based currency (1 coin = $10). Enterprises buy coins, see costs in coins. Practitioners see earnings in INR only, never coins or commission percentages.

Plans:
- [x] 03-01-PLAN.md — Database schema, TypeScript types, coin constants, package installation
- [x] 03-02-PLAN.md — Discovery browse page with filters (specialization, industry, tier), sorting, practitioner cards
- [x] 03-03-PLAN.md — Booking wizard core: session type selection, structured brief form, slot picker
- [x] 03-04-PLAN.md — Coin payment system: Razorpay integration, coin purchase, balance, spending
- [x] 03-05-PLAN.md — Booking completion: Google Meet link generation, confirmation page, .ics download
- [x] 03-06-PLAN.md — Practitioner earnings dashboard, payout requests, sessions view with briefs
- [x] 03-07-PLAN.md — Email notifications: booking confirmation, new booking alert, 24-hour reminders

### Phase 4: Enterprise Dashboard & Trust
**Goal**: Enterprises can manage team sessions and practitioners accumulate trust signals
**Depends on**: Phase 3
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, MENT-04, REV-01, REV-02, REV-03, REV-04, NOTF-04
**Success Criteria** (what must be TRUE):
  1. Enterprise admin can view team overview (members, sessions completed)
  2. Enterprise admin can track hours used vs purchased and budget utilization
  3. Enterprise admin can view session history and upcoming sessions
  4. Enterprise can submit NPS rating and review after session
  5. Reviews display on practitioner profile with aggregate stats on practitioner cards
  6. Practitioner can see ratings and reviews received in portal
  7. Session history includes "Rebook" CTA to quickly book same practitioner again
**Plans**: TBD
**UI hint**: yes
**Implementation Notes**:
  - **Rebook CTA**: Add "Rebook" button directly in session history. If enterprise had a great session, one click to book the same practitioner again. Targeting 96%+ rebook rate — this becomes the growth engine.

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Authentication | 3/3 | Complete | 2026-04-10 |
| 2. Practitioner Supply | 5/5 | Complete | 2026-04-12 |
| 3. Discovery, Booking & Payments | 7/7 | Complete | 2026-04-14 |
| 4. Enterprise Dashboard & Trust | 0/2 | Not started | - |

---
*Roadmap created: 2026-04-09*
*Granularity: coarse (4 phases)*
*Coverage: 44/44 requirements mapped*
