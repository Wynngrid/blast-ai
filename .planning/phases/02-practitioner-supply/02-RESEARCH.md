# Phase 2: Practitioner Supply - Research

**Researched:** 2026-04-10
**Domain:** Practitioner profiles, availability calendars, mentor portal UI
**Confidence:** HIGH

## Summary

Phase 2 delivers the practitioner-facing experience: profile editor, availability management, and mentor portal dashboard. The existing codebase provides a solid foundation with established patterns (react-hook-form + zod, Supabase RLS, shadcn/ui components) that should be extended rather than replaced.

Key technical challenges include: (1) multi-step wizard form with validation across steps, (2) recurring availability calendar with timezone handling, and (3) persistent sidebar navigation matching Linear's aesthetic. All three are well-supported by the recommended stack with battle-tested patterns available.

**Primary recommendation:** Use FullCalendar 6.x for availability UI with a server-side recurring availability pattern (store weekly rules, generate slots on-the-fly). Multi-step wizard uses zustand for step state + react-hook-form per step. shadcn/ui Sidebar component for Linear-style navigation.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Multi-step wizard layout (Step 1: Bio -> Step 2: Skills/Tools -> Step 3: Portfolio -> Step 4: Rates/Availability)
- **D-02:** Portfolio items are URL-based links only (Behance, Dribbble, YouTube, etc.). No file uploads for MVP. Platform auto-fetches title/thumbnail from URL.
- **D-03:** Practitioner edits all fields EXCEPT tier. Tier is admin-assigned only (during approval or later). Maintains quality control.
- **D-04:** Recurring weekly schedule pattern. Practitioners set weekly availability (e.g., Mon/Wed 2-6pm) and calendar generates slots automatically.
- **D-05:** Slot duration is 30 minutes base unit. Session types: 20, 40, 60, 90 minutes.
- **D-06:** 15-minute buffer automatically inserted between bookable slots. Prevents back-to-back burnout.
- **D-07:** Anonymous-by-default -- public profiles show specialization, tier, bio, portfolio, stats. NO name until booking is confirmed.
- **D-08:** Tier badge uses colored pill with icon: Rising (gray), Expert (blue), Master (terracotta #D97757).
- **D-09:** Profile card stats show "Sessions + NPS only" (e.g., "47 sessions - 9.2 NPS"). Rebook rate deferred to v2.
- **D-10:** Landing view shows upcoming sessions (today/this week) front and center, with stats sidebar (earnings, sessions completed, rating).
- **D-11:** Sidebar navigation: Home | Profile | Availability | Sessions | Earnings. Linear-style, persistent nav.
- **D-12:** Predefined list + custom option. Core categories predefined, plus "Other" with free-text for niche specializations.
- **D-13:** Problem-centric labels (enterprise-friendly). Use labels that map to enterprise problems, not practitioner skill jargon.

### Claude's Discretion
- Specialization taxonomy categories -- research and propose enterprise-problem-centric labels
- Wizard step grouping -- exact fields per step
- Loading/empty states across all views
- Responsive breakpoints and mobile adaptations

### Deferred Ideas (OUT OF SCOPE)
- Agentic real-time copilot -- v2 feature per PROJECT.md
- File uploads for portfolio -- URL-based for MVP
- Rebook rate stat -- v2. Sessions + NPS sufficient for launch
- Session packages/sprints -- Phase 3 handles booking flow
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PROF-01 | Practitioner has profile with bio, specialization, and tools/stack | Multi-step wizard (Steps 1-2), existing `practitioners` table schema supports this |
| PROF-02 | Practitioner profile displays tier badge | TierBadge component with colored pills (gray/blue/terracotta), admin-only field |
| PROF-03 | Practitioner profile shows stats (sessions completed, NPS, rebook rate) | StatsDisplay component with placeholder zeros, Sessions + NPS per D-09 |
| PROF-04 | Practitioner profile displays hourly rate | Step 4 of wizard, integer field in practitioners table |
| PROF-05 | Practitioner profile shows portfolio of shipped work | Step 3, URL-based with unfurl.js metadata extraction |
| PROF-06 | Practitioner profile shows reviews from past sessions | Placeholder section ("No reviews yet"), reviews table Phase 4 |
| AVAIL-01 | Practitioner can set available time slots | FullCalendar 6.x with recurring events pattern |
| AVAIL-02 | Practitioner can block specific dates/times | Exception dates stored separately, overlaid on recurring rules |
| AVAIL-03 | Availability calendar displays in enterprise's local timezone | date-fns-tz for conversion, store UTC, convert at display |
| AVAIL-04 | Booked slots are automatically removed from availability | RLS policy + realtime subscription for Phase 3 integration |
| MENT-01 | Practitioner can manage availability (toggle time blocks) | Availability page with drag-select on FullCalendar |
| MENT-02 | Practitioner can view upcoming sessions with session briefs | Sessions page with empty state for Phase 2, populated in Phase 3 |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Verification |
|---------|---------|---------|--------------|
| react-hook-form | 7.72.1 | Form state management | [VERIFIED: package.json] |
| zod | 4.3.6 | Schema validation | [VERIFIED: package.json] |
| @hookform/resolvers | 5.2.2 | Zod + react-hook-form bridge | [VERIFIED: package.json] |
| zustand | 5.0.12 | Client state (wizard steps) | [VERIFIED: package.json] |
| @tanstack/react-query | 5.97.0 | Server state caching | [VERIFIED: package.json] |

### New for Phase 2
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @fullcalendar/react | 6.1.20 | Availability calendar UI | [VERIFIED: npm registry] Enterprise-grade, drag-drop, recurring events |
| @fullcalendar/daygrid | 6.1.20 | Month view plugin | [VERIFIED: npm registry] FullCalendar plugin |
| @fullcalendar/timegrid | 6.1.20 | Week/day view plugin | [VERIFIED: npm registry] Time slot display |
| @fullcalendar/interaction | 6.1.20 | Drag-and-drop plugin | [VERIFIED: npm registry] Slot selection |
| date-fns | 4.1.0 | Date manipulation | [VERIFIED: npm registry] Tree-shakable, TS-first |
| date-fns-tz | 3.2.0 | Timezone conversion | [VERIFIED: npm registry] UTC storage, local display |
| unfurl.js | 6.4.0 | URL metadata extraction | [VERIFIED: npm registry] Portfolio link previews |

### shadcn/ui Components Needed
| Component | Purpose | Installation |
|-----------|---------|--------------|
| Sidebar | Linear-style persistent navigation | `pnpm dlx shadcn@latest add sidebar` |
| Tabs | Profile sections, wizard steps | `pnpm dlx shadcn@latest add tabs` |
| Select | Specialization dropdown | `pnpm dlx shadcn@latest add select` |
| Badge | Tier badges, status indicators | `pnpm dlx shadcn@latest add badge` |
| Progress | Wizard step progress | `pnpm dlx shadcn@latest add progress` |
| Avatar | Profile pictures | `pnpm dlx shadcn@latest add avatar` |
| Separator | Visual dividers | `pnpm dlx shadcn@latest add separator` |
| Skeleton | Loading states | `pnpm dlx shadcn@latest add skeleton` |
| Tooltip | Help text | `pnpm dlx shadcn@latest add tooltip` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| FullCalendar | react-big-calendar | 50% smaller bundle, but no drag-drop or recurring events built-in |
| date-fns-tz | Temporal API | Native browser API coming, but not production-ready until 2027+ |
| unfurl.js | metascraper | metascraper more customizable, but unfurl.js simpler for OG/Twitter cards |

**Installation:**
```bash
pnpm add @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction date-fns date-fns-tz unfurl.js
pnpm dlx shadcn@latest add sidebar tabs select badge progress avatar separator skeleton tooltip
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   └── portal/
│       ├── layout.tsx              # SidebarProvider wrapper
│       ├── page.tsx                # Dashboard home (upcoming sessions)
│       ├── profile/
│       │   ├── page.tsx            # Profile view
│       │   └── edit/
│       │       └── page.tsx        # Multi-step wizard
│       ├── availability/
│       │   └── page.tsx            # Calendar management
│       ├── sessions/
│       │   └── page.tsx            # Session list (empty for Phase 2)
│       └── earnings/
│           └── page.tsx            # Earnings placeholder
├── components/
│   ├── portal/
│   │   ├── portal-sidebar.tsx      # Sidebar navigation
│   │   ├── profile-wizard/
│   │   │   ├── wizard-provider.tsx # Zustand context
│   │   │   ├── step-bio.tsx
│   │   │   ├── step-skills.tsx
│   │   │   ├── step-portfolio.tsx
│   │   │   └── step-rates.tsx
│   │   ├── availability-calendar.tsx
│   │   └── tier-badge.tsx
│   └── ui/                         # shadcn components
├── lib/
│   ├── validations/
│   │   ├── profile.ts              # Profile form schemas
│   │   └── availability.ts         # Availability schemas
│   └── hooks/
│       ├── use-profile.ts          # TanStack Query for profile
│       └── use-availability.ts     # TanStack Query for availability
└── actions/
    ├── profile.ts                  # Server actions for profile
    └── availability.ts             # Server actions for availability
```

### Pattern 1: Multi-Step Wizard with Zustand
**What:** Wizard state managed by zustand store, each step has own react-hook-form instance
**When to use:** Complex forms where validation happens per-step but data persists across steps
**Example:**
```typescript
// Source: [ASSUMED based on shadcn patterns]
// lib/stores/wizard-store.ts
import { create } from 'zustand'

interface WizardState {
  currentStep: number
  stepData: {
    bio: { fullName: string; bio: string } | null
    skills: { specializations: string[]; tools: string[] } | null
    portfolio: { items: PortfolioItem[] } | null
    rates: { hourlyRate: number } | null
  }
  setStepData: <K extends keyof WizardState['stepData']>(
    step: K,
    data: WizardState['stepData'][K]
  ) => void
  nextStep: () => void
  prevStep: () => void
  reset: () => void
}

export const useWizardStore = create<WizardState>((set) => ({
  currentStep: 0,
  stepData: { bio: null, skills: null, portfolio: null, rates: null },
  setStepData: (step, data) =>
    set((state) => ({
      stepData: { ...state.stepData, [step]: data }
    })),
  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  prevStep: () => set((state) => ({ currentStep: state.currentStep - 1 })),
  reset: () => set({ currentStep: 0, stepData: { bio: null, skills: null, portfolio: null, rates: null } }),
}))
```

### Pattern 2: Recurring Availability with FullCalendar
**What:** Store weekly rules in database, generate visual events in FullCalendar
**When to use:** Weekly recurring patterns with exception dates
**Example:**
```typescript
// Source: [CITED: https://fullcalendar.io/docs/recurring-events]
// Transform availability_rules to FullCalendar events
const weeklyEvents = rules.map(rule => ({
  groupId: `availability-${rule.id}`,
  daysOfWeek: [rule.day_of_week], // 0=Sunday, 1=Monday, etc.
  startTime: rule.start_time,     // "09:00:00"
  endTime: rule.end_time,         // "17:00:00"
  display: 'background',
  color: '#22c55e',               // Available = green background
}))

// Exception dates overlay as blocked
const exceptions = blockedDates.map(block => ({
  start: block.date,
  allDay: true,
  display: 'background',
  color: '#ef4444',               // Blocked = red background
}))
```

### Pattern 3: Timezone-Safe Storage
**What:** Store all times in UTC, convert to user's timezone on display only
**When to use:** Any datetime storage, especially availability/booking
**Example:**
```typescript
// Source: [CITED: date-fns-tz documentation]
import { formatInTimeZone, toZonedTime } from 'date-fns-tz'

// Get user's timezone
const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

// Display availability in user's local time
const displayTime = formatInTimeZone(
  slot.start_utc,
  userTimezone,
  'h:mm a'
)

// Store user input as UTC
const utcTime = fromZonedTime(localDateInput, userTimezone)
```

### Pattern 4: Portfolio Link Unfurling (Server Action)
**What:** Fetch URL metadata server-side to avoid CORS, cache results
**When to use:** Portfolio items need title/thumbnail from external URLs
**Example:**
```typescript
// Source: [ASSUMED based on unfurl.js usage]
// actions/portfolio.ts
'use server'

import { unfurl } from 'unfurl.js'

export async function unfurlPortfolioUrl(url: string) {
  try {
    const metadata = await unfurl(url)
    return {
      success: true,
      data: {
        title: metadata.title || metadata.open_graph?.title || url,
        description: metadata.description || metadata.open_graph?.description,
        image: metadata.open_graph?.images?.[0]?.url || metadata.favicon,
        url,
      }
    }
  } catch (error) {
    return {
      success: false,
      data: { title: url, url }
    }
  }
}
```

### Anti-Patterns to Avoid
- **Single form for entire wizard:** Causes validation nightmares and poor UX. Use separate form per step.
- **Storing local times:** Timezone bugs when enterprises view in different zones. Always store UTC.
- **Client-side unfurling:** CORS blocks most sites. Use server action.
- **Inline calendar CSS:** FullCalendar has 40KB+ of styles. Import properly in globals.css.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Recurring events | Custom date generation logic | FullCalendar recurring events API | Edge cases: DST, leap years, timezone offsets |
| Timezone conversion | Manual UTC offset math | date-fns-tz | DST transitions, historical timezone data |
| URL metadata extraction | Custom fetch + parsing | unfurl.js | OG, Twitter Cards, oEmbed, fallbacks |
| Sidebar navigation | Custom CSS drawer | shadcn/ui Sidebar | Keyboard shortcuts, mobile sheet, persistence |
| Step progress indicator | Custom divs | shadcn/ui Progress | Accessibility, animations |

**Key insight:** Date/time handling is deceptively complex. DST transitions create 1-hour gaps/overlaps twice yearly. Recurring events must handle "last Monday of month" vs "4th Monday" differences. Let battle-tested libraries handle these.

## Database Schema Extension

New tables needed for Phase 2:

```sql
-- Source: [ASSUMED based on requirements]
-- Availability rules (recurring weekly pattern)
CREATE TABLE availability_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone TEXT NOT NULL, -- Practitioner's local timezone for display
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

-- Exception dates (blocked dates, one-off availability changes)
CREATE TABLE availability_exceptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  exception_date DATE NOT NULL,
  is_blocked BOOLEAN NOT NULL DEFAULT true, -- true = blocked, false = extra availability
  start_time TIME, -- Optional: block specific hours
  end_time TIME,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio items (structured storage vs JSONB)
CREATE TABLE portfolio_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  thumbnail_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_availability_rules_practitioner ON availability_rules(practitioner_id);
CREATE INDEX idx_availability_exceptions_practitioner ON availability_exceptions(practitioner_id);
CREATE INDEX idx_availability_exceptions_date ON availability_exceptions(exception_date);
CREATE INDEX idx_portfolio_items_practitioner ON portfolio_items(practitioner_id);
```

**RLS Policies:**
```sql
-- Source: [ASSUMED based on existing RLS patterns]
-- Practitioners manage their own availability
ALTER TABLE availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Practitioners can manage own availability rules"
  ON availability_rules FOR ALL
  TO authenticated
  USING (practitioner_id IN (
    SELECT id FROM practitioners WHERE user_id = auth.uid()
  ));

CREATE POLICY "Practitioners can manage own exceptions"
  ON availability_exceptions FOR ALL
  TO authenticated
  USING (practitioner_id IN (
    SELECT id FROM practitioners WHERE user_id = auth.uid()
  ));

CREATE POLICY "Practitioners can manage own portfolio"
  ON portfolio_items FOR ALL
  TO authenticated
  USING (practitioner_id IN (
    SELECT id FROM practitioners WHERE user_id = auth.uid()
  ));

-- Public read access to approved practitioners' availability (for booking in Phase 3)
CREATE POLICY "Anyone can view approved practitioners availability"
  ON availability_rules FOR SELECT
  TO authenticated
  USING (practitioner_id IN (
    SELECT id FROM practitioners WHERE application_status = 'approved'
  ));
```

## Specialization Taxonomy (Claude's Discretion)

Based on research into [AI skills in demand 2026](https://futurense.com/blog/ai-skills-in-demand) and [enterprise AI skills taxonomy](https://oneten.org/news/research-snapshot-ai-driven-skills-taxonomy-checklist-an-evidence-based-guide/), here's a problem-centric taxonomy that maps to enterprise needs:

**Recommended Categories (enterprise-problem-centric):**

| Category | Enterprise Problem It Solves | Example Skills |
|----------|------------------------------|----------------|
| **AI Strategy & Roadmapping** | "Where should we start with AI?" | AI readiness assessment, use case prioritization, ROI modeling |
| **LLM & GenAI Implementation** | "We want to build with GPT/Claude" | Prompt engineering, RAG systems, fine-tuning, agent design |
| **ML Model Development** | "We need custom predictions" | Classical ML, deep learning, model training, feature engineering |
| **MLOps & Production** | "Our models aren't making it to production" | Model deployment, monitoring, CI/CD for ML, infrastructure |
| **Data Engineering for AI** | "Our data isn't AI-ready" | Data pipelines, vector databases, data quality, embeddings |
| **Computer Vision** | "We need to process images/video" | Object detection, OCR, image classification, video analysis |
| **NLP & Language AI** | "We need to understand/generate text" | Text classification, NER, summarization, translation |
| **AI Product & UX** | "How do users interact with AI?" | AI product design, evaluation, user research, prototyping |

**Implementation:**
```typescript
// Source: [ASSUMED - research-based recommendation]
export const SPECIALIZATION_CATEGORIES = [
  { id: 'ai-strategy', label: 'AI Strategy & Roadmapping', icon: 'Compass' },
  { id: 'llm-genai', label: 'LLM & GenAI Implementation', icon: 'Sparkles' },
  { id: 'ml-development', label: 'ML Model Development', icon: 'Brain' },
  { id: 'mlops-production', label: 'MLOps & Production', icon: 'Server' },
  { id: 'data-engineering', label: 'Data Engineering for AI', icon: 'Database' },
  { id: 'computer-vision', label: 'Computer Vision', icon: 'Eye' },
  { id: 'nlp-language', label: 'NLP & Language AI', icon: 'MessageSquare' },
  { id: 'ai-product-ux', label: 'AI Product & UX', icon: 'Layers' },
  { id: 'other', label: 'Other (specify)', icon: 'Plus' },
] as const
```

## Common Pitfalls

### Pitfall 1: Timezone Display Bugs
**What goes wrong:** Availability shows wrong times for enterprise users in different timezones
**Why it happens:** Storing local times or converting at wrong layer
**How to avoid:** Store UTC always. Store practitioner's preferred timezone. Convert at UI layer using user's detected timezone.
**Warning signs:** "My availability shows 2am meetings" complaints

### Pitfall 2: FullCalendar CSS Missing
**What goes wrong:** Calendar renders without styles (tiny text, no grid lines)
**Why it happens:** FullCalendar CSS not imported
**How to avoid:** Add `@import '@fullcalendar/core/main.css'` or use Tailwind-compatible themes
**Warning signs:** Calendar looks broken on first render

### Pitfall 3: Form State Lost on Navigation
**What goes wrong:** User loses wizard progress if they navigate away
**Why it happens:** Wizard state in component state (useState) not persisted
**How to avoid:** Use zustand with persist middleware, or save draft to Supabase
**Warning signs:** User complaints about "lost my work"

### Pitfall 4: Unfurl Rate Limiting
**What goes wrong:** Portfolio URL fetch fails silently or times out
**Why it happens:** External sites rate-limit or block server requests
**How to avoid:** Cache unfurl results in database. Show fallback (just URL) on failure. Add retry with backoff.
**Warning signs:** Portfolio items showing raw URLs instead of previews

### Pitfall 5: Recurring Events DST Bugs
**What goes wrong:** Availability shifts by 1 hour twice a year
**Why it happens:** Using fixed UTC offsets instead of timezone identifiers
**How to avoid:** Store timezone as IANA identifier (e.g., "America/New_York"), let date-fns-tz handle DST
**Warning signs:** Complaints in spring/fall about appointment times

## Code Examples

### Multi-Step Wizard Navigation
```typescript
// Source: [ASSUMED based on shadcn patterns]
// components/portal/profile-wizard/wizard-navigation.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useWizardStore } from '@/lib/stores/wizard-store'

const STEPS = ['Bio', 'Skills & Tools', 'Portfolio', 'Rates']

export function WizardNavigation() {
  const { currentStep, nextStep, prevStep } = useWizardStore()
  const progress = ((currentStep + 1) / STEPS.length) * 100

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Progress value={progress} className="flex-1" />
        <span className="text-sm text-muted-foreground">
          Step {currentStep + 1} of {STEPS.length}
        </span>
      </div>
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          Back
        </Button>
        <span className="text-sm font-medium self-center">
          {STEPS[currentStep]}
        </span>
        {currentStep < STEPS.length - 1 ? (
          <Button onClick={nextStep}>Continue</Button>
        ) : (
          <Button type="submit">Save Profile</Button>
        )}
      </div>
    </div>
  )
}
```

### Tier Badge Component
```typescript
// Source: [ASSUMED based on D-08 decision]
// components/portal/tier-badge.tsx
import { Badge } from '@/components/ui/badge'
import { Sparkles, Star, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PractitionerTier } from '@/types/database'

const tierConfig = {
  rising: {
    label: 'Rising',
    icon: Sparkles,
    className: 'bg-gray-100 text-gray-700 border-gray-200'
  },
  expert: {
    label: 'Expert',
    icon: Star,
    className: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  master: {
    label: 'Master',
    icon: Crown,
    className: 'bg-[#D97757]/10 text-[#D97757] border-[#D97757]/20'
  },
}

export function TierBadge({ tier }: { tier: PractitionerTier | null }) {
  if (!tier) return null
  const { label, icon: Icon, className } = tierConfig[tier]

  return (
    <Badge variant="outline" className={cn('gap-1', className)}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  )
}
```

### Sidebar Navigation
```typescript
// Source: [CITED: https://ui.shadcn.com/docs/components/radix/sidebar]
// components/portal/portal-sidebar.tsx
'use client'

import { Home, User, Calendar, Clock, Wallet } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'

const navItems = [
  { href: '/portal', label: 'Home', icon: Home },
  { href: '/portal/profile', label: 'Profile', icon: User },
  { href: '/portal/availability', label: 'Availability', icon: Calendar },
  { href: '/portal/sessions', label: 'Sessions', icon: Clock },
  { href: '/portal/earnings', label: 'Earnings', icon: Wallet },
]

export function PortalSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <span className="font-bold">BLAST AI</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname === item.href}>
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| moment.js for dates | date-fns or Temporal | 2020+ | 10x smaller bundle, immutable |
| moment-timezone | date-fns-tz v3 | 2024 | Tree-shakable, TypeScript-first |
| Custom sidebar CSS | shadcn/ui Sidebar | Nov 2024 | Keyboard shortcuts, persistence, mobile |
| Formik + Yup | react-hook-form + zod | 2023+ | Better TS, less rerenders |
| Separate CSS files | Tailwind v4 | 2025 | CSS-native config, faster builds |

**Deprecated/outdated:**
- **react-big-calendar:** Still works but lacks FullCalendar's enterprise features
- **moment-timezone:** Bundle size issues, use date-fns-tz
- **Custom form validation:** Zod with hookform is the 2026 standard

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | shadcn/ui Sidebar component is already installed | Standard Stack | Minor - just need to add it |
| A2 | unfurl.js works reliably in Next.js server actions | Architecture Patterns | Medium - may need fallback to metascraper |
| A3 | FullCalendar CSS imports work with Tailwind v4 | Architecture Patterns | Medium - may need custom theme |
| A4 | Supabase RLS policy pattern with subquery is performant | Database Schema | Medium - may need to use auth.uid() lookup differently |
| A5 | Specialization taxonomy covers enterprise needs | Specialization Taxonomy | Low - can easily add categories |

## Open Questions

1. **Session durations and slot math**
   - What we know: D-05 specifies 30-min base unit, sessions 20/40/60/90 min, D-06 specifies 15-min buffer
   - What's unclear: How do 20-min and 90-min sessions fit into 30-min slots? 20 leaves 10 min gap, 90 spans 3 slots.
   - Recommendation: Implement slot display as 30-min units, but allow booking to span multiple slots. 15-min buffer is between *bookings*, not slots.

2. **Portfolio thumbnail caching**
   - What we know: unfurl.js fetches metadata including images
   - What's unclear: Should we store thumbnail URLs (risk: link rot) or download/rehost images (complexity)?
   - Recommendation: Store URLs for MVP. Add Supabase Storage rehosting as v2 enhancement if link rot becomes issue.

3. **Anonymous profile display timing**
   - What we know: D-07 says name reveals "after booking is confirmed"
   - What's unclear: Does "confirmed" mean paid, or accepted by practitioner, or scheduled?
   - Recommendation: Implement as after-payment for MVP. Name in booking confirmation email.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | FullCalendar, Next.js | Assumed | 18+ | - |
| Supabase | Database, Auth | Configured | Latest | - |
| pnpm | Package management | Assumed | 9.x | npm/yarn |

**Missing dependencies with no fallback:** None identified

**Missing dependencies with fallback:** None identified

## Project Constraints (from CLAUDE.md)

| Directive | Source | Phase 2 Compliance |
|-----------|--------|-------------------|
| Tech Stack: Next.js + Supabase | PROJECT.md | All patterns use these |
| Brand Color: #D97757 | PROJECT.md | Master tier badge uses this |
| Design References: Linear, Contra | PROJECT.md | Sidebar follows Linear, profile follows Contra |
| Vibe: Minimal/Clean with warmth | PROJECT.md | shadcn/ui provides this aesthetic |
| Form validation: react-hook-form + zod | STACK.md | Existing pattern, extended for wizard |
| State management: Zustand | STACK.md | Used for wizard step state |
| Calendar: FullCalendar | STACK.md | Recommended, needs installation |

## Sources

### Primary (HIGH confidence)
- [VERIFIED: npm registry] - All package versions verified via `npm view`
- [VERIFIED: package.json] - Existing dependencies confirmed installed
- [CITED: FullCalendar Recurring Events Docs](https://fullcalendar.io/docs/recurring-events) - Recurring events API
- [CITED: shadcn/ui Sidebar Docs](https://ui.shadcn.com/docs/components/radix/sidebar) - Sidebar component patterns
- [CITED: shadcn/ui Forms Docs](https://ui.shadcn.com/docs/forms/react-hook-form) - Form patterns

### Secondary (MEDIUM confidence)
- [CITED: date-fns-tz docs](https://github.com/date-fns/date-fns/blob/main/docs/timeZones.md) - Timezone handling
- [CITED: unfurl.js GitHub](https://github.com/jacktuck/unfurl) - URL metadata extraction
- [CITED: AI Skills 2026 Article](https://futurense.com/blog/ai-skills-in-demand) - Specialization taxonomy research

### Tertiary (LOW confidence)
- [ASSUMED] Multi-step wizard patterns - Based on community patterns, not official docs
- [ASSUMED] Database schema design - Based on requirements, needs validation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All packages verified against npm registry
- Architecture: HIGH - Patterns from official docs and existing codebase
- Pitfalls: MEDIUM - Based on common issues, may miss project-specific issues
- Database schema: MEDIUM - Design based on requirements, needs review

**Research date:** 2026-04-10
**Valid until:** 2026-05-10 (30 days - stable domain)
