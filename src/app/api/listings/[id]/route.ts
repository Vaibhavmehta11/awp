import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const listing = await prisma.serviceListing.findUnique({
    where: { id, status: "APPROVED" },
    include: {
      creator: {
        include: { badges: { include: { badge: true } } },
      },
      badges: { include: { badge: true } },
      reviews: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!listing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data: listing });
}
