# Phase 4: Enterprise Dashboard & Trust - Research

**Researched:** 2026-04-14
**Domain:** Enterprise Dashboard, Review/Rating System, AI-Powered Insights
**Confidence:** HIGH

## Summary

Phase 4 delivers the enterprise dashboard with tabbed navigation (Overview | Sessions | Budget), a multi-criteria review system with mandatory post-session collection, review display on practitioner profiles/cards, practitioner review insights in portal, manager reporting with PDF export, and an optional AI upskiller agent powered by Claude API.

The core technical challenges are: (1) designing the session_reviews and session_outcomes tables with proper RLS policies for multi-tenant access, (2) building the mandatory review modal that blocks navigation until submission, (3) integrating aggregate review stats into the existing practitioner cards and profiles, (4) implementing PDF report generation server-side with @react-pdf/renderer, and (5) optionally integrating Claude API for AI-generated organizational insights.

**Primary recommendation:** Build database schema and RLS policies first, then dashboard UI with existing shadcn components, then review collection/display, then reporting, with AI insights as a stretch goal.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Tabbed navigation -- Overview | Sessions | Budget tabs. Linear-style, clean.
- **D-02:** Focus on AI adoption insights, NOT financial metrics -- Dashboard emphasizes learning outcomes.
- **D-03:** Aggregate company stats only for MVP -- No per-team-member breakdown.
- **D-04:** Self-reported progress with multi-select tags + notes after each session.
- **D-05:** Outcome data feeds dashboard insights.
- **D-06:** Mandatory immediately after session -- Full-screen modal, cannot navigate away.
- **D-07:** Multi-criteria rating: Communication, Expertise, Helpfulness (1-5 stars each).
- **D-08:** Written comment required for low scores (overall/NPS <= 6).
- **D-09:** Public reviews visible to all enterprises.
- **D-10:** Curated highlights (3-5 best) on profile, full list expandable.
- **D-11:** Score + count on browse cards ("4.8 * (23 reviews)").
- **D-12:** Rebook CTA in session history, after review, confirmation email, practitioner profile.
- **D-13:** Rebook pre-fills practitioner + duration only, requires fresh session brief.
- **D-14:** Practitioner portal: Reviews tab + summary stats on Home dashboard.
- **D-15:** Practitioner insights: aggregate scores, per-criteria breakdowns, trends over time, actionable feedback highlights.
- **D-16:** Manager reporting: Exportable PDF + automated email digest.
- **D-17:** Report content: Executive summary, sessions this period, skills covered, % positive outcomes.
- **D-18:** AI Upskiller Agent (stretch): Claude API for org-level insights from session briefs/outcomes.
- **D-19:** Data infrastructure built regardless -- session outcomes collected for future AI.

### Claude's Discretion
- Exact tab content layout and visualizations for Overview
- Outcome tag exact wording and presentation
- Review modal design and flow
- PDF report template design
- AI prompt engineering for Claude insights
- Email digest frequency options (weekly vs monthly vs both)

### Deferred Ideas (OUT OF SCOPE)
- Per-team-member tracking -- deferred to v2
- Sprint packages -- deferred to v2
- AI-generated weekly learnings -- defer full implementation if too complex
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DASH-01 | Enterprise admin can see team overview (members enrolled, sessions completed) | Dashboard Overview tab with aggregate stats from bookings table |
| DASH-02 | Enterprise admin can view hours used vs hours purchased (progress bar) | Progress component exists; calculate from coin_transactions and bookings |
| DASH-03 | Enterprise admin can view session history | Sessions tab with filterable list from bookings table |
| DASH-04 | Enterprise admin can view upcoming sessions | Sessions tab with separate upcoming section |
| DASH-05 | Enterprise admin can track budget utilization | Budget tab with coin balance visualization |
| MENT-04 | Practitioner can see ratings and reviews received | Portal Reviews tab + home dashboard summary |
| REV-01 | Enterprise can submit NPS rating after session | Review modal with 0-10 NPS scale |
| REV-02 | Enterprise can write review after session | Review modal with textarea, required for low scores |
| REV-03 | Reviews display on practitioner profile | Profile page curated highlights + expandable list |
| REV-04 | Aggregate stats visible on practitioner card | Extend PractitionerCard with rating display |
| NOTF-04 | Enterprise receives prompt to leave review after session | Trigger review modal on session completion |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| shadcn/ui Tabs | Base-UI | Dashboard tab navigation | Already in project, Linear-style aesthetic |
| shadcn/ui Progress | Base-UI | Budget utilization bars | Already in project |
| shadcn/ui Card | Base-UI | Dashboard stat cards | Already in project |
| shadcn/ui Sheet | Base-UI | Full-screen review modal | Already in project, used as Dialog primitive |
| react-hook-form | 7.72.1 | Review form management | Already in project |
| zod | 4.3.6 | Review schema validation | Already in project |

