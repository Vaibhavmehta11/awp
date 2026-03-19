import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
  listingCount?: number;
  className?: string;
}

export function CategoryCard({
  title,
  description,
  href,
  icon,
  listingCount,
  className,
}: CategoryCardProps) {
  return (
    <Link href={href} className="block group">
      <Card
        className={cn(
          "h-full transition-all group-hover:shadow-md group-hover:border-primary/50",
          className
        )}
      >
        <CardContent className="p-6 flex flex-col h-full">
          <div className="text-3xl mb-3">{icon}</div>
          <h3 className="font-semibold text-lg leading-snug group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground flex-1">{description}</p>
          {listingCount !== undefined && (
            <p className="mt-4 text-xs text-muted-foreground">
              {listingCount} service{listingCount !== 1 ? "s" : ""} available
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
