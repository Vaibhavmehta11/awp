import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { buyerProfile: true, creatorProfile: true },
  });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const job = await prisma.job.findFirst({
    where: {
      id,
      OR: [
        { buyerProfileId: user.buyerProfile?.id ?? "" },
        { creatorId: user.creatorProfile?.id ?? "" },
      ],
    },
  });
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const body = await req.json();
  const { reasonCode, notes } = body;

  if (!reasonCode) return NextResponse.json({ error: "reasonCode required" }, { status: 400 });

  const openedByType = user.creatorProfile ? "CREATOR" : "BUYER";

  const [dispute] = await prisma.$transaction([
    prisma.disputeCase.create({
      data: {
        jobId: id,
        openedByType,
        reasonCode,
        notes: notes ?? null,
      },
    }),
    prisma.job.update({
      where: { id },
      data: { status: "DISPUTED" },
    }),
  ]);

  return NextResponse.json({ data: dispute }, { status: 201 });
}
