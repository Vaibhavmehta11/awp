"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePostHog } from "@/hooks/use-posthog";
import { ListingDetailDTO } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface JobRequestFormProps {
  listing: ListingDetailDTO;
}

export function JobRequestForm({ listing }: JobRequestFormProps) {
  const { track, events } = usePostHog();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    briefTitle: "",
    briefDetails: "",
    targetAudience: "",
    outputFormat: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    track(events.JOB_FORM_SUBMITTED, { listingId: listing.id, category: listing.category });

    try {
      // Create Stripe Checkout Session — job is saved as pending until payment confirms
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          briefTitle: formData.briefTitle,
          submittedBrief: {
            details: formData.briefDetails,
            targetAudience: formData.targetAudience,
          },
          expectedOutputFormat: formData.outputFormat || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to initiate checkout");
        setLoading(false);
        return;
      }

      // Redirect to Stripe hosted checkout page
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return; // Stay in loading state while redirecting
      }

      setError("Could not redirect to payment. Please try again.");
      setLoading(false);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order: {listing.title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {formatCurrency(listing.priceAmount, listing.currency)} · {listing.turnaroundHours}h turnaround
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="briefTitle">Job title *</Label>
            <Input
              id="briefTitle"
              placeholder="e.g. B2B SaaS leads in fintech, 100 contacts"
              value={formData.briefTitle}
              onChange={(e) => setFormData((p) => ({ ...p, briefTitle: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="briefDetails">Describe what you need *</Label>
            <Textarea
              id="briefDetails"
              rows={5}
              placeholder="Be specific: target company size, industry, geography, title, any extra context..."
              value={formData.briefDetails}
              onChange={(e) => setFormData((p) => ({ ...p, briefDetails: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="targetAudience">Target audience / ICP</Label>
            <Input
              id="targetAudience"
              placeholder="e.g. VP of Sales at Series B SaaS companies in the US"
              value={formData.targetAudience}
              onChange={(e) => setFormData((p) => ({ ...p, targetAudience: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="outputFormat">Preferred output format</Label>
            <Input
              id="outputFormat"
              placeholder="e.g. Google Sheet, CSV, Notion database..."
              value={formData.outputFormat}
              onChange={(e) => setFormData((p) => ({ ...p, outputFormat: e.target.value }))}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Redirecting to payment..." : `Pay & Submit · ${formatCurrency(listing.priceAmount, listing.currency)}`}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            You will be taken to Stripe&apos;s secure payment page. Your job is confirmed after payment.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
