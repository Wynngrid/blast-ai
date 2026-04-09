# Feature Research

**Domain:** AI Practitioner/Expert Marketplace
**Researched:** 2026-04-09
**Confidence:** MEDIUM-HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Expert/Practitioner Profiles** | Standard across all marketplaces (Toptal, Contra, MentorCruise). Users need to evaluate expertise before booking. | MEDIUM | Must include: bio, specialization, experience indicators, rates. Contra's case study format is industry-leading. |
| **Ratings & Reviews** | 58% of marketplace users expect this as trust signal. Essential for credibility in expert services. | MEDIUM | Star ratings + written reviews. Display aggregate stats (sessions completed, average rating). |
| **Availability Calendar** | Every booking platform has this (Clarity.fm, Calendly, GrowthMentor). Scheduling without it creates friction. | MEDIUM | Integration with external calendars (Google, Outlook). Real-time availability sync. |
| **Session Booking Flow** | Core transaction of the marketplace. Clarity.fm, GrowthMentor all have streamlined 3-step flows. | MEDIUM | Select time slot -> Submit context/brief -> Confirm payment. Must be < 3 minutes. |
| **Secure Payments** | Trust is paramount. Users expect protected transactions with receipts and invoicing. | HIGH | Escrow-style payment (charge on booking, release after session). Razorpay/Stripe handles complexity. |
| **Search & Filtering** | Users need to find relevant experts quickly. All competitors have robust filtering by skill, industry, price. | MEDIUM | Filter by: specialization, industry, tier/price range, availability. Sort by: rating, sessions completed. |
| **Messaging/Communication** | Upwork, Fiverr, MentorCruise all include in-platform messaging for pre-session coordination. | MEDIUM | Pre-booking inquiries + post-booking coordination. Keep communication on-platform for trust. |
| **Basic Notifications** | Users expect booking confirmations, reminders, session updates via email. | LOW | Email notifications for: booking confirmed, 24hr reminder, session completed, review request. |
| **Session Brief/Context** | GrowthMentor and MentorCruise require session context. Practitioners need prep context to deliver value. | LOW | Simple form: "What are you stuck on?", "What outcome do you want?". Visible to practitioner before session. |
| **Practitioner Payout System** | Practitioners won't join without clear payment terms. Toptal, MentorCruise, Clarity.fm all have this. | HIGH | Commission model (15-40% industry standard). Clear payout schedules. Earnings dashboard. |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Anonymous/Skill-First Profiles** | Blast AI's core differentiator. Removes bias, emphasizes vetting. No competitor does this well. | LOW | Hide names until booking. Search by skill/specialization only. Reveal identity post-booking. |
| **Enterprise Dashboard** | Toptal has account managers; MentorCruise has Teams. No competitor combines team tracking with self-service booking. | HIGH | Hours used vs purchased, session history, team member progress, budget utilization. |
| **Tier Badge System** | Signals quality at a glance. Awesomic uses "top 1%". Toptal uses "top 3%". Visual trust indicators. | LOW | Bronze/Silver/Gold or similar. Earned through vetting, reviews, session volume. |
| **Sprint/Package Bookings** | Most competitors are single-session only. Multi-session packages for structured upskilling are rare. | MEDIUM | Package pricing (e.g., 4-session sprint). Milestone-based progress. Better for enterprise L&D. |
| **Practitioner Vetting Display** | Show HOW practitioners were vetted. GrowthMentor accepts 5%, Toptal 3%. Make vetting transparent. | LOW | "Vetted through: portfolio review, technical interview, reference check". Trust through transparency. |
| **Session Prep Materials** | Go beyond brief. MentorCruise includes async messaging for prep. | MEDIUM | Pre-session checklist, resource sharing, async Q&A before call. |
| **Rebook Rate Display** | Airbnb found NPS predicts rebooking. Display rebook rate as quality signal. Unique metric no competitor shows. | LOW | "X% of clients rebook" on profile. Stronger trust signal than reviews alone. |
| **AI-Powered Matching** | GrowthMentor has basic AI matching. Awesomic uses AI for designer matching. Can optimize for better outcomes. | HIGH | Match based on: problem type, industry, tools mentioned, past session success. Phase 2 feature. |
| **Async Messaging Between Sessions** | MentorCruise's killer feature. Relationship doesn't end when call ends. | MEDIUM | Included in sprint packages. Quick questions between sessions. Builds ongoing relationship. |
| **Session Summaries/Recordings** | GrowthMentor has AI session summaries and recordings. High value for learners. | HIGH | AI-generated action items. Searchable transcript. Reference for future sessions. Phase 2 feature. |
| **Enterprise SSO/SAML** | Required for large enterprises. Qooper, Chronus have this for enterprise L&D. | HIGH | Defer to v2. Table stakes for 500+ employee companies. |
| **Progress Analytics for Enterprises** | Qooper, MentorCliQ have DEI dashboards, engagement tracking. | HIGH | Skill progression, engagement trends, ROI metrics. Phase 2 differentiator. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Built-in Video Conferencing** | "All-in-one platform" appeal | Zoom/Meet already solved. Building video = massive complexity, reliability burden. Users prefer familiar tools. | External meeting links (Zoom/Meet). Focus on booking + context, not video infrastructure. |
| **Real-time Chat with Experts** | "Quick questions" use case | Creates expectation of instant availability. Burns out practitioners. Blurs async vs sync boundaries. | Async messaging with clear SLA (respond within 24hrs). Reserve real-time for booked sessions. |
| **Public Bidding/Proposals** | Upwork/Freelancer model | Race to bottom on pricing. Devalues expertise. Creates adversarial dynamic. Opposite of premium positioning. | Fixed rates set by practitioners within tier guidelines. No negotiation/bidding. |
| **Unlimited Revisions/Sessions** | Awesomic subscription model | Unclear scope. Practitioner burnout. Hard to price profitably. Works for design tasks, not mentorship. | Clear session counts per package. Sprint = 4 sessions. Single = 1 session. Defined scope. |
| **Free Tier for Enterprises** | "Try before buy" | Enterprise L&D has budget. Free signals low value. Attracts tire-kickers not buyers. | Paid pilot (1-2 sessions). If valuable, they'll pay. If not, free won't convert them. |
| **Practitioner-Initiated Outreach** | "Help practitioners find clients" | Spam risk. Poor UX. Enterprises don't want cold pitches. Damages premium positioning. | Enterprises discover and book. Practitioners respond. One-way marketplace. |
| **Complex Skill Assessments** | "Verify expertise deeply" | Slow onboarding. Deters qualified practitioners. Assessment validity is questionable. | Portfolio review + interview + reference check. Ship-based vetting, not test-based. |
| **Gamification/Leaderboards** | ADPList has this | Creates wrong incentives (quantity over quality). Feels gimmicky for premium positioning. | Quality metrics (NPS, rebook rate, reviews) as reputation signals. No gamification. |
| **Marketplace-Wide Community/Forum** | "Build community" | Diffuses focus. Requires moderation. Slack communities exist. Not core value prop. | Phase 3 consideration. Focus on 1:1 sessions first. Community is separate product. |
| **Micro-Tasks/Gig Work** | Fiverr model | Opposite of structured mentorship. Commoditizes expertise. Wrong market positioning. | Session-based (1hr minimum) or sprint-based (multi-session). No 15-minute tasks. |

