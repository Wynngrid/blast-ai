# Architecture Research

**Domain:** Two-sided AI practitioner marketplace
**Researched:** 2026-04-09
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
+------------------------------------------------------------------+
|                        CLIENT LAYER                               |
+------------------------------------------------------------------+
|  +----------------+  +----------------+  +----------------+       |
|  | Enterprise     |  | Practitioner   |  | Admin          |       |
|  | Dashboard      |  | Portal         |  | Console        |       |
|  | (Client)       |  | (Client)       |  | (Server)       |       |
|  +-------+--------+  +-------+--------+  +-------+--------+       |
|          |                   |                   |                |
+----------+-------------------+-------------------+----------------+
           |                   |                   |
+----------v-------------------v-------------------v----------------+
|                    NEXT.JS APP ROUTER                             |
+------------------------------------------------------------------+
|  +----------------+  +----------------+  +----------------+       |
|  | Server         |  | Server         |  | Route          |       |
|  | Components     |  | Actions        |  | Handlers       |       |
|  | (Data Fetch)   |  | (Mutations)    |  | (Webhooks)     |       |
|  +-------+--------+  +-------+--------+  +-------+--------+       |
|          |                   |                   |                |
+----------+-------------------+-------------------+----------------+
           |                   |                   |
           +-------------------+-------------------+
                               |
                    +----------v-----------+
                    |    MIDDLEWARE        |
                    | (Auth/Session Mgmt)  |
                    +----------+-----------+
                               |
+------------------------------v-----------------------------------+
|                    SUPABASE LAYER                                 |
+------------------------------------------------------------------+
|  +------------+  +------------+  +------------+  +------------+  |
|  | Auth       |  | Database   |  | Storage    |  | Realtime   |  |
|  | (Sessions) |  | (Postgres) |  | (Files)    |  | (Updates)  |  |
|  +------------+  +-----+------+  +------------+  +------------+  |
|                        |                                          |
|              +---------v----------+                               |
|              | Row Level Security |                               |
|              | (Role-Based Access)|                               |
|              +--------------------+                               |
+------------------------------------------------------------------+
                               |
+------------------------------v-----------------------------------+
|                  EXTERNAL SERVICES                                |
+------------------------------------------------------------------+
|  +----------------+  +----------------+  +----------------+       |
|  | Razorpay       |  | Stripe         |  | Calendar       |       |
|  | (India)        |  | (Intl)         |  | (Scheduling)   |       |
|  +----------------+  +----------------+  +----------------+       |
+------------------------------------------------------------------+
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Enterprise Dashboard | Browse practitioners, manage bookings, track team progress | Client Components with real-time updates |
| Practitioner Portal | Manage availability, view bookings, track earnings | Client Components for calendar interaction |
| Admin Console | Approve practitioners, manage platform settings | Server Components for security |
| Server Components | Data fetching, SEO content, non-interactive UI | React Server Components (default) |
| Server Actions | Mutations (create booking, update profile) | `'use server'` functions |
| Route Handlers | Webhooks (payment confirmations, OAuth callbacks) | `route.ts` files |
| Middleware | Session refresh, route protection, redirects | `middleware.ts` at root |
| Supabase Auth | User authentication, JWT tokens, OAuth | `@supabase/ssr` package |
| Supabase Database | All persistent data with RLS | PostgreSQL with policies |
| RLS Policies | Role-based data access at database level | SQL policies per table |
| Payment Gateways | Payment processing, splits, payouts | Razorpay Route / Stripe Connect |

## Recommended Project Structure

