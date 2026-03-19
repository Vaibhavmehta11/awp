import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RatingStars } from "@/components/shared/rating-stars";
import { ListingCardDTO } from "@/types";
import { categoryLabel, formatCurrency } from "@/lib/utils";

interface ListingCardProps {
  listing: ListingCardDTO;
}

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Card className="group hover:shadow-md transition-shadow overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <Badge variant="secondary" className="text-xs">
            {categoryLabel(listing.category)}
          </Badge>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {listing.turnaroundHours}h turnaround
          </span>
        </div>

        <Link href={`/listings/${listing.slug}`} className="block">
          <h3 className="font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {listing.title}
          </h3>
        </Link>

        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {listing.shortSummary}
        </p>

        {listing.badges.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {listing.badges.slice(0, 3).map((badge) => (
              <Badge key={badge.id} variant="outline" className="text-xs px-1.5 py-0">
                {badge.label}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="px-5 py-3 border-t bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={listing.creator.avatarUrl ?? undefined} />
            <AvatarFallback className="text-xs">
              {listing.creator.displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Link
            href={`/creators/${listing.creator.slug}`}
            className="text-xs font-medium hover:underline"
          >
            {listing.creator.displayName}
          </Link>
          {listing.creator.verifiedStatus && (
            <span className="text-xs text-primary" title="Verified creator">✓</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {listing.ratingCount > 0 && (
            <RatingStars rating={listing.ratingAvg} count={listing.ratingCount} size="sm" />
          )}
          <span className="font-bold text-sm">
            {formatCurrency(listing.priceAmount, listing.currency)}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
