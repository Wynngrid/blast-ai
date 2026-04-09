# Stack Research

**Domain:** AI Practitioner Marketplace (Enterprise booking platform)
**Researched:** 2026-04-09
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.1 | Full-stack React framework | Latest stable (Dec 2025). Turbopack stable, 50%+ faster builds. Cache Components for instant navigation. proxy.ts improves network boundary clarity. Vercel zero-config deployment. |
| React | 19 | UI library | Ships with Next.js 16. Server Components are production-ready. New use hook and Suspense improvements for data fetching. |
| TypeScript | 5.8 | Type safety | Current stable (March 2025). Strong inference, satisfies operator. TS 6.0 coming mid-2026 with stricter defaults. |
| Supabase | Latest | Backend-as-a-service | Postgres database, Auth, Realtime, Storage, Edge Functions. RLS for row-level security. Custom claims for RBAC. Handles 10k+ concurrent realtime connections. |
| Tailwind CSS | 4.x | Styling | CSS-native configuration via @theme directives. 5x faster full builds with Rust-based Oxide engine. First-class container queries and cascade layers. |

### Database & Auth

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Supabase Postgres | 15+ | Primary database | Full Postgres with extensions (pgvector, pg_cron). Row Level Security for authorization. Automatic API generation. |
| Supabase Auth | Latest | Authentication | Built-in OAuth (Google), email/password, magic links. Custom claims via Auth Hooks for role injection. Session management included. |
| Custom RBAC | N/A | Role-based access | Use Supabase's Custom Access Token Hook pattern: store roles in user_roles table, inject into JWT, enforce via RLS policies. |

### Payments

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Razorpay | Latest | India payments | India-first requirement. Good React integration via react-razorpay. Supports subscriptions, one-time payments, payouts. |
| Stripe | Latest | International payments | Embedded Checkout (2026 recommended pattern). Server Actions integration. Subscription lifecycle management. Better international coverage. |
| stripe, @stripe/stripe-js, @stripe/react-stripe-js | Latest | Stripe SDK | Official packages for Next.js. Embedded Checkout keeps users on your domain. |

### UI & Components

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| shadcn/ui | Latest | Component library | Copy-paste components, not npm dependency. Full code ownership. Radix UI primitives for accessibility. Tailwind v4 + React 19 compatible. Used by Vercel, Linear (your design reference). |
| Radix UI | Latest | Accessible primitives | Foundation for shadcn. Keyboard navigation, ARIA support. Un-styled by design. |
| Lucide React | Latest | Icons | Tree-shakable, only imports what's used. Consistent design language. Pairs with shadcn. No brand icons (use custom for payment providers). |

### Forms & Validation

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| react-hook-form | 7.x | Form management | Minimal re-renders via uncontrolled components. Native integration with shadcn/ui Form component. |
| zod | 3.x | Schema validation | TypeScript-first. Reuse schemas on client and server. Pairs with @hookform/resolvers. |
| @hookform/resolvers | Latest | Validation bridge | Connects zod schemas to react-hook-form. |

### State Management

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Zustand | 5.x | Client state | 3KB bundle. Simple API like useState but global. 2026 default for small-to-medium apps. DevTools support. |
| TanStack Query | 5.x | Server state | Caching, background refetch, optimistic updates. useSuspenseQuery for React 19. Pairs with Server Components. |
| nuqs | 2.x | URL state | Type-safe search params. Used by Supabase, Vercel, Sentry. 6KB gzipped. Essential for shareable filter/search states. |

### Scheduling & Calendar

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| @fullcalendar/react | 6.x | Availability calendar | Drag-and-drop, resource scheduling, multiple views. More capable than react-big-calendar for booking systems. Enterprise-grade features. |
| @fullcalendar/daygrid | 6.x | Month view | Plugin for FullCalendar. |
| @fullcalendar/timegrid | 6.x | Week/day view | Plugin for FullCalendar time slots. |
| @fullcalendar/interaction | 6.x | Drag-and-drop | Plugin for event editing. |
| date-fns | 3.x | Date manipulation | Functional API, tree-shakable. Better TypeScript support than Day.js. No wrapper objects. |

