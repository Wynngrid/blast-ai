---
phase: 04-enterprise-dashboard-trust
plan: 04
subsystem: reviews-display
tags: [reviews, trust, practitioner-portal, profile]
dependency_graph:
  requires: [04-01, 04-02]
  provides: [review-display-components, portal-reviews-tab]
  affects: [practitioner-profile, practitioner-portal, browse-cards]
tech_stack:
  added: []
  patterns: [server-components-data-fetching, curated-highlights]
key_files:
  created:
    - src/components/reviews/review-card.tsx
    - src/components/reviews/review-list.tsx
    - src/app/portal/reviews/page.tsx
  modified:
    - src/actions/reviews.ts
    - src/components/browse/practitioner-card.tsx
    - src/app/practitioners/[id]/page.tsx
    - src/components/portal/portal-sidebar.tsx
    - src/app/portal/page.tsx
decisions:
  - D-09 public reviews implemented on practitioner profiles
  - D-10 curated highlights with expand/collapse for all reviews
  - D-11 rating display format on browse cards (X.X stars + count)
  - D-14 Reviews tab added to portal sidebar
  - D-15 comprehensive insights with trends and actionable feedback
metrics:
  duration: ~25 minutes
  completed: 2026-04-14
  tasks: 3
  files_changed: 8
---

# Phase 04 Plan 04: Review Display Summary

Reviews displayed on practitioner profiles and cards with curated highlights, plus practitioner portal Reviews tab for comprehensive feedback insights.

## Tasks Completed

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 1 | Add review display actions and update practitioner card | f1c43ef | getPractitionerReviews, getPractitionerReviewTrends actions; rating on cards |
| 2 | Create review display components and update practitioner profile | c9a6dd1 | ReviewCard, ReviewList components; profile reviews section with per-criteria breakdown |
| 3 | Add Reviews tab to practitioner portal | bb958dc | Portal sidebar Reviews link; /portal/reviews page with stats, trends, actionable feedback |

## Implementation Details

### Review Display Components

**ReviewCard** (`src/components/reviews/review-card.tsx`):
- Displays individual review with star rating, date, enterprise company
- Shows comment and per-criteria scores (Communication, Expertise, Helpfulness)
- Uses existing StarRating component in readonly mode

**ReviewList** (`src/components/reviews/review-list.tsx`):
- Client component with expand/collapse state
- Shows curated highlights (top 5 reviews by NPS) by default
- "Show all X reviews" button expands to full list per D-10

### Practitioner Profile Updates

Updated `src/app/practitioners/[id]/page.tsx`:
- Fetches review stats, curated reviews, and all reviews in parallel
- Displays aggregate rating with star rating and review count in header
- Per-criteria breakdown grid (Communication, Expertise, Helpfulness scores)
- ReviewList component with curated highlights and expand functionality

### Practitioner Portal Reviews Tab

**Sidebar Navigation** (`src/components/portal/portal-sidebar.tsx`):
- Added Reviews nav item with Star icon between Sessions and Earnings per D-14

**Reviews Page** (`src/app/portal/reviews/page.tsx`):
- Overall stats: rating with trend indicator, NPS score, total reviews, this month count
- Per-criteria breakdown with progress bars per D-15
- Actionable feedback sections: "What's Working" (NPS >= 9) and "Areas to Improve" (NPS <= 6)
- Recent reviews list using ReviewCard component
- Empty state for practitioners with no reviews

**Portal Home** (`src/app/portal/page.tsx`):
- Updated stats sidebar to show real average rating from reviews
- Dynamic label showing review count when available

## Deviations from Plan

None - plan executed exactly as written.

## Verification

```bash
# Task 1
grep -q "export async function getPractitionerReviews" src/actions/reviews.ts  # PASS
grep -q "Star" src/components/browse/practitioner-card.tsx  # PASS

# Task 2
grep -q "export function ReviewCard" src/components/reviews/review-card.tsx  # PASS
grep -q "export function ReviewList" src/components/reviews/review-list.tsx  # PASS
grep -q "ReviewList" src/app/practitioners/\[id\]/page.tsx  # PASS

# Task 3
grep -q "/portal/reviews" src/components/portal/portal-sidebar.tsx  # PASS
test -f src/app/portal/reviews/page.tsx  # PASS
grep -q "CriteriaBar" src/app/portal/reviews/page.tsx  # PASS
```

## Self-Check: PASSED

- [x] src/components/reviews/review-card.tsx exists
- [x] src/components/reviews/review-list.tsx exists
- [x] src/app/portal/reviews/page.tsx exists
- [x] Commit f1c43ef exists (Task 1)
- [x] Commit c9a6dd1 exists (Task 2)
- [x] Commit bb958dc exists (Task 3)
