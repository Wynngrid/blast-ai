# Pitfalls Research

**Domain:** AI Practitioner Marketplace (Expert booking, enterprise dashboards, role-based auth, payment splits)
**Researched:** 2026-04-09
**Confidence:** HIGH (multiple sources verified for each pitfall)

## Critical Pitfalls

### Pitfall 1: The Chicken-and-Egg Death Spiral

**What goes wrong:**
Platform launches with balanced focus on both practitioners and enterprises. Neither side finds value because the other side is empty. Growth stalls before any transactions occur.

**Why it happens:**
Teams spend months building features instead of getting users. They try to grow both sides simultaneously rather than seeding one side first. The "launch big" mentality spreads resources too thin.

**How to avoid:**
- Seed supply (practitioners) first. Blast AI already has beta mentors (Rishi, Pragya, etc.)
- Don't need perfect balance -- need 10 transactions to start flywheel
- Focus geographically (Masters' Union Summit is good constraint)
- Single-player mode for practitioners: let them set up profiles before any buyers exist

**Warning signs:**
- Equal marketing spend on both sides
- "We'll launch when we have X practitioners AND Y enterprises"
- No transactions after 2 weeks of having both sides
- Practitioners leaving because no bookings

**Phase to address:**
Phase 1 (Foundation). Ensure practitioner onboarding and profiles work independently of enterprise demand. Validate supply is ready before investing in demand acquisition.

---

### Pitfall 2: Disintermediation (Going Around the Platform)

**What goes wrong:**
After first successful session, practitioner and enterprise exchange contact info and book directly. Platform loses all future revenue from that relationship.

**Why it happens:**
30-40% commission feels high once trust is established. Video calls happen on Zoom/Meet (external tools). Nothing prevents email/LinkedIn exchange during sessions.

**How to avoid:**
- Make platform genuinely valuable beyond matching:
  - Enterprise dashboard with team progress tracking
  - Automated scheduling across timezones
  - Invoicing/receipts that enterprises need for L&D budgets
  - Sprint package structures that are annoying to replicate manually
- Filter contact info in session briefs (detect emails, phone numbers)
- Consider relationship-based pricing: lower commission on rebookings
- Session history and skill tracking as moat for practitioners

**Warning signs:**
- One-time bookings only (no rebookings through platform)
- Session briefs containing contact details
- Practitioners with high ratings but zero rebookings
- Enterprises booking many practitioners once each

**Phase to address:**
Phase 2-3. MVP may accept some leakage. But core dashboard value (progress tracking, budget utilization) should be built early to create switching costs.

---

### Pitfall 3: Supabase RLS Security Holes

**What goes wrong:**
Data leaks between tenants. Enterprise A sees Enterprise B's team data. Practitioners access other practitioners' earnings. Or worse: tables left without RLS enabled, exposing all data via anon key.

**Why it happens:**
- RLS is disabled by default on new tables (must enable manually)
- Enabling RLS without creating policies = all queries return empty (silent failure)
- Views bypass RLS by default
- Testing with SQL Editor (which bypasses RLS) gives false confidence
- `getSession()` trusted instead of `getUser()` for auth checks

**How to avoid:**
- Enable RLS on EVERY table immediately after creation
- Create explicit policies before writing any application code
- Test from client SDK, never from SQL Editor alone
- Use `auth.uid()` for user-scoped data, always scope by tenant
- Never trust `user_metadata` in JWT (user-modifiable)
- Index all columns used in RLS policies (performance)
- Use `getUser()` not `getSession()` for server-side auth checks

**Warning signs:**
- Empty query results with no errors
- Performance degradation as data grows (missing indexes on policy columns)
- "Works in SQL Editor but not in app"
- Tables created without immediate `ENABLE ROW LEVEL SECURITY`

**Phase to address:**
Phase 1 (Foundation). Establish RLS patterns in database schema from day one. Document and enforce in all migrations.

---

### Pitfall 4: Timezone Booking Chaos

**What goes wrong:**
Practitioner in IST sets availability for 10 AM. US enterprise books what they think is 10 AM PST. Confirmation email shows wrong time. Someone shows up 12 hours early/late or misses entirely.

**Why it happens:**
- Storing times in local timezone rather than UTC
- Not displaying times in viewer's local timezone
- Calendar sync issues between platforms (Google Calendar, Outlook, Apple)
- DST transitions causing hour shifts
- "Business timezone" vs "user timezone" conflicts

**How to avoid:**
- Store ALL times in UTC in database
- Convert to user's local timezone only at display layer
- Show timezone explicitly: "10:00 AM IST (7:30 PM your time)"
- Include timezone in all calendar invites and emails
- Test with practitioners and enterprises in different timezones
- Handle DST transitions (test dates around March/November)

**Warning signs:**
- Session briefs mentioning "what timezone?"
- Missed sessions in first international bookings
- Calendar syncs showing different times than platform
- Support tickets about wrong meeting times

**Phase to address:**
Phase 2 (Booking Flow). Critical to get right before any cross-timezone usage. Build UTC-first from start, display conversion at end.

---

### Pitfall 5: Role-Based Access Control Explosion

**What goes wrong:**
Starts with 3 roles (enterprise_buyer, practitioner, admin). Six months later: enterprise_admin, enterprise_viewer, enterprise_manager, practitioner_pending, practitioner_verified, super_admin... Permissions scattered across codebase. No one knows who can access what.

**Why it happens:**
- Ad-hoc role additions for specific customer requests
- Permissions embedded in application code rather than centralized
- No tenant scoping (roles apply globally instead of per-organization)
- Conflating authentication (who are you?) with authorization (what can you do?)

**How to avoid:**
- Design role model upfront with extension points:
  ```
  Roles: enterprise_admin, enterprise_member, practitioner, platform_admin
  Permissions: separate from roles, assigned to roles
  Scope: always tenant-scoped (which enterprise? which practitioner profile?)
  ```
- Centralize all permission checks in one module
- Actor + Action + Resource pattern: (user + tenant) -> action -> tenant-scoped resource
- Audit permissions periodically: "Who has access to what?"

**Warning signs:**
- Permission checks duplicated across multiple files
- Roles named after specific customers/use cases
- "Just add a new role" as default solution
- Questions like "Can [role] do [action]?" require code review to answer

**Phase to address:**
Phase 1 (Foundation). Define role/permission architecture before building features. Easier to expand than to refactor.

---

### Pitfall 6: Payment Split Compliance Failures

**What goes wrong:**
Platform collects payment, holds funds, splits to practitioner. Unknowingly violates money transmission laws. Razorpay/Stripe freezes account. Practitioners can't get paid. Enterprises demand refunds.

**Why it happens:**
- DIY payment splitting instead of using proper Connect/Route products
- Not understanding that moving money between parties has legal requirements
- Missing TDS/GST compliance in India
- Refund flows not accounting for split payments (who pays what back?)
- No documentation of payment flows for compliance audits

**How to avoid:**
- Use Razorpay Route (India) or Stripe Connect (international) from day one
- Route handles compliance: TDS deduction, GST, fund splitting
- Never hold funds in platform account manually
- Design refund flow explicitly: proportional pullback from each recipient
- Maintain transaction records for audit
- Consult with CA on India-specific compliance (TDS on professional services)

**Warning signs:**
- Manual bank transfers to practitioners
- Platform bank account holding session payments
- Refunds failing due to insufficient seller balance
- No TDS certificates being generated

**Phase to address:**
Phase 2 (Payments). Non-negotiable: use proper marketplace payment rails. Don't build custom splitting.

---

### Pitfall 7: Enterprise Dashboard Information Overload

**What goes wrong:**
Dashboard shows every possible metric: sessions booked, sessions completed, hours used, hours remaining, budget spent, budget remaining, NPS per practitioner, NPS per team member, completion rates, rebook rates... Users can't find what they need.

**Why it happens:**
- Designing for internal stakeholders ("sales wants this metric visible")
- Adding metrics without removing old ones
- One-size-fits-all dashboard for admins, managers, and team members
- Confusing "everything accessible" with "good UX"

**How to avoid:**
- Role-based views: Admin sees budget/billing, Manager sees team progress, Member sees their sessions
- Prioritize ruthlessly: What decision does this metric inform?
- Progressive disclosure: summary at top, details on drill-down
- Empty states that guide action ("No sessions booked -- find a practitioner")
- User testing with actual enterprise L&D heads

**Warning signs:**
- Users asking "where do I find X?" for common tasks
- Support tickets about dashboard navigation
- Low dashboard engagement (people book but don't check progress)
- Feature requests for metrics that already exist (buried)

**Phase to address:**
Phase 3 (Enterprise Dashboard). Build minimal dashboard first, add metrics based on user requests not assumptions.

---

### Pitfall 8: Practitioner Vetting Theater

**What goes wrong:**
"Vetted practitioners" becomes marketing copy rather than real quality control. Fake profiles slip through. One bad session destroys enterprise trust. Platform becomes indistinguishable from generic freelance marketplaces.

**Why it happens:**
- Pressure to onboard supply quickly (chicken-egg problem)
- Manual vetting doesn't scale
- No clear vetting criteria ("has shipped AI work" is vague)
- No ongoing quality monitoring after initial approval

**How to avoid:**
- Define explicit vetting criteria:
  - Portfolio of shipped work (links, not claims)
  - Technical interview or sample session
  - LinkedIn verification
  - Reference from existing practitioner (network effect)
- Implement quality signals that update over time:
  - NPS after each session
  - Rebook rate (strongest signal)
  - Session completion rate
- Tiered practitioners: Rising (new) -> Verified (proven) -> Expert (top performers)
- Kill switch: ability to deactivate practitioners quickly if issues arise

**Warning signs:**
- Practitioners approved with no portfolio links
- Approval rate > 80% (not selective enough)
- No post-session feedback collection
- Quality complaints from enterprises

**Phase to address:**
Phase 1 (Practitioner Profiles). Manual vetting is fine for MVP scale, but define criteria clearly. Build feedback collection early.

---

### Pitfall 9: Booking Calendar Integration Failures

**What goes wrong:**
Practitioner's availability doesn't sync with their actual calendar. Double-bookings occur. Enterprise books slot that's already taken. Practitioner looks unprofessional. Enterprise loses trust.

**Why it happens:**
- Building custom availability system instead of syncing with real calendars
- One-way sync (platform reads calendar but doesn't write to it)
- Stale availability data (not real-time)
- Buffer time not accounted for (back-to-back sessions)

**How to avoid:**
- Two-way calendar sync from the start (Google Calendar, Outlook)
- Real-time availability checks at booking time, not just display time
- Built-in buffer time between sessions (configurable, default 15min)
- Confirmation flow: practitioner can accept/decline within time window
- Automatic calendar block creation when booking confirmed

**Warning signs:**
- Practitioners manually updating availability in multiple places
- Double-booking incidents
- "My calendar shows different availability"
- No-shows because practitioner forgot about booking

**Phase to address:**
Phase 2 (Booking Flow). Calendar sync is core to scheduling products. Don't defer this.

---

### Pitfall 10: Subscription/Retainer Billing Complexity

**What goes wrong:**
Enterprise buys annual retainer. Uses 60% of hours in 3 months. Wants to add seats mid-cycle. Billing system can't prorate. Finance team needs invoice that doesn't exist. Platform loses enterprise because admin overhead is too high.

**Why it happens:**
- Building simple payment flow first, bolting on subscription later
- Not considering: upgrades, downgrades, mid-cycle changes, prorations
- Separate systems for one-time payments vs. subscriptions
- Invoicing as afterthought (enterprises need proper invoices for procurement)

**How to avoid:**
- Use Razorpay/Stripe subscription features rather than building custom
- Design for enterprise billing requirements from start:
  - Proper invoices with GST/tax details
  - PO number support
  - Multi-seat plans with prorated changes
  - Usage tracking against purchased hours
- Dunning management (automated retry on failed payments)
- Consider starting with simpler model: pay-per-session until subscription patterns clear

**Warning signs:**
- Manual invoice generation requests
- Finance asking for "proper invoice format"
- Mid-cycle changes requiring manual adjustment
- Churn due to billing friction (not product issues)

**Phase to address:**
Phase 2-3. MVP can use simpler pay-per-session. Subscription/retainer adds significant complexity. Build only when enterprise demand is validated.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Storing times in local timezone | Simpler initial code | Nightmare with international users | Never |
| Skipping RLS for "internal tables" | Faster development | Security breach waiting to happen | Never |
| Hardcoded roles in code | Quick feature delivery | Role explosion, unmaintainable auth | Only if < 3 roles forever |
| Manual payment splits | Avoid Razorpay Route setup | Compliance violations, frozen accounts | Never |
| Single dashboard for all users | One view to build | Information overload, low engagement | MVP only, refactor in Phase 3 |
| No calendar sync (manual availability) | Simpler booking flow | Double-bookings, practitioner frustration | MVP only if domestic-only |
| Session feedback as optional | Higher completion rate | No quality signals, can't improve matching | Never |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Razorpay Route | Using regular payments API then manually transferring to practitioners | Set up Route from start; automatic splits on every payment |
| Stripe Connect | Skipping onboarding verification | Use hosted onboarding; handle verification failures gracefully |
| Google Calendar | Read-only sync | Two-way sync; block time when booked, free time when cancelled |
| Supabase Auth | Using deprecated `@supabase/auth-helpers` | Use `@supabase/ssr` package for Next.js App Router |
| Supabase Auth | Trusting `getSession()` for server-side protection | Always use `getUser()` which validates with Supabase server |
| Razorpay/Stripe Webhooks | No idempotency handling | Store processed webhook IDs; handle duplicate delivery |
| OAuth (Google) | No error handling for denied permissions | Graceful fallback; explain why permissions needed |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| RLS policies without indexes | Slow queries as data grows | Index ALL columns in WHERE clauses of RLS policies | 1,000+ rows in table |
| Loading all practitioners on browse | Slow initial page load | Pagination, infinite scroll, search-first UX | 100+ practitioners |
| Full availability calculation on every view | Slow booking page | Cache availability, invalidate on calendar change | 50+ practitioners with complex schedules |
| Storing session recordings in database | Database bloat, slow backups | External storage (S3/Cloudflare R2) with signed URLs | Any recording storage (out of MVP scope, but plan for it) |
| No-limit search queries | Timeout on large result sets | Always limit results, implement cursor pagination | 10,000+ sessions in history |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Session briefs visible to all practitioners | Confidential business info exposed | RLS: briefs visible only to booked practitioner |
| Practitioner earnings visible to other practitioners | Privacy violation, competitive issues | RLS: earnings scoped to own profile |
| Enterprise team data visible across enterprises | Major data breach | Strict tenant isolation in all queries |
| Admin routes without server-side verification | Client-side auth bypass | Verify roles server-side for all admin operations |
| Webhook endpoints without signature verification | Fake payment confirmations | Verify Razorpay/Stripe webhook signatures |
| No rate limiting on booking | Slot hoarding, abuse | Rate limit bookings per user per hour |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Requiring account before browsing | Enterprises can't evaluate practitioners | Public browse, auth required only for booking |
| No empty states | Confusion when no data exists | Guide users: "No sessions yet -- find a practitioner" |
| Booking flow longer than 3 steps | Abandonment | Select slot -> Submit brief -> Pay -> Done |
| Calendar showing practitioner's timezone only | International users calculate manually | Always show times in viewer's local timezone |
| Session brief as free-text only | Vague briefs, poor session prep | Guided questions: "What are you stuck on? What's your current setup?" |
| No booking confirmation beyond email | Users unsure if booking worked | In-app confirmation page, calendar invite, email |
| Practitioner approval status unclear | Applicants ghost platform | Clear status: Applied -> Under Review -> Approved/Rejected with feedback |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Booking flow:** Often missing timezone display, buffer time between sessions, cancellation policy enforcement
- [ ] **Payment integration:** Often missing webhook idempotency, refund flows, failed payment handling, proper invoices
- [ ] **Practitioner profiles:** Often missing portfolio verification, availability sync, tier/badge logic
- [ ] **Enterprise dashboard:** Often missing export functionality, multi-seat management, role-based views
- [ ] **Authentication:** Often missing session refresh, logout from all devices, account deletion flow
- [ ] **RLS policies:** Often missing indexes on policy columns, UPDATE policies (need both USING and WITH CHECK)
- [ ] **Calendar integration:** Often missing two-way sync, DST handling, buffer time blocking
- [ ] **Search/browse:** Often missing pagination, filters, sorting, empty state handling

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| RLS not enabled | HIGH | Audit all tables immediately; enable RLS; create policies; test thoroughly; notify affected users if breach occurred |
| Timezone bugs causing missed sessions | MEDIUM | Immediate user communication; offer rebooking; fix UTC storage; migrate existing data |
| Disintermediation discovered | LOW | Add platform value features; adjust commission; accept some loss as cost of validation |
| Role explosion | MEDIUM | Audit existing roles; consolidate into permission-based model; migrate users; deprecate old roles |
| Double-bookings | MEDIUM | Apologize to both parties; offer free rebooking; implement real-time availability locking |
| Payment compliance issues | HIGH | Engage legal/CA immediately; migrate to proper Route/Connect; may need to pause payments temporarily |
| Dashboard information overload | LOW | User research to identify key metrics; redesign with role-based views; ship incrementally |
| Bad practitioner quality | MEDIUM | Remove practitioner; apologize to enterprise; tighten vetting criteria; implement quality monitoring |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Chicken-and-egg spiral | Phase 1: Focus on practitioner onboarding first | 5+ practitioners with complete profiles before enterprise outreach |
| Disintermediation | Phase 2-3: Build dashboard value | Rebook rate > 30% through platform |
| Supabase RLS holes | Phase 1: Database foundation | Every table has RLS enabled with tested policies |
| Timezone chaos | Phase 2: Booking flow | Successful cross-timezone booking test (IST + US timezone) |
| RBAC explosion | Phase 1: Auth architecture | Role model documented; centralized permission checks |
| Payment compliance | Phase 2: Payment integration | Using Razorpay Route/Stripe Connect; no manual transfers |
| Dashboard overload | Phase 3: Enterprise dashboard | User testing shows < 3 clicks to key metrics |
| Vetting theater | Phase 1: Practitioner flow | Explicit vetting criteria documented; feedback collection active |
| Calendar integration failures | Phase 2: Booking flow | Two-way Google Calendar sync working |
| Subscription complexity | Phase 3: If needed | Start with pay-per-session; add subscriptions only when validated |

## Sources

**Two-Sided Marketplaces & Chicken-Egg Problem:**
- [Sharetribe Marketplace Glossary](https://www.sharetribe.com/marketplace-glossary/chicken-and-egg-problem/)
- [NFX: 19 Tactics for Chicken-or-Egg Problem](https://www.nfx.com/post/19-marketplace-tactics-for-overcoming-the-chicken-or-egg-problem)
- [Startups.com: 14 Marketplace Mistakes](https://www.startups.com/articles/14-marketplace-mistakes-that-are-killing-your-startup)
- [Joe Procopio: Why Expert Two-Sided Marketplaces Rarely Succeed](https://jproco.medium.com/why-expert-two-sided-marketplace-startups-rarely-succeed-dc9fcffa046d)

**Disintermediation:**
- [Sharetribe Academy: How to Prevent Marketplace Leakage](https://www.sharetribe.com/academy/how-to-discourage-people-from-going-around-your-payment-system/)
- [LatentView: Preventing Disintermediation](https://www.latentview.com/blog/how-to-prevent-disintermediation-at-the-marketplace/)
- [A Crowded Space: Disintermediation in Marketplaces](https://acrowdedspace.com/post/28387454995/disintermediation-its-a-bitch)

**Supabase RLS:**
- [Supabase Docs: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Design Revision: Supabase RLS Guide](https://designrevision.com/blog/supabase-row-level-security)
- [ProsperaSoft: RLS Misconfigurations](https://prosperasoft.com/blog/database/supabase/supabase-rls-issues/)
- [I Love Blogs: 10 Common Next.js + Supabase Mistakes](https://www.iloveblogs.blog/post/nextjs-supabase-common-mistakes)

**Booking & Scheduling:**
- [Booknetic: Booking Software Mistakes](https://www.booknetic.com/blog/mistakes-selecting-appointment-booking-software)
- [KliknRoll: Common Booking Mistakes 2025](https://kliknroll.com/common-booking-mistake-in-2025/)
- [Cal.com Issue: Timezone Booking Bug](https://github.com/calcom/cal.com/issues/16017)

**Payment Splits & Compliance:**
- [Sharetribe Academy: Marketplace Payments Guide](https://www.sharetribe.com/academy/marketplace-payments/)
- [Stripe: Split Payments Implementation](https://stripe.com/resources/more/how-to-implement-split-payment-systems-what-businesses-need-to-do-to-make-it-work)
- [Razorpay Route Documentation](https://razorpay.com/route/)
- [Stripe Connect: Refunds and Disputes](https://docs.stripe.com/connect/marketplace/tasks/refunds-disputes)

**RBAC & Multi-Tenancy:**
- [WorkOS: Multi-Tenant RBAC Design](https://workos.com/blog/how-to-design-multi-tenant-rbac-saas)
- [TechoSquare: RBAC for Multi-Tenant Apps](https://www.techosquare.com/blog/rbac-for-multi-tenant-apps)
- [Permit.io: Multi-Tenant Authorization Best Practices](https://www.permit.io/blog/best-practices-for-multi-tenant-authorization)

**Enterprise Dashboards:**
- [Groto: SaaS UX Best Practices](https://www.letsgroto.com/blog/saas-ux-best-practices-how-to-design-dashboards-users-actually-understand)
- [UX Collective: Thoughtful B2B Dashboards](https://uxdesign.cc/design-thoughtful-dashboards-for-b2b-saas-ff484385960d)
- [Raw Studio: UX for SaaS 2025](https://raw.studio/blog/ux-for-saas-in-2025-what-top-performing-dashboards-have-in-common/)

**Practitioner Vetting & Fraud:**
- [MultiVendorX: Seller Verification](https://multivendorx.com/blog/earn-customer-trust-with-seller-verification/)
- [RST Software: Marketplace Fraud Prevention](https://www.rst.software/blog/marketplace-fraud-detection-and-prevention-best-practices)
- [Gray Falkon: Weak Vetting Risks](https://grayfalkon.com/weak-vetting-big-risks-how-lax-marketplace-verification-of-sellers-fuels-counterfeits-and-gray-market-activity/)

**Enterprise Billing:**
- [Orb: Enterprise Billing Guide](https://www.withorb.com/blog/enterprise-billing)
- [PayPro Global: Enterprise Billing](https://payproglobal.com/answers/what-is-saas-enterprise-billing/)

---
*Pitfalls research for: Blast AI - AI Practitioner Marketplace*
*Researched: 2026-04-09*
