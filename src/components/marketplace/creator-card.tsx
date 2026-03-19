import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RatingStars } from "@/components/shared/rating-stars";
import { TrustBadges } from "@/components/marketplace/trust-badges";
import { CreatorPublicDTO } from "@/types";

interface CreatorCardProps {
  creator: CreatorPublicDTO;
}

export function CreatorCard({ creator }: CreatorCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={creator.avatarUrl ?? undefined} />
            <AvatarFallback>
              {creator.displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <Link
              href={`/creators/${creator.slug}`}
              className="font-semibold hover:underline block"
            >
              {creator.displayName}
              {creator.verifiedStatus && (
                <span className="ml-1 text-primary text-sm">✓</span>
              )}
            </Link>
            {creator.location && (
              <p className="text-xs text-muted-foreground mt-0.5">{creator.location}</p>
            )}
            {creator.ratingCount > 0 && (
              <RatingStars
                rating={creator.ratingAvg}
                count={creator.ratingCount}
                size="sm"
                className="mt-1"
              />
            )}
          </div>
        </div>

        {creator.bio && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{creator.bio}</p>
        )}

        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <p className="font-semibold">{creator.completionRate.toFixed(0)}%</p>
            <p className="text-muted-foreground">Completion</p>
          </div>
          <div>
            <p className="font-semibold">{creator.onTimeRate.toFixed(0)}%</p>
            <p className="text-muted-foreground">On Time</p>
          </div>
          <div>
            <p className="font-semibold">{creator.acceptedJobs}</p>
            <p className="text-muted-foreground">Jobs</p>
          </div>
        </div>

        {creator.badges.length > 0 && (
          <div className="mt-3">
            <TrustBadges badges={creator.badges} size="sm" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
