import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ListingGrid } from "@/components/marketplace/listing-grid";
import { PageHeader } from "@/components/shared/page-header";
import { ListingCardDTO } from "@/types";
import { categoryLabel } from "@/lib/utils";
import { Category } from "@prisma/client";

const slugToCategory: Record<string, Category> = {
  "lead-research": Category.LEAD_RESEARCH,
  "market-intelligence": Category.MARKET_INTELLIGENCE,
  "outreach-personalization": Category.OUTREACH_PERSONALIZATION,
};

const categoryDescriptions: Record<Category, string> = {
  LEAD_RESEARCH: "Verified, enriched prospect lists built for your exact ICP.",
  MARKET_INTELLIGENCE: "Deep research on competitors, positioning, and market signals.",
  OUTREACH_PERSONALIZATION: "Hyper-personalized cold outreach sequences at scale.",
};

interface PageProps {
  params: Promise<{ category: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const { category: categorySlug } = await params;
  const category = slugToCategory[categorySlug];
  if (!category) notFound();

  const listings = await prisma.serviceListing.findMany({
    where: { category, status: "APPROVED" },
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

  const listingDTOs: ListingCardDTO[] = listings.map((l) => ({
    id: l.id,
    title: l.title,
    slug: l.slug,
    category: l.category,
    shortSummary: l.shortSummary,
    turnaroundHours: l.turnaroundHours,
    priceAmount: l.priceAmount.toString(),
    currency: l.currency,
    ratingAvg: l.ratingAvg,
    ratingCount: l.ratingCount,
    creator: l.creator,
    badges: l.badges.map((b) => ({
      id: b.badge.id,
      code: b.badge.code,
      label: b.badge.label,
      description: b.badge.description,
      badgeType: b.badge.badgeType,
    })),
  }));

  return (
    <div className="container mx-auto px-4 py-10">
      <PageHeader
        title={categoryLabel(category)}
        description={categoryDescriptions[category]}
        className="mb-8"
      />
      <ListingGrid listings={listingDTOs} />
    </div>
  );
}

export async function generateStaticParams() {
  return Object.keys(slugToCategory).map((category) => ({ category }));
}