### New Dependencies
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| recharts | 3.8.1 | Dashboard charts | [VERIFIED: npm registry] Overview tab visualizations |
| @react-pdf/renderer | 4.4.1 | PDF report generation | [VERIFIED: npm registry] Manager reporting |
| @anthropic-ai/sdk | 0.88.0 | Claude API for AI insights | [VERIFIED: npm registry] Stretch goal only |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| recharts | shadcn/ui Chart | shadcn Chart wraps recharts; use directly for more control |
| @react-pdf/renderer | jspdf (4.2.1) | jspdf is lighter but less React-native; react-pdf better for complex layouts |
| @react-pdf/renderer | html2canvas + jspdf | More brittle, relies on DOM rendering; react-pdf is purpose-built |
| Full Dialog | Sheet side="bottom" | Sheet with full-screen mode can simulate modal; may need Dialog component |

**Installation:**
```bash
pnpm add recharts @react-pdf/renderer
# Stretch goal only:
pnpm add @anthropic-ai/sdk
```

**Version verification:** [VERIFIED: npm registry 2026-04-14]
- recharts: 3.8.1 (published 2026-04-10)
- @react-pdf/renderer: 4.4.1 (published 2026-04-12)
- @anthropic-ai/sdk: 0.88.0 (published 2026-04-08)

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   └── dashboard/
│       ├── layout.tsx          # Dashboard layout with auth
│       ├── page.tsx            # Redirects to overview
│       ├── overview/page.tsx   # Overview tab (DASH-01)
│       ├── sessions/page.tsx   # Sessions tab (DASH-03, DASH-04)
│       └── budget/page.tsx     # Budget tab (DASH-02, DASH-05)
├── app/portal/
│   └── reviews/page.tsx        # Practitioner reviews (MENT-04)
├── components/
│   └── dashboard/
│       ├── dashboard-tabs.tsx  # Tab navigation
│       ├── overview-stats.tsx  # Stat cards
│       ├── session-history.tsx # Session list with rebook
│       ├── budget-progress.tsx # Budget visualization
│       └── ai-insights.tsx     # AI upskiller (stretch)
├── components/
│   └── reviews/
│       ├── review-modal.tsx    # Mandatory review collection
│       ├── star-rating.tsx     # Multi-criteria stars
│       ├── review-card.tsx     # Single review display
│       └── review-list.tsx     # Reviews on profile
├── actions/
│   └── reviews.ts              # Review CRUD operations
│   └── dashboard.ts            # Dashboard data fetching
│   └── reports.ts              # PDF generation
└── emails/
    └── review-prompt.tsx       # NOTF-04 email
    └── manager-digest.tsx      # D-16 email digest
