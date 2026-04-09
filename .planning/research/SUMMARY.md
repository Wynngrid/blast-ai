# Project Research Summary

**Project:** BLAST AI - AI Practitioner Marketplace
**Domain:** Two-sided marketplace (Enterprise booking platform for AI expertise)
**Researched:** 2026-04-09
**Confidence:** HIGH

## Executive Summary

BLAST AI is a two-sided marketplace connecting enterprises with vetted AI practitioners for structured learning sessions and project support. The research reveals that building successful marketplaces of this type requires solving the "chicken-and-egg" problem (seeding supply before demand), preventing disintermediation (practitioners and enterprises going around the platform), and establishing robust trust signals (vetting, ratings, rebook rates). The recommended approach is a Next.js 16 + Supabase stack with Razorpay (India-first) and Stripe (international) payment infrastructure, using Row Level Security for multi-tenant data isolation and Server Components for performance.

The critical success factors are: (1) seed practitioners first with complete profiles before enterprise outreach, (2) build enterprise dashboard value beyond simple matching to prevent disintermediation, (3) implement proper marketplace payment rails (Razorpay Route/Stripe Connect) from day one to avoid compliance nightmares, and (4) ensure timezone-aware booking with UTC storage and calendar sync to prevent missed sessions. The architecture follows a server-first pattern with client islands for interactivity, slot-based availability with conflict prevention, and destination charges for payment splits.

Key risks include RLS security holes (tables without policies exposing data across tenants), role-based access control explosion (adding ad-hoc roles instead of permission-based design), and practitioner vetting becoming theater rather than quality control. Mitigation requires strict RLS enforcement on all tables from day one, upfront role/permission architecture design, and explicit vetting criteria with ongoing quality monitoring through NPS, rebook rates, and session completion metrics.

## Key Findings

### Recommended Stack

The 2026-optimal stack for this marketplace is Next.js 16 (with stable Turbopack and Cache Components), Supabase (for Postgres + Auth + Realtime), and Razorpay/Stripe for payments. This stack provides enterprise-grade features with minimal operational overhead. Next.js 16's Server Components reduce JS bundle size and keep secrets server-side, while Supabase's Row Level Security enforces multi-tenant data isolation at the database level. Tailwind CSS 4.x with shadcn/ui provides a Linear-aesthetic component library with full code ownership.

**Core technologies:**
- **Next.js 16 + React 19**: Full-stack framework with Server Components, Turbopack for 50%+ faster builds, zero-config Vercel deployment
- **Supabase**: Backend-as-a-service with Postgres, Auth (OAuth + custom RBAC), Realtime, Storage, Edge Functions, and Row Level Security
- **Razorpay + Stripe**: India-first payments (Razorpay Route) for marketplace splits, international coverage (Stripe Connect) for global enterprises
- **shadcn/ui + Radix UI**: Copy-paste accessible components (not npm dependency), Tailwind v4 compatible, matches Linear aesthetic reference
- **Zustand + TanStack Query + nuqs**: Client state (3KB), server state with caching, and type-safe URL state for shareable filters
- **FullCalendar**: Availability management with drag-and-drop, resource scheduling, and enterprise-grade features
- **Resend + React Email**: Transactional emails with React component templates for booking confirmations and notifications

### Expected Features

The feature research identified 10 table stakes features (users expect these), 12 differentiators (competitive advantages), and 6 anti-features (commonly requested but problematic). The MVP for April 18 Masters' Union demo requires practitioner profiles, anonymous discovery, availability calendar, session booking flow, Razorpay payments, session briefs, email notifications, basic enterprise dashboard, practitioner portal, and ratings/reviews.

