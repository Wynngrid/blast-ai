---
phase: 04-enterprise-dashboard-trust
plan: 01
title: Review Schema and Types
subsystem: database, types
tags: [schema, reviews, outcomes, rls, zod]
dependency_graph:
  requires: [bookings, enterprises, practitioners]
  provides: [session_reviews, session_outcomes, review-schemas]
  affects: [practitioner-profiles, enterprise-dashboard, portal-reviews]
tech_stack:
  added: []
  patterns: [rls-policies, zod-validation, typescript-database-types]
key_files:
  created:
    - supabase/migrations/20260414_session_reviews.sql
    - src/lib/schemas/review.ts
  modified:
    - src/types/database.ts
decisions:
  - D-07 multi-criteria ratings implemented (communication, expertise, helpfulness 1-5)
  - D-08 conditional comment validation (required if NPS <= 6)
  - D-04 outcome tags as TEXT[] array with 4 allowed values
metrics:
  duration: 2m
  completed: 2026-04-14T07:59:00Z
  tasks: 3
  files: 3
requirements_completed: [REV-01, REV-02, REV-03, REV-04]
---

# Phase 04 Plan 01: Review Schema and Types Summary

Database schema and TypeScript types for session reviews and outcomes with RLS policies and zod validation.

## One-Liner

Multi-criteria review schema with NPS scoring, outcome tags array, and D-08 conditional comment validation.

## What Was Built

### Task 1: SQL Migration (20260414_session_reviews.sql)

Created database schema for the review and outcome system:

**session_reviews table:**
- Multi-criteria ratings: communication, expertise, helpfulness (1-5 scale with CHECK constraints)
- NPS score (0-10 scale with CHECK constraint)
- Optional comment field (enforced at app level for low scores)
- is_public flag for visibility control (default true per D-09)
- Foreign keys to bookings, enterprises, practitioners with CASCADE delete

**session_outcomes table:**
- outcome_tags TEXT[] array for multi-select tags per D-04
- Optional notes field
- Foreign keys to bookings, enterprises

**RLS Policies:**
- Enterprises can read public reviews (D-09)
- Enterprises can insert reviews for their own bookings (T-04-01 mitigation)
- Practitioners can read their own reviews (MENT-04)
- Admins have full access for reporting

**Bookings enhancement:**
- Added needs_review column for tracking which completed sessions need reviews

### Task 2: TypeScript Types (database.ts)

Extended the Database interface:

- Added `OutcomeTag` union type: `'skill_learned' | 'blocker_resolved' | 'need_followup' | 'not_helpful'`
- Added `session_reviews` table types (Row, Insert, Update, Relationships)
- Added `session_outcomes` table types with OutcomeTag[] for outcome_tags
- Added `needs_review: boolean` to bookings Row/Insert/Update types

### Task 3: Zod Validation Schemas (review.ts)

Created validation schemas for form and server-side use:

- `outcomeTagSchema` - enum validator for outcome tags
- `sessionOutcomeSchema` - validates outcome form (min 1 tag required)
- `reviewSchema` - validates review form with D-08 refinement
- `postSessionFeedbackSchema` - combined review + outcome for single submission
- Server-side insert schemas with snake_case field names

**D-08 Implementation:**
```typescript
.refine(
  (data) => data.npsScore > 6 || (data.comment && data.comment.trim().length >= 10),
  { message: 'Please tell us why you gave this rating (at least 10 characters)', path: ['comment'] }
)
```

## Commits

| Hash | Message |
|------|---------|
| 2616e1e | feat(04-01): create session_reviews and session_outcomes tables |
| 7858d7b | feat(04-01): extend TypeScript types for reviews and outcomes |
| d5f6e88 | feat(04-01): add zod validation schemas for reviews and outcomes |

## Deviations from Plan

None - plan executed exactly as written.

## Threat Mitigations Applied

| Threat ID | Mitigation |
|-----------|------------|
| T-04-01 (Spoofing) | RLS INSERT policy requires enterprise_id to match auth.uid() via enterprises table |
| T-04-02 (Tampering) | CHECK constraints enforce rating bounds (1-5, 0-10) at database level |
| T-04-04 (Info Disclosure) | is_public column + RLS policy controls review visibility |
| T-04-05 (Privilege Escalation) | INSERT policy only allows enterprises, not practitioners |

## Verification Results

All automated verifications passed:
- SQL migration contains 2 CREATE TABLE statements
- SQL migration contains 8 CREATE POLICY statements
- TypeScript types include all required fields
- TypeScript compilation passes (`npx tsc --noEmit`)
- Zod schemas include D-08 conditional validation

## Self-Check: PASSED

- [x] supabase/migrations/20260414_session_reviews.sql exists
- [x] src/types/database.ts contains session_reviews and session_outcomes
- [x] src/lib/schemas/review.ts exists with validation schemas
- [x] Commit 2616e1e exists
- [x] Commit 7858d7b exists
- [x] Commit d5f6e88 exists
