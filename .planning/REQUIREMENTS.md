# Requirements: BLAST AI

**Defined:** 2026-04-09
**Core Value:** Vetted matching between enterprises needing AI skills and practitioners who've shipped real work

## v1 Requirements

Requirements for April 18, 2026 Masters' Union AI Summit launch.

### Authentication

- [ ] **AUTH-01**: Enterprise buyer can sign up with email/password
- [ ] **AUTH-02**: Enterprise buyer can sign up/login with Google OAuth
- [ ] **AUTH-03**: Practitioner can apply with email/password (pending approval)
- [ ] **AUTH-04**: Admin can approve/reject practitioner applications
- [ ] **AUTH-05**: User session persists across browser refresh
- [ ] **AUTH-06**: Role-based access control enforces correct permissions per user type

### Practitioner Profiles

- [ ] **PROF-01**: Practitioner has profile with bio, specialization, and tools/stack
- [ ] **PROF-02**: Practitioner profile displays tier badge (e.g., Master, Expert)
- [ ] **PROF-03**: Practitioner profile shows stats (sessions completed, NPS, rebook rate)
- [ ] **PROF-04**: Practitioner profile displays hourly rate
- [ ] **PROF-05**: Practitioner profile shows portfolio of shipped work
- [ ] **PROF-06**: Practitioner profile shows reviews from past sessions

### Discovery

- [ ] **DISC-01**: Enterprise can browse practitioners by specialization
- [ ] **DISC-02**: Enterprise can filter practitioners by industry
- [ ] **DISC-03**: Enterprise can filter practitioners by tier level
- [ ] **DISC-04**: Practitioner cards show anonymized info (skill-first, no name until booking)
- [ ] **DISC-05**: Enterprise can sort practitioners by rating, sessions completed, or availability
- [ ] **DISC-06**: Enterprise can view full practitioner profile from card

### Availability & Scheduling

- [ ] **AVAIL-01**: Practitioner can set available time slots
- [ ] **AVAIL-02**: Practitioner can block specific dates/times
- [ ] **AVAIL-03**: Availability calendar displays in enterprise's local timezone
- [ ] **AVAIL-04**: Booked slots are automatically removed from availability

### Booking Flow

