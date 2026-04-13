---
phase: 03-discovery-booking-payments
plan: 03
subsystem: booking-wizard
tags: [booking, wizard, ui, forms, calendar]
dependency_graph:
  requires: [02-04]
  provides: [booking-wizard-ui, session-brief-form, slot-picker]
  affects: [booking-flow, enterprise-ux]
tech_stack:
  added: []
  patterns: [zustand-wizard-store, react-hook-form-zod, fullcalendar-selection]
key_files:
  created:
    - src/lib/validations/booking.ts
    - src/lib/stores/booking-wizard.ts
    - src/components/booking/step-session-type.tsx
    - src/components/booking/step-brief.tsx
    - src/components/booking/step-slot-picker.tsx
    - src/components/booking/wizard-container.tsx
    - src/app/book/[practitioner_id]/page.tsx
  modified: []
decisions:
  - Placed booking wizard store in src/lib/stores/ to follow existing wizard-store.ts pattern
  - Used BOOKING_WIZARD_STEPS constant exported from store for DRY step labels
metrics:
  duration: ~15min
  completed: 2026-04-13
  tasks: 3
  files: 7
---

# Phase 03 Plan 03: Booking Wizard UI Summary

Multi-step booking wizard with session type selection, structured brief form, and availability calendar for enterprise slot picking.

## What Was Built

### Task 1: Booking Validation Schemas and Wizard Store

Created `src/lib/validations/booking.ts` with:
- `sessionBriefSchema` with required fields per D-06 (stuckOn, desiredOutcome with 20 char min)
- `selectedSlotSchema` for date/time validation
- `createBookingSchema` combining all booking inputs

Created `src/lib/stores/booking-wizard.ts` with:
- 5-step wizard state (SessionType, Brief, Slot, Payment, Confirmation)
- Step navigation (nextStep, prevStep, setStep)
- State management for sessionDuration, brief, selectedSlot, timezone
- `canProceedToPayment()` computed check for validation

### Task 2: Session Type and Brief Form Components

Created `src/components/booking/step-session-type.tsx`:
- Card grid with 20, 40, 60, 90 minute options
- Session duration descriptions
- Sprint packages "Coming soon" teaser per D-05
- Continue button disabled until selection

Created `src/components/booking/step-brief.tsx`:
- react-hook-form with zod validation
- Required "What are you stuck on?" field (20+ chars)
- Required "What outcome do you want?" field (20+ chars)
- Optional "Any context to share?" field
- Character count displays
- Back/Continue navigation

### Task 3: Slot Picker, Wizard Container, and Booking Page

Created `src/components/booking/step-slot-picker.tsx`:
- FullCalendar with timeGridPlugin and interactionPlugin
- Timezone selector with COMMON_TIMEZONES
- Color-coded legend (green=Available, gray=Booked, red=Blocked)
- dateClick handler for slot selection
- validRange to prevent past date selection

Created `src/components/booking/wizard-container.tsx`:
- Progress indicator showing "Step X of 5"
- Renders appropriate step component based on wizard state
- Sets practitionerId on mount, resets on unmount
- Placeholder messages for Payment/Confirmation steps (Plan 04/05)

Created `src/app/book/[practitioner_id]/page.tsx`:
- Server Component fetching practitioner, rules, exceptions, bookings
- Validates practitioner is approved
- Anonymous practitioner sidebar with specialization and tier badge
- Grid layout with sticky sidebar

## Commits

| Commit | Message | Files |
|--------|---------|-------|
| 4a14161 | feat(03-03): add booking validation schemas and wizard store | 2 |
| fb6ddd0 | feat(03-03): add session type and brief form step components | 2 |
| 7156b5f | feat(03-03): add slot picker, wizard container, and booking page | 3 |

## Deviations from Plan

### Store Location Adjustment

**[Rule 2 - Convention]** Placed store in `src/lib/stores/` instead of `src/stores/` to follow existing `wizard-store.ts` pattern in the codebase.

## Key Integrations

- **Zustand store** follows existing wizard-store.ts pattern
- **FullCalendar** reuses plugins already installed in Phase 2
- **calculateBookableSlots** from `src/lib/utils/timezone.ts` for slot generation
- **SPECIALIZATION_CATEGORIES** from `src/lib/constants/specializations.ts` for display titles
- **TierBadge** component for practitioner tier display

## Testing Notes

To verify:
1. Visit `/book/{practitioner_id}` with an approved practitioner ID
2. Session type cards should be selectable (20/40/60/90)
3. Sprint packages shows "Coming soon"
4. Brief form validates required fields (20 char minimum)
5. Slot picker shows calendar with availability
6. Progress indicator updates on navigation
7. Back/Continue buttons work between steps

## Self-Check: PASSED

- [x] src/lib/validations/booking.ts exists with sessionBriefSchema
- [x] src/lib/stores/booking-wizard.ts exists with useBookingWizard
- [x] src/components/booking/step-session-type.tsx exports StepSessionType
- [x] src/components/booking/step-brief.tsx exports StepBrief
- [x] src/components/booking/step-slot-picker.tsx exports StepSlotPicker
- [x] src/components/booking/wizard-container.tsx exports WizardContainer
- [x] src/app/book/[practitioner_id]/page.tsx exports BookPractitionerPage
- [x] Commits 4a14161, fb6ddd0, 7156b5f verified
