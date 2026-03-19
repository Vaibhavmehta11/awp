import { Badge } from "@/components/ui/badge";
import { BadgeDTO } from "@/types";

interface TrustBadgesProps {
  badges: BadgeDTO[];
  size?: "sm" | "md";
}

const badgeVariantMap: Record<string, "default" | "secondary" | "outline"> = {
  TRUST: "default",
  PERFORMANCE: "secondary",
  CURATION: "outline",
};

export function TrustBadges({ badges, size = "md" }: TrustBadgesProps) {
  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((badge) => (
        <Badge
          key={badge.id}
          variant={badgeVariantMap[badge.badgeType] ?? "outline"}
          className={size === "sm" ? "text-xs px-1.5 py-0" : undefined}
          title={badge.description}
        >
          {badge.label}
        </Badge>
      ))}
    </div>
  );
}
