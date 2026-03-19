import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { trackServerEvent, AWP_EVENTS } from "@/lib/posthog";
import { sendCreatorApplicationStatusEmail } from "@/lib/resend";

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

  const application = await prisma.creatorApplication.findUnique({ where: { id } });
  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.creatorApplication.update({
    where: { id },
    data: { status: "REJECTED", reviewNotes: body.reviewNotes ?? null },
  });

  await trackServerEvent(adminUser.clerkId, AWP_EVENTS.CREATOR_REJECTED, {
    applicationId: id,
  });

  try {
    await sendCreatorApplicationStatusEmail(application.email, application.name, false);
  } catch { /* non-blocking */ }

  return NextResponse.json({ data: { rejected: true } });
}
