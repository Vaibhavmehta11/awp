import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { trackServerEvent, AWP_EVENTS } from "@/lib/posthog";
import { Category } from "@prisma/client";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    name, email, background, categoryExpertise,
    workflowStack, portfolioLinks, sampleWorkLinks,
  } = body;

  if (!name || !email || !background || !workflowStack) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const application = await prisma.creatorApplication.create({
    data: {
      name,
      email,
      background,
      categoryExpertise: (categoryExpertise ?? []) as Category[],
      workflowStack,
      portfolioLinks: portfolioLinks ?? [],
      sampleWorkLinks: sampleWorkLinks ?? [],
    },
  });

  await trackServerEvent(email, AWP_EVENTS.CREATOR_APPLICATION_SUBMITTED, {
    applicationId: application.id,
  });

  return NextResponse.json({ data: application }, { status: 201 });
}