## Feature Dependencies

```
[Authentication]
    |
    +---> [Practitioner Profiles]
    |         |
    |         +---> [Search & Filtering]
    |         |
    |         +---> [Availability Calendar]
    |                   |
    |                   +---> [Session Booking Flow]
    |                             |
    |                             +---> [Payments]
    |                             |         |
    |                             |         +---> [Practitioner Payouts]
    |                             |
    |                             +---> [Session Brief]
    |                             |
    |                             +---> [Notifications]
    |
    +---> [Enterprise Dashboard]
              |
              +---> [Team Management]
                        |
                        +---> [Hours Tracking]

[Ratings & Reviews] --requires--> [Completed Sessions]

[Tier Badges] --requires--> [Vetting Process] + [Session History]

[Rebook Rate Display] --requires--> [Session History] + [Repeat Bookings]

[Sprint Packages] --enhances--> [Session Booking Flow]

[Async Messaging] --enhances--> [Sprint Packages]

[AI Matching] --requires--> [Session History] + [Outcome Data]
```

### Dependency Notes

- **Booking Flow requires Auth + Profiles + Calendar**: Cannot book without knowing who's available and when.
- **Payouts require Payments**: Must collect before distributing.
- **Reviews require Completed Sessions**: Can only rate after experiencing service.
- **Enterprise Dashboard requires Team Management**: Individual tracking before aggregate views.
- **AI Matching requires Historical Data**: Need session outcomes to train recommendations.
- **Rebook Rate requires Session Volume**: Need enough data for meaningful percentages.

