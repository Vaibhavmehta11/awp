import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ListingReviewCard } from "@/components/admin/listing-review-card";

export default async function AdminListingsPage() {
  const listings = await prisma.serviceListing.findMany({
    where: { status: "PENDING_REVIEW" },
    include: {
      creator: { include: { user: { select: { email: true, displayName: true } } } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Listing Reviews"
        description={`${listings.length} listings pending approval`}
      />

      {listings.length === 0 ? (
        <EmptyState title="No pending listings" description="All listings have been reviewed." />
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <ListingReviewCard
              key={listing.id}
              listing={{
                ...listing,
                priceAmount: listing.priceAmount.toString(),
                creator: {
                  displayName: listing.creator.displayName,
                  slug: listing.creator.slug,
                  email: listing.creator.user.email,
                },
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
