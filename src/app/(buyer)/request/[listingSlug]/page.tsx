import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { JobRequestForm } from "@/components/buyer/job-request-form";
import { ListingDetailDTO } from "@/types";

interface PageProps {
  params: Promise<{ listingSlug: string }>;
}

export default async function RequestPage({ params }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { listingSlug } = await params;

  const listing = await prisma.serviceListing.findUnique({
    where: { slug: listingSlug, status: "APPROVED" },
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
  });

  if (!listing) notFound();

  const dto: ListingDetailDTO = {
    id: listing.id,
    title: listing.title,
    slug: listing.slug,
    category: listing.category,
    shortSummary: listing.shortSummary,
    description: listing.description,
    deliverableDefinition: listing.deliverableDefinition,
    inputSchema: listing.inputSchema as Record<string, unknown> | null,
    outputSchema: listing.outputSchema as Record<string, unknown> | null,
    turnaroundHours: listing.turnaroundHours,
    revisionCountIncluded: listing.revisionCountIncluded,
    priceAmount: listing.priceAmount.toString(),
    currency: listing.currency,
    sampleOutputUrls: listing.sampleOutputUrls,
    exclusions: listing.exclusions,
    ratingAvg: listing.ratingAvg,
    ratingCount: listing.ratingCount,
    completionRate: listing.completionRate,
    onTimeRate: listing.onTimeRate,
    repeatBuyerRate: listing.repeatBuyerRate,
    status: listing.status,
    creator: {
      ...listing.creator,
    },
    badges: listing.badges.map((b) => ({
      id: b.badge.id,
      code: b.badge.code,
      label: b.badge.label,
      description: b.badge.description,
      badgeType: b.badge.badgeType,
    })),
    recentReviews: [],
  };

  return (
    <div className="max-w-2xl mx-auto py-4">
      <JobRequestForm listing={dto} />
    </div>
  );
}
