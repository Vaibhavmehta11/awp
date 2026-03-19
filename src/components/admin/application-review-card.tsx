"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { CreatorApplication } from "@prisma/client";

interface ApplicationReviewCardProps {
  application: CreatorApplication;
}

export function ApplicationReviewCard({ application }: ApplicationReviewCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");

  const handleAction = async (action: "approve" | "reject") => {
    setLoading(true);
    await fetch(`/api/admin/creator-applications/${application.id}/${action}`, {
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
            <CardTitle className="text-base">{application.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{application.email} · Applied {formatDate(application.createdAt)}</p>
          </div>
          <Badge variant="secondary">{application.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium mb-1">Background</p>
            <p className="text-muted-foreground">{application.background}</p>
          </div>
          <div>
            <p className="font-medium mb-1">Workflow Stack</p>
            <p className="text-muted-foreground">{application.workflowStack}</p>
          </div>
        </div>

        {application.portfolioLinks.length > 0 && (
          <div className="text-sm">
            <p className="font-medium mb-1">Portfolio</p>
            <ul className="space-y-0.5">
              {application.portfolioLinks.map((link, i) => (
                <li key={i}>
                  <a href={link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor={`notes-${application.id}`}>Review notes (optional)</Label>
          <Textarea
            id={`notes-${application.id}`}
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Internal notes or feedback for the applicant..."
          />
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => handleAction("approve")}
            disabled={loading}
            size="sm"
          >
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
