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
    where: { id, buyerProfileId: user.buyerProfile.id, status: "DELIVERED" },
  });
  if (!job) return NextResponse.json({ error: "Job not found or invalid state" }, { status: 404 });

  if (job.revisionCountUsed >= job.revisionLimit) {
    return NextResponse.json({ error: "Revision limit reached" }, { status: 400 });
  }

  const body = await req.json();
  const { note } = body;

  const [updated] = await prisma.$transaction([
    prisma.job.update({
      where: { id },
      data: {
        status: "REVISION_REQUESTED",
        revisionCountUsed: { increment: 1 },
      },
    }),
    ...(note
      ? [
          prisma.jobMessage.create({
            data: {
              jobId: id,
              senderType: "BUYER",
              senderId: user.buyerProfile.id,
              messageText: `Revision request: ${note}`,
            },
          }),
        ]
      : []),
  ]);

  await trackServerEvent(userId, AWP_EVENTS.REVISION_REQUESTED_UI, { jobId: id });

  return NextResponse.json({ data: updated });
}