## MVP Definition

### Launch With (v1)

Minimum viable product for April 18 Masters' Union demo.

- [x] **Practitioner Profiles** — Core value proposition. Show expertise, bio, rates, tier badge.
- [x] **Anonymous Discovery** — Differentiator. Skill-first search without names.
- [x] **Availability Calendar** — Table stakes for booking.
- [x] **Session Booking Flow** — Core transaction. Select time + submit brief + pay.
- [x] **Payments (Razorpay)** — India-first launch requirement.
- [x] **Session Brief** — Critical for practitioner prep and session quality.
- [x] **Email Notifications** — Booking confirmation, reminders.
- [x] **Enterprise Dashboard (Basic)** — Team overview, hours used, session history.
- [x] **Practitioner Portal (Basic)** — Manage availability, view bookings, track earnings.
- [x] **Ratings & Reviews** — Post-session feedback collection.

### Add After Validation (v1.x)

Features to add once core is working and first sessions completed.

- [ ] **Sprint/Package Bookings** — After validating single-session demand.
- [ ] **Async Messaging** — When enterprises request ongoing relationships.
- [ ] **Rebook Rate Display** — After sufficient session volume (50+ sessions).
- [ ] **Stripe Integration** — When international enterprises show interest.
- [ ] **Enhanced Practitioner Stats** — NPS scores, detailed metrics.
- [ ] **Session Prep Checklists** — After collecting feedback on session quality issues.

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **AI-Powered Matching** — Requires session outcome data to train.
- [ ] **Session Recordings/Summaries** — High complexity, needs consent workflows.
- [ ] **Enterprise SSO/SAML** — Only needed for 500+ employee accounts.
- [ ] **Progress Analytics/Heat Maps** — Requires multi-session sprint data.
- [ ] **Skill Progression Tracking** — Phase 2 L&D differentiation.
- [ ] **Agentic Copilot** — Phase 2. AI trained on session transcripts.
- [ ] **Creator Marketplace Mode** — Phase 3. Production briefs, not mentorship.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Practitioner Profiles | HIGH | MEDIUM | P1 |
| Session Booking Flow | HIGH | MEDIUM | P1 |
| Availability Calendar | HIGH | MEDIUM | P1 |
| Payments (Razorpay) | HIGH | MEDIUM | P1 |
| Anonymous Discovery | HIGH | LOW | P1 |
| Session Brief | HIGH | LOW | P1 |
| Email Notifications | MEDIUM | LOW | P1 |
| Enterprise Dashboard | HIGH | HIGH | P1 |
| Practitioner Portal | HIGH | MEDIUM | P1 |
| Ratings & Reviews | HIGH | MEDIUM | P1 |
| Search & Filtering | MEDIUM | MEDIUM | P1 |
| Sprint Packages | HIGH | MEDIUM | P2 |
| Async Messaging | MEDIUM | MEDIUM | P2 |
| Rebook Rate Display | MEDIUM | LOW | P2 |
| Stripe (International) | MEDIUM | MEDIUM | P2 |
| AI Matching | HIGH | HIGH | P3 |
| Session Recordings | MEDIUM | HIGH | P3 |
| Enterprise SSO | LOW (initially) | HIGH | P3 |
| Progress Analytics | MEDIUM | HIGH | P3 |

