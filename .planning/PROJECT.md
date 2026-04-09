# BLAST AI

## What This Is

An AI practitioner marketplace where enterprises and institutions book vetted AI experts for structured mentorship sprints. Think "Toptal meets Calendly for AI expertise" — anonymous profiles searchable by skill, not name, with enterprise dashboards for tracking team upskilling progress.

## Core Value

**Vetted matching** — enterprises get practitioners who've shipped real AI work (not course instructors), and practitioners get paid sessions without handling sales, invoicing, or client acquisition.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Practitioner Discovery**
- [ ] Enterprise can browse practitioners by specialization, industry, tier
- [ ] Anonymous profiles (searchable by skill, not name)
- [ ] Practitioner cards show specialization, tier badge, bio, stats (sessions, NPS, rebook rate), hourly rate, availability

**Practitioner Profiles**
- [ ] Full portfolio of shipped work
- [ ] Tools/stack listing
- [ ] Bio and reviews
- [ ] Availability calendar
- [ ] Booking CTA

**Booking Flow**
- [ ] Select session type (single session or sprint package)
- [ ] Submit session brief (what you're stuck on)
- [ ] Pick time slot from practitioner's availability
- [ ] Pay via Razorpay (Stripe for international)
- [ ] Confirmation with prep instructions

**Enterprise Dashboard**
- [ ] Team overview (members enrolled, sessions completed)
- [ ] Hours used vs purchased (progress bar)
- [ ] Session history
- [ ] Upcoming sessions
- [ ] Budget utilization

**Mentor Portal**
- [ ] Manage availability (toggle time blocks)
- [ ] View upcoming sessions with session briefs
- [ ] Track earnings
- [ ] See ratings/reviews

**Authentication**
- [ ] Enterprise buyer: Google OAuth + email/password
- [ ] Mentor/Practitioner: Email/password + manual approval (apply → vet → activate)
- [ ] Enterprise admin: Google OAuth with SSO

**Payments**
- [ ] Subscription/retainer for enterprises (annual/semester)
- [ ] One-time session/sprint payments
- [ ] Platform commission (30-40%)
- [ ] Practitioner payouts

### Out of Scope

- **Session workspace (built-in video + notes)** — MVP uses external Zoom/Meet links
- **Session recording storage** — defer to v2
- **Skill progression heat maps** — defer to v2
- **Agentic copilot** — Phase 2 feature (AI trained on session transcripts)
- **Sprint milestone tracking with deliverables** — defer to v2
- **Bulk team onboarding and SSO** — defer to v2
- **Practitioner tier progression automation** — defer to v2
- **ROI reporting and exportable leadership decks** — defer to v2
- **Creator marketplace mode** — Phase 3 (production briefs, not mentorship)
- **AI capabilities in platform** — MVP is human mentorship; AI tools are Phase 2+

## Context

**Market Validation:**
- 24.16 Productions (AI production studio) — every brand client (Van Heusen, Marico, Noise, Dabur, YAS Holding) asks "can you train our team?"
- Cold LinkedIn DM from US creator asking for 1:1 AI mentorship — unprompted, willing to pay
- 90,000+ tech layoffs in 12 months — Jack Dorsey stated AI tools "fundamentally changes what it means to build and run a company"

**Target Users:**
1. **Enterprise L&D heads and CMOs** at 50-5000+ employee companies whose teams need to work with AI tools (Runway, Midjourney, Kling, Sora) but are stuck
2. **Institution program heads** at business schools (Masters' Union, ISB, MICA, NIFT) who need AI practitioners as visiting faculty
3. **AI practitioners** (filmmakers, performance marketers, UX designers, voice AI specialists) who want to monetize expertise

**Launch Event:** Masters' Union AI Summit — April 18, 2026 ("The Next Tech 1.0" in Gurugram)

**Beta Users:**
- Enterprise: Masters' Union, Marico, WPP/Dentsu agency, D2C brand, corporate from AI Summit
- Mentors: Rishi, Pragya, AI filmmaker, AI performance marketer, AI UX practitioner

**Success Metric (Week 1):** 3 enterprise pilot sessions booked and completed through the platform with NPS scores collected

## Constraints

- **Tech Stack**: Next.js on Vercel (frontend) + Supabase (backend/database/auth)
- **Payments**: Razorpay (India-first), Stripe (international)
- **Timeline**: Demo-ready by April 18, 2026 (Masters' Union AI Summit)
- **Design References**: Awesomic (marketplace layout), Linear (dashboard aesthetic), Contra (profile design)
- **Brand Color**: #D97757 (terracotta/warm orange) — sparingly for CTAs, active states, tier badges
- **Vibe**: Minimal/Clean with warmth — premium SaaS, not edtech or freelance gig platform

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Anonymous profiles searchable by skill | Vetting is the product — skills matter more than names | — Pending |
| Razorpay-first, Stripe secondary | India-first launch at MU Summit | — Pending |
| No built-in video/session workspace | Reduce MVP complexity, use existing tools | — Pending |
| 30-40% platform commission | Industry standard for curated marketplaces | — Pending |
| Manual practitioner approval | Quality control is core value proposition | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-09 after initialization*
