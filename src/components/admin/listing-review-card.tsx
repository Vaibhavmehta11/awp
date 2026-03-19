"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { categoryLabel, formatCurrency, formatDate } from "@/lib/utils";
import { Category, ListingStatus } from "@prisma/client";

interface ListingForReview {
  id: string;
  title: string;
  slug: string;
  category: Category;
  shortSummary: string;
  description: string;
  deliverableDefinition: string;
  turnaroundHours: number;
  priceAmount: string;
  status: ListingStatus;
  createdAt: Date;
  creator: {
    displayName: string;
    slug: string;
    email: string;
  };
}

interface ListingReviewCardProps {
  listing: ListingForReview;
}

export function ListingReviewCard({ listing }: ListingReviewCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");

  const handleAction = async (action: "approve" | "reject") => {
    setLoading(true);
    await fetch(`/api/admin/listings/${listing.id}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewNotes: notes }),
    });
    router.refresh();
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">{listing.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              by {listing.creator.displayName} · {categoryLabel(listing.category)} · {formatDate(listing.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{formatCurrency(listing.priceAmount)}</span>
            <Badge variant="secondary">{listing.status.replace(/_/g, " ")}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div>
            <p className="font-medium mb-1">Summary</p>
            <p className="text-muted-foreground">{listing.shortSummary}</p>
          </div>
          <div>
            <p className="font-medium mb-1">Description</p>
            <p className="text-muted-foreground line-clamp-4">{listing.description}</p>
          </div>
          <div>
            <p className="font-medium mb-1">Deliverable</p>
            <p className="text-muted-foreground">{listing.deliverableDefinition}</p>
          </div>
          <div>
            <p className="font-medium mb-1">Turnaround</p>
            <p className="text-muted-foreground">{listing.turnaroundHours}h</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`review-notes-${listing.id}`}>Review notes</Label>
          <Textarea
            id={`review-notes-${listing.id}`}
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Feedback for the creator..."
          />
        </div>

        <div className="flex gap-3">
          <Button onClick={() => handleAction("approve")} disabled={loading} size="sm">
            Approve
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleAction("reject")}
            disabled={loading}
            size="sm"
          >
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
