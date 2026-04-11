---
phase: 02-practitioner-supply
plan: 05
subsystem: portal/profiles
tags: [profiles, public-display, tier-badges, anonymity]
dependency_graph:
  requires: [02-02, 02-03, 02-04]
  provides: [TierBadge, StatsDisplay, ProfileCard, public-profile-page]
  affects: [portal/profile, practitioners/[id]]
tech_stack:
  added: []
  patterns: [buttonVariants-for-links, specialization-to-label-mapping]
key_files:
  created:
    - src/components/portal/tier-badge.tsx
    - src/components/portal/stats-display.tsx
    - src/components/portal/profile-card.tsx
    - src/app/practitioners/[id]/page.tsx
  modified:
    - src/app/portal/profile/page.tsx
decisions:
  - "Used buttonVariants() instead of Button asChild (Base UI compatibility)"
  - "Avatar initials derived from specialization label (anonymous per D-07)"
metrics:
  duration: 5m 17s
  completed: 2026-04-11T20:37:35Z
  tasks: 3
  files: 5
---

# Phase 02 Plan 05: Public Profile Display Summary

Public profile components (TierBadge, StatsDisplay, ProfileCard) and public practitioner profile page with portal profile preview.

## What Was Built

### Task 1: TierBadge and StatsDisplay Components

**TierBadge** (`src/components/portal/tier-badge.tsx`):
- Rising tier: gray badge with Sparkles icon
- Expert tier: blue badge with Star icon
- Master tier: terracotta (#D97757) badge with Crown icon per brand guidelines
- Supports `size="sm"` variant for compact display
- Exports `tierConfig` for reuse

**StatsDisplay** (`src/components/portal/stats-display.tsx`):
- Inline variant: "47 sessions - 9.2 NPS" format per D-09
- Card variant: large numbers for profile pages
- `StatsPlaceholder` component for new practitioners without stats

### Task 2: ProfileCard and Public Profile Page

**ProfileCard** (`src/components/portal/profile-card.tsx`):
- Anonymous display: shows specialization label, NOT name (per D-07)
- Avatar initials from specialization (e.g., "AI Strategy" -> "AS")
- TierBadge, StatsDisplay/StatsPlaceholder, bio preview
- Hourly rate and "View Profile" link

**Public Profile Page** (`src/app/practitioners/[id]/page.tsx`):
- Only shows approved practitioners (RLS filter `application_status='approved'`)
- Does NOT expose `full_name` (anonymous per D-07)
- Sections: Header (avatar, specialization, tier, stats), About, Specializations, Tools & Stack, Portfolio, Reviews (placeholder per PROF-06)
- Sidebar: Book a Session (Phase 3 placeholder), Industries
- Portfolio items displayed from `portfolio_items` table

### Task 3: Portal Profile Page Update

**Updated Portal Profile** (`src/app/portal/profile/page.tsx`):
- "Preview Public Profile" link opens `/practitioners/[id]` in new tab
- "Edit Profile" link to wizard
- Profile completeness warning when missing required fields
- Full profile display: specializations, tools, bio, portfolio items
- Sidebar: Private info (full name), hourly rate, tier badge
- Uses `getProfile()` server action to fetch data

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 9ec977f | feat | add TierBadge and StatsDisplay components |
| c5bac93 | feat | add ProfileCard component and public profile page |
| 3b8723f | feat | update portal profile page with preview and profile view |
| c135e31 | fix | replace Button asChild with buttonVariants for Link styling |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Button asChild prop not supported**
- **Found during:** Verification (build check)
- **Issue:** Base UI's Button component doesn't support `asChild` prop like Radix
- **Fix:** Used `buttonVariants()` with `cn()` to style Link components
- **Files modified:** src/app/portal/profile/page.tsx, src/components/portal/profile-card.tsx
- **Commit:** c135e31

## Known Issues (Out of Scope)

Pre-existing TypeScript error in `src/components/portal/availability-calendar.tsx:242` from plan 02-04 (Select onValueChange type mismatch). Logged to `deferred-items.md` per scope boundary rules.

## Known Stubs

None - all components fully functional for Phase 2 scope. Reviews section intentionally shows placeholder per PROF-06 (reviews table comes in Phase 4).

## Requirements Addressed

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| PROF-02 | Complete | TierBadge with colored pills (gray/blue/terracotta) |
| PROF-03 | Partial | StatsDisplay structure ready, real data in Phase 4 |
| PROF-06 | Complete | Reviews placeholder section in public profile |

## Self-Check: PASSED

- [x] src/components/portal/tier-badge.tsx exists
- [x] src/components/portal/stats-display.tsx exists
- [x] src/components/portal/profile-card.tsx exists
- [x] src/app/practitioners/[id]/page.tsx exists
- [x] Commit 9ec977f found
- [x] Commit c5bac93 found
- [x] Commit 3b8723f found
- [x] Commit c135e31 found
