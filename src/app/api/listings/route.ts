import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Category } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") as Category | null;

  const listings = await prisma.serviceListing.findMany({
    where: {
      status: "APPROVED",
      ...(category ? { category } : {}),
    },
    include: {
      creator: {
        select: {
          displayName: true,
          slug: true,
          avatarUrl: true,
          verifiedStatus: true,
        },
      },
      badges: { include: { badge: true } },
    },
    orderBy: { ratingAvg: "desc" },
  });

  return NextResponse.json({ data: listings });
}
