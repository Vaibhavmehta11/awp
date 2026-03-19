import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { trackServerEvent, AWP_EVENTS } from "@/lib/posthog";
import { sendJobDeliveredEmail } from "@/lib/resend";

export async function POST(
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

  const job = await prisma.job.findFirst({
    where: {
      id,
      creatorId: user.creatorProfile.id,
      status: { in: ["IN_PROGRESS", "REVISION_REQUESTED"] },
    },
    include: { buyer: { include: { user: { select: { email: true } } } } },
  });
  if (!job) return NextResponse.json({ error: "Job not found or invalid state" }, { status: 404 });

  const body = await req.json();
  const { summaryNote, deliveryPayload } = body;

  if (!deliveryPayload) {
    return NextResponse.json({ error: "deliveryPayload is required" }, { status: 400 });
  }

  const lastDelivery = await prisma.jobDelivery.findFirst({
    where: { jobId: id },
    orderBy: { deliveryVersion: "desc" },
  });
  const nextVersion = (lastDelivery?.deliveryVersion ?? 0) + 1;

  const [delivery] = await prisma.$transaction([
    prisma.jobDelivery.create({
      data: {
        jobId: id,
        deliveryVersion: nextVersion,
        summaryNote: summaryNote ?? null,
        deliveryPayload,
        submittedById: user.creatorProfile.id,
      },
    }),
    prisma.job.update({
      where: { id },
      data: { status: "DELIVERED", deliveredAt: new Date() },
    }),
  ]);

  await trackServerEvent(userId, AWP_EVENTS.JOB_DELIVERED, { jobId: id });

  try {
    await sendJobDeliveredEmail(job.buyer.user.email, job.briefTitle);
  } catch { /* non-blocking */ }

  return NextResponse.json({ data: delivery });
}
