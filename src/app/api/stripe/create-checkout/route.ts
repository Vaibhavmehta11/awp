import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    listingId,
    briefTitle,
    submittedBrief,
    attachments,
    expectedOutputFormat,
  } = body;

  if (!listingId || !briefTitle || !submittedBrief) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const listing = await prisma.serviceListing.findUnique({
    where: { id: listingId, status: "APPROVED" },
    include: { creator: true },
  });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${req.headers.get("host")}`;

  // Store the pending job brief in session metadata (stringified)
  const briefMeta = JSON.stringify({
    briefTitle,
    submittedBrief,
    attachments: attachments ?? [],
    expectedOutputFormat: expectedOutputFormat ?? null,
  });

  const session = await createCheckoutSession({
    listingId,
    listingSlug: listing.slug,
    listingTitle: listing.title,
    priceAmountCents: Math.round(Number(listing.priceAmount) * 100),
    currency: listing.currency,
    creatorId: listing.creatorId,
    buyerClerkId: userId,
    appUrl,
  });

  // We need to pass the brief data through — store it server-side keyed by session ID
  // Use a temporary PendingCheckout record approach via job with PENDING_PAYMENT status
  // Instead: store brief in session metadata (Stripe allows up to 500 chars per key)
  // For longer briefs, we store a reference in DB as a draft job

  // Create a "pending" job that will be activated on webhook success
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { buyerProfile: true },
  });

  let buyerProfile = user?.buyerProfile;
  if (!buyerProfile && user) {
    buyerProfile = await prisma.buyerProfile.create({ data: { userId: user.id } });
  }

  if (buyerProfile) {
    const dueAt = new Date(Date.now() + listing.turnaroundHours * 60 * 60 * 1000);
    await prisma.job.create({
      data: {
        buyerProfileId: buyerProfile.id,
        creatorId: listing.creatorId,
        listingId: listing.id,
        briefTitle,
        submittedBrief,
        attachments: attachments ?? [],
        expectedOutputFormat: expectedOutputFormat ?? null,
        priceAmount: listing.priceAmount,
        currency: listing.currency,
        revisionLimit: listing.revisionCountIncluded,
        dueAt,
        stripeSessionId: session.id,
        paymentStatus: "pending",
        // Keep as SUBMITTED but unpaid — webhook will mark paid
        status: "SUBMITTED",
      },
    });
  }

  return NextResponse.json({ checkoutUrl: session.url });
}
