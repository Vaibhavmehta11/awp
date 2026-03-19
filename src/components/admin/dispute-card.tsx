"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { AdminDisputeCaseDTO } from "@/types";

interface DisputeCardProps {
  dispute: AdminDisputeCaseDTO;
}

export function DisputeCard({ dispute }: DisputeCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [resolution, setResolution] = useState("");

  const resolve = async () => {
    if (!resolution.trim()) return;
    setLoading(true);
    await fetch(`/api/admin/disputes/${dispute.id}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolutionNotes: resolution }),
    });
    router.refresh();
    setLoading(false);
  };

  return (
    <Card className="border-orange-200">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">{dispute.job.briefTitle}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Reason: {dispute.reasonCode} · Opened {formatDate(dispute.createdAt)}
            </p>
          </div>
          <Badge variant="destructive">{dispute.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium mb-1">Buyer</p>
            <p className="text-muted-foreground">{dispute.job.buyer.displayName}</p>
            <p className="text-xs text-muted-foreground">{dispute.job.buyer.email}</p>
          </div>
          <div>
            <p className="font-medium mb-1">Creator</p>
            <p className="text-muted-foreground">{dispute.job.creator.displayName}</p>
            <p className="text-xs text-muted-foreground">{dispute.job.creator.email}</p>
          </div>
        </div>

        {dispute.notes && (
          <div className="text-sm">
            <p className="font-medium mb-1">Notes from opener</p>
            <p className="text-muted-foreground">{dispute.notes}</p>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor={`resolution-${dispute.id}`}>Resolution notes *</Label>
          <Textarea
            id={`resolution-${dispute.id}`}
            rows={3}
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            placeholder="Describe the resolution and any actions taken..."
          />
        </div>

        <Button
          onClick={resolve}
          disabled={loading || !resolution.trim()}
          size="sm"
        >
          {loading ? "Resolving..." : "Mark Resolved"}
        </Button>
      </CardContent>
    </Card>
  );
}