```

### Pattern 1: Tabbed Dashboard with Route Groups
**What:** Use Next.js route groups with shared layout for tab navigation
**When to use:** Multi-tab dashboards where tabs have different data requirements
**Example:**
```typescript
// Source: Next.js App Router patterns
// src/app/dashboard/layout.tsx
import { DashboardTabs } from '@/components/dashboard/dashboard-tabs'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardTabs />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
```

### Pattern 2: Mandatory Modal with Navigation Blocking
**What:** Full-screen modal that prevents route navigation until action is completed
**When to use:** Critical workflows like review collection (D-06)
**Example:**
```typescript
// Source: React patterns for modal blocking
'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function ReviewModal({ bookingId, isSessionComplete }: Props) {
  const router = useRouter()
  const [submitted, setSubmitted] = useState(false)

  // Block navigation until review submitted
  useEffect(() => {
    if (!isSessionComplete || submitted) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isSessionComplete, submitted])

  // Full-screen modal that cannot be dismissed
  if (!isSessionComplete || submitted) return null

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
      {/* Review form - no close button */}
    </div>
  )
}
```

### Pattern 3: Server-Side Aggregate Stats
**What:** Calculate review aggregates in Supabase RPC or Server Component
**When to use:** Display aggregate stats without loading all reviews
**Example:**
```typescript
// Source: Supabase patterns
// actions/reviews.ts
export async function getPractitionerStats(practitionerId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('session_reviews')
    .select('communication_rating, expertise_rating, helpfulness_rating, nps_score')
    .eq('practitioner_id', practitionerId)

  if (!data || data.length === 0) return null

  const count = data.length
  const avgRating = data.reduce((sum, r) =>
    sum + (r.communication_rating + r.expertise_rating + r.helpfulness_rating) / 3, 0) / count
  const avgNps = data.reduce((sum, r) => sum + r.nps_score, 0) / count

  return { count, avgRating: avgRating.toFixed(1), avgNps: avgNps.toFixed(1) }
}
```

### Pattern 4: Client-Side Charts with Server Data
**What:** Fetch data server-side, render charts client-side (recharts requires 'use client')
**When to use:** Dashboard visualizations
**Example:**
```typescript
// Source: Recharts + Next.js patterns
// components/dashboard/outcome-chart.tsx
'use client'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

interface OutcomeChartProps {
  data: { name: string; value: number; color: string }[]
}

export function OutcomeChart({ data }: OutcomeChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%">
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}
```

### Anti-Patterns to Avoid
- **Storing aggregates in practitioner table:** Aggregates become stale; calculate on read or use database triggers
- **Client-side aggregate calculation:** Loading all reviews to count them wastes bandwidth; use SQL aggregation
- **Optional review modal:** D-06 mandates reviews cannot be skipped; do not add close button or skip option
- **Mixing Recharts with Server Components:** Recharts uses browser APIs; always mark with 'use client'

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Star rating input | Custom SVG click handlers | shadcn-compatible rating component | Accessibility, keyboard navigation, hover states |
| PDF generation | HTML-to-PDF conversion | @react-pdf/renderer | Purpose-built, consistent rendering, no browser dependency |
| Dashboard charts | Custom SVG/Canvas | recharts | Responsive, accessible, battle-tested |
| NPS scale | Custom 0-10 buttons | Styled ButtonGroup or RadioGroup | Accessibility, form integration |
| Email digest scheduling | Custom cron job | Supabase pg_cron + Edge Function | Managed infrastructure, retries |

**Key insight:** Dashboard and review components involve complex accessibility requirements (keyboard navigation, screen readers) and responsive design. Using established libraries prevents accessibility bugs that are hard to test manually.

## Database Schema

### New Tables Required

```sql
-- session_reviews: Stores review data (REV-01, REV-02, REV-03, REV-04)
CREATE TABLE session_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  enterprise_id UUID NOT NULL REFERENCES enterprises(id),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id),

  -- Multi-criteria ratings per D-07 (1-5 scale)
  communication_rating SMALLINT NOT NULL CHECK (communication_rating BETWEEN 1 AND 5),
  expertise_rating SMALLINT NOT NULL CHECK (expertise_rating BETWEEN 1 AND 5),
  helpfulness_rating SMALLINT NOT NULL CHECK (helpfulness_rating BETWEEN 1 AND 5),

  -- NPS per REV-01 (0-10 scale)
  nps_score SMALLINT NOT NULL CHECK (nps_score BETWEEN 0 AND 10),

  -- Written review per D-08
  comment TEXT, -- Required if nps_score <= 6

  -- Visibility per D-09
  is_public BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure one review per booking
CREATE UNIQUE INDEX idx_reviews_booking ON session_reviews(booking_id);

-- session_outcomes: Self-reported outcomes per D-04
CREATE TABLE session_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  enterprise_id UUID NOT NULL REFERENCES enterprises(id),

  -- Multi-select tags per D-04
  outcome_tags TEXT[] NOT NULL DEFAULT '{}',
  -- Allowed: 'skill_learned', 'blocker_resolved', 'need_followup', 'not_helpful'

  -- Optional notes per D-04
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_outcomes_booking ON session_outcomes(booking_id);

-- RLS Policies
ALTER TABLE session_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_outcomes ENABLE ROW LEVEL SECURITY;

