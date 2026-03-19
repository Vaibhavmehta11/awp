# AWP — Agent Workforce Platform

A curated marketplace where buyers hire AI-powered services for scoped business outcomes.

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database ORM | Prisma |
| Database | PostgreSQL (Neon recommended) |
| Auth | Clerk |
| Analytics | PostHog |
| Email | Resend |
| Payments | Stripe (placeholder) |
| Deployment | Vercel |

## Folder Structure

```
src/
  app/
    (public)/        # Marketing / marketplace pages (no auth required)
    (auth)/          # Clerk sign-in / sign-up
    (buyer)/         # Buyer dashboard, jobs, order form
    (creator)/       # Creator dashboard, listings, jobs, apply
    (admin)/         # Admin tools — applications, listings, disputes
    api/             # All API routes
  components/
    ui/              # shadcn/ui components
    layout/          # Navbar, footer, sidebar
    marketplace/     # Listing cards, category cards, trust badges
    buyer/           # Job request form, status timeline, job card
    creator/         # Listing builder, job workspace
    admin/           # Application review, listing review, dispute cards
    shared/          # Page header, empty state, loading spinner, rating stars
    providers/       # PostHog provider
  lib/               # prisma, clerk, posthog, stripe, resend, utils
  types/             # Shared TypeScript DTOs
  hooks/             # usePostHog
prisma/
  schema.prisma      # Full data model
  seed.ts            # Seed data (badges, sample creator + listings)
```

## Setup

### 1. Clone and install

```bash
git clone <repo>
cd awp
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local`:

- `DATABASE_URL` — PostgreSQL connection string (Neon: https://neon.tech)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` — Clerk dashboard
- `NEXT_PUBLIC_POSTHOG_KEY` — PostHog project API key
- `RESEND_API_KEY` — Resend dashboard
- `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Stripe dashboard
- `NEXT_PUBLIC_APP_URL` — Your app URL (`http://localhost:3000` for dev)

### 3. Push schema and seed

```bash
npx prisma db push
npm run db:seed
```

### 4. Run dev server

```bash
npm run dev
```

## Key Concepts

### User Roles

- **BUYER** — Default. Can browse marketplace, submit job orders, review deliveries
- **CREATOR** — Apply via `/creator/apply`. Once approved, can create listings and fulfill jobs
- **ADMIN** — Set via DB. Access to `/admin` dashboard for reviewing applications, listings, disputes

### Job Lifecycle

```
SUBMITTED → ACCEPTED → IN_PROGRESS → DELIVERED → ACCEPTED_BY_BUYER
                                          ↑
                              REVISION_REQUESTED ──────────┘
```

### Creator Onboarding

1. Creator fills out application at `/creator/apply`
2. Admin reviews at `/admin/creators`
3. On approval, `CreatorProfile` is created and creator can build listings
4. Listings go through `DRAFT → PENDING_REVIEW → APPROVED` before going live

## Deploy to Vercel

1. Push to GitHub
2. Import project at vercel.com
3. Add all environment variables from `.env.example`
4. Deploy

The app is fully serverless-compatible — Prisma uses Neon PostgreSQL.
