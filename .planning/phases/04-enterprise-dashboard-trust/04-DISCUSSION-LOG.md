# Phase 4: Enterprise Dashboard & Trust - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-14
**Phase:** 04-enterprise-dashboard-trust
**Areas discussed:** Dashboard layout, Review collection, Review display, Rebook flow, Practitioner review view, Manager reporting

---

## Dashboard Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Tabbed sections (Recommended) | Overview \| Sessions \| Budget tabs. Linear-style. | ✓ |
| Single scrolling page | Everything on one long page. | |
| Sidebar navigation | Left sidebar like practitioner portal. | |

**User's choice:** Tabbed sections
**Notes:** User wanted Linear-style clean navigation with each tab focusing on one concern.

---

## Dashboard Focus

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal | Coin balance, sessions this month, upcoming count. | |
| Detailed | Add team members, ratings, burn rate %. | |
| Visual-heavy | Large cards with charts and trends. | |

**User's choice:** Custom — Focus on AI adoption insights, less on coins/budgets, more on learning outcomes
**Notes:** User emphasized tracking how team is "working more efficiently and effectively" with AI skills.

---

## Progress Tracking Metrics

| Option | Description | Selected |
|--------|-------------|----------|
| Session-derived only | Sessions, specializations, practitioners worked with. | |
| Self-reported progress | After session, enterprise marks outcomes. | ✓ |
| AI-generated insights | AI analyzes briefs and patterns. | |

**User's choice:** Self-reported progress
**Notes:** Light feedback loop where enterprise marks session outcomes.

---

## Progress Tracking Method

| Option | Description | Selected |
|--------|-------------|----------|
| Binary outcome | "Did this session help?" Yes/No. | |
| Multi-tag outcomes | Select from skill learned, blocker resolved, etc. | ✓ |
| Free-form notes | Text field for learnings. | ✓ |

**User's choice:** Both multi-tag outcomes AND free-form notes
**Notes:** User explicitly requested combination (answered "2 and 3", confirmed "Yes, both").

---

## Team Tracking Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Aggregate only (MVP) | Company-wide stats, no individual tracking. | ✓ |
| Per-member breakdown | Each team member's sessions and progress. | |

**User's choice:** Aggregate only for MVP
**Notes:** Per-member tracking deferred to v2.

---

## Review Timing

| Option | Description | Selected |
|--------|-------------|----------|
| Post-session email | Email 1-2 hours after with review link. | |
| In-app prompt | Modal on next login. | |
| Combined (both) | Email AND in-app prompt. | |

**User's choice:** Custom — "Immediately after the call, it will be mandatory"
**Notes:** User wants mandatory review collection as part of session completion.

---

## Review UX

| Option | Description | Selected |
|--------|-------------|----------|
| Full-screen modal | Can't navigate away until submitted. | ✓ |
| Embedded in confirmation | Review on completion page. | |
| Email with urgency | Immediate email, 24hr expiration. | |

**User's choice:** Full-screen modal
**Notes:** Ensures review collection.

---

## Review Form Content

| Option | Description | Selected |
|--------|-------------|----------|
| NPS + comment | 0-10 score + optional comment. | |
| Multi-criteria rating | Communication, Expertise, Helpfulness (each 1-5). | ✓ |
| Structured feedback | NPS + multi-select tags + comment. | |

**User's choice:** Multi-criteria rating
**Notes:** More granular feedback per dimension.

---

## Written Comment Requirement

| Option | Description | Selected |
|--------|-------------|----------|
| Required for low scores | If NPS ≤ 6, require explanation. | ✓ |
| Always required | Every review must have comment. | |
| Always optional | Comment is nice-to-have. | |

**User's choice:** Required for low scores
**Notes:** Captures the "why" when sessions don't go well.

---

## Review Visibility

| Option | Description | Selected |
|--------|-------------|----------|
| Public (Recommended) | All reviews visible on profile. | ✓ |
| Aggregates only | Average + count, individual reviews hidden. | |
| Gated behind booking | Reviews only after booking confirmed. | |

**User's choice:** Public
**Notes:** Standard marketplace trust signal.

---