-- Enterprises can read public reviews for any practitioner
CREATE POLICY "Enterprises can read public reviews"
  ON session_reviews FOR SELECT
  USING (is_public = true);

-- Enterprises can insert reviews for their own bookings
CREATE POLICY "Enterprises can create reviews for their bookings"
  ON session_reviews FOR INSERT
  WITH CHECK (
    enterprise_id = (SELECT id FROM enterprises WHERE user_id = auth.uid())
  );

-- Practitioners can read reviews about themselves
CREATE POLICY "Practitioners can read their own reviews"
  ON session_reviews FOR SELECT
  USING (
    practitioner_id = (SELECT id FROM practitioners WHERE user_id = auth.uid())
  );

-- Similar policies for session_outcomes...
```

### Type Extensions

```typescript
// src/types/database.ts additions
export type OutcomeTag = 'skill_learned' | 'blocker_resolved' | 'need_followup' | 'not_helpful'

// Add to Database.public.Tables
session_reviews: {
  Row: {
    id: string
    booking_id: string
    enterprise_id: string
    practitioner_id: string
    communication_rating: number
    expertise_rating: number
    helpfulness_rating: number
    nps_score: number
    comment: string | null
    is_public: boolean
    created_at: string
  }
  Insert: {
    id?: string
    booking_id: string
    enterprise_id: string
    practitioner_id: string
    communication_rating: number
    expertise_rating: number
    helpfulness_rating: number
    nps_score: number
    comment?: string | null
    is_public?: boolean
    created_at?: string
  }
  Update: Partial<Insert>
  Relationships: [
    { foreignKeyName: 'session_reviews_booking_id_fkey', ... },
    { foreignKeyName: 'session_reviews_enterprise_id_fkey', ... },
    { foreignKeyName: 'session_reviews_practitioner_id_fkey', ... }
  ]
}
```

## Common Pitfalls

### Pitfall 1: Review Modal Dismissal
**What goes wrong:** User refreshes page or navigates away without submitting review, losing the mandatory requirement
**Why it happens:** Browser navigation cannot be fully blocked in modern browsers
**How to avoid:** Mark booking as "needs_review" in database; show modal on any page load until review submitted; use beforeunload warning
**Warning signs:** bookings table has completed sessions without matching session_reviews entries

### Pitfall 2: Stale Aggregate Stats
**What goes wrong:** Practitioner card shows outdated rating after new review submitted
**Why it happens:** Caching aggregate values without invalidation
**How to avoid:** Either calculate aggregates on each read (acceptable for MVP scale) or use Supabase triggers to update denormalized columns
**Warning signs:** Ratings don't update after review submission

### Pitfall 3: Chart Hydration Mismatch
**What goes wrong:** Recharts throws hydration errors in Next.js
**Why it happens:** Recharts measures DOM on mount, causing client/server mismatch
**How to avoid:** Always use 'use client' directive; wrap charts in Suspense with loading skeleton; use dynamic import with ssr: false if needed
**Warning signs:** "Text content does not match" or "Hydration failed" errors in console

### Pitfall 4: PDF Generation Memory Issues
**What goes wrong:** PDF generation times out or crashes on large reports
**Why it happens:** @react-pdf/renderer loads all data into memory
**How to avoid:** Paginate data before generating PDF; limit report to reasonable time range; generate in chunks if needed
**Warning signs:** API route timeouts, memory errors in logs

### Pitfall 5: NPS Calculation Confusion
**What goes wrong:** NPS displayed as average instead of proper NPS formula
**Why it happens:** NPS is % Promoters (9-10) minus % Detractors (0-6), not an average
**How to avoid:** Implement correct NPS formula; label "NPS" vs "Average Rating" clearly
**Warning signs:** NPS score > 10 (impossible with correct formula) or negative NPS labeled as invalid

## Code Examples

### Star Rating Component
```typescript
// Source: Common React pattern with shadcn styling
// components/reviews/star-rating.tsx
'use client'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function StarRating({ value, onChange, readonly = false, size = 'md' }: StarRatingProps) {
  const sizes = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6' }

  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value >= star}
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={cn(
            'focus:outline-none focus:ring-2 focus:ring-primary rounded',
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'
          )}
        >
          <Star
            className={cn(
              sizes[size],
              value >= star ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
            )}
          />
        </button>
      ))}
    </div>
  )
}
```

### Review Form Schema
```typescript
// Source: zod validation pattern
// lib/schemas/review.ts
import { z } from 'zod'

