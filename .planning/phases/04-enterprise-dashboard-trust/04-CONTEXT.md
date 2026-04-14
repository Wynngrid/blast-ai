# Phase 4: Enterprise Dashboard & Trust - Context

**Gathered:** 2026-04-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Enterprises can manage team sessions, track AI adoption progress, and practitioners accumulate trust signals. This phase delivers the enterprise dashboard (team overview, progress tracking, session history), the review/rating system (multi-criteria + NPS), review display on practitioner profiles and cards, practitioner review insights in portal, manager reporting with AI-generated insights, and the "Rebook" CTA for quick rebooking. It does NOT include per-team-member tracking, sprint packages, or international payments — those are v2.

</domain>

<decisions>
## Implementation Decisions

### Enterprise Dashboard Layout
- **D-01:** Tabbed navigation — Overview | Sessions | Budget tabs. Linear-style, clean, each tab focuses on one concern.
- **D-02:** Focus on AI adoption insights, NOT financial metrics — Dashboard emphasizes learning outcomes and team upskilling progress over coin balance and spending.
- **D-03:** Aggregate company stats only for MVP — No per-team-member breakdown. Individual tracking deferred to v2.

### Session Outcome Tracking
- **D-04:** Self-reported progress with multi-select tags + notes — After each session, enterprise marks outcomes:
  - Tags (multi-select): "Skill learned", "Blocker resolved", "Need follow-up", "Not helpful"
  - Notes (optional): Free-form text field for additional context
- **D-05:** Outcome data feeds dashboard insights — Aggregated outcomes power the Overview tab visualizations and AI-generated insights.

### Review Collection
- **D-06:** Mandatory immediately after session — Full-screen modal appears when session completes. Enterprise cannot navigate away until review is submitted.
- **D-07:** Multi-criteria rating system:
  - Communication (1-5 stars)
  - Expertise (1-5 stars)
  - Helpfulness (1-5 stars)
  - Overall rating (calculated or explicit)
- **D-08:** Written comment required for low scores — If overall/NPS ≤ 6, comment is required. Otherwise optional. Captures the "why" for negative experiences.

### Review Display
- **D-09:** Public reviews — All reviews visible to enterprises browsing practitioner profiles. Standard marketplace trust signal.
- **D-10:** Curated highlights on profile — Show 3-5 best reviews prominently on practitioner profile. Full list available in expandable section. Favors premium positioning.
- **D-11:** Score + count on browse cards — Practitioner cards show "4.8 ★ (23 reviews)" only. Clean, scannable. Click for full reviews.

### Rebook Flow
- **D-12:** Rebook CTA everywhere relevant:
  - Session history list
  - After review submission (modal completion)
  - Booking confirmation email
  - Practitioner profile page
- **D-13:** Pre-fills practitioner + duration only — Requires fresh session brief. Each session likely has different needs.

### Practitioner Review View (MENT-04)
- **D-14:** Two access points:
  - Dedicated "Reviews" tab in portal sidebar (Home | Profile | Availability | Sessions | Reviews | Earnings)
  - Summary stats on Home dashboard (quick glance)
- **D-15:** Comprehensive insights for practitioners:
  - Aggregate scores (overall, per-criteria breakdowns)
  - Trends over time (month-over-month rating chart)
  - Actionable feedback highlights (what enterprises praise/criticize most)

### Manager Reporting
- **D-16:** Two sharing mechanisms:
  - Exportable PDF report (one-click generation for manual sharing)
  - Automated email digest (weekly/monthly to specified recipients)
- **D-17:** Report content:
  - Executive summary: sessions this period, skills covered, % positive outcomes
  - AI-generated insights (stretch goal)

### AI Upskiller Agent (Stretch Goal)
- **D-18:** AI-powered org-level insights using Claude API (Anthropic):
  - Analyzes session briefs, outcomes, and patterns across organization
  - Identifies common AI problem statements team is facing
  - Provides recommendations: positives, negatives, upskilling priorities
  - Suggests ideas for next learning focus areas