**Priority key:**
- P1: Must have for April 18 launch
- P2: Should have, add when validated/requested
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Toptal | Contra | Clarity.fm | MentorCruise | GrowthMentor | ADPList | Blast AI Approach |
|---------|--------|--------|------------|--------------|--------------|---------|-------------------|
| **Profile Format** | Curated by platform | Portfolio/case study | Basic profile | Detailed mentor page | Mentor profile | Community profile | Anonymous + skill-first, revealed on booking |
| **Vetting Level** | Top 3% (strict) | Self-serve | Self-serve | ~5% acceptance | ~5% acceptance | Open | Manual approval, portfolio + interview |
| **Pricing Model** | Hourly, platform sets | Commission-free | Per-minute | Monthly subscription | Monthly membership | Free/freemium | Session-based + sprint packages |
| **Commission** | High (undisclosed) | 0% | 15% | ~20% markup | Membership fee | Free | 30-40% commission |
| **Enterprise Features** | Account managers | None | None | Teams dashboard | Team plans | None | Self-serve dashboard + team tracking |
| **Session Format** | Project-based | Project-based | Phone calls | Video calls + async | Video calls | Video calls | External video + session briefs |
| **Async Support** | Account manager | Messaging | Q&A forum | Included in plans | Slack community | None | Sprint packages only |
| **Matching** | Human advisors | Browse/search | Browse | Algorithm + browse | AI + browse | Browse | Search/filter, AI matching Phase 2 |
| **Reviews/Ratings** | Platform verified | Client endorsements | Public reviews | Public reviews | Session ratings | Public reviews | NPS + reviews + rebook rate |

### Key Differentiation Opportunities

1. **Anonymous Profiles**: No competitor does skill-first, name-hidden discovery. Removes bias, emphasizes vetting quality.
2. **Enterprise Self-Serve**: Toptal has account managers (expensive), others lack enterprise features entirely. Self-serve dashboard is underserved.
3. **Sprint Packages**: Most competitors are single-session or subscription. Structured multi-session sprints rare.
4. **Rebook Rate Metric**: Unique trust signal no competitor displays.
5. **AI Practitioner Focus**: Domain specialization in AI tools (Runway, Midjourney, Kling, Sora). Generalist platforms lack this focus.

## Sources

### Primary Competitors Analyzed
- [Toptal](https://www.toptal.com/) - Talent marketplace, top 3% vetting
- [Contra](https://contra.com/) - Commission-free freelance network, portfolio-focused
- [Clarity.fm](https://clarity.fm/) - Expert calls marketplace, per-minute billing
- [MentorCruise](https://mentorcruise.com/) - Subscription mentorship, async included
- [GrowthMentor](https://www.growthmentor.com/) - Startup mentorship, AI matching
- [ADPList](https://adplist.org/) - Free design mentorship, 38K+ mentors

### Industry Research
- [Rigby - 21 Services Marketplace Features](https://www.rigbyjs.com/blog/services-marketplace-features) - Marketplace feature checklist
- [GrowthMentor - How We Vet Mentors](https://www.growthmentor.com/blog/how-we-vet-growth-mentors/) - Vetting process best practices
- [Cobbleweb - Ratings and Reviews](https://www.cobbleweb.co.uk/marketplace-features/ratings-and-reviews/) - Trust systems in marketplaces
- [Qooper - Enterprise Mentoring](https://www.qooper.io/) - Enterprise L&D platform features

### Payment & Commission Models
- Clarity.fm: 15% commission
- MentorCruise: ~20% markup on mentor fees
- Toptal: High (undisclosed), premium positioning
- Contra: 0% (freemium model, monetizes through Pro subscriptions)
- Industry standard for curated marketplaces: 20-40%

---
*Feature research for: AI Practitioner/Expert Marketplace (Blast AI)*
*Researched: 2026-04-09*
