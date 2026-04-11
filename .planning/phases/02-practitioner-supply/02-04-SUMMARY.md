---
phase: 02-practitioner-supply
plan: 04
subsystem: availability
tags: [calendar, fullcalendar, timezone, scheduling]
dependency_graph:
  requires: [02-01, 02-02]
  provides: [availability-rules, availability-exceptions, timezone-utils]
  affects: [booking-flow, session-scheduling]
tech_stack:
  added: [@fullcalendar/react, date-fns-tz]
  patterns: [recurring-events, timezone-conversion, session-slot-calculation]
key_files:
  created:
    - src/lib/validations/availability.ts
    - src/lib/utils/timezone.ts
    - src/actions/availability.ts
    - src/components/portal/availability-calendar.tsx
  modified:
    - src/app/portal/availability/page.tsx
decisions:
  - Store times in practitioner timezone (not UTC) for simplicity
  - Use FullCalendar background events for availability visualization
  - Session duration options per D-05: 20, 40, 60, 90 minutes
  - 15-minute buffer between sessions per D-06
metrics:
  duration: 4 minutes
  completed: 2026-04-11T20:30:00Z
  tasks: 3/3
  files_created: 4
  files_modified: 1
---

# Phase 02 Plan 04: Availability Calendar Summary

FullCalendar-based availability management with recurring weekly rules, exception dates, timezone handling, and session duration mapping per D-04/D-05/D-06.

## What Was Built

### Task 1: Validation Schemas and Timezone Utilities
- **Commit:** 457241a
- **Files:** `src/lib/validations/availability.ts`, `src/lib/utils/timezone.ts`
- Created Zod schemas for availability rules (day, start/end time) and exceptions (date blocking)
- Added timezone utilities: `formatInUserTimezone`, `localTimeToUTC`, `utcTimeToLocal`
- Added session slot calculation: `calculateBookableSlots`, `canFitSession`, `getAvailableSessionTypes`
- Added `COMMON_TIMEZONES` list for dropdown (14 major timezones)
- Added `generateTimeSlots` for 30-minute interval options

### Task 2: Availability Server Actions
- **Commit:** 9705f54
- **Files:** `src/actions/availability.ts`
- `getAvailability()` - Fetch practitioner's rules and future exceptions
- `saveAvailabilityRules()` - Bulk replace all availability rules with validation
- `addAvailabilityRule()` - Add single rule
- `deleteAvailabilityRule()` - Remove rule by ID
- `addException()` - Block specific date
- `deleteException()` - Unblock date
- All actions include auth checks and revalidate `/portal/availability`

### Task 3: FullCalendar UI Component
- **Commit:** 17c7f4b
- **Files:** `src/components/portal/availability-calendar.tsx`, `src/app/portal/availability/page.tsx`
- FullCalendar integration with dayGrid, timeGrid, and interaction plugins
- Green background events for recurring availability
- Red background events for blocked dates
- Timezone selector with common timezones
- Session types info card showing 20/40/60/90 min options (D-05)
- Buffer info showing 15-min between sessions (D-06)
- Weekly schedule management: add/remove time blocks
- Real-time validation showing which session types fit in time window
- Date blocking UI with date picker

## Key Patterns

### Session Slot Calculation (D-05/D-06)
```typescript
// Check if window can fit a session
canFitSession('09:00', '10:00', 40) // true (40 + 15 buffer = 55 min fits in 60)
canFitSession('09:00', '09:30', 20) // false (20 + 15 = 35 > 30)

// Get bookable start times
calculateBookableSlots('09:00', '12:00', 60)
// Returns: ['09:00', '10:15', '11:30'] (60 min + 15 buffer between)
```

### FullCalendar Recurring Events
```typescript
{
  groupId: 'availability',
  daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
  startTime: '09:00',
  endTime: '17:00',
  display: 'background',
  color: '#22c55e'
}
```

## Deviations from Plan

None - plan executed exactly as written.

## Dependencies Verified

- FullCalendar packages installed: @fullcalendar/react, @fullcalendar/daygrid, @fullcalendar/timegrid, @fullcalendar/interaction
- date-fns-tz installed for timezone handling
- Database tables `availability_rules` and `availability_exceptions` exist in types

## Known Limitations

- Times stored in practitioner timezone (not UTC) - simpler for MVP but may need conversion for cross-timezone booking display
- No drag-and-drop editing of availability blocks (view-only calendar)
- Pre-existing build error in `/portal/profile/page.tsx` (asChild prop issue) - unrelated to this plan

## Self-Check: PASSED

- [x] src/lib/validations/availability.ts exists
- [x] src/lib/utils/timezone.ts exists
- [x] src/actions/availability.ts exists
- [x] src/components/portal/availability-calendar.tsx exists
- [x] Commit 457241a found
- [x] Commit 9705f54 found
- [x] Commit 17c7f4b found
