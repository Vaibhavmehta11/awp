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
  "icp-definition": Category.ICP_DEFINITION,
  "competitor-intelligence": Category.COMPETITOR_INTELLIGENCE,
  "abm-account-research": Category.ABM_ACCOUNT_RESEARCH,
  "prospect-list-audit": Category.PROSPECT_LIST_AUDIT,
  "intent-signal-monitoring": Category.INTENT_SIGNAL_MONITORING,
};

const categoryDescriptions: Record<Category, string> = {
  LEAD_RESEARCH: "Verified, enriched prospect lists built for your exact ICP.",
  MARKET_INTELLIGENCE: "Deep research on competitors, positioning, and market signals.",
  OUTREACH_PERSONALIZATION: "Hyper-personalized cold outreach sequences at scale.",
  ICP_DEFINITION: "Get a precise 1-page Ideal Customer Profile with sample accounts, firmographic filters, and persona briefs.",
  COMPETITOR_INTELLIGENCE: "Deep competitive cards covering positioning, pricing, messaging weaknesses, and differentiation opportunities.",
  ABM_ACCOUNT_RESEARCH: "Deep account profiles with decision makers, tech stack, recent triggers, and personalized talking points.",
  PROSPECT_LIST_AUDIT: "Clean, enrich, and re-score a decaying list before you send. Deduped, verified, and formatted for your email platform.",
  INTENT_SIGNAL_MONITORING: "Weekly report of accounts showing active buying signals based on job posts, funding rounds, tech changes, and content activity.",
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
