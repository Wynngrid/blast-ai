# BLAST AI

An AI practitioner marketplace where enterprises and institutions book vetted AI experts for structured mentorship sprints. Think "Toptal meets Calendly for AI expertise."

## Features

- **Enterprise Dashboard** - Team management, budget tracking, session history
- **Practitioner Portal** - Profile management, availability calendar, earnings tracking
- **Discovery & Booking** - Search practitioners by skill, book sessions, pay with coins
- **Reviews & Trust** - Multi-criteria ratings, NPS scoring, review display
- **Payments** - Razorpay integration with coin-based currency system
- **Notifications** - Email confirmations and reminders via Resend

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Payments**: Razorpay
- **Email**: Resend + React Email
- **Calendar**: FullCalendar + Google Calendar API

## Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Supabase account
- Razorpay account (for payments)
- Google Cloud account (for Meet links)
- Resend account (for emails)

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/Wynngrid/blast-ai.git
cd blast-ai
pnpm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the migrations in order:
   ```
   supabase/migrations/00001_initial_schema.sql
   supabase/migrations/00002_phase2_schema.sql
   supabase/migrations/00003_phase3_schema.sql
   supabase/migrations/20260414_session_reviews.sql
   ```

### 3. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Razorpay (Required for payments)
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=your_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx

# Google Calendar (Required for Meet links)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-sa@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Resend (Required for emails)
RESEND_API_KEY=re_xxx
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── admin/             # Admin dashboard
│   ├── browse/            # Practitioner discovery
│   ├── dashboard/         # Enterprise dashboard
│   ├── portal/            # Practitioner portal
│   └── practitioners/     # Public practitioner profiles
├── actions/               # Server Actions
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── reviews/          # Review components
│   ├── dashboard/        # Dashboard components
│   └── portal/           # Portal components
├── lib/                   # Utilities and configs
│   ├── supabase/         # Supabase client setup
│   └── schemas/          # Zod validation schemas
└── types/                 # TypeScript types
```

## User Roles

| Role | Access |
|------|--------|
| Enterprise | Browse practitioners, book sessions, manage team, view reports |
| Practitioner | Manage profile, set availability, view sessions, track earnings |
| Admin | Approve practitioners, manage platform |

## Development

```bash
# Run dev server
pnpm dev

# Type check
pnpm tsc --noEmit

# Lint
pnpm lint

# Build for production
pnpm build
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual

```bash
pnpm build
pnpm start
```

## License

Private - All rights reserved.