**Must have (table stakes):**
- **Practitioner Profiles**: Bio, specialization, experience, rates, tier badges (expected across all marketplaces like Toptal, MentorCruise)
- **Availability Calendar**: Real-time availability sync, integration points for Google/Outlook (every booking platform has this)
- **Session Booking Flow**: 3-step flow (select slot → submit brief → pay) completed in < 3 minutes
- **Secure Payments**: Escrow-style with Razorpay/Stripe, charge on booking, release after session completion
- **Search & Filtering**: Filter by specialization, industry, tier/price, availability; sort by rating and sessions completed
- **Ratings & Reviews**: Star ratings + NPS + written reviews as trust signals (58% of marketplace users expect this)
- **Basic Notifications**: Email confirmations, 24hr reminders, session completed, review requests
- **Practitioner Payout System**: Clear commission model (30-40% industry standard), payout schedules, earnings dashboard

**Should have (competitive advantage):**
- **Anonymous/Skill-First Profiles**: Hide names until booking to remove bias, emphasize vetting quality (no competitor does this well)
- **Enterprise Dashboard**: Self-serve team tracking, hours used vs purchased, session history, budget utilization (Toptal has account managers but no self-serve)
- **Tier Badge System**: Visual quality signals (Rising/Expert/Master) earned through vetting, reviews, and session volume
- **Sprint/Package Bookings**: Multi-session packages for structured upskilling (most competitors are single-session only)
- **Rebook Rate Display**: Unique trust metric showing "X% of clients rebook" on profiles (no competitor displays this)
- **Practitioner Vetting Display**: Transparent vetting process ("vetted through: portfolio review, technical interview, reference check")

**Defer (v2+):**
- **AI-Powered Matching**: Requires session outcome data to train recommendations (Phase 2)
- **Session Recordings/Summaries**: High complexity with consent workflows, AI-generated action items (Phase 2)
- **Enterprise SSO/SAML**: Only needed for 500+ employee accounts (Phase 3)
- **Progress Analytics/Heat Maps**: Skill progression tracking for L&D differentiation (Phase 2)
- **Built-in Video Conferencing**: Zoom/Meet already solved this; building video = massive complexity and reliability burden (anti-feature)

### Architecture Approach

The architecture follows a server-first Next.js App Router pattern with client islands for interactivity, Supabase Row Level Security for multi-tenant data isolation, and destination charges for marketplace payment splits. Route groups separate auth, platform (enterprise/practitioner), marketing, and admin concerns without affecting URLs. Server Components handle data fetching (zero client JS), Server Actions handle mutations (booking creation, profile updates), and Route Handlers process webhooks (payment confirmations).

**Major components:**
1. **Enterprise Dashboard (Client Components)**: Browse practitioners, manage bookings, track team progress with real-time updates via Supabase Realtime
2. **Practitioner Portal (Client Components)**: Manage availability calendar with drag-and-drop, view bookings, track earnings and session history
3. **Booking Engine (Server Actions + Route Handlers)**: Slot-based availability with conflict prevention using PostgreSQL exclusion constraints, atomic booking creation in transactions, webhook-driven payment confirmation
4. **Authentication & Authorization (Middleware + RLS)**: Supabase Auth with custom access token hooks for role injection into JWT, RLS policies enforce role-based access at database level (defense-in-depth), middleware refreshes sessions and protects routes
5. **Payment System (Razorpay Route + Stripe Connect)**: Destination charges where platform receives payment and automatically transfers to practitioner minus commission, handles TDS/GST compliance in India, proper invoice generation for enterprise procurement

### Critical Pitfalls

The pitfalls research identified 10 critical failures that kill marketplace startups, with specific prevention strategies for each phase of development.

1. **Chicken-and-Egg Death Spiral**: Trying to grow both practitioners and enterprises simultaneously leads to stalled growth. Prevention: Seed practitioners first (BLAST AI already has beta mentors), validate 10 transactions before scaling demand. Phase 1 must ensure practitioner onboarding works independently.

2. **Disintermediation (Going Around Platform)**: After first successful session, parties exchange contact info and book directly, losing all future revenue. Prevention: Build genuine platform value beyond matching (enterprise dashboard with team tracking, automated scheduling, invoicing, sprint package structures). Consider relationship-based pricing with lower commission on rebookings. Address in Phase 2-3.

