import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { trackServerEvent, AWP_EVENTS } from "@/lib/posthog";
import { sendJobAcceptedEmail } from "@/lib/resend";

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

  const job = await prisma.job.findFirst({
    where: { id, creatorId: user.creatorProfile.id, status: "SUBMITTED" },
    include: { buyer: { include: { user: { select: { email: true } } } } },
  });
  if (!job) return NextResponse.json({ error: "Job not found or invalid state" }, { status: 404 });

  const updated = await prisma.job.update({
    where: { id },
    data: {
      status: "IN_PROGRESS",
      acceptedAt: new Date(),
    },
  });

  await prisma.creatorProfile.update({
    where: { id: user.creatorProfile.id },
    data: { acceptedJobs: { increment: 1 } },
  });

  await trackServerEvent(userId, AWP_EVENTS.JOB_ACCEPTED, { jobId: id });

  try {
    await sendJobAcceptedEmail(job.buyer.user.email, job.briefTitle);
  } catch { /* non-blocking */ }

  return NextResponse.json({ data: updated });
}