## Review Display on Profile

| Option | Description | Selected |
|--------|-------------|----------|
| Recent 5 with 'View all' | Show 5 most recent with link to full list. | |
| All reviews | Paginated list of all reviews. | |
| Curated highlights | Show 3-5 best reviews prominently. | ✓ |

**User's choice:** Curated highlights
**Notes:** Favors practitioners, fits premium positioning.

---

## Review on Browse Cards

| Option | Description | Selected |
|--------|-------------|----------|
| Score + count only (Recommended) | "4.8 ★ (23 reviews)" on card. | ✓ |
| Score + one quote | Score plus a short review snippet. | |
| Detailed breakdown | Sub-ratings on card. | |

**User's choice:** Score + count only
**Notes:** Clean, scannable.

---

## Rebook CTA Placement

| Option | Description | Selected |
|--------|-------------|----------|
| Session history + post-review | Two touch points. | |
| Session history only | Simple placement. | |
| Everywhere relevant | History + review + email + profile. | ✓ |

**User's choice:** Everywhere relevant
**Notes:** Maximum exposure for rebooking.

---

## Rebook Pre-fill

| Option | Description | Selected |
|--------|-------------|----------|
| Practitioner + duration only | Still requires new brief and slot. | ✓ |
| Everything except slot | Pre-fills brief as starting point. | |
| Just skips to slot picker | Assumes same everything. | |

**User's choice:** Practitioner + duration only
**Notes:** Fresh brief required — each session has different needs.

---

## Practitioner Review View

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated Reviews tab | New tab in portal sidebar. | ✓ |
| Part of Home dashboard | Recent reviews + stats on Home. | ✓ |
| Part of Sessions | Reviews attached to session cards. | |

**User's choice:** Both dedicated tab AND Home dashboard summary
**Notes:** Quick glance on Home, deep dive in Reviews tab.

---

## Practitioner Review Insights

| Option | Description | Selected |
|--------|-------------|----------|
| Aggregate scores only | Overall, per-criteria breakdowns. | ✓ |
| Trends over time | Month-over-month chart. | ✓ |
| Actionable feedback | What enterprises praise/criticize most. | ✓ |

**User's choice:** All three
**Notes:** Comprehensive insights to help practitioners improve.

---

## Manager Sharing Mechanism

| Option | Description | Selected |
|--------|-------------|----------|
| Exportable PDF report | One-click generate summary. | ✓ |
| Shareable dashboard link | Read-only live view. | |
| Email digest | Automated weekly/monthly summary. | ✓ |

**User's choice:** Both PDF and email digest
**Notes:** Manual export AND automated push.

---

## Report Content

| Option | Description | Selected |
|--------|-------------|----------|
| Executive summary | High-level 1-page overview. | ✓ |
| Detailed breakdown | Full session-by-session data. | |
| Both with toggle | Summary default, expandable detail. | |

**User's choice:** Custom — Executive summary + AI-generated insights
**Notes:** User wants "AI Upskiller Agent" that analyzes org patterns, problem statements, provides recommendations, positives/negatives, upskilling ideas.

---

## AI Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Data infra + basic rules (MVP realistic) | Build tracking, aggregate patterns. AI in v2. | |
| Include AI insights (stretch goal) | Integrate LLM to generate insights. | ✓ |

**User's choice:** Include AI insights as stretch goal
**Notes:** Adds complexity but delivers differentiating value.

---

## AI Provider

| Option | Description | Selected |
|--------|-------------|----------|
| Anthropic Claude (Recommended) | Consistent with BLAST AI platform. | ✓ |
| OpenAI GPT-4 | Most widely used. | |
| You decide | Claude's discretion. | |

**User's choice:** Anthropic Claude
**Notes:** Consistent ecosystem.

---

## Claude's Discretion

- Exact tab content layout and visualizations
- Outcome tag wording and presentation
- Review modal design
- PDF report template
- AI prompt engineering
- Email digest frequency options

## Deferred Ideas

- AI-generated weekly summarized reports for organization — noted during initial area selection (AI capability, builds on stretch goal)
- Per-team-member tracking — deferred to v2
