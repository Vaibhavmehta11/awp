import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
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
    where: { id, creatorId: user.creatorProfile.id },
  });
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!["DRAFT", "REJECTED"].includes(listing.status)) {
    return NextResponse.json({ error: "Cannot edit listing in current status" }, { status: 400 });
  }

  const body = await req.json();
  const allowedFields = [
    "title", "shortSummary", "description", "deliverableDefinition",
    "turnaroundHours", "revisionCountIncluded", "priceAmount",
    "sampleOutputUrls", "exclusions", "category",
  ];

  const updateData: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in body) updateData[field] = body[field];
  }

  const updated = await prisma.serviceListing.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ data: updated });
}

export async function DELETE(
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
    where: { id, creatorId: user.creatorProfile.id, status: "DRAFT" },
  });
  if (!listing) return NextResponse.json({ error: "Not found or cannot delete" }, { status: 404 });

  await prisma.serviceListing.delete({ where: { id } });
  return NextResponse.json({ data: { deleted: true } });
}