- **D-19:** Data infrastructure built regardless — Even if AI integration delayed, session outcomes and briefs collected for future AI enhancement.

### Claude's Discretion
- Exact tab content layout and visualizations for Overview
- Outcome tag exact wording and presentation
- Review modal design and flow
- PDF report template design
- AI prompt engineering for Claude insights
- Email digest frequency options (weekly vs monthly vs both)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Core value prop (vetted matching), constraints, design references (Awesomic, Linear, Contra)
- `.planning/REQUIREMENTS.md` — DASH-01 through DASH-05, MENT-04, REV-01 through REV-04, NOTF-04

### Phase 2 & 3 Decisions (carry forward)
- `.planning/phases/02-practitioner-supply/02-CONTEXT.md`:
  - D-07: Anonymous-by-default (name reveals only after booking)
  - D-08: Tier badge colors (Rising=gray, Expert=blue, Master=terracotta)
  - D-09: Stats show "Sessions + NPS" only (rebook rate deferred to v2)
  - D-11: Linear-style sidebar navigation in portal
- `.planning/phases/03-discovery-booking-payments/03-CONTEXT.md`:
  - D-12/D-13: BLAST Coins currency (enterprises see coins, practitioners see ₹)
  - D-21: Email provider is Resend with React Email templates

### Existing Implementation
- `src/app/dashboard/` — Current enterprise dashboard (placeholder, needs full build)
- `src/app/portal/` — Practitioner portal structure (sidebar nav pattern established)
- `src/types/database.ts` — Existing schema (bookings, practitioner_earnings, etc.)
- `src/components/ui/tabs.tsx` — Tabs component for dashboard navigation
- `src/components/ui/progress.tsx` — Progress component for visualizations

### External Documentation
- Anthropic Claude API: https://docs.anthropic.com/en/api
- Resend Next.js (for email digests): https://resend.com/docs/send-with-nextjs

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Tabs component** (`src/components/ui/tabs.tsx`): Use for Overview | Sessions | Budget tabs
- **Card component** (`src/components/ui/card.tsx`): For dashboard stat cards, session cards
- **Progress component** (`src/components/ui/progress.tsx`): For visualizing budget usage, progress bars
- **Badge component** (`src/components/ui/badge.tsx`): For outcome tags display
- **Sidebar pattern** (`src/app/portal/layout.tsx`): Reference for portal nav updates

### Established Patterns
- **Server Components + Server Actions**: Dashboard data fetching and form submissions
- **Supabase RLS**: All tables have RLS policies. New `session_reviews`, `session_outcomes` tables will need policies.
- **TypeScript types**: `database.ts` defines table types. Extend for reviews and outcomes.
- **Resend email**: Phase 3 established email patterns for notifications

### Integration Points
- `src/app/dashboard/page.tsx` — Current placeholder needs full rebuild
- `src/app/portal/` — Add Reviews tab to sidebar nav
- `src/components/portal/stats-display.tsx` — Extend for review stats
- `bookings` table — Link reviews to specific bookings
- New tables needed: `session_reviews`, `session_outcomes`

</code_context>

<specifics>
## Specific Ideas

- **AI Upskiller Agent**: Acts as organizational AI adoption advisor, analyzing patterns and providing recommendations
- **Design reference**: Linear aesthetic for dashboard tabs and stats
- **Brand color**: #D97757 (terracotta) for CTAs, active states, highlights
- **Review timing**: Immediately after session, mandatory, full-screen modal

</specifics>

<deferred>
## Deferred Ideas

- **Per-team-member tracking** — Individual progress breakdown requires team member management. Deferred to v2.
- **Sprint packages** — Phase 3 showed "Coming soon" teaser. Full implementation v2.
- **AI-generated weekly learnings** — If AI stretch goal proves too complex for Phase 4, defer full implementation to v2 but keep data infrastructure.

</deferred>

---

*Phase: 04-enterprise-dashboard-trust*
*Context gathered: 2026-04-14*
