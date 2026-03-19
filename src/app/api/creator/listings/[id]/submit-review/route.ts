import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { trackServerEvent, AWP_EVENTS } from "@/lib/posthog";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { creatorProfile: true },
  });
  if (!user?.creatorProfile) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const listing = await prisma.serviceListing.findFirst({
    where: {
      id,
      creatorId: user.creatorProfile.id,
      status: { in: ["DRAFT", "REJECTED"] },
    },
  });
  if (!listing) return NextResponse.json({ error: "Not found or invalid state" }, { status: 404 });

  const updated = await prisma.serviceListing.update({
    where: { id },
    data: { status: "PENDING_REVIEW" },
  });

  await trackServerEvent(userId, AWP_EVENTS.LISTING_SUBMITTED_FOR_REVIEW, { listingId: id });

  return NextResponse.json({ data: updated });
}
