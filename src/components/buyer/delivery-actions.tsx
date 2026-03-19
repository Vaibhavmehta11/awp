"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { JobStatus } from "@prisma/client";
import { usePostHog } from "@/hooks/use-posthog";

interface DeliveryActionsProps {
  jobId: string;
  status: JobStatus;
  revisionCountUsed: number;
  revisionLimit: number;
  hasReview: boolean;
}

export function DeliveryActions({
  jobId,
  status,
  revisionCountUsed,
  revisionLimit,
  hasReview,
}: DeliveryActionsProps) {
  const router = useRouter();
  const { track, events } = usePostHog();
  const [loading, setLoading] = useState(false);
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [revisionNote, setRevisionNote] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  if (status !== "DELIVERED") return null;

  const canRequestRevision = revisionCountUsed < revisionLimit;

  const acceptDelivery = async () => {
    setLoading(true);
    track(events.DELIVERY_ACCEPTED_UI, { jobId });
    await fetch(`/api/jobs/${jobId}/accept-delivery`, { method: "POST" });
    router.refresh();
    setLoading(false);
    setReviewOpen(true);
  };

  const requestRevision = async () => {
    setLoading(true);
    track(events.REVISION_REQUESTED_UI, { jobId });
    await fetch(`/api/jobs/${jobId}/request-revision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: revisionNote }),
    });
    setRevisionOpen(false);
    router.refresh();
    setLoading(false);
  };

  const submitReview = async () => {
    setLoading(true);
    track(events.REVIEW_SUBMITTED_UI, { jobId, rating: reviewRating });
    await fetch(`/api/jobs/${jobId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: reviewRating, reviewText }),
    });
    setReviewOpen(false);
    router.refresh();
    setLoading(false);
  };

  return (
    <>
      <div className="flex gap-3 flex-wrap">
        <Button onClick={acceptDelivery} disabled={loading}>
          Accept Delivery
        </Button>
        {canRequestRevision && (
          <Button variant="outline" onClick={() => setRevisionOpen(true)} disabled={loading}>
            Request Revision ({revisionCountUsed}/{revisionLimit} used)
          </Button>
        )}
      </div>

      {/* Revision dialog */}
      <Dialog open={revisionOpen} onOpenChange={setRevisionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request a Revision</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="revisionNote">What needs to be changed?</Label>
            <Textarea
              id="revisionNote"
              rows={4}
              value={revisionNote}
              onChange={(e) => setRevisionNote(e.target.value)}
              placeholder="Be specific about what you'd like adjusted..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevisionOpen(false)}>Cancel</Button>
            <Button onClick={requestRevision} disabled={loading || !revisionNote.trim()}>
              {loading ? "Sending..." : "Send Revision Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review dialog */}
      <Dialog open={reviewOpen && !hasReview} onOpenChange={setReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Rating</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Button
                    key={n}
                    variant={reviewRating >= n ? "default" : "outline"}
                    size="sm"
                    className="w-10"
                    onClick={() => setReviewRating(n)}
                  >
                    {n}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reviewText">Comments (optional)</Label>
              <Textarea
                id="reviewText"
                rows={3}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOpen(false)}>Skip</Button>
            <Button onClick={submitReview} disabled={loading}>
              {loading ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
