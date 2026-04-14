---
phase: "04"
plan: "02"
subsystem: review-collection
tags: [reviews, nps, ratings, feedback, trust]
dependency_graph:
  requires: [04-01]
  provides: [review-components, review-server-action, review-stats]
  affects: [practitioner-profiles, enterprise-dashboard]
tech_stack:
  added: []
  patterns: [multi-criteria-rating, nps-scoring, mandatory-modal]
key_files:
  created:
    - src/components/reviews/star-rating.tsx
    - src/components/reviews/nps-input.tsx
    - src/components/reviews/outcome-select.tsx
    - src/components/reviews/review-modal.tsx
    - src/actions/reviews.ts
  modified: []
key_decisions:
  - NPS color coding: red 0-6 (detractors), yellow 7-8 (passives), green 9-10 (promoters)
  - Two-step review flow: outcome selection first, then ratings
  - Comment required when NPS <= 6 per D-08
metrics:
  duration: 2m
  completed: 2026-04-14
---

# Phase 04 Plan 02: Review Collection System Summary

Multi-criteria review modal with NPS scoring and outcome tagging for post-session feedback collection.

## What Was Built

### Review UI Components (Task 1 + 2)

**StarRating component** (`src/components/reviews/star-rating.tsx`):
- 5-star rating with hover/click interactions
- Supports readonly mode for display
- Three sizes: sm, md, lg
- Proper accessibility with `role="radiogroup"` and `aria-checked`
- Yellow fill for active stars

**NPSInput component** (`src/components/reviews/nps-input.tsx`):
- 0-10 scale for Net Promoter Score
- Color-coded selection: red (0-6 detractors), yellow (7-8 passives), green (9-10 promoters)
- Labels at endpoints for context

**OutcomeSelect component** (`src/components/reviews/outcome-select.tsx`):
- Multi-select checkboxes for session outcomes
- Four outcome options: skill_learned, blocker_resolved, need_followup, not_helpful
- Optional notes textarea

**ReviewModal component** (`src/components/reviews/review-modal.tsx`):
- Full-screen mandatory modal per D-06
- Navigation blocking via beforeunload event
- Two-step flow: outcome selection -> rating
- Multi-criteria ratings: Communication, Expertise, Helpfulness
- Conditional comment requirement when NPS <= 6

### Server Action (Task 3)

**submitReview** (`src/actions/reviews.ts`):
- Validates input with postSessionFeedbackSchema
- Verifies auth and enterprise ownership per T-04-06
- Prevents duplicate reviews per T-04-09
- Inserts into session_reviews and session_outcomes tables
- Updates booking needs_review flag
- Revalidates dashboard and profile paths

**getPendingReviews**:
- Fetches completed sessions needing review for current enterprise

**getPractitionerReviewStats**:
- Computes average ratings (overall, per-criteria) and NPS
- Returns stats for practitioner profiles/cards

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | b87f649 | Star rating and NPS input components |
| 2 | b3ac5ac | Outcome select and review modal components |
| 3 | 7d540eb | Review submission server action |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed ZodError property access**
- **Found during:** Task 3
- **Issue:** Used `.errors` instead of `.issues` on ZodError
- **Fix:** Changed `validation.error.errors[0]` to `validation.error.issues[0]`
- **Files modified:** src/actions/reviews.ts
- **Commit:** 7d540eb (included in task commit)

## Threat Mitigations Applied

| Threat ID | Mitigation |
|-----------|------------|
| T-04-06 | submitReview verifies auth.getUser() and enterprise ownership |
| T-04-07 | Zod schema validates rating ranges (1-5 stars, 0-10 NPS) |
| T-04-08 | Database timestamps on insert, no edit capability |
| T-04-09 | Duplicate check before insert |
| T-04-10 | booking.enterprise_id must match user's enterprise |

## Testing Notes

Components are ready for integration:
1. Import ReviewModal with bookingId and practitionerName props
2. Show when booking.needs_review is true
3. onComplete callback handles navigation after submission

## Self-Check: PASSED

- [x] src/components/reviews/star-rating.tsx exists
- [x] src/components/reviews/nps-input.tsx exists
- [x] src/components/reviews/outcome-select.tsx exists
- [x] src/components/reviews/review-modal.tsx exists
- [x] src/actions/reviews.ts exists
- [x] Commit b87f649 exists
- [x] Commit b3ac5ac exists
- [x] Commit 7d540eb exists