```
src/
+-- app/                           # Next.js App Router
|   +-- (auth)/                    # Route group: auth flows
|   |   +-- login/
|   |   +-- signup/
|   |   +-- callback/              # OAuth callback handler
|   |   +-- layout.tsx             # Auth-specific layout
|   +-- (platform)/                # Route group: authenticated users
|   |   +-- (enterprise)/          # Enterprise-specific routes
|   |   |   +-- dashboard/
|   |   |   +-- bookings/
|   |   |   +-- team/
|   |   +-- (practitioner)/        # Practitioner-specific routes
|   |   |   +-- portal/
|   |   |   +-- availability/
|   |   |   +-- earnings/
|   |   +-- layout.tsx             # Shared platform layout
|   +-- (marketing)/               # Route group: public pages
|   |   +-- page.tsx               # Landing page
|   |   +-- browse/                # Practitioner discovery
|   |   +-- [practitioner]/        # Public practitioner profile
|   +-- (admin)/                   # Route group: admin only
|   |   +-- approve/
|   |   +-- settings/
|   +-- api/                       # API route handlers
|   |   +-- webhooks/
|   |   |   +-- razorpay/
|   |   |   +-- stripe/
|   +-- layout.tsx                 # Root layout
|   +-- globals.css
+-- components/
|   +-- ui/                        # Shadcn/Radix primitives
|   +-- features/                  # Feature-specific components
|   |   +-- booking/
|   |   +-- practitioner/
|   |   +-- dashboard/
|   |   +-- calendar/
|   +-- layouts/                   # Layout components
+-- lib/
|   +-- supabase/
|   |   +-- client.ts              # Browser client
|   |   +-- server.ts              # Server client factory
|   |   +-- middleware.ts          # Auth middleware helper
|   +-- payments/
|   |   +-- razorpay.ts
|   |   +-- stripe.ts
|   +-- utils.ts                   # General utilities
+-- actions/                       # Server Actions
|   +-- bookings.ts
|   +-- practitioners.ts
|   +-- payments.ts
+-- types/
|   +-- database.ts                # Generated Supabase types
|   +-- api.ts
+-- hooks/                         # Client-side React hooks
+-- middleware.ts                  # Next.js middleware (root)
```

### Structure Rationale

- **(auth)/, (platform)/, (marketing)/, (admin)/:** Route groups separate concerns without affecting URLs. Each group can have its own layout and loading states.
- **actions/:** Server Actions centralized for reuse across routes. Keeps business logic out of components.
- **lib/supabase/:** Two client factories (browser and server) following Supabase's official pattern for App Router.
- **components/features/:** Feature-organized components prevent the "200 files in components" anti-pattern.
- **types/database.ts:** Auto-generated from Supabase schema using `supabase gen types typescript`.

## Architectural Patterns

### Pattern 1: Server-First with Client Islands

**What:** Default to Server Components, only use Client Components for interactivity (calendar, forms, real-time).

**When to use:** Almost always in Next.js App Router. This is the recommended default.

**Trade-offs:**
- PRO: Smaller JS bundle, faster initial load, secrets stay on server
- CON: More thought required about component boundaries

**Example:**
```typescript
// app/(platform)/(practitioner)/availability/page.tsx (Server Component)
import { createServerClient } from '@/lib/supabase/server'
import { AvailabilityCalendar } from '@/components/features/calendar/availability-calendar'

export default async function AvailabilityPage() {
  const supabase = await createServerClient()
  const { data: slots } = await supabase
    .from('availability_slots')
    .select('*')
    .eq('practitioner_id', (await supabase.auth.getUser()).data.user?.id)

  // Server Component fetches data, passes to Client Component
  return <AvailabilityCalendar initialSlots={slots} />
}

// components/features/calendar/availability-calendar.tsx
'use client'
import { useState } from 'react'

export function AvailabilityCalendar({ initialSlots }) {
  const [slots, setSlots] = useState(initialSlots)
  // Interactive calendar logic here
}
```

### Pattern 2: Row Level Security for Multi-Role Access

**What:** Define database policies that enforce access rules at the PostgreSQL level, using JWT claims for role identification.

**When to use:** Always for marketplace data. RLS provides defense-in-depth regardless of application bugs.

**Trade-offs:**
- PRO: Security enforced at database level, can't be bypassed by app bugs
- CON: Policies can impact query performance (mitigate with indexes)

**Example:**
```sql
-- Table: bookings
-- Users can only see bookings where they are the enterprise buyer OR the practitioner

-- Policy for SELECT
CREATE POLICY "Users view own bookings" ON bookings
FOR SELECT TO authenticated
USING (
  (SELECT auth.uid()) = enterprise_user_id
  OR (SELECT auth.uid()) = practitioner_id
);

-- Policy for INSERT (enterprises create bookings)
CREATE POLICY "Enterprises create bookings" ON bookings
FOR INSERT TO authenticated
WITH CHECK (
  (SELECT auth.uid()) = enterprise_user_id
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (SELECT auth.uid())
    AND role = 'enterprise'
  )
);

-- Policy for UPDATE (practitioners can accept/decline)
CREATE POLICY "Practitioners update booking status" ON bookings
FOR UPDATE TO authenticated
USING ((SELECT auth.uid()) = practitioner_id)
WITH CHECK ((SELECT auth.uid()) = practitioner_id);
```

### Pattern 3: Destination Charges for Marketplace Payments

