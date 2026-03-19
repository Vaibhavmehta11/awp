import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
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
    include: {
      listing: true,
      creator: true,
      buyer: true,
      deliveries: { orderBy: { deliveryVersion: "desc" } },
      messages: { orderBy: { createdAt: "asc" } },
      reviews: true,
      disputes: true,
    },
  });

  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ data: job });
}