- [ ] **BOOK-01**: Enterprise can select session type (single session)
- [ ] **BOOK-02**: Enterprise can submit session brief (what they're stuck on)
- [ ] **BOOK-03**: Enterprise can pick available time slot from practitioner's calendar
- [ ] **BOOK-04**: Enterprise receives booking confirmation with prep instructions
- [ ] **BOOK-05**: Practitioner can view session brief before session
- [ ] **BOOK-06**: External meeting link (Zoom/Meet) included in booking confirmation

### Payments

- [ ] **PAY-01**: Enterprise can pay for session via Razorpay
- [ ] **PAY-02**: Platform collects payment before session is confirmed
- [ ] **PAY-03**: Platform commission (30-40%) is calculated automatically
- [ ] **PAY-04**: Practitioner receives payout after session completion
- [ ] **PAY-05**: Practitioner can view earnings dashboard with payout history

### Enterprise Dashboard

- [ ] **DASH-01**: Enterprise admin can see team overview (members enrolled, sessions completed)
- [ ] **DASH-02**: Enterprise admin can view hours used vs hours purchased (progress bar)
- [ ] **DASH-03**: Enterprise admin can view session history
- [ ] **DASH-04**: Enterprise admin can view upcoming sessions
- [ ] **DASH-05**: Enterprise admin can track budget utilization

### Mentor Portal

- [ ] **MENT-01**: Practitioner can manage availability (toggle time blocks)
- [ ] **MENT-02**: Practitioner can view upcoming sessions with session briefs
- [ ] **MENT-03**: Practitioner can track earnings and payout status
- [ ] **MENT-04**: Practitioner can see ratings and reviews received

### Reviews & Trust

- [ ] **REV-01**: Enterprise can submit NPS rating after session
- [ ] **REV-02**: Enterprise can write review after session
- [ ] **REV-03**: Reviews display on practitioner profile
- [ ] **REV-04**: Aggregate stats (avg rating, total sessions) visible on practitioner card

### Notifications

- [ ] **NOTF-01**: Enterprise receives email when booking is confirmed
- [ ] **NOTF-02**: Practitioner receives email when new booking is made
- [ ] **NOTF-03**: Both parties receive reminder 24 hours before session
- [ ] **NOTF-04**: Enterprise receives prompt to leave review after session

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Sprint Packages

- **SPRT-01**: Enterprise can book multi-session sprint packages
- **SPRT-02**: Sprint packages have milestone-based progress tracking
- **SPRT-03**: Sprint pricing offers discount vs individual sessions

### International Payments

- **INTL-01**: Enterprise can pay via Stripe (international)
- **INTL-02**: Multi-currency support for international practitioners

### Enhanced Features

- **ENH-01**: Async messaging between sessions (sprint packages only)
- **ENH-02**: Rebook rate displayed on practitioner profiles
- **ENH-03**: Session prep checklists for practitioners
- **ENH-04**: Enhanced practitioner stats (detailed NPS breakdown)

### Enterprise Advanced

- **ENT-01**: Enterprise SSO/SAML integration
- **ENT-02**: Bulk team member onboarding
- **ENT-03**: ROI reporting and exportable leadership decks
- **ENT-04**: Skill progression heat maps per team member

### AI Features

- **AI-01**: AI-powered practitioner matching
- **AI-02**: Session recordings with AI transcription
- **AI-03**: Agentic copilot trained on session transcripts

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Built-in video conferencing | Zoom/Meet already solved. High complexity, reliability burden. Use external links. |
| Real-time chat with experts | Creates instant availability expectation. Practitioner burnout risk. |
| Public bidding/proposals | Race to bottom on pricing. Devalues expertise. Opposite of premium positioning. |
| Free enterprise tier | Enterprise L&D has budget. Free signals low value. Attracts tire-kickers. |
| Practitioner-initiated outreach | Spam risk. Damages premium positioning. Enterprises discover, not practitioners pitch. |
| Gamification/leaderboards | Wrong incentives (quantity over quality). Gimmicky for premium positioning. |
| Marketplace community/forum | Diffuses focus. Requires moderation. Not core value prop. |
| Micro-tasks/gig work | Opposite of structured mentorship. Commoditizes expertise. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| AUTH-05 | Phase 1 | Pending |
| AUTH-06 | Phase 1 | Pending |
| PROF-01 | Phase 2 | Pending |
| PROF-02 | Phase 2 | Pending |
| PROF-03 | Phase 2 | Pending |
| PROF-04 | Phase 2 | Pending |
| PROF-05 | Phase 2 | Pending |
| PROF-06 | Phase 2 | Pending |
| AVAIL-01 | Phase 2 | Pending |
| AVAIL-02 | Phase 2 | Pending |
| AVAIL-03 | Phase 2 | Pending |
| AVAIL-04 | Phase 2 | Pending |
| MENT-01 | Phase 2 | Pending |
| MENT-02 | Phase 2 | Pending |
| DISC-01 | Phase 3 | Pending |
| DISC-02 | Phase 3 | Pending |
| DISC-03 | Phase 3 | Pending |
| DISC-04 | Phase 3 | Pending |
| DISC-05 | Phase 3 | Pending |
| DISC-06 | Phase 3 | Pending |
| BOOK-01 | Phase 3 | Pending |
| BOOK-02 | Phase 3 | Pending |
| BOOK-03 | Phase 3 | Pending |
| BOOK-04 | Phase 3 | Pending |
| BOOK-05 | Phase 3 | Pending |
| BOOK-06 | Phase 3 | Pending |
| PAY-01 | Phase 3 | Pending |
| PAY-02 | Phase 3 | Pending |
| PAY-03 | Phase 3 | Pending |
| PAY-04 | Phase 3 | Pending |
| PAY-05 | Phase 3 | Pending |
| MENT-03 | Phase 3 | Pending |
| NOTF-01 | Phase 3 | Pending |
| NOTF-02 | Phase 3 | Pending |
| NOTF-03 | Phase 3 | Pending |
| DASH-01 | Phase 4 | Pending |
| DASH-02 | Phase 4 | Pending |
| DASH-03 | Phase 4 | Pending |
| DASH-04 | Phase 4 | Pending |
| DASH-05 | Phase 4 | Pending |
| MENT-04 | Phase 4 | Pending |
| REV-01 | Phase 4 | Pending |
| REV-02 | Phase 4 | Pending |
| REV-03 | Phase 4 | Pending |
| REV-04 | Phase 4 | Pending |
| NOTF-04 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 44 total
- Mapped to phases: 44
- Unmapped: 0

---
*Requirements defined: 2026-04-09*
*Last updated: 2026-04-09 after roadmap creation*