3. **Supabase RLS Security Holes**: Tables without RLS enabled expose data across tenants. Prevention: Enable RLS on EVERY table immediately, create explicit policies before application code, test from client SDK (not SQL Editor which bypasses RLS), always use getUser() not getSession() for auth checks. Critical in Phase 1.

4. **Timezone Booking Chaos**: Storing times in local timezone causes missed sessions when practitioners and enterprises are in different zones. Prevention: Store ALL times in UTC, convert to user's timezone at display layer, show timezone explicitly ("10:00 AM IST (7:30 PM your time)"), test across DST transitions. Critical in Phase 2 booking flow.

5. **Payment Split Compliance Failures**: DIY payment splitting violates money transmission laws, leading to frozen accounts. Prevention: Use Razorpay Route (India) or Stripe Connect (international) from day one, never hold funds in platform account manually, maintain transaction records for audit, consult CA on TDS/GST compliance. Non-negotiable in Phase 2.

## Implications for Roadmap

Based on research, the suggested phase structure prioritizes foundation (auth + RLS + database schema), then practitioner supply, then booking/payment infrastructure, then enterprise features, and finally trust/quality systems. This order prevents the chicken-and-egg problem by ensuring practitioners can onboard before enterprises arrive, establishes security patterns before handling sensitive data, and validates core transactions before building advanced features.

### Phase 1: Foundation & Authentication
**Rationale:** Must establish security model, database schema with RLS, and authentication before any feature development. Supabase RLS security holes are the #1 technical pitfall—enabling RLS after tables have data is high-risk. Role-based access control must be designed upfront to prevent role explosion.

**Delivers:**
- Supabase project setup with Postgres database
- Complete database schema with RLS policies on all tables
- Authentication system (Google OAuth + email/password via Supabase Auth)
- Custom RBAC with role injection into JWT claims
- Middleware for session management and route protection
- Profile management for all user types

**Addresses (from FEATURES.md):**
- Table stakes: Authentication foundation for all other features
- Architecture: Server Components + Middleware + RLS patterns

**Avoids (from PITFALLS.md):**
- Pitfall #3: RLS security holes (by enabling on all tables from start)
- Pitfall #5: RBAC explosion (by designing role/permission model upfront)

### Phase 2: Practitioner Supply & Onboarding
**Rationale:** Chicken-and-egg problem demands seeding supply before demand. Practitioners must be able to create complete profiles and set availability even when zero enterprises exist. This allows BLAST AI to leverage existing beta mentors (Rishi, Pragya) before public launch.

**Delivers:**
- Practitioner onboarding flow with portfolio submission
- Profile creation (bio, specializations, industries, tools, tier)
- Availability calendar with FullCalendar (drag-and-drop time slots)
- Practitioner portal dashboard (upcoming sessions, earnings view)
- Admin approval console for vetting practitioners
- Tier badge system (Rising/Expert/Master)

**Addresses (from FEATURES.md):**
- Must have: Practitioner profiles, availability calendar
- Should have: Tier badge system, vetting display, anonymous profiles (implemented)

**Uses (from STACK.md):**
- FullCalendar for availability management
- shadcn/ui components for portal interface
- Supabase Storage for portfolio uploads

**Avoids (from PITFALLS.md):**
- Pitfall #1: Chicken-and-egg spiral (by enabling supply-side MVP first)
- Pitfall #8: Vetting theater (by defining explicit vetting criteria)

### Phase 3: Discovery & Booking Engine
**Rationale:** With practitioners seeded, build the core transaction flow. Booking engine is the highest-complexity feature requiring timezone handling, slot conflict prevention, and calendar integration. Must work perfectly before adding payments.

