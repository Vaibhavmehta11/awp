import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BuyerJobListDTO } from "@/types";
import { categoryLabel, formatCurrency, formatDate } from "@/lib/utils";
import { JobStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

const statusConfig: Record<JobStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  SUBMITTED: { label: "Submitted", variant: "secondary" },
  ACCEPTED: { label: "Accepted", variant: "secondary" },
  IN_PROGRESS: { label: "In Progress", variant: "default" },
  DELIVERED: { label: "Delivered — Review Needed", variant: "default" },
  REVISION_REQUESTED: { label: "Revision Requested", variant: "secondary" },
  ACCEPTED_BY_BUYER: { label: "Completed", variant: "outline" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
  DISPUTED: { label: "Disputed", variant: "destructive" },
  FAILED: { label: "Failed", variant: "destructive" },
};

interface JobCardProps {
  job: BuyerJobListDTO;
}

export function JobCard({ job }: JobCardProps) {
  const config = statusConfig[job.status];

  return (
    <Card className={cn("hover:shadow-sm transition-shadow", job.status === "DELIVERED" && "border-primary/50")}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <Link href={`/jobs/${job.id}`} className="font-semibold hover:underline block truncate">
              {job.briefTitle}
            </Link>
            <p className="text-xs text-muted-foreground mt-0.5">
              {categoryLabel(job.listing.category)} · {job.listing.title}
            </p>
          </div>
          <Badge variant={config.variant} className="shrink-0 text-xs">
            {config.label}
          </Badge>
        </div>

        <div className="mt-3 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarImage src={job.creator.avatarUrl ?? undefined} />
              <AvatarFallback className="text-xs">
                {job.creator.displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-muted-foreground text-xs">{job.creator.displayName}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {job.dueAt && (
              <span>Due {formatDate(job.dueAt)}</span>
            )}
            <span className="font-semibold text-foreground">
              {formatCurrency(job.priceAmount, job.currency)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