export const reviewSchema = z.object({
  bookingId: z.string().uuid(),
  communicationRating: z.number().int().min(1).max(5),
  expertiseRating: z.number().int().min(1).max(5),
  helpfulnessRating: z.number().int().min(1).max(5),
  npsScore: z.number().int().min(0).max(10),
  comment: z.string().optional(),
}).refine(
  // D-08: Comment required if NPS <= 6
  (data) => data.npsScore > 6 || (data.comment && data.comment.length > 0),
  { message: 'Please tell us why you gave this rating', path: ['comment'] }
)

export type ReviewFormData = z.infer<typeof reviewSchema>
```

### Dashboard Aggregate Query
```typescript
// Source: Supabase query patterns
// actions/dashboard.ts
export async function getDashboardStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: enterprise } = await supabase
    .from('enterprises')
    .select('id')
    .eq('user_id', user!.id)
    .single()

  // Sessions completed
  const { count: sessionsCompleted } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('enterprise_id', enterprise.id)
    .eq('status', 'completed')

  // Coins balance (sum purchases - sum spends)
  const { data: transactions } = await supabase
    .from('coin_transactions')
    .select('type, amount')
    .eq('enterprise_id', enterprise.id)

  const coinBalance = (transactions || []).reduce((sum, t) =>
    t.type === 'purchase' ? sum + t.amount : sum - t.amount, 0)

  // Outcome breakdown for charts
  const { data: outcomes } = await supabase
    .from('session_outcomes')
    .select('outcome_tags')
    .eq('enterprise_id', enterprise.id)

  const outcomeBreakdown = {
    skill_learned: 0,
    blocker_resolved: 0,
    need_followup: 0,
    not_helpful: 0,
  }
  outcomes?.forEach(o => {
    o.outcome_tags.forEach(tag => {
      if (tag in outcomeBreakdown) outcomeBreakdown[tag as keyof typeof outcomeBreakdown]++
    })
  })

  return { sessionsCompleted, coinBalance, outcomeBreakdown }
}
```

### PDF Report Generation
```typescript
// Source: @react-pdf/renderer official docs
// actions/reports.ts
'use server'
import { renderToBuffer } from '@react-pdf/renderer'
import { ManagerReport } from '@/components/reports/manager-report'

export async function generateManagerReport(enterpriseId: string, period: string) {
  // Fetch report data...
  const data = await getReportData(enterpriseId, period)

  const pdfBuffer = await renderToBuffer(
    <ManagerReport
      companyName={data.companyName}
      period={period}
      sessionsCount={data.sessionsCount}
      skillsCovered={data.skillsCovered}
      positiveOutcomeRate={data.positiveOutcomeRate}
    />
  )

  return pdfBuffer
}

// API route to stream PDF
// app/api/reports/[enterpriseId]/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: { enterpriseId: string } }) {
  const buffer = await generateManagerReport(params.enterpriseId, 'monthly')

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="blast-ai-report.pdf"',
    },
  })
}
```

### Claude API Integration (Stretch Goal)
```typescript
// Source: Anthropic TypeScript SDK docs [CITED: platform.claude.com/docs/en/api/sdks/typescript]
// actions/ai-insights.ts
'use server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