**Delivers:**
- Public practitioner browse page with search/filtering
- Anonymous skill-first discovery (names hidden until booking)
- Practitioner profile pages (public view)
- Session booking flow (slot selection → brief submission → confirmation)
- Timezone-aware scheduling (UTC storage, local display)
- Two-way Google Calendar integration
- Session brief collection ("What are you stuck on?")
- Email notifications (booking confirmation, 24hr reminders)

**Addresses (from FEATURES.md):**
- Must have: Search & filtering, session booking flow, session brief, notifications
- Should have: Anonymous discovery (core differentiator)

**Implements (from ARCHITECTURE.md):**
- Slot-based availability with PostgreSQL exclusion constraints
- Server Actions for booking mutations
- Conflict prevention with row-level locking

**Avoids (from PITFALLS.md):**
- Pitfall #4: Timezone chaos (by storing UTC, displaying in user's local time)
- Pitfall #9: Calendar integration failures (by implementing two-way sync)

### Phase 4: Payment Integration
**Rationale:** Payments are critical but defer until booking flow is validated to reduce complexity. Must use proper marketplace payment rails from day one to avoid compliance nightmares. Razorpay Route (India) is MVP; Stripe (international) can follow.

**Delivers:**
- Razorpay Route integration for India payments
- Destination charges (platform receives, auto-splits to practitioner)
- Payment confirmation via webhooks
- Transaction audit trail
- Practitioner earnings dashboard
- Payout schedule management
- Proper invoice generation for enterprise procurement

**Addresses (from FEATURES.md):**
- Must have: Secure payments, practitioner payout system

**Uses (from STACK.md):**
- Razorpay Route for marketplace payment splits
- Webhook signature verification for security
- Server Actions for payment initiation

**Avoids (from PITFALLS.md):**
- Pitfall #6: Payment compliance failures (by using Route, not DIY splits)
- Integration gotcha: Webhook idempotency handling

### Phase 5: Enterprise Dashboard & Team Management
**Rationale:** Enterprise features create platform stickiness to prevent disintermediation. Self-serve dashboard is a competitive differentiator (Toptal has account managers, MentorCruise lacks enterprise features). Build after core transactions validated.

**Delivers:**
- Enterprise dashboard (team overview, session history)
- Team member management (add/remove members)
- Budget tracking (hours purchased vs used)
- Session history with filtering
- Multi-seat booking for team members
- Role-based dashboard views (admin vs member)

**Addresses (from FEATURES.md):**
- Must have: Enterprise dashboard (basic)
- Should have: Team tracking, hours utilization (differentiator)

**Implements (from ARCHITECTURE.md):**
- Real-time updates via Supabase Realtime
- Aggregated queries for team progress
- Role-based views to avoid information overload

**Avoids (from PITFALLS.md):**
- Pitfall #2: Disintermediation (by creating platform value beyond matching)
- Pitfall #7: Dashboard information overload (by using progressive disclosure)

### Phase 6: Trust & Quality Systems
**Rationale:** Post-session feedback and quality metrics close the loop, enabling reputation signals that improve matching over time. Reviews and rebook rates are table stakes for marketplace trust. Build after first real sessions completed.

**Delivers:**
- Post-session review collection (star rating + NPS + comment)
- Practitioner stats aggregation (average rating, sessions completed)
- Rebook rate calculation and display (unique differentiator)
- Session completion tracking
- Quality monitoring alerts for admin
- Review display on practitioner profiles

**Addresses (from FEATURES.md):**
- Must have: Ratings & reviews
- Should have: Rebook rate display (unique metric)

**Implements (from ARCHITECTURE.md):**
- Automated review request emails via Resend
- Stats calculation with caching for performance
- Quality signals for future AI matching

**Avoids (from PITFALLS.md):**
- Pitfall #8: Vetting theater (by implementing ongoing quality monitoring)

### Phase Ordering Rationale

