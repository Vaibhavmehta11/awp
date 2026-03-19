"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JobStatus } from "@prisma/client";
import { usePostHog } from "@/hooks/use-posthog";
import { CreatorJobWorkspaceDTO } from "@/types";
import { formatDate } from "@/lib/utils";

interface JobWorkspaceProps {
  job: CreatorJobWorkspaceDTO;
}

export function JobWorkspace({ job }: JobWorkspaceProps) {
  const router = useRouter();
  const { track, events } = usePostHog();
  const [loading, setLoading] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState("");
  const [deliveryPayload, setDeliveryPayload] = useState("");
  const [messageText, setMessageText] = useState("");

  const acceptJob = async () => {
    setLoading(true);
    await fetch(`/api/jobs/${job.id}/accept`, { method: "POST" });
    track(events.JOB_ACCEPTED, { jobId: job.id });
    router.refresh();
    setLoading(false);
  };

  const submitDelivery = async () => {
    if (!deliveryPayload.trim()) return;
    setLoading(true);

    let payload;
    try {
      payload = JSON.parse(deliveryPayload);
    } catch {
      payload = { content: deliveryPayload };
    }

    await fetch(`/api/jobs/${job.id}/deliver`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ summaryNote: deliveryNote, deliveryPayload: payload }),
    });

    track(events.JOB_DELIVERED, { jobId: job.id });
    setDeliveryNote("");
    setDeliveryPayload("");
    router.refresh();
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!messageText.trim()) return;
    setLoading(true);
    await fetch(`/api/jobs/${job.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageText }),
    });
    setMessageText("");
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      {/* Buyer brief */}
      <Card>
        <CardHeader><CardTitle className="text-base">Buyer Brief</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted rounded-md p-3 overflow-auto max-h-60">
            {JSON.stringify(job.submittedBrief, null, 2)}
          </pre>
          {job.expectedOutputFormat && (
            <p className="mt-2 text-sm">
              <span className="font-medium">Preferred output:</span> {job.expectedOutputFormat}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      {job.status === "SUBMITTED" && (
        <Card>
          <CardContent className="pt-5">
            <Button onClick={acceptJob} disabled={loading}>Accept Job</Button>
          </CardContent>
        </Card>
      )}

      {(job.status === "IN_PROGRESS" || job.status === "ACCEPTED") && (
        <Card>
          <CardHeader><CardTitle className="text-base">Submit Delivery</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="deliveryNote">Summary note (shown to buyer)</Label>
              <Textarea
                id="deliveryNote"
                rows={2}
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                placeholder="Brief note about what you're delivering..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deliveryPayload">Delivery content / payload *</Label>
              <Textarea
                id="deliveryPayload"
                rows={8}
                value={deliveryPayload}
                onChange={(e) => setDeliveryPayload(e.target.value)}
                placeholder='{"data": [...]} or paste your output here'
                className="font-mono text-xs"
              />
            </div>
            <Button onClick={submitDelivery} disabled={loading || !deliveryPayload.trim()}>
              {loading ? "Submitting..." : "Submit Delivery"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Messages */}
      <Card>
        <CardHeader><CardTitle className="text-base">Messages</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {job.messages.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {job.messages.map((msg) => (
                <div key={msg.id} className="text-sm border-l-2 pl-3 border-muted">
                  <p className="text-xs text-muted-foreground mb-0.5">
                    {msg.senderType} · {formatDate(msg.createdAt)}
                  </p>
                  <p>{msg.messageText}</p>
                </div>
              ))}
            </div>
          )}
          <div className="space-y-2">
            <Textarea
              rows={2}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Send a message to the buyer..."
            />
            <Button
              variant="outline"
              size="sm"
              onClick={sendMessage}
              disabled={loading || !messageText.trim()}
            >
              Send Message
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
