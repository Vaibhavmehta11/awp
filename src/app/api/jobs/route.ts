import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { trackServerEvent, AWP_EVENTS } from "@/lib/posthog";
import { sendJobSubmittedEmail } from "@/lib/resend";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { buyerProfile: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  let buyerProfile = user.buyerProfile;
  if (!buyerProfile) {
    buyerProfile = await prisma.buyerProfile.create({ data: { userId: user.id } });
  }

  const body = await req.json();
  const { listingId, briefTitle, submittedBrief, attachments, expectedOutputFormat } = body;

  if (!listingId || !briefTitle || !submittedBrief) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const listing = await prisma.serviceListing.findUnique({
    where: { id: listingId, status: "APPROVED" },
    include: { creator: { include: { user: true } } },
  });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  const dueAt = new Date(Date.now() + listing.turnaroundHours * 60 * 60 * 1000);

  const job = await prisma.job.create({
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
    },
  });

  await prisma.buyerProfile.update({
    where: { id: buyerProfile.id },
    data: { jobsSubmittedCount: { increment: 1 } },
  });

  await trackServerEvent(userId, AWP_EVENTS.JOB_CREATED, {
    jobId: job.id,
    listingId: listing.id,
    category: listing.category,
  });

  // Send email notification to creator
  try {
    await sendJobSubmittedEmail(
      listing.creator.user?.email ?? "",
      briefTitle,
      listing.creator.displayName
    );
  } catch { /* non-blocking */ }

  return NextResponse.json({ data: job }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { buyerProfile: true },
  });
  if (!user?.buyerProfile) return NextResponse.json({ data: [] });

  const jobs = await prisma.job.findMany({
    where: { buyerProfileId: user.buyerProfile.id },
    include: {
      listing: { select: { title: true, slug: true, category: true } },
      creator: { select: { displayName: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: jobs });
}
