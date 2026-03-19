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
    include: { buyerProfile: true },
  });
  if (!user?.buyerProfile) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const job = await prisma.job.findFirst({
    where: { id, buyerProfileId: user.buyerProfile.id, status: "DELIVERED" },
  });
  if (!job) return NextResponse.json({ error: "Job not found or invalid state" }, { status: 404 });

  const updated = await prisma.job.update({
    where: { id },
    data: {
      status: "ACCEPTED_BY_BUYER",
      buyerClosedAt: new Date(),
    },
  });

  // Update stats
  await prisma.$transaction([
    prisma.buyerProfile.update({
      where: { id: user.buyerProfile.id },
      data: { jobsCompletedCount: { increment: 1 } },
    }),
    prisma.creatorProfile.update({
      where: { id: job.creatorId },
      data: {
        completionRate: { set: await computeCreatorCompletionRate(job.creatorId) },
      },
    }),
  ]);

  await trackServerEvent(userId, AWP_EVENTS.DELIVERY_ACCEPTED_UI, { jobId: id });

  return NextResponse.json({ data: updated });
}

async function computeCreatorCompletionRate(creatorId: string): Promise<number> {
  const [completed, total] = await Promise.all([
    prisma.job.count({ where: { creatorId, status: "ACCEPTED_BY_BUYER" } }),
    prisma.job.count({ where: { creatorId, status: { not: "SUBMITTED" } } }),
  ]);
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}
