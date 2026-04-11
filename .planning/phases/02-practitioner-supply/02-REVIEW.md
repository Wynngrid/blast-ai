---
phase: 02-practitioner-supply
reviewed: 2026-04-12T14:35:00Z
depth: standard
files_reviewed: 28
files_reviewed_list:
  - src/actions/availability.ts
  - src/actions/portfolio.ts
  - src/actions/profile.ts
  - src/app/portal/availability/page.tsx
  - src/app/portal/earnings/page.tsx
  - src/app/portal/layout.tsx
  - src/app/portal/page.tsx
  - src/app/portal/profile/edit/page.tsx
  - src/app/portal/profile/page.tsx
  - src/app/portal/sessions/page.tsx
  - src/app/practitioners/[id]/page.tsx
  - src/components/portal/availability-calendar.tsx
  - src/components/portal/portal-sidebar.tsx
  - src/components/portal/profile-card.tsx
  - src/components/portal/profile-wizard/step-bio.tsx
  - src/components/portal/profile-wizard/step-portfolio.tsx
  - src/components/portal/profile-wizard/step-rates.tsx
  - src/components/portal/profile-wizard/step-skills.tsx
  - src/components/portal/profile-wizard/wizard-container.tsx
  - src/components/portal/profile-wizard/wizard-navigation.tsx
  - src/components/portal/stats-display.tsx
  - src/components/portal/tier-badge.tsx
  - src/lib/constants/specializations.ts
  - src/lib/stores/wizard-store.ts
  - src/lib/utils/timezone.ts
  - src/lib/validations/availability.ts
  - src/lib/validations/profile.ts
  - src/types/database.ts
findings:
  critical: 2
  warning: 6
  info: 4
  total: 12
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-04-12T14:35:00Z
**Depth:** standard
**Files Reviewed:** 28
**Status:** issues_found

## Summary

Reviewed the Practitioner Supply phase code including server actions for profile/availability management, portal UI components, profile wizard, and supporting utilities. The codebase follows good patterns overall (Zod validation, proper TypeScript typing, clean component structure), but there are security concerns with SSRF potential in URL unfurling, race conditions in database operations, and several code quality issues that should be addressed.

Key concerns:
1. **SSRF vulnerability** in portfolio URL unfurling (server can be tricked into fetching internal resources)
2. **Non-atomic database operations** that could leave data in inconsistent states
3. **Unchecked URL constructor** calls that can throw on malformed input
4. **Missing input validation** on server action parameters

## Critical Issues

### CR-01: SSRF Vulnerability in URL Unfurling

**File:** `src/actions/portfolio.ts:16-24`
**Issue:** The `unfurlPortfolioUrl` server action fetches arbitrary URLs provided by users without validating the target. An attacker could craft URLs pointing to internal services (e.g., `http://169.254.169.254/` for cloud metadata, `http://localhost:3000/admin`, internal IPs) to probe internal infrastructure or exfiltrate sensitive data.
**Fix:**
```typescript
export async function unfurlPortfolioUrl(url: string): Promise<UnfurlResult> {
  try {
    const parsedUrl = new URL(url)

    // Block internal/private IP ranges and localhost
    const hostname = parsedUrl.hostname.toLowerCase()
    const blockedPatterns = [
      /^localhost$/,
      /^127\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^169\.254\./,
      /^0\./,
      /^\[::1\]$/,
      /^metadata\.google/,
    ]

    if (blockedPatterns.some(pattern => pattern.test(hostname))) {
      return {
        success: false,
        data: null,
        error: 'URL not allowed',
      }
    }

    // Only allow http/https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return {
        success: false,
        data: null,
        error: 'Only HTTP/HTTPS URLs are allowed',
      }
    }

    const metadata = await unfurl(url, {
      timeout: 5000,
      follow: 3,
    })
    // ... rest of implementation
```

### CR-02: Non-Atomic Delete-Then-Insert in saveAvailabilityRules

**File:** `src/actions/availability.ts:101-124`
**Issue:** The `saveAvailabilityRules` function deletes all existing rules then inserts new ones in separate operations. If the insert fails after the delete succeeds, the practitioner loses all their availability data with no way to recover. This is a data loss risk.
**Fix:**
```typescript
export async function saveAvailabilityRules(
  input: AvailabilityRulesInput
): Promise<AvailabilityResult> {
  // ... validation code ...

  // Use a transaction or upsert pattern
  // Option 1: Delete and insert in a single RPC call with transaction
  const { error } = await supabase.rpc('replace_availability_rules', {
    p_practitioner_id: practitioner.id,
    p_rules: validated.data.rules.map((rule) => ({
      day_of_week: rule.dayOfWeek,
      start_time: rule.startTime + ':00',
      end_time: rule.endTime + ':00',
      timezone: validated.data.timezone,
    })),
  })

  // Option 2: Soft-delete approach (mark old, insert new, then delete marked)
  // This provides rollback capability if insert fails
```

## Warnings

### WR-01: Non-null Assertion on User Object