- **Foundation first**: RLS and auth must be correct before handling user data. Retrofitting RLS is high-risk.
- **Supply before demand**: Practitioners must onboard independently to avoid chicken-and-egg spiral. BLAST AI's beta mentors enable this.
- **Booking before payments**: Validate core transaction flow works (timezone handling, calendar sync) before adding payment complexity.
- **Payments before enterprise features**: Core revenue mechanism must work before investing in retention features.
- **Enterprise dashboard before trust systems**: Prevent disintermediation by building platform value early.
- **Trust systems last**: Require actual sessions to generate reviews and rebook rates. Premature optimization.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4 (Payments)**: Razorpay Route setup details, TDS/GST compliance specifics, webhook testing strategies. Research tax implications with CA.
- **Phase 3 (Booking)**: Google Calendar OAuth scopes, two-way sync implementation patterns, DST handling edge cases. May need API-specific research.
- **Phase 6 (Trust Systems)**: NPS calculation methodologies, rebook rate definitions (same practitioner? within timeframe?), quality threshold tuning.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation)**: Supabase Auth + RLS is well-documented with official Next.js App Router guides. Follow Supabase SSR package patterns.
- **Phase 2 (Practitioner Supply)**: CRUD operations with file uploads are standard. FullCalendar has comprehensive React documentation.
- **Phase 5 (Enterprise Dashboard)**: Data aggregation and role-based views follow established patterns. TanStack Query for caching is well-documented.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Next.js 16, Supabase, Razorpay/Stripe all have official docs, active communities, and 2026 best practices verified. Version compatibility matrix complete. |
| Features | MEDIUM-HIGH | Table stakes identified from 6 competitor analyses (Toptal, Contra, Clarity.fm, MentorCruise, GrowthMentor, ADPList). Differentiators validated against market gaps. Anti-features backed by marketplace failure patterns. |
| Architecture | HIGH | Patterns verified from Supabase RLS docs, Next.js App Router structure guides, Stripe/Razorpay marketplace documentation. Database schema follows appointment scheduling best practices. |
| Pitfalls | HIGH | Each pitfall sourced from multiple references: marketplace failure analyses, Supabase common mistakes, payment compliance guides, booking system gotchas. Prevention strategies tested in production systems. |

**Overall confidence:** HIGH

### Gaps to Address

Research was comprehensive but some areas need validation during implementation:

- **Razorpay Route TDS Compliance**: Documentation exists but India-specific tax handling for marketplace payouts needs CA consultation. Handle during Phase 4 planning with tax professional review.

- **Anonymous Profile UX**: No direct competitor implements skill-first discovery well. This differentiator needs UX iteration. Plan for user testing during Phase 2 to validate "reveal on booking" flow doesn't create friction.

- **Sprint Package Pricing**: Research shows demand exists (GrowthMentor has packages) but optimal pricing structure (bulk discount %, milestone-based vs upfront) needs market validation. Defer to Phase 6+ after single-session pricing validated.

- **Calendar Sync Edge Cases**: Two-way Google Calendar sync has documented patterns but handling practitioner's existing events, buffer time preferences, and concurrent booking attempts across multiple enterprises needs careful testing. Allocate extra QA time in Phase 3.

- **International Payment Timing**: Stripe Connect adds complexity over Razorpay Route. If international enterprise interest emerges pre-launch, may need to accelerate Stripe integration. Keep Phase 4 flexible.

## Sources

### Primary Sources (HIGH confidence)

