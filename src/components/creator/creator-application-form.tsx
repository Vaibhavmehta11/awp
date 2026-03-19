"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { usePostHog } from "@/hooks/use-posthog";

export function CreatorApplicationForm() {
  const router = useRouter();
  const { track, events } = usePostHog();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    background: "",
    workflowStack: "",
    portfolioLinks: "",
    sampleWorkLinks: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    track(events.CREATOR_APPLICATION_SUBMITTED);

    const res = await fetch("/api/creator-applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        background: form.background,
        workflowStack: form.workflowStack,
        categoryExpertise: ["LEAD_RESEARCH"],
        portfolioLinks: form.portfolioLinks.split("\n").filter(Boolean),
        sampleWorkLinks: form.sampleWorkLinks.split("\n").filter(Boolean),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to submit application");
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <Card>
        <CardContent className="py-10 text-center space-y-2">
          <p className="text-2xl">🎉</p>
          <h3 className="font-semibold text-lg">Application submitted!</h3>
          <p className="text-sm text-muted-foreground">
            We review all applications manually and will email you within 3–5 business days.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="background">Background & expertise *</Label>
            <Textarea
              id="background"
              rows={4}
              placeholder="Describe your background in AI, automation, and the services you'd offer..."
              value={form.background}
              onChange={(e) => setForm((p) => ({ ...p, background: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="workflowStack">Workflow stack *</Label>
            <Input
              id="workflowStack"
              placeholder="e.g. n8n, Clay, Apollo, Make, OpenAI, Apify..."
              value={form.workflowStack}
              onChange={(e) => setForm((p) => ({ ...p, workflowStack: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="portfolioLinks">Portfolio links (one per line)</Label>
            <Textarea
              id="portfolioLinks"
              rows={3}
              placeholder="https://..."
              value={form.portfolioLinks}
              onChange={(e) => setForm((p) => ({ ...p, portfolioLinks: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sampleWorkLinks">Sample work links (one per line)</Label>
            <Textarea
              id="sampleWorkLinks"
              rows={3}
              placeholder="https://..."
              value={form.sampleWorkLinks}
              onChange={(e) => setForm((p) => ({ ...p, sampleWorkLinks: e.target.value }))}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Submit Application"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
