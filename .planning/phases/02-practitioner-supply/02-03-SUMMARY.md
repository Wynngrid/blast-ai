---
phase: 02-practitioner-supply
plan: 03
subsystem: portal
tags: [profile, wizard, forms, validation, portfolio]
dependency_graph:
  requires: [02-01]
  provides: [profile-wizard, profile-validation, portfolio-unfurl]
  affects: [portal-profile]
tech_stack:
  added: [zustand, unfurl.js, react-hook-form]
  patterns: [wizard-state-machine, server-actions, zod-validation]
key_files:
  created:
    - src/lib/validations/profile.ts
    - src/lib/stores/wizard-store.ts
    - src/actions/profile.ts
    - src/actions/portfolio.ts
    - src/app/portal/profile/edit/page.tsx
    - src/components/portal/profile-wizard/wizard-container.tsx
    - src/components/portal/profile-wizard/wizard-navigation.tsx
    - src/components/portal/profile-wizard/step-bio.tsx
    - src/components/portal/profile-wizard/step-skills.tsx
    - src/components/portal/profile-wizard/step-portfolio.tsx
    - src/components/portal/profile-wizard/step-rates.tsx
  modified: []
decisions:
  - "Used zustand for wizard state to persist form data across steps"
  - "Created custom progress bar instead of base-ui Progress for simpler API"
  - "Portfolio URLs unfurled server-side for security (no client fetch)"
metrics:
  duration: 4 minutes
  completed: 2026-04-11T13:32:00Z
---

# Phase 02 Plan 03: Profile Editor Wizard Summary

4-step profile wizard with Zod validation, zustand state management, portfolio URL unfurling, and server actions for database persistence.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Create validation schemas and zustand store | fe4efb3 | profile.ts, wizard-store.ts |
| 2 | Create server actions for profile and portfolio | 15bf8d4 | profile.ts, portfolio.ts |
| 3 | Create wizard UI components | 3defc73 | 7 wizard components |

## What Was Built

### Validation Schemas (src/lib/validations/profile.ts)
- `bioSchema`: Full name (min 2 chars), bio (50-500 chars)
- `skillsSchema`: Specializations array (min 1), tools array (min 1), optional industries
- `portfolioSchema`: URL-based items with title/description/thumbnail
- `ratesSchema`: Hourly rate ($50-$1000)
- `profileSchema`: Combined schema for final submission

### Wizard State Store (src/lib/stores/wizard-store.ts)
- Zustand store managing currentStep, stepData, isSubmitting
- Actions: setStepData, nextStep, prevStep, goToStep, reset
- Data persists across step navigation without loss

### Server Actions (src/actions/profile.ts, portfolio.ts)
- `getProfile()`: Fetch practitioner + portfolio items
- `updateBio()`, `updateSkills()`, `updateRates()`: Individual field updates
- `updatePortfolio()`: Replace all portfolio items
- `saveProfile()`: Combined wizard submission
- `unfurlPortfolioUrl()`: Extract title/description/thumbnail from URLs

### Wizard UI Components
- `WizardContainer`: Orchestrates steps, handles submission
- `WizardNavigation`: Progress bar, back button, step indicators
- `StepBio`: Name and bio with character count guidance
- `StepSkills`: Specialization checkboxes, tool tag input
- `StepPortfolio`: URL input with auto-unfurl, card display
- `StepRates`: Hourly rate input with tier read-only notice

## Key Implementation Details

1. **Form Validation**: react-hook-form + zod resolver provides real-time validation
2. **State Persistence**: Zustand store holds all form data across steps
3. **Portfolio Unfurl**: Server action uses unfurl.js with 5s timeout, falls back gracefully
4. **Auth Protection**: All server actions verify user authentication via getUser()
5. **Tier Read-Only**: Per D-03, tier is displayed but not editable (admin-assigned)

## Threat Mitigations Applied

| Threat ID | Mitigation |
|-----------|------------|
| T-02-03-01 | Zod validation on all inputs before DB operations |
| T-02-03-02 | Auth check via getUser() ensures users edit only own profile |
| T-02-03-03 | 5s timeout on unfurl, max 10 portfolio items |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Progress component API mismatch**
- **Found during:** Task 3
- **Issue:** base-ui Progress component doesn't support multiple children like Radix
- **Fix:** Created inline progress bar with Tailwind instead of using Progress primitive
- **Files modified:** wizard-navigation.tsx
- **Commit:** 3defc73

## Known Stubs

None - all components are fully wired to server actions and database.

## Out of Scope Issues Noted

- Pre-existing build error in `src/app/portal/profile/page.tsx` using `asChild` prop on Button component (base-ui doesn't support this pattern). Not caused by this plan. Logged to deferred-items.md.

## Self-Check: PASSED

- [x] src/lib/validations/profile.ts exists and contains bioSchema
- [x] src/lib/stores/wizard-store.ts exists and exports useWizardStore
- [x] src/actions/profile.ts exists and exports saveProfile
- [x] src/actions/portfolio.ts exists and exports unfurlPortfolioUrl
- [x] All 7 wizard components created
- [x] Commits fe4efb3, 15bf8d4, 3defc73 verified
