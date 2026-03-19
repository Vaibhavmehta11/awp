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

  const adminUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!adminUser || adminUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const listing = await prisma.serviceListing.findUnique({ where: { id } });
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.serviceListing.update({
    where: { id },
    data: { status: "REJECTED" },
  });

  await trackServerEvent(adminUser.clerkId, AWP_EVENTS.LISTING_REJECTED, {
    listingId: id,
    reason: body.reviewNotes ?? "",
  });

  return NextResponse.json({ data: updated });
}
