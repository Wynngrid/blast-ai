# Phase 2: Practitioner Supply - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-10
**Phase:** 02-practitioner-supply
**Areas discussed:** Profile Editor UI, Availability Calendar, Profile Display (Public), Mentor Portal Dashboard, Specialization Taxonomy

---

## Profile Editor UI

### Layout Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Single page form | All fields on one scrollable page with sections. Simpler, faster to complete. Contra-style. | |
| Multi-step wizard | Step 1: Bio → Step 2: Skills → Step 3: Portfolio. More guided, but more clicks. | ✓ |
| Tab-based sections | Tabs at top: General | Skills | Portfolio | Rates. Can edit any section independently. | |

**User's choice:** Multi-step wizard
**Notes:** None

### Portfolio Items

| Option | Description | Selected |
|--------|-------------|----------|
| URL-based links | Paste links to Behance, Dribbble, YouTube, etc. Platform auto-fetches title/thumbnail. Lightweight. | ✓ |
| File uploads | Upload images/PDFs directly. Requires Supabase Storage. | |
| Hybrid | Both options available. Links preferred, uploads for proprietary work. | |

**User's choice:** URL-based links (Recommended)
**Notes:** None

### Field Permissions

| Option | Description | Selected |
|--------|-------------|----------|
| Tier is admin-only | Practitioner edits everything except tier. Admin assigns tier. Maintains quality control. | ✓ |
| All fields editable | Practitioner can set their own tier. Risk: everyone picks 'Master'. | |
| Tier + rate admin-controlled | Admin sets both tier AND hourly rate. More control, less autonomy. | |

**User's choice:** Tier is admin-only (Recommended)
**Notes:** None

---

## Availability Calendar

### Availability Type

| Option | Description | Selected |
|--------|-------------|----------|
| Recurring weekly schedule | Set weekly pattern. Calendar generates slots automatically. | ✓ |
| Specific date/time slots | Add individual slots manually. Maximum flexibility. | |
| Hybrid | Weekly base schedule with ability to block/add specific dates. | |

**User's choice:** Recurring weekly schedule (Recommended)
**Notes:** None

### Slot Duration

| Option | Description | Selected |
|--------|-------------|----------|
| 1 hour | Standard for mentorship/consulting. | |
| 30 minutes | More granular. Good for quick consultations. | ✓ |
| Practitioner chooses | Each practitioner sets their own slot duration. | |

**User's choice:** 30 minutes
**Notes:** User specified session options: 20, 40, 60, 90 minutes

### Buffer Time

| Option | Description | Selected |
|--------|-------------|----------|
| 15-minute buffer | Automatic gap between bookable slots. Prevents back-to-back burnout. | ✓ |
| No buffer | Slots can be back-to-back. | |
| Practitioner configurable | Let practitioner choose buffer (0/15/30 min). | |

**User's choice:** 15-minute buffer (Recommended)
**Notes:** None

---

## Profile Display (Public)

### Tier Badge Styling

| Option | Description | Selected |
|--------|-------------|----------|
| Colored pill with icon | Small badge: Rising (gray), Expert (blue), Master (terracotta). | ✓ |
| Text label only | Plain text next to name. Minimal. | |
| Icon only | Star/badge icon with color. Cleaner but requires learning colors. | |

**User's choice:** Colored pill with icon (Recommended)
**Notes:** None

### Card Stats

| Option | Description | Selected |
|--------|-------------|----------|
| Sessions + NPS only | Essential trust signals without clutter. | ✓ |
| Sessions + NPS + Rebook rate | All three metrics. More data but may overwhelm. | |
| Sessions only | Simplest, but NPS is strong trust signal. | |

**User's choice:** Sessions + NPS only (Recommended)
**Notes:** None

---

## Mentor Portal Dashboard

### Portal Home View

| Option | Description | Selected |
|--------|-------------|----------|
| Upcoming sessions + quick stats | Sessions front and center. Stats sidebar. Action-focused. | ✓ |
| Full calendar view | Calendar dominates the page. Sessions embedded. | |
| Stats dashboard | Earnings chart, session trends. Analytics-first. | |

**User's choice:** Upcoming sessions + quick stats (Recommended)
**Notes:** None

### Portal Navigation

| Option | Description | Selected |
|--------|-------------|----------|
| Sidebar navigation | Left sidebar: Home | Profile | Availability | Sessions | Earnings. Linear-style. | ✓ |
| Top tabs | Horizontal tabs at top. | |
| Cards on home page | No persistent nav. Home has cards linking to sections. | |

**User's choice:** Sidebar navigation (Recommended)
**Notes:** None

---

## Specialization Taxonomy

### Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Predefined list + custom | Core list plus 'Other' with free-text. Best of both. | ✓ |
| Fully predefined | Fixed dropdown only. Consistent but may miss niches. | |
| Free-text tags | Any tags. Flexible but inconsistent. | |

**User's choice:** Predefined list + custom (Recommended)
**Notes:** None

### Core Categories

| Option | Description | Selected |
|--------|-------------|----------|
| Use beta practitioner roster | AI Filmmaker, AI Performance Marketing, AI UX/Product, Voice AI. | |
| Broader categories | AI Content Creation, AI Marketing, AI Design, AI Engineering. | |
| Let Claude decide | Research common AI skill categories and propose taxonomy. | ✓ |

**User's choice:** Let Claude decide
**Notes:** None

### Label Style

| Option | Description | Selected |
|--------|-------------|----------|
| Dual labels | Problem-first to enterprises, skill-first to practitioners. Same taxonomy, different display. | |
| Problem-centric only | Use enterprise-friendly labels everywhere. Practitioners adapt. | ✓ |
| Skill-centric only | Use practitioner expertise labels. Add descriptions. | |

**User's choice:** Problem-centric only
**Notes:** User wanted to ensure taxonomy makes sense from enterprise client POV

---

## Claude's Discretion

- Specialization taxonomy categories — research and propose
- Wizard step grouping
- Loading/empty states
- Responsive breakpoints

## Deferred Ideas

- Agentic real-time copilot (v2)
- File uploads for portfolio (v2)
- Rebook rate stat (v2)
- Session packages/sprints (v2/Phase 3)
