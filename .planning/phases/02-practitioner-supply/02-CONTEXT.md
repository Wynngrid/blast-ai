# Phase 2: Practitioner Supply - Context

**Gathered:** 2026-04-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Practitioners can create complete profiles and manage their availability independently. This phase delivers the profile editor, availability calendar, public profile display, and mentor portal dashboard. It does NOT include booking flow, payments, or enterprise-facing discovery — those are Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Profile Editor UI
- **D-01:** Multi-step wizard layout (Step 1: Bio → Step 2: Skills/Tools → Step 3: Portfolio → Step 4: Rates/Availability)
- **D-02:** Portfolio items are URL-based links only (Behance, Dribbble, YouTube, etc.). No file uploads for MVP. Platform auto-fetches title/thumbnail from URL.
- **D-03:** Practitioner edits all fields EXCEPT tier. Tier is admin-assigned only (during approval or later). Maintains quality control.

### Availability Calendar
- **D-04:** Recurring weekly schedule pattern. Practitioners set weekly availability (e.g., Mon/Wed 2-6pm) and calendar generates slots automatically.
- **D-05:** Slot duration is 30 minutes base unit. Session types: 20, 40, 60, 90 minutes.
- **D-06:** 15-minute buffer automatically inserted between bookable slots. Prevents back-to-back burnout.

### Profile Display (Public)
- **D-07:** Anonymous-by-default — public profiles show specialization, tier, bio, portfolio, stats. NO name until booking is confirmed.
- **D-08:** Tier badge uses colored pill with icon: Rising (gray), Expert (blue), Master (terracotta #D97757).
- **D-09:** Profile card stats show "Sessions + NPS only" (e.g., "47 sessions · 9.2 NPS"). Rebook rate deferred to v2.

### Mentor Portal Dashboard
- **D-10:** Landing view shows upcoming sessions (today/this week) front and center, with stats sidebar (earnings, sessions completed, rating).
- **D-11:** Sidebar navigation: Home | Profile | Availability | Sessions | Earnings. Linear-style, persistent nav.

### Specialization Taxonomy
- **D-12:** Predefined list + custom option. Core categories predefined, plus "Other" with free-text for niche specializations.
- **D-13:** Problem-centric labels (enterprise-friendly). Use labels that map to enterprise problems, not practitioner skill jargon.
- **D-14:** Core taxonomy: Claude's discretion to research and propose problem-centric categories during planning.

### Claude's Discretion
- Specialization taxonomy categories — research and propose enterprise-problem-centric labels
- Wizard step grouping — exact fields per step
- Loading/empty states across all views
- Responsive breakpoints and mobile adaptations

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Core value prop (vetted matching), constraints, design references (Awesomic, Linear, Contra)
- `.planning/REQUIREMENTS.md` — PROF-01 through PROF-06, AVAIL-01 through AVAIL-04, MENT-01, MENT-02

### Existing Implementation
- `src/types/database.ts` — Current practitioners table schema (full_name, bio, specializations, industries, tier, hourly_rate, tools, portfolio, application_status)
- `src/components/ui/card.tsx` — Card component with size variants and slots
- `src/app/portal/page.tsx` — Current portal placeholder (shows profile, availability, sessions cards)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Card component** (`src/components/ui/card.tsx`): Supports `size="default"|"sm"`, has CardHeader/Title/Description/Content/Footer/Action slots. Use for profile cards, session cards, stats cards.
- **Button component** (`src/components/ui/button.tsx`): Multiple variants available.
- **Input/Label/Textarea** (`src/components/ui/`): Form primitives ready.
- **Checkbox** (`src/components/ui/checkbox.tsx`): For multi-select (tools, specializations).

### Established Patterns
- **Server Components + Server Actions**: Auth flow uses this pattern. Profile editor should follow same approach.
- **Supabase RLS**: All tables have RLS policies. New `availability_slots` table will need policies.
- **TypeScript types**: `database.ts` defines table types. Extend for availability.

### Integration Points
- `/portal` layout already exists with authenticated practitioner check
- `practitioners` table already has most profile fields — editor updates existing record
- New tables needed: `availability_slots` (or `availability_rules` for recurring pattern)

</code_context>

<specifics>
## Specific Ideas

- **Session durations:** 20, 40, 60, 90 minutes — explicitly requested
- **Design reference:** Linear aesthetic for dashboard, Contra for profile pages
- **Brand color usage:** Terracotta #D97757 for Master tier badge, CTAs, active states

</specifics>

<deferred>
## Deferred Ideas

- **Agentic real-time copilot** — v2 feature per PROJECT.md. AI trained on session transcripts.
- **File uploads for portfolio** — URL-based for MVP, consider Supabase Storage for v2 if practitioners need to upload proprietary work.
- **Rebook rate stat** — v2. Sessions + NPS sufficient for launch.
- **Session packages/sprints** — Phase 3 handles booking flow, packages deferred to v2.

</deferred>

---

*Phase: 02-practitioner-supply*
*Context gathered: 2026-04-10*
