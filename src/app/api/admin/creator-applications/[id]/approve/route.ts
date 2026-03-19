import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { trackServerEvent, AWP_EVENTS } from "@/lib/posthog";
import { sendCreatorApplicationStatusEmail } from "@/lib/resend";
import { slugify } from "@/lib/utils";

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

  const application = await prisma.creatorApplication.findUnique({ where: { id } });
  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (application.status === "APPROVED") {
    return NextResponse.json({ error: "Already approved" }, { status: 409 });
  }

  const body = await req.json();

  // Update application status
  await prisma.creatorApplication.update({
    where: { id },
    data: {
      status: "APPROVED",
      reviewNotes: body.reviewNotes ?? null,
    },
  });

  // Find or create user, then create creator profile
  let user = await prisma.user.findUnique({ where: { email: application.email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: `pending_${id}`,
        email: application.email,
        displayName: application.name,
        role: "CREATOR",
      },
    });
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "CREATOR" },
    });
  }

  const baseSlug = slugify(application.name);
  let slug = baseSlug;
  let attempt = 0;
  while (await prisma.creatorProfile.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++attempt}`;
  }

  const existingProfile = await prisma.creatorProfile.findUnique({ where: { userId: user.id } });
  if (!existingProfile) {
    await prisma.creatorProfile.create({
      data: {
        userId: user.id,
        displayName: application.name,
        slug,
        status: "APPROVED",
        verifiedStatus: true,
      },
    });
  } else {
    await prisma.creatorProfile.update({
      where: { userId: user.id },
      data: { status: "APPROVED", verifiedStatus: true },
    });
  }

  await trackServerEvent(adminUser.clerkId, AWP_EVENTS.CREATOR_APPROVED, {
    applicationId: id,
    email: application.email,
  });

  try {
    await sendCreatorApplicationStatusEmail(application.email, application.name, true);
  } catch { /* non-blocking */ }

  return NextResponse.json({ data: { approved: true } });
}
