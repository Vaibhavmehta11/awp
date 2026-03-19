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
  const { resolutionNotes } = body;

  if (!resolutionNotes?.trim()) {
    return NextResponse.json({ error: "resolutionNotes required" }, { status: 400 });
  }

  const dispute = await prisma.disputeCase.findUnique({ where: { id } });
  if (!dispute) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.disputeCase.update({
    where: { id },
    data: {
      status: "RESOLVED",
      resolutionNotes,
      resolvedAt: new Date(),
    },
  });

  await trackServerEvent(adminUser.clerkId, AWP_EVENTS.DISPUTE_RESOLVED, {
    disputeId: id,
    jobId: dispute.jobId,
  });

  return NextResponse.json({ data: updated });
}