**What:** Platform receives payment, automatically transfers to practitioner minus commission, using Stripe Connect destination charges or Razorpay Route.

**When to use:** When platform wants control over payment flow and customer relationship.

**Trade-offs:**
- PRO: Platform handles customer relationship, refunds, disputes
- CON: Platform absorbs Stripe/Razorpay fees (offset via application fees)

**Example Flow:**
```
1. Enterprise pays $100 for session
2. Platform receives $100, Stripe/Razorpay deducts ~2.9% ($2.90)
3. Platform keeps 30% commission ($30)
4. Practitioner receives $67.10 ($100 - $30 commission - $2.90 fees)

Stripe: application_fee_amount = $30 (commission)
Razorpay Route: transfer $67.10 to practitioner's linked account
```

### Pattern 4: Slot-Based Availability with Conflict Prevention

**What:** Practitioners define available time slots; bookings reserve slots atomically to prevent double-booking.

**When to use:** Any appointment/booking system.

**Trade-offs:**
- PRO: Clean model, prevents conflicts at database level
- CON: Requires careful transaction handling

**Example:**
```sql
-- Check slot availability before booking (in a transaction)
SELECT * FROM availability_slots
WHERE practitioner_id = $1
  AND start_time = $2
  AND status = 'available'
FOR UPDATE;  -- Lock the row

-- If available, create booking and mark slot as booked
UPDATE availability_slots
SET status = 'booked', booking_id = $3
WHERE id = $4;
```

## Data Flow

### Booking Flow

```
Enterprise User                    Platform                         Practitioner
     |                                |                                   |
     | 1. Browse practitioners        |                                   |
     |------------------------------->|                                   |
     |     (Server Component fetch)   |                                   |
     |                                |                                   |
     | 2. View availability           |                                   |
     |------------------------------->|                                   |
     |     (Server Component fetch)   |                                   |
     |                                |                                   |
     | 3. Select slot, submit brief   |                                   |
     |------------------------------->|                                   |
     |     (Server Action)            |                                   |
     |                                |                                   |
     | 4. Pay via Razorpay/Stripe     |                                   |
     |------------------------------->|                                   |
     |     (Client -> Payment Gateway)|                                   |
     |                                |                                   |
     |                                | 5. Webhook confirms payment       |
     |                                |<----------------------------------|
     |                                |     (Route Handler)               |
     |                                |                                   |
     |                                | 6. Create booking, notify both    |
     |                                |---------------------------------->|
     |                                |     (DB insert + email/Realtime)  |
     |                                |                                   |
     | 7. Confirmation                | 8. New booking notification       |
     |<-------------------------------|---------------------------------->|
```

### Payment Flow (Destination Charges)

```
Enterprise                Platform Account             Practitioner Account
    |                           |                              |
    | Pay $100                  |                              |
    |-------------------------->|                              |
    |                           |                              |
    |               Stripe/Razorpay deducts fees ($2.90)       |
    |                           |                              |
    |               Platform keeps commission ($30)            |
    |                           |                              |
    |                           | Transfer $67.10              |
    |                           |----------------------------->|
    |                           |                              |
    |                           |        (Payout schedule)     |
    |                           |                              |-> Bank
```

### Authentication Flow

```
User                    Browser                  Middleware              Supabase
 |                         |                         |                      |
 | 1. Access /dashboard    |                         |                      |
 |------------------------>|                         |                      |
 |                         | 2. Request              |                      |
 |                         |------------------------>|                      |
 |                         |                         | 3. getUser()         |
 |                         |                         |--------------------->|
 |                         |                         |                      |
 |                         |                         | 4. Validate JWT      |
 |                         |                         |<---------------------|
 |                         |                         |                      |
 |                         |     (if invalid/expired)|                      |
 |                         | 5. Redirect /login      |                      |
 |<------------------------|-------------------------|                      |
 |                         |                         |                      |
 |                         |     (if valid)          |                      |
 |                         | 6. Set refreshed cookie |                      |
 |                         | 7. Continue to page     |                      |
 |<------------------------|-------------------------|                      |
```

### Key Data Flows

1. **Discovery Flow:** Marketing pages (Server Components) -> Supabase (practitioner listings) -> Client (filters/search)
2. **Booking Flow:** Client (slot selection) -> Server Action (validation + payment init) -> Webhook (confirmation) -> DB (booking record)
3. **Earnings Flow:** Webhook (payment confirmed) -> DB (transaction record) -> Practitioner Portal (earnings query)
4. **Team Progress Flow:** Enterprise Dashboard -> Server Component -> Supabase (aggregated booking/session data)

