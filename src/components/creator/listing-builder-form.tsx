"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { CreatorListingEditDTO } from "@/types";
import { usePostHog } from "@/hooks/use-posthog";

interface ListingBuilderFormProps {
  listing?: CreatorListingEditDTO & { id: string };
  mode: "create" | "edit";
}

const categories = [
  { value: "LEAD_RESEARCH", label: "Lead Research & List Building" },
  { value: "MARKET_INTELLIGENCE", label: "Competitor / Market Intelligence" },
  { value: "OUTREACH_PERSONALIZATION", label: "Outreach Personalization" },
];

export function ListingBuilderForm({ listing, mode }: ListingBuilderFormProps) {
  const router = useRouter();
  const { track, events } = usePostHog();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<CreatorListingEditDTO>({
    title: listing?.title ?? "",
    category: listing?.category ?? "LEAD_RESEARCH",
    shortSummary: listing?.shortSummary ?? "",
    description: listing?.description ?? "",
    deliverableDefinition: listing?.deliverableDefinition ?? "",
    turnaroundHours: listing?.turnaroundHours ?? 24,
    revisionCountIncluded: listing?.revisionCountIncluded ?? 1,
    priceAmount: listing?.priceAmount ?? "",
    sampleOutputUrls: listing?.sampleOutputUrls ?? [],
    exclusions: listing?.exclusions ?? "",
  });

  const [sampleUrls, setSampleUrls] = useState(
    (listing?.sampleOutputUrls ?? []).join("\n")
  );

  const handleSubmit = async (e: React.FormEvent, submitForReview = false) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...form,
      sampleOutputUrls: sampleUrls.split("\n").filter(Boolean),
    };

    const url = mode === "create"
      ? "/api/creator/listings"
      : `/api/creator/listings/${listing!.id}`;

    const method = mode === "create" ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to save listing");
      setLoading(false);
      return;
    }

    if (mode === "create") {
      track(events.LISTING_CREATED, { listingId: data.data.id });
    }

    if (submitForReview) {
      await fetch(`/api/creator/listings/${data.data.id}/submit-review`, { method: "POST" });
      track(events.LISTING_SUBMITTED_FOR_REVIEW, { listingId: data.data.id });
    }

    router.push("/creator/listings");
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. 100 Verified B2B Leads for your ICP"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((p) => ({ ...p, category: v as typeof form.category }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="priceAmount">Price (USD) *</Label>
              <Input
                id="priceAmount"
                type="number"
                min="1"
                step="0.01"
                value={form.priceAmount}
                onChange={(e) => setForm((p) => ({ ...p, priceAmount: e.target.value }))}
                placeholder="99.00"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="turnaroundHours">Turnaround (hours) *</Label>
              <Input
                id="turnaroundHours"
                type="number"
                min="1"
                value={form.turnaroundHours}
                onChange={(e) => setForm((p) => ({ ...p, turnaroundHours: parseInt(e.target.value) }))}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="revisions">Revisions included</Label>
              <Input
                id="revisions"
                type="number"
                min="0"
                max="10"
                value={form.revisionCountIncluded}
                onChange={(e) => setForm((p) => ({ ...p, revisionCountIncluded: parseInt(e.target.value) }))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="shortSummary">Short summary * (shown on card)</Label>
            <Input
              id="shortSummary"
              maxLength={160}
              value={form.shortSummary}
              onChange={(e) => setForm((p) => ({ ...p, shortSummary: e.target.value }))}
              placeholder="One sentence describing what the buyer gets..."
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Full description *</Label>
            <Textarea
              id="description"
              rows={6}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Explain how your service works, what makes it different..."
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="deliverable">Deliverable definition *</Label>
            <Textarea
              id="deliverable"
              rows={4}
              value={form.deliverableDefinition}
              onChange={(e) => setForm((p) => ({ ...p, deliverableDefinition: e.target.value }))}
              placeholder="Be precise: exactly what file / data format / content the buyer receives..."
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="exclusions">What&apos;s NOT included</Label>
            <Textarea
              id="exclusions"
              rows={3}
              value={form.exclusions ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, exclusions: e.target.value }))}
              placeholder="List anything out of scope to set clear expectations..."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sampleUrls">Sample output URLs (one per line)</Label>
            <Textarea
              id="sampleUrls"
              rows={3}
              value={sampleUrls}
              onChange={(e) => setSampleUrls(e.target.value)}
              placeholder="https://..."
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={(e) => handleSubmit(e, false)}
              disabled={loading}
            >
              Save as Draft
            </Button>
            <Button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={loading}
            >
              {loading ? "Saving..." : "Submit for Review"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
