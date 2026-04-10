# Roadmap Review v0

**Reviewed:** 2026-04-09

## Proposed Roadmap Summary

4 phases | 44 requirements mapped | All v1 requirements covered ✓

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | Foundation & Authentication | All user types can securely access with role-appropriate permissions | AUTH-01 to AUTH-06 (6) | 5 |
| 2 | Practitioner Supply | Practitioners can create profiles and manage availability independently | PROF-01 to PROF-06, AVAIL-01 to AVAIL-04, MENT-01, MENT-02 (12) | 5 |
| 3 | Discovery, Booking & Payments | Enterprise can find practitioners, book sessions, and pay | DISC-01 to DISC-06, BOOK-01 to BOOK-06, PAY-01 to PAY-05, MENT-03, NOTF-01 to NOTF-03 (21) | 7 |
| 4 | Enterprise Dashboard & Trust | Enterprises manage team sessions, practitioners accumulate trust signals | DASH-01 to DASH-05, REV-01 to REV-04, MENT-04, NOTF-04 (11) | 6 |

## Phase Details

### Phase 1: Foundation & Authentication
**Goal:** All user types can securely access the platform with role-appropriate permissions
**Requirements:** AUTH-01 through AUTH-06

**Success criteria:**
1. Enterprise buyer can create account with email/password and log in
2. Enterprise buyer can sign up and log in via Google OAuth
3. Practitioner can apply with email/password and application is visible to admin
4. Admin can approve or reject practitioner applications
5. User session persists across browser refresh without re-login

### Phase 2: Practitioner Supply
**Goal:** Practitioners can create complete profiles and manage their availability independently
**Requirements:** PROF-01 through PROF-06, AVAIL-01 through AVAIL-04, MENT-01, MENT-02

**Success criteria:**
1. Practitioner can create and edit profile with bio, specialization, tools, tier, portfolio, and hourly rate
2. Practitioner can set available time slots and block specific dates
3. Availability calendar displays correctly in viewer's local timezone
4. Practitioner can view their upcoming sessions with session briefs
5. Practitioner profile displays stats placeholder (sessions: 0, ready for data)

### Phase 3: Discovery, Booking & Payments
**Goal:** Enterprise can find practitioners, book sessions, and pay through the platform
**Requirements:** DISC-01 through DISC-06, BOOK-01 through BOOK-06, PAY-01 through PAY-05, MENT-03, NOTF-01 through NOTF-03

**Success criteria:**
1. Enterprise can browse practitioners with filters (specialization, industry, tier) and sorting
2. Practitioner cards show anonymized info (skill-first, no name until booking)
3. Enterprise can complete booking flow: select session type, submit brief, pick slot, pay
4. Booking confirmation includes prep instructions and external meeting link
5. Payment collected via Razorpay before session is confirmed
6. Practitioner sees earnings in portal with commission calculated
7. Both parties receive email confirmation and 24-hour reminder

### Phase 4: Enterprise Dashboard & Trust
**Goal:** Enterprises can manage team sessions and practitioners accumulate trust signals
**Requirements:** DASH-01 through DASH-05, REV-01 through REV-04, MENT-04, NOTF-04

**Success criteria:**
1. Enterprise admin can view team overview (members, sessions completed)
2. Enterprise admin can track hours used vs purchased and budget utilization
3. Enterprise admin can view session history and upcoming sessions
4. Enterprise can submit NPS rating and review after session
5. Reviews display on practitioner profile with aggregate stats on practitioner cards
6. Practitioner can see ratings and reviews received in portal

---

## Review Notes & Enhancements

### Phase 1: Foundation & Authentication
**Status:** Looks right. No notes. Ship it.

### Phase 2: Practitioner Supply
**Flag:** Anonymous-by-default design

Make sure the profile creation flow enforces the anonymous-by-default design. The practitioner enters their real name (for internal/payment purposes), but the public-facing profile shows specialization, tier, bio, portfolio, stats — no name. Name only reveals after booking is confirmed. This is a core design decision that needs to be baked into PROF-01 from the start.

### Phase 3: Discovery, Booking & Payments
**Flag 1:** Default sort order

DISC-02 (anonymized cards) is listed correctly — good. Make sure the search results page defaults to sorting by "relevance" (matching specialization + tier + NPS) not by "newest" or alphabetical.

**Flag 2:** Mandatory session brief

BOOK flow — the session brief submission (what the mentee is stuck on) should be mandatory, not optional. This is the feature that makes sessions 10x better than a cold Zoom call. If the enterprise doesn't submit a brief, the practitioner can't prepare, and the session quality drops. Make it a required field in BOOK-03.

### Phase 4: Enterprise Dashboard & Trust
**Addition:** Rebook CTA

Consider adding a "Reorder" or "Rebook" CTA directly from the session history. If an enterprise had a great session, the fastest path to revenue is making it one click to book the same practitioner again. That rebook rate (we're targeting 96%+) becomes the growth engine.

---

*All review notes have been incorporated into ROADMAP.md Implementation Notes sections.*