## Database Schema (Supabase)

### Core Tables

```sql
-- Users (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('enterprise', 'practitioner', 'admin')),
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enterprise-specific data
CREATE TABLE enterprises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_size TEXT,
  industry TEXT,
  billing_email TEXT,
  stripe_customer_id TEXT,
  razorpay_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Practitioner-specific data
CREATE TABLE practitioners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bio TEXT,
  specializations TEXT[],
  industries TEXT[],
  tier TEXT CHECK (tier IN ('rising', 'expert', 'master')),
  hourly_rate INTEGER NOT NULL,  -- in smallest currency unit (paise/cents)
  tools TEXT[],
  portfolio JSONB,
  is_approved BOOLEAN DEFAULT FALSE,
  approval_date TIMESTAMPTZ,
  stripe_account_id TEXT,        -- Stripe Connect account
  razorpay_linked_account_id TEXT, -- Razorpay Route account
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Availability slots
CREATE TABLE availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'booked', 'blocked')),
  booking_id UUID REFERENCES bookings(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT no_overlap EXCLUDE USING gist (
    practitioner_id WITH =,
    tstzrange(start_time, end_time) WITH &&
  ) WHERE (status != 'blocked')
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_user_id UUID NOT NULL REFERENCES profiles(id),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id),
  slot_id UUID NOT NULL REFERENCES availability_slots(id),
  session_type TEXT CHECK (session_type IN ('single', 'sprint')),
  brief TEXT,                     -- What they need help with
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  meeting_link TEXT,              -- Zoom/Meet link
  price INTEGER NOT NULL,         -- Total price in smallest unit
  platform_fee INTEGER NOT NULL,  -- Platform commission
  practitioner_payout INTEGER NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  payment_id TEXT,                -- Razorpay/Stripe payment ID
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  reviewer_id UUID NOT NULL REFERENCES profiles(id),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  nps INTEGER CHECK (nps >= 0 AND nps <= 10),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions (payment audit trail)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  type TEXT CHECK (type IN ('payment', 'refund', 'payout')),
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  provider TEXT CHECK (provider IN ('razorpay', 'stripe')),
  provider_id TEXT,               -- External transaction ID
  status TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for RLS performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_practitioners_user_id ON practitioners(user_id);
CREATE INDEX idx_practitioners_approved ON practitioners(is_approved) WHERE is_approved = TRUE;
CREATE INDEX idx_availability_practitioner ON availability_slots(practitioner_id, start_time);
CREATE INDEX idx_availability_status ON availability_slots(status) WHERE status = 'available';
CREATE INDEX idx_bookings_enterprise ON bookings(enterprise_user_id);
CREATE INDEX idx_bookings_practitioner ON bookings(practitioner_id);
CREATE INDEX idx_bookings_status ON bookings(status);
```

### RLS Policies Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | Own profile or public practitioners | Own only | Own only | Never (auth handles) |
| enterprises | Own enterprise data | Own only | Own only | Admin only |
| practitioners | Public (approved) or own | Own only | Own only | Admin only |
| availability_slots | Public (approved practitioner) or own | Practitioner only | Practitioner only | Practitioner only |
| bookings | Involved party only | Enterprise only | Practitioner (status) / Admin | Admin only |
| reviews | Public | Booking participant | Own only | Admin only |
| transactions | Involved party only | System only | Never | Never |

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Supabase free tier sufficient. Single database. Vercel free tier. |
| 1k-10k users | Supabase Pro ($25/mo). Add connection pooling. Consider caching popular practitioner queries. |
| 10k-100k users | Dedicated Supabase instance. Read replicas for browse pages. CDN for static assets. Consider moving to Vercel Pro for better edge performance. |
| 100k+ users | Sharding by region. Separate read/write databases. Dedicated payment processing service. Consider extracting booking service as microservice. |

### Scaling Priorities

1. **First bottleneck:** Database connections. Solution: Supabase connection pooling (built-in), optimize query patterns.
2. **Second bottleneck:** Payment webhook processing. Solution: Queue webhooks for async processing if volume high.
3. **Third bottleneck:** Real-time subscriptions. Solution: Limit subscription scope, use polling for non-critical updates.

## Anti-Patterns

### Anti-Pattern 1: Trusting getSession() in Server Code

**What people do:** Use `supabase.auth.getSession()` to check authentication in Server Components or middleware.
**Why it's wrong:** `getSession()` reads from cookies without validation. Users can forge session data.
**Do this instead:** Always use `supabase.auth.getUser()` which validates the JWT against Supabase servers.