**Technology Stack:**
- [Next.js 16 Release Blog](https://nextjs.org/blog/next-16) — Turbopack stable, Cache Components, React 19 integration
- [Next.js 16.1 Release](https://nextjs.org/blog/next-16-1) — Performance improvements, bundle analyzer
- [Supabase RLS Documentation](https://supabase.com/docs/guides/database/postgres/row-level-security) — Multi-tenant security patterns
- [Supabase RBAC Guide](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac) — Custom claims for role injection
- [Supabase Next.js SSR Setup](https://supabase.com/docs/guides/auth/server-side/nextjs) — Official App Router integration
- [Stripe Connect Destination Charges](https://docs.stripe.com/connect/destination-charges) — Marketplace payment architecture
- [Razorpay Route Documentation](https://razorpay.com/route/) — India marketplace payment splits
- [shadcn/ui Tailwind v4](https://ui.shadcn.com/docs/tailwind-v4) — React 19 + Tailwind v4 compatibility

**Feature Research:**
- Competitor analysis: Toptal, Contra, Clarity.fm, MentorCruise, GrowthMentor, ADPList (marketplace product pages)
- [Rigby - 21 Services Marketplace Features](https://www.rigbyjs.com/blog/services-marketplace-features) — Feature checklist for service marketplaces
- [Cobbleweb - Ratings and Reviews](https://www.cobbleweb.co.uk/marketplace-features/ratings-and-reviews/) — Trust systems in marketplaces
- [GrowthMentor - Vetting Mentors](https://www.growthmentor.com/blog/how-we-vet-growth-mentors/) — Practitioner vetting best practices

**Architecture Patterns:**
- [Next.js App Router Project Structure](https://nextjs.org/docs/app/getting-started/project-structure) — Official folder organization
- [MakerKit RLS Best Practices](https://makerkit.dev/blog/tutorials/supabase-rls-best-practices) — Production RLS patterns
- [Database Model for Appointment Scheduling](https://www.red-gate.com/blog/a-database-model-to-manage-appointments-and-organize-schedules/) — Slot-based availability architecture
- [Sharetribe Marketplace Payments](https://www.sharetribe.com/academy/marketplace-payments/) — Payment flow design

**Pitfalls & Common Mistakes:**
- [NFX: 19 Tactics for Chicken-or-Egg](https://www.nfx.com/post/19-marketplace-tactics-for-overcoming-the-chicken-or-egg-problem) — Two-sided marketplace cold start
- [Sharetribe: Preventing Disintermediation](https://www.sharetribe.com/academy/how-to-discourage-people-from-going-around-your-payment-system/) — Marketplace leakage prevention
- [I Love Blogs: Next.js + Supabase Mistakes](https://www.iloveblogs.blog/post/nextjs-supabase-common-mistakes) — Common integration errors
- [ProsperaSoft: RLS Misconfigurations](https://prosperasoft.com/blog/database/supabase/supabase-rls-issues/) — Security pitfalls
- [Cal.com Timezone Bug](https://github.com/calcom/cal.com/issues/16017) — Real-world timezone handling issues

### Secondary Sources (MEDIUM confidence)

- [Stripe Next.js Guide 2026](https://dev.to/sameer_saleem/the-ultimate-guide-to-stripe-nextjs-2026-edition-2f33) — Integration patterns (community, not official)
- [Zustand vs Redux 2026](https://medium.com/@abdurrehman1/state-management-in-2026-redux-vs-zustand-vs-context-api-ad5760bfab0b) — State management comparison
- [FullCalendar vs react-big-calendar](https://bryntum.com/blog/react-fullcalendar-vs-big-calendar/) — Calendar library evaluation
- [WorkOS: Multi-Tenant RBAC](https://workos.com/blog/how-to-design-multi-tenant-rbac-saas) — Role design patterns
- [Orb: Enterprise Billing Guide](https://www.withorb.com/blog/enterprise-billing) — Subscription billing complexity

### Tertiary Sources (LOW confidence, needs validation)

- [Joe Procopio: Why Expert Marketplaces Fail](https://jproco.medium.com/why-expert-two-sided-marketplace-startups-rarely-succeed-dc9fcffa046d) — Marketplace failure analysis (anecdotal but insightful)
- [Startups.com: 14 Marketplace Mistakes](https://www.startups.com/articles/14-marketplace-mistakes-that-are-killing-your-startup) — Common pitfalls (listicle but backed by examples)

---
*Research completed: 2026-04-09*
*Ready for roadmap: YES*