**File:** `src/app/portal/page.tsx:13`
**Issue:** Using `user!.id` assumes user is always defined. While the layout redirects unauthenticated users, the non-null assertion could mask bugs if the auth flow changes. The query will fail silently with an undefined user ID.
**Fix:**
```typescript
export default async function PortalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: practitioner } = await supabase
    .from('practitioners')
    .select('full_name, application_status, bio, specializations, tier, hourly_rate')
    .eq('user_id', user.id) // No assertion needed after guard
    .single()
```

### WR-02: Uncaught URL Constructor Exception in Profile Display

**File:** `src/app/portal/profile/page.tsx:198`
**Issue:** `new URL(item.url).hostname` can throw if `item.url` is malformed. While data should be validated on input, defensive coding would prevent runtime crashes from bad data.
**Fix:**
```typescript
{portfolioItems.map((item) => {
  let hostname = 'Unknown'
  try {
    hostname = new URL(item.url).hostname
  } catch {
    hostname = item.url.slice(0, 30)
  }

  return (
    <a
      key={item.id}
      href={item.url}
      // ...
    >
      <p className="font-medium group-hover:text-primary flex items-center gap-1">
        {item.title || hostname}
        <ExternalLink className="h-3 w-3" />
      </p>
    </a>
  )
})}
```

### WR-03: Same URL Constructor Issue in Public Profile

**File:** `src/app/practitioners/[id]/page.tsx:167`
**Issue:** Same uncaught URL constructor exception as WR-02 in the public practitioner profile page.
**Fix:** Same fix as WR-02 - wrap in try/catch.

### WR-04: Missing Validation on addAvailabilityRule Parameters

**File:** `src/actions/availability.ts:133-138`
**Issue:** The `addAvailabilityRule` function accepts raw parameters without Zod validation. While `saveAvailabilityRules` validates its input, this function does not validate `dayOfWeek`, `startTime`, `endTime` bounds, or timezone format. A malformed timezone string or invalid day could cause database errors or unexpected behavior.
**Fix:**
```typescript
const singleRuleSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  timezone: z.string().min(1),
})

export async function addAvailabilityRule(
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  timezone: string
): Promise<AvailabilityResult> {
  const validated = singleRuleSchema.safeParse({ dayOfWeek, startTime, endTime, timezone })
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message }
  }
  // ... rest of implementation
```

### WR-05: Non-Atomic Portfolio Update

**File:** `src/actions/profile.ts:169-192`
**Issue:** Similar to CR-02, `updatePortfolio` deletes all portfolio items then inserts new ones. If the insert fails, the practitioner loses their portfolio data.
**Fix:** Use a database transaction or implement a soft-delete pattern to ensure atomicity.

### WR-06: Time Comparison Using String Comparison

**File:** `src/lib/validations/availability.ts:10-12`
**Issue:** The refinement `data.startTime < data.endTime` uses string comparison for times. This works correctly for "HH:MM" format but is fragile. If the format changes or times cross midnight, this comparison would break.
**Fix:**
```typescript
.refine(
  (data) => {
    const [startH, startM] = data.startTime.split(':').map(Number)
    const [endH, endM] = data.endTime.split(':').map(Number)
    return (startH * 60 + startM) < (endH * 60 + endM)
  },
  { message: 'End time must be after start time', path: ['endTime'] }
)
```

## Info

### IN-01: Unused practitionerId Prop

**File:** `src/components/portal/availability-calendar.tsx:50-53`
**Issue:** The `practitionerId` prop is destructured but never used in the component. This suggests incomplete implementation or dead code.
**Fix:** Either use the prop (e.g., for optimistic updates) or remove it from the interface and component signature.

### IN-02: Inconsistent Error Handling Pattern

**File:** `src/components/portal/profile-wizard/step-portfolio.tsx:37-43`
**Issue:** The catch block on line 37 swallows the error and still adds the URL. While this is intentional fallback behavior, logging the error would help debugging.
**Fix:**
```typescript
} catch (error) {
  console.warn('Failed to unfurl URL, using fallback:', error)
  // Still add the URL even if unfurl fails
  setItems([...items, { url: urlInput.trim() }])
  setUrlInput('')
}
```

### IN-03: Magic Number in Wizard Step Bounds

**File:** `src/lib/stores/wizard-store.ts:43-44`
**Issue:** The step bounds use magic number `3` instead of deriving from `WIZARD_STEPS.length - 1`. If steps are added/removed, these bounds could become incorrect.
**Fix:**
```typescript
const TOTAL_STEPS = WIZARD_STEPS.length

export const useWizardStore = create<WizardState>((set) => ({
  // ...
  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, TOTAL_STEPS - 1),
    })),
  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 0),
    })),
  goToStep: (step) =>
    set({ currentStep: Math.max(0, Math.min(step, TOTAL_STEPS - 1)) }),
  // ...
}))
```

### IN-04: Commented Reference in UI Text

**File:** `src/app/portal/profile/page.tsx:111`
**Issue:** The text "Public view shows specialization, not your name (per D-07)" includes a design document reference that should not be user-facing.
**Fix:**
```typescript
<p className="text-sm text-muted-foreground mt-2">
  Enterprises see your specialization, not your name, until after booking
</p>
```

---

_Reviewed: 2026-04-12T14:35:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