export async function generateOrgInsights(enterpriseId: string) {
  // Gather session data
  const { briefs, outcomes } = await getSessionData(enterpriseId)

  const prompt = `Analyze these AI mentorship session briefs and outcomes for an organization.
Identify:
1. Common AI problem patterns the team is facing
2. Skills being developed vs skills still needed
3. Recommendations for next learning focus areas

Session briefs: ${JSON.stringify(briefs)}
Outcomes: ${JSON.stringify(outcomes)}

Provide a concise executive summary with actionable recommendations.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  return message.content[0].type === 'text' ? message.content[0].text : null
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Star ratings with react-star-rating-component | Custom accessible component with Lucide icons | 2025 | Better accessibility, tree-shaking |
| Chart.js for dashboards | recharts with shadcn theming | 2025 | Better React 19 support, smaller bundle |
| jspdf + html2canvas | @react-pdf/renderer | 2024 | Server-side generation, consistent rendering |
| Storing NPS averages | Calculate real NPS (promoters - detractors) | Ongoing | Correct industry-standard metric |

**Deprecated/outdated:**
- react-star-rating-component: Unmaintained, poor TypeScript support
- react-chartjs-2: Bundle size issues, less React-native than recharts
- html2pdf.js: Relies on DOM rendering, inconsistent results

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Sheet component can be used as full-screen modal | Architecture Patterns | Need to add Dialog component from shadcn |
| A2 | recharts integrates well with shadcn theming | Standard Stack | May need custom theme wrapper |
| A3 | pg_cron available in Supabase for email scheduling | Don't Hand-Roll | Need Vercel cron or external scheduler |

**Note:** All claims tagged [VERIFIED: npm registry] were confirmed via `npm view` commands. All patterns are based on existing project code and official documentation.

## Open Questions

1. **Dialog vs Sheet for Review Modal**
   - What we know: Project has Sheet component using @base-ui/react Dialog primitives
   - What's unclear: Whether Sheet can be styled for full-screen mandatory modal, or if separate Dialog component needed
   - Recommendation: Try Sheet first with custom styling; add Dialog component if needed

2. **Chart Theming Integration**
   - What we know: recharts works standalone, shadcn has Chart wrapper
   - What's unclear: Whether to use recharts directly or shadcn Chart wrapper
   - Recommendation: Use recharts directly for more control; theme colors can be applied via CSS variables

3. **Email Digest Scheduling**
   - What we know: Supabase has pg_cron extension, Vercel has cron jobs
   - What's unclear: Which approach is more reliable for weekly/monthly digests
   - Recommendation: Use Supabase pg_cron + Edge Function for consistency with existing notification patterns

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | All | Assumed | 20+ | -- |
| Supabase | Database, Auth | Existing | Latest | -- |
| Resend | Email notifications | Existing | 6.11.0 | -- |
| recharts | Dashboard charts | Not installed | 3.8.1 | shadcn Chart |
| @react-pdf/renderer | PDF reports | Not installed | 4.4.1 | jspdf |
| @anthropic-ai/sdk | AI insights | Not installed | 0.88.0 | Defer feature |

**Missing dependencies with no fallback:**
- None -- all have alternatives

**Missing dependencies with fallback:**
- recharts: Could use shadcn Chart wrapper, but direct recharts preferred
- @react-pdf/renderer: Could use jspdf, but react-pdf more maintainable
- @anthropic-ai/sdk: Stretch goal only, can defer entirely

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | Yes | Supabase Auth (existing) |
| V3 Session Management | Yes | Supabase Auth (existing) |
| V4 Access Control | Yes | RLS policies on new tables |
| V5 Input Validation | Yes | zod schemas for review forms |
| V6 Cryptography | No | No new crypto requirements |

### Known Threat Patterns for Review Systems

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Fake reviews from non-customers | Spoofing | RLS: Only booking participants can review |
| Review bombing | Tampering | One review per booking (unique constraint) |
| PII in review comments | Information Disclosure | Content moderation guidelines, optional admin review |
| Practitioner self-reviews | Elevation of Privilege | RLS: enterprise_id must match auth user's enterprise |

## Sources

### Primary (HIGH confidence)
- [VERIFIED: npm registry] recharts 3.8.1, @react-pdf/renderer 4.4.1, @anthropic-ai/sdk 0.88.0
- [CITED: platform.claude.com/docs/en/api/sdks/typescript] - Claude TypeScript SDK usage
- Project codebase: src/types/database.ts, src/components/ui/, src/actions/

### Secondary (MEDIUM confidence)
- [Recharts documentation](https://recharts.org/en-US/) - Chart patterns
- [@react-pdf/renderer docs](https://react-pdf.org/) - PDF generation
- [shadcn/ui docs](https://ui.shadcn.com/) - Component patterns

### Tertiary (LOW confidence)
- WebSearch results for NPS best practices - needs validation against specific requirements
- WebSearch results for star rating accessibility - patterns verified but implementation details may vary

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified via npm registry, existing patterns in codebase
- Architecture: HIGH - Follows established patterns from prior phases
- Database schema: HIGH - Based on existing schema patterns and requirements
- Pitfalls: MEDIUM - Based on common issues, but project-specific issues may emerge

**Research date:** 2026-04-14
**Valid until:** 2026-05-14 (30 days - stable domain, no rapid changes expected)