### Email

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Resend | Latest | Transactional email | Developer-friendly API. React Email integration for templating. Works with Server Actions. Booking confirmations, notifications. |
| @react-email/components | Latest | Email templates | Write emails as React components. Type-safe. Renders to HTML. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint | 9.x | Linting | Flat config system. eslint-config-next for Next.js rules. Still recommended over Biome for Next.js due to plugin ecosystem. |
| Prettier | 3.x | Formatting | Consistent code style. Works alongside ESLint. |
| pnpm | 9.x | Package manager | Faster, disk-efficient. Strict dependency resolution prevents phantom dependencies. |
| Turborepo | Latest | Build system (if monorepo) | Optional. Vercel-maintained. Caching for faster CI. |

### Deployment & Infrastructure

| Tool | Purpose | Notes |
|------|---------|-------|
| Vercel | Hosting | Zero-config Next.js deployment. Edge Functions, ISR, preview deployments. CDN for static assets. |
| Supabase Cloud | Backend hosting | Managed Postgres, Auth, Realtime. Free tier for development. Scale as needed. |
| Vercel Analytics | Performance monitoring | Core Web Vitals tracking. Optional but recommended. |

## Installation

```bash
# Initialize Next.js 16 with TypeScript and Tailwind v4
npx create-next-app@latest blast-ai --typescript --tailwind --eslint --app --src-dir

# Core dependencies
pnpm add @supabase/supabase-js @supabase/ssr zustand @tanstack/react-query nuqs

# UI
pnpm add class-variance-authority clsx tailwind-merge lucide-react
# Then: npx shadcn@latest init

# Forms
pnpm add react-hook-form @hookform/resolvers zod

# Scheduling
pnpm add @fullcalendar/core @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction

# Dates
pnpm add date-fns

# Payments
pnpm add stripe @stripe/stripe-js @stripe/react-stripe-js react-razorpay

# Email
pnpm add resend @react-email/components

# Dev dependencies
pnpm add -D @types/node @types/react @types/react-dom eslint-config-next prettier
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Next.js 16 | Next.js 15 | If 16.x has breaking issues for your codebase. 15 is still supported. |
| Zustand | Redux Toolkit | Large enterprise team (10+ devs) needing strict structure and debugging. |
| Zustand | Jotai | Atomic state pattern preferred. More granular than Zustand. |
| TanStack Query | SWR | Simpler needs, smaller bundle. SWR is Vercel's library but less feature-rich. |
| FullCalendar | react-big-calendar | Simpler calendar needs, no drag-and-drop. ~50% smaller bundle. |
| FullCalendar | DayPilot | If you need more customization and don't mind commercial license. |
| date-fns | Day.js | Migrating from Moment.js (API compatible). Slightly smaller bundle. |
| Resend | SendGrid / Postmark | Already have account, higher volume needs, marketing email features. |
| shadcn/ui | Radix Themes | Want pre-styled components without copying. Less customization. |
| shadcn/ui | Chakra UI | Prefer runtime CSS-in-JS (but hurts performance). |
| ESLint 9 | Biome | Greenfield project, no Next.js-specific rules needed. 10-25x faster. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Moment.js | Deprecated, massive bundle (300KB+). Team recommends alternatives. | date-fns or Day.js |
| Create React App | Deprecated. No server rendering, no API routes. | Next.js |
| CSS Modules alone | Verbose, no design system. Tailwind is industry standard. | Tailwind CSS |
| Firebase | Lock-in, proprietary query language, weaker Postgres features. | Supabase |
| NextAuth.js alone | Unnecessary complexity when Supabase Auth handles it all. | Supabase Auth |
| Redux (classic) | Boilerplate-heavy. Even Redux team recommends RTK or alternatives. | Zustand or RTK |
| Material UI (MUI) | Large bundle, opinionated design language doesn't match "Linear aesthetic". | shadcn/ui |
| Ant Design | Enterprise-heavy, Chinese-first docs, doesn't match brand aesthetic. | shadcn/ui |
| react-icons | Bundles all icons, inconsistent styles when mixing sets. | Lucide React |
| Yup | Less TypeScript-native than Zod. Zod is the 2026 standard. | Zod |
| Axios | Unnecessary wrapper. fetch() is standard, Next.js extends it. | Native fetch |
| Formik | Heavier than react-hook-form, more re-renders. | react-hook-form |

## Stack Patterns by Variant

**If you need multi-tenant enterprise features later:**
- Add Supabase Row Level Security policies per organization_id
- Consider separate schemas per tenant (Postgres feature)
- Supabase handles this well with RLS

**If video integration becomes scope:**
- Daily.co or 100ms for embedded video
- Supabase Storage for recording storage
- NOT Zoom SDK (complex licensing)

**If you add AI features (Phase 2+):**
- Vercel AI SDK for streaming responses
- OpenAI or Anthropic APIs
- pgvector in Supabase for embeddings

**If you need real-time features (session chat, notifications):**
- Supabase Realtime is included
- Postgres Changes for database triggers
- Broadcast for ephemeral messages

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Next.js 16.x | React 19.x | Bundled together. Don't use React 18 with Next 16. |
| Tailwind CSS 4.x | shadcn/ui latest | shadcn updated for Tailwind v4 in early 2026. |
| TypeScript 5.8 | Next.js 16.x | Supported. TS 6.0 will work when released. |
| @supabase/ssr | Next.js 14.2+ | Required for App Router server-side auth. |
| nuqs 2.x | Next.js 14.2+ | Check nuqs docs for exact Next.js requirements. |
| FullCalendar 6.x | React 18/19 | Compatible with both. |
| TanStack Query 5.x | React 18/19 | Full React 19 support with useSuspenseQuery. |

## Architecture Notes

### Auth Flow (Supabase + Custom Roles)

```
1. User signs in (Google OAuth or email/password)
2. Supabase Auth creates session
3. Custom Access Token Hook runs before token issuance
4. Hook reads user's role from user_roles table
5. Hook injects role into JWT claims
6. Client receives JWT with role claim
7. RLS policies check role claim for authorization
```

### Payment Flow (Razorpay/Stripe)

```
1. User selects session/package
2. Server Action creates order (Razorpay) or checkout session (Stripe)
3. Client opens payment modal (Razorpay) or embedded checkout (Stripe)
4. User completes payment
5. Webhook receives confirmation
6. Server Action updates booking status
7. Resend sends confirmation email
```

### Data Fetching Pattern (2026)

```
- Server Components: Initial data fetch (zero client JS)
- TanStack Query: Client-side mutations, optimistic updates, cache
- Supabase Realtime: Live updates (availability changes, notifications)
- nuqs: Filter/search state in URL (shareable, bookmarkable)
```

## Sources

- [Next.js 16 Release Blog](https://nextjs.org/blog/next-16) - Turbopack stable, Cache Components
- [Next.js 16.1 Release](https://nextjs.org/blog/next-16-1) - FS caching, bundle analyzer
- [Supabase RBAC Documentation](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac) - Custom claims pattern
- [Supabase Realtime Benchmarks](https://supabase.com/docs/guides/realtime/benchmarks) - Performance data
- [shadcn/ui Tailwind v4](https://ui.shadcn.com/docs/tailwind-v4) - React 19 + Tailwind v4 support
- [TanStack Query v5 Docs](https://tanstack.com/query/v5) - Server state management
- [nuqs Documentation](https://nuqs.dev/) - URL state management
- [Stripe Next.js Guide 2026](https://dev.to/sameer_saleem/the-ultimate-guide-to-stripe-nextjs-2026-edition-2f33) - Embedded Checkout pattern
- [Razorpay Node.js Integration](https://razorpay.com/docs/payments/server-integration/nodejs/integration-steps/) - Server-side setup
- [Zustand vs Redux 2026](https://medium.com/@abdurrehman1/state-management-in-2026-redux-vs-zustand-vs-context-api-ad5760bfab0b) - State management comparison
- [Tailwind CSS v4 Blog](https://tailwindcss.com/blog/tailwindcss-v4) - New features
- [Resend Next.js Docs](https://resend.com/docs/send-with-nextjs) - Email integration
- [FullCalendar vs react-big-calendar](https://bryntum.com/blog/react-fullcalendar-vs-big-calendar/) - Calendar comparison

---
*Stack research for: BLAST AI - AI Practitioner Marketplace*
*Researched: 2026-04-09*
