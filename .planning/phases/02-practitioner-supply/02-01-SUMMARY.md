---
phase: 02-practitioner-supply
plan: 01
subsystem: database, foundation
tags: [database, migration, rls, packages, shadcn, taxonomy]
dependency_graph:
  requires: [00001_initial_schema.sql, practitioners table]
  provides: [availability_rules, availability_exceptions, portfolio_items, shadcn-sidebar, specialization-taxonomy]
  affects: [Phase 2 plans 02-05]
tech_stack:
  added: [@fullcalendar/react@6.1.20, @fullcalendar/daygrid@6.1.20, @fullcalendar/timegrid@6.1.20, @fullcalendar/interaction@6.1.20, date-fns@4.1.0, date-fns-tz@3.2.0, unfurl.js@6.4.0]
  patterns: [RLS policies with auth.uid() ownership check, recurring availability pattern]
key_files:
  created:
    - supabase/migrations/00002_phase2_schema.sql
    - src/lib/constants/specializations.ts
    - src/components/ui/sidebar.tsx
    - src/components/ui/tabs.tsx
    - src/components/ui/select.tsx
    - src/components/ui/badge.tsx
    - src/components/ui/progress.tsx
    - src/components/ui/avatar.tsx
    - src/components/ui/separator.tsx
    - src/components/ui/skeleton.tsx
    - src/components/ui/tooltip.tsx
    - src/components/ui/sheet.tsx
    - src/hooks/use-mobile.ts
  modified:
    - src/types/database.ts
    - package.json
decisions:
  - Recurring availability uses weekly rules pattern (day_of_week + time range)
  - Portfolio items stored as structured URLs, not JSONB in practitioners table
  - 9 specialization categories with problem-centric enterprise labels
  - Session slot mapping: 20->1, 40->2, 60->2, 90->3 slots with 15-min buffer
metrics:
  duration: 3 minutes
  completed: 2026-04-11
---

# Phase 02 Plan 01: Foundation Setup Summary

Database schema for availability and portfolio, FullCalendar and date-fns packages installed, shadcn components for mentor portal UI, and specialization taxonomy with session duration mapping.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Create Phase 2 database migration | 7003d99 | supabase/migrations/00002_phase2_schema.sql |
| 2 | Extend database types and install packages | 4feb00c | src/types/database.ts, package.json |
| 3 | Add shadcn components and specialization taxonomy | d31c881 | src/components/ui/sidebar.tsx, src/lib/constants/specializations.ts |

## What Was Built

### Database Schema
- **availability_rules** table: Recurring weekly availability (day_of_week, start_time, end_time, timezone)
- **availability_exceptions** table: Blocked dates and one-off changes
- **portfolio_items** table: URL-based portfolio with title, description, thumbnail
- **6 RLS policies** enforcing practitioner ownership via auth.uid() and public read for approved practitioners

### Packages Installed
- @fullcalendar/react, daygrid, timegrid, interaction v6.1.20 for availability calendar
- date-fns v4.1.0 and date-fns-tz v3.2.0 for timezone-safe date handling
- unfurl.js v6.4.0 for portfolio URL metadata extraction

### shadcn/ui Components
- Sidebar (with Sheet, Separator, Skeleton, Tooltip dependencies)
- Tabs, Select, Badge, Progress, Avatar
- use-mobile hook for responsive behavior

### Specialization Taxonomy
9 problem-centric categories per D-12, D-13:
1. AI Strategy & Roadmapping
2. LLM & GenAI Implementation
3. ML Model Development
4. MLOps & Production
5. Data Engineering for AI
6. Computer Vision
7. NLP & Language AI
8. AI Product & UX
9. Other (custom)

Session duration mapping per D-05, D-06:
- 20 min = 1 slot
- 40 min = 2 slots
- 60 min = 2 slots
- 90 min = 3 slots
- 15-min buffer between sessions

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

```
Migration tables: 3 (availability_rules, availability_exceptions, portfolio_items)
RLS policies: 6 (owner manage + public read for each table)
Types extended: availability_rules, availability_exceptions, portfolio_items
Packages installed: @fullcalendar/react, date-fns, date-fns-tz, unfurl.js
Components created: sidebar, tabs, select, badge, progress, avatar, separator, skeleton, tooltip, sheet
Specializations defined: 9 categories with SESSION_TYPE_SLOTS mapping
Build: PASSED (no TypeScript errors)
```

## Self-Check: PASSED

- [x] supabase/migrations/00002_phase2_schema.sql exists
- [x] src/types/database.ts contains availability_rules
- [x] src/lib/constants/specializations.ts exists with SPECIALIZATION_CATEGORIES
- [x] src/components/ui/sidebar.tsx exists
- [x] Commit 7003d99 verified
- [x] Commit 4feb00c verified
- [x] Commit d31c881 verified
- [x] npm run build succeeds