### Anti-Pattern 2: Role Checks Only in Application Code

**What people do:** Check user roles in React components or API routes only.
**Why it's wrong:** Any bug in application logic exposes all data. Attackers can bypass UI.
**Do this instead:** Implement RLS policies at database level. Application checks are convenience, not security.

### Anti-Pattern 3: Storing Availability as Boolean Flags

**What people do:** Store practitioner availability as `is_available: boolean` or weekly patterns only.
**Why it's wrong:** Can't handle exceptions, overlapping bookings, or complex schedules.
**Do this instead:** Use explicit time slots with status. Leverage PostgreSQL's exclusion constraints.

### Anti-Pattern 4: Processing Payments Synchronously

**What people do:** Wait for payment confirmation in the booking request before responding.
**Why it's wrong:** Payment gateways are slow. User experience suffers. Timeouts cause inconsistent state.
**Do this instead:** Create pending booking, initiate payment, handle confirmation via webhook.

### Anti-Pattern 5: Mixing Client/Server Concerns

**What people do:** Import server utilities in client components or vice versa.
**Why it's wrong:** Leaks secrets to client bundle or breaks hydration.
**Do this instead:** Strict separation. Server code in `lib/supabase/server.ts`, client in `lib/supabase/client.ts`. Use 'use client' directive consciously.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Razorpay | Server-side SDK for order creation, webhooks for confirmation | Primary for India. Use Route for practitioner payouts. |
| Stripe | Connect destination charges, webhooks | International payments. Onboard practitioners as connected accounts. |
| Google Calendar | OAuth + API | Optional: Sync availability. Defer to v2. |
| Zoom/Google Meet | Store meeting links in bookings | MVP: Manual links. v2: Auto-generate via API. |
| Email (Resend/Postmark) | Transactional emails | Booking confirmations, reminders, payout notifications. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Server Components <-> Supabase | Direct via server client | Use `createServerClient()` per request |
| Client Components <-> Supabase | Via `createBrowserClient()` | Singleton, handles auth refresh |
| Server Actions <-> Supabase | Direct via server client | Always validate user before mutations |
| Webhooks <-> Supabase | Service role client | Bypass RLS for system operations |
| Middleware <-> Supabase | Server client | Use `getUser()` for auth validation |

## Build Order Implications

Based on component dependencies, suggested implementation order:

1. **Foundation (Phase 1)**
   - Supabase project setup + schema migration
   - Auth system (middleware, login/signup)
   - RLS policies for all tables
   - Profile management

2. **Practitioner Side (Phase 2)**
   - Practitioner onboarding flow
   - Availability calendar CRUD
   - Portal dashboard (upcoming sessions, earnings view)

3. **Discovery & Booking (Phase 3)**
   - Practitioner browse/search (public)
   - Practitioner profile pages
   - Booking flow (slot selection, brief submission)
   - Payment integration (Razorpay first, then Stripe)

4. **Enterprise Features (Phase 4)**
   - Enterprise dashboard
   - Team management
   - Budget/hours tracking
   - Booking history

5. **Completion & Trust (Phase 5)**
   - Session completion flow
   - Review/rating system
   - Practitioner stats aggregation
   - Admin approval console

## Sources

- [Next.js App Router Project Structure](https://nextjs.org/docs/app/getting-started/project-structure)
- [Next.js App Router Folder Structure Best Practices 2026](https://www.codebydeep.com/blog/next-js-folder-structure-best-practices-for-scalable-applications-2026-guide)
- [Supabase Row Level Security Documentation](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase RLS Best Practices: Production Patterns](https://makerkit.dev/blog/tutorials/supabase-rls-best-practices)
- [Setting up Server-Side Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Stripe Connect Destination Charges](https://docs.stripe.com/connect/destination-charges)
- [Razorpay Route for Marketplace Payments](https://razorpay.com/route/)
- [Database Model for Appointment Scheduling](https://www.red-gate.com/blog/a-database-model-to-manage-appointments-and-organize-schedules/)
- [Marketplace Payment Guide - Sharetribe](https://www.sharetribe.com/academy/marketplace-payments/)
- [MakerKit RBAC Documentation](https://makerkit.dev/docs/next-supabase-turbo/development/permissions-and-roles)

---
*Architecture research for: BLAST AI - Two-sided AI practitioner marketplace*
*Researched: 2026-04-09*
