import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RatingStars } from "@/components/shared/rating-stars";
import { TrustBadges } from "@/components/marketplace/trust-badges";
import { categoryLabel, formatCurrency, formatDate } from "@/lib/utils";
import { BadgeDTO, ReviewSummaryDTO } from "@/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const listing = await prisma.serviceListing.findUnique({
    where: { slug, status: "APPROVED" },
    include: {
      creator: {
        include: { badges: { include: { badge: true } } },
      },
      badges: { include: { badge: true } },
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!listing) notFound();

  const listingBadges: BadgeDTO[] = listing.badges.map((b) => ({
    id: b.badge.id,
    code: b.badge.code,
    label: b.badge.label,
    description: b.badge.description,
    badgeType: b.badge.badgeType,
  }));

  const creatorBadges: BadgeDTO[] = listing.creator.badges.map((b) => ({
    id: b.badge.id,
    code: b.badge.code,
    label: b.badge.label,
    description: b.badge.description,
    badgeType: b.badge.badgeType,
  }));

  const reviews: ReviewSummaryDTO[] = listing.reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    reviewText: r.reviewText,
    createdAt: r.createdAt,
  }));

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <Badge variant="secondary" className="mb-3">
              {categoryLabel(listing.category)}
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight">{listing.title}</h1>
            <p className="mt-3 text-lg text-muted-foreground">{listing.shortSummary}</p>

            <div className="flex items-center gap-4 mt-4">
              {listing.ratingCount > 0 && (
                <RatingStars rating={listing.ratingAvg} count={listing.ratingCount} />
              )}
              <TrustBadges badges={listingBadges} size="sm" />
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="text-xl font-semibold mb-4">About this service</h2>
            <div className="prose prose-sm max-w-none text-foreground">
              <p className="whitespace-pre-wrap">{listing.description}</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">What you&apos;ll receive</h2>
            <p className="text-sm leading-relaxed">{listing.deliverableDefinition}</p>
          </div>

          {listing.exclusions && (
            <div>
              <h2 className="text-xl font-semibold mb-4">What&apos;s not included</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {listing.exclusions}
              </p>
            </div>
          )}

          {listing.sampleOutputUrls.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Sample outputs</h2>
              <ul className="space-y-2">
                {listing.sampleOutputUrls.map((url, i) => (
                  <li key={i}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Sample {i + 1} →
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {reviews.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Reviews</h2>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <RatingStars rating={review.rating} size="sm" />
                      <span className="text-xs text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    {review.reviewText && (
                      <p className="text-sm">{review.reviewText}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="border rounded-xl p-6 sticky top-24 space-y-5">
            <div>
              <p className="text-3xl font-bold">
                {formatCurrency(listing.priceAmount.toString(), listing.currency)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Fixed price</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-muted-foreground text-xs">Turnaround</p>
                <p className="font-semibold mt-0.5">{listing.turnaroundHours}h</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-muted-foreground text-xs">Revisions</p>
                <p className="font-semibold mt-0.5">{listing.revisionCountIncluded} included</p>
              </div>
              {listing.completionRate > 0 && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-muted-foreground text-xs">Completion</p>
                  <p className="font-semibold mt-0.5">{listing.completionRate.toFixed(0)}%</p>
                </div>
              )}
              {listing.onTimeRate > 0 && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-muted-foreground text-xs">On Time</p>
                  <p className="font-semibold mt-0.5">{listing.onTimeRate.toFixed(0)}%</p>
                </div>
              )}
            </div>

            <Button size="lg" className="w-full" asChild>
              <Link href={`/request/${listing.slug}`}>Order This Service</Link>
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              You won&apos;t be charged until the creator accepts your job
            </p>
          </div>

          {/* Creator card */}
          <div className="border rounded-xl p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Creator
            </p>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={listing.creator.avatarUrl ?? undefined} />
                <AvatarFallback>
                  {listing.creator.displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <Link
                  href={`/creators/${listing.creator.slug}`}
                  className="font-semibold text-sm hover:underline"
                >
                  {listing.creator.displayName}
                  {listing.creator.verifiedStatus && (
                    <span className="ml-1 text-primary">✓</span>
                  )}
                </Link>
                {listing.creator.ratingCount > 0 && (
                  <RatingStars
                    rating={listing.creator.ratingAvg}
                    count={listing.creator.ratingCount}
                    size="sm"
                    className="mt-0.5"
                  />
                )}
              </div>
            </div>
            {listing.creator.bio && (
              <p className="text-xs text-muted-foreground line-clamp-3">
                {listing.creator.bio}
              </p>
            )}
            <TrustBadges badges={creatorBadges} size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
