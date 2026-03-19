import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { trackServerEvent, AWP_EVENTS } from "@/lib/posthog";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { buyerProfile: true },
  });
  if (!user?.buyerProfile) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const job = await prisma.job.findFirst({
    where: { id, buyerProfileId: user.buyerProfile.id, status: "ACCEPTED_BY_BUYER" },
  });
  if (!job) return NextResponse.json({ error: "Job not found or not yet accepted" }, { status: 404 });

  const existing = await prisma.review.findUnique({ where: { jobId: id } });
  if (existing) return NextResponse.json({ error: "Review already exists" }, { status: 409 });

  const body = await req.json();
  const { rating, reviewText } = body;

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
  }

  const review = await prisma.review.create({
    data: {
      jobId: id,
      buyerId: user.buyerProfile.id,
      creatorId: job.creatorId,
      listingId: job.listingId,
      rating,
      reviewText: reviewText ?? null,
    },
  });

  // Recompute creator rating avg
  const allReviews = await prisma.review.findMany({ where: { creatorId: job.creatorId } });
  const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

  await prisma.$transaction([
    prisma.creatorProfile.update({
      where: { id: job.creatorId },
      data: { ratingAvg: avgRating, ratingCount: allReviews.length },
    }),
    prisma.serviceListing.update({
      where: { id: job.listingId },
      data: { ratingAvg: avgRating, ratingCount: allReviews.length },
    }),
  ]);

  await trackServerEvent(userId, AWP_EVENTS.REVIEW_SUBMITTED_UI, { jobId: id, rating });

  return NextResponse.json({ data: review }, { status: 201 });
}
