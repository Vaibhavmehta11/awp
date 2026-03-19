import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { MessageSenderType } from "@prisma/client";

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

  const isBuyer = !!user.buyerProfile;
  const isCreator = !!user.creatorProfile;

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
  const { messageText, attachments } = body;

  if (!messageText?.trim()) {
    return NextResponse.json({ error: "messageText required" }, { status: 400 });
  }

  const senderType: MessageSenderType = isCreator ? "CREATOR" : "BUYER";
  const senderId = isCreator ? user.creatorProfile!.id : user.buyerProfile!.id;

  const message = await prisma.jobMessage.create({
    data: {
      jobId: id,
      senderType,
      senderId,
      messageText,
      attachments: attachments ?? [],
    },
  });

  return NextResponse.json({ data: message }, { status: 201 });
}

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
  });
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const messages = await prisma.jobMessage.findMany({
    where: { jobId: id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ data: messages });
}
