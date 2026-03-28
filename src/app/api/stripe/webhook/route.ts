import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendJobSubmittedEmail } from "@/lib/resend";
import { trackServerEvent, AWP_EVENTS } from "@/lib/posthog";
import Stripe from "stripe";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing stripe signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook signature verification failed";
    console.error("Stripe webhook error:", message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true });
    }

    const sessionId = session.id;

    // Find the pending job linked to this checkout session
    const job = await prisma.job.findFirst({
      where: { stripeSessionId: sessionId },
      include: {
        listing: { include: { creator: { include: { user: true } } } },
      },
    });

    if (!job) {
      console.error("No job found for session:", sessionId);
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Mark job as paid
    await prisma.job.update({
      where: { id: job.id },
      data: { paymentStatus: "paid" },
    });

    // Update buyer stats
    await prisma.buyerProfile.update({
      where: { id: job.buyerProfileId },
      data: { jobsSubmittedCount: { increment: 1 } },
    });

    // Track event
    const metadata = session.metadata;
    if (metadata?.buyerClerkId) {
      await trackServerEvent(metadata.buyerClerkId, AWP_EVENTS.JOB_CREATED, {
        jobId: job.id,
        listingId: job.listingId,
        category: job.listing.category,
        paymentSessionId: sessionId,
      }).catch(() => {/* non-blocking */});
    }

    // Send creator email notification
    try {
      const creatorEmail = job.listing.creator.user?.email ?? "";
      if (creatorEmail) {
        await sendJobSubmittedEmail(creatorEmail, job.briefTitle, job.listing.creator.displayName);
      }
    } catch {
      /* non-blocking */
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    // Mark any pending job as failed/cancelled
    await prisma.job.updateMany({
      where: { stripeSessionId: session.id, paymentStatus: "pending" },
      data: { paymentStatus: "failed", status: "CANCELLED", cancelledAt: new Date(), failureReason: "Payment not completed" },
    }).catch(() => {/* non-blocking */});
  }

  return NextResponse.json({ received: true });
}
