import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { trackServerEvent, AWP_EVENTS } from "@/lib/posthog";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { creatorProfile: true },
  });
  if (!user?.creatorProfile) return NextResponse.json({ error: "Not a creator" }, { status: 403 });
  if (user.creatorProfile.status !== "APPROVED") {
    return NextResponse.json({ error: "Creator account not approved" }, { status: 403 });
  }

  const body = await req.json();
  const {
    title, category, shortSummary, description, deliverableDefinition,
    turnaroundHours, revisionCountIncluded, priceAmount, sampleOutputUrls, exclusions,
  } = body;

  if (!title || !category || !shortSummary || !description || !deliverableDefinition || !priceAmount) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const baseSlug = slugify(title);
  let slug = baseSlug;
  let attempt = 0;
  while (await prisma.serviceListing.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++attempt}`;
  }

  const listing = await prisma.serviceListing.create({
    data: {
      creatorId: user.creatorProfile.id,
      title,
      slug,
      category,
      shortSummary,
      description,
      deliverableDefinition,
      turnaroundHours: turnaroundHours ?? 24,
      revisionCountIncluded: revisionCountIncluded ?? 1,
      priceAmount,
      sampleOutputUrls: sampleOutputUrls ?? [],
      exclusions: exclusions ?? null,
      status: "DRAFT",
    },
  });

  await trackServerEvent(userId, AWP_EVENTS.LISTING_CREATED, { listingId: listing.id });

  return NextResponse.json({ data: listing }, { status: 201 });
}

export async function GET(_req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { creatorProfile: true },
  });
  if (!user?.creatorProfile) return NextResponse.json({ data: [] });

  const listings = await prisma.serviceListing.findMany({
    where: { creatorId: user.creatorProfile.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: listings });
}
