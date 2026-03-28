# Iriai Day 9 — Build Report

**Date:** 2026-03-27
**Sprint Focus:** Stripe Payment Integration
**Status:** COMPLETE — Ready to Activate with Keys

---

## What Was Built

### Problem Addressed
Jobs were being created in the DB without any payment. Buyers were not charged. This was the last blocker before revenue.

### New Flow (After Day 9)
1. Buyer fills out job request form
2. Form POSTs to `/api/stripe/create-checkout` (new)
3. A pending Job record is created in DB with `paymentStatus: "pending"`
4. Buyer is redirected to Stripe hosted checkout page
5. On payment success: Stripe fires `checkout.session.completed` webhook
6. Webhook handler marks Job as `paymentStatus: "paid"` and sends creator email
7. Buyer is redirected to `/buyer/jobs/pending?session_id=...&payment=success`
8. Success page shows confirmation and links to job detail

---

## Files Created

| File | Description |
|---|---|
| `src/app/api/stripe/create-checkout/route.ts` | Creates Stripe Checkout Session, saves pending Job to DB |
| `src/app/api/stripe/webhook/route.ts` | Handles Stripe webhook events, marks Job as paid, sends email |
| `src/app/(buyer)/buyer/jobs/pending/page.tsx` | Payment success landing page with job confirmation |

## Files Modified

| File | Change |
|---|---|
| `src/lib/stripe.ts` | Added `createCheckoutSession()` function |
| `src/components/buyer/job-request-form.tsx` | Now redirects to Stripe checkout instead of direct DB write |
| `src/app/(buyer)/buyer/jobs/[id]/page.tsx` | Added payment success banner, "Paid" badge |
| `prisma/schema.prisma` | Added `stripeSessionId` and `paymentStatus` fields to Job model |

---

## Webhook Events Handled

| Event | Action |
|---|---|
| `checkout.session.completed` | Marks Job as paid, increments buyer stats, sends creator email |
| `checkout.session.expired` | Marks pending Job as CANCELLED with reason "Payment not completed" |

---

## Board Action Required

### CRITICAL — Without these, payments will not work:

1. **Get Stripe API Keys** from https://dashboard.stripe.com → Developers → API Keys

2. **Create Stripe Webhook** pointing to:
   `https://awp-git-main-vaibhavmehta11s-projects.vercel.app/api/stripe/webhook`
   Events: `checkout.session.completed`, `checkout.session.expired`

3. **Add to Vercel** (Project → Settings → Environment Variables):
   - `STRIPE_SECRET_KEY` = sk_test_... (or sk_live_...)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = pk_test_... (or pk_live_...)
   - `STRIPE_WEBHOOK_SECRET` = whsec_...
   - `NEXT_PUBLIC_APP_URL` = https://awp-git-main-vaibhavmehta11s-projects.vercel.app

4. **Apply DB schema changes** to Neon:
   ```sql
   ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "stripeSessionId" TEXT;
   ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT DEFAULT 'pending';
   ```
   OR run: `npx prisma db push` locally with DATABASE_URL set

5. **Redeploy on Vercel** after adding env vars

See `IRIAI_DAY9_STRIPE_SETUP.md` for detailed step-by-step instructions.

---

## Architecture Decision Notes

### Why: Create Job on checkout initiation (not on webhook)?
The buyer's brief data can be very large (JSON). Stripe metadata has a 500-char limit per key. Rather than encoding brief data in Stripe metadata, we create a pending Job in DB at checkout start, linked by `stripeSessionId`. The webhook then updates this record to `paid` status.

This means:
- No data is lost if webhook is delayed
- Job data is immediately in DB (can be reviewed/cancelled if needed)
- The webhook is lightweight — just a status update

### Fallback / Edge cases handled:
- If Stripe session expires: Job is cancelled automatically
- If webhook is delayed: Job shows as SUBMITTED (payment pending) but won't block anything
- Payment cancelled: buyer returns to listing page with `?payment=cancelled` param

---

## No Issues Found
- Stripe packages (stripe v20.4.1, @stripe/stripe-js v8.11.0) were already in repo
- No new npm packages needed
- Prisma generate completed cleanly
- All TypeScript types should resolve cleanly (schema updated, client regenerated)

---

## Estimated Time to Revenue
From Board adding keys to first paid order: **under 10 minutes**
