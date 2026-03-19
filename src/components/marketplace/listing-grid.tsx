import { ListingCard } from "@/components/marketplace/listing-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ListingCardDTO } from "@/types";

interface ListingGridProps {
  listings: ListingCardDTO[];
}

export function ListingGrid({ listings }: ListingGridProps) {
  if (listings.length === 0) {
    return (
      <EmptyState
        title="No listings found"
        description="Check back soon as new services are added regularly."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
