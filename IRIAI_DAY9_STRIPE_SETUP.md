# Iriai Day 9 — Stripe Setup Guide

## Environment Variables Required in Vercel

Add these in Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Value | Description |
|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_...` (test) or `sk_live_...` (prod) | Stripe secret key from Dashboard → Developers → API Keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` or `pk_live_...` | Stripe publishable key (currently not used client-side, but add for future use) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Get from Stripe → Developers → Webhooks after creating endpoint |
| `NEXT_PUBLIC_APP_URL` | `https://awp-git-main-vaibhavmehta11s-projects.vercel.app` | Your Vercel deployment URL |

---

## Step-by-Step Activation Instructions

### Step 1 — Get Stripe Keys
1. Go to https://dashboard.stripe.com
2. Navigate to **Developers → API Keys**
3. Copy **Secret key** → set as `STRIPE_SECRET_KEY`
4. Copy **Publishable key** → set as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Step 2 — Create Stripe Webhook
1. Go to **Stripe Dashboard → Developers → Webhooks**
2. Click **Add endpoint**
3. Set Endpoint URL: `https://awp-git-main-vaibhavmehta11s-projects.vercel.app/api/stripe/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `checkout.session.expired`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`) → set as `STRIPE_WEBHOOK_SECRET`

### Step 3 — Add vars to Vercel
1. Go to https://vercel.com → Your Project → **Settings → Environment Variables**
2. Add all 4 variables above
3. Set scope to: **Production + Preview + Development**
4. Click **Save**

### Step 4 — Redeploy
After adding env vars, trigger a new deploy:
- Push any commit, OR
- Go to Vercel → Deployments → click **Redeploy** on the latest

### Step 5 — Test in Stripe Test Mode
Use Stripe test card: `4242 4242 4242 4242` (any future date, any CVC)

---

## Database Migration

The schema changes (stripeSessionId, paymentStatus on Job model) need to be applied to Neon DB.

Option A — Run migration from local (recommended):
```bash
# In the repo root with DATABASE_URL set to your Neon connection string
npx prisma db push
```

Option B — Neon console:
Run these SQL statements in Neon SQL editor:
```sql
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "stripeSessionId" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT DEFAULT 'pending';
```

---

## Notes
- The platform currently uses Stripe package v20.4.1 (already in repo, no new install needed)
- All flows are built and ready — only keys are needed to go live
- Test mode: use `sk_test_` keys first, then swap to `sk_live_` when ready
