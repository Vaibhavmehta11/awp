import { PostHog } from "posthog-node";

// ─── Event name constants ────────────────────────────────────────────────────
export const AWP_EVENTS = {
  // Marketplace browsing
  HOMEPAGE_VIEWED: "awp_homepage_viewed",
  CATEGORY_VIEWED: "awp_category_viewed",
  LISTING_VIEWED: "awp_listing_viewed",
  LISTING_SAVED: "awp_listing_saved",

  // Job lifecycle – buyer side
  JOB_FORM_STARTED: "awp_job_form_started",
  JOB_FORM_SUBMITTED: "awp_job_form_submitted",
  JOB_CREATED: "awp_job_created",

  // Job lifecycle – creator side
  JOB_ACCEPTED: "awp_job_accepted",
  JOB_STARTED: "awp_job_started",
  JOB_DELIVERED: "awp_job_delivered",

  // Job lifecycle – buyer actions
  REVISION_REQUESTED_UI: "awp_revision_requested_ui",
  DELIVERY_ACCEPTED_UI: "awp_delivery_accepted_ui",
  REVIEW_SUBMITTED_UI: "awp_review_submitted_ui",

  // Creator onboarding
  CREATOR_APPLY_VIEWED: "awp_creator_apply_viewed",
  CREATOR_APPLICATION_SUBMITTED: "awp_creator_application_submitted",

  // Admin – creator management
  CREATOR_APPROVED: "awp_creator_approved",
  CREATOR_REJECTED: "awp_creator_rejected",
  CREATOR_SUSPENDED: "awp_creator_suspended",

  // Listing management
  LISTING_CREATED: "awp_listing_created",
  LISTING_SUBMITTED_FOR_REVIEW: "awp_listing_submitted_for_review",
  LISTING_APPROVED: "awp_listing_approved",
  LISTING_REJECTED: "awp_listing_rejected",
  LISTING_SUSPENDED: "awp_listing_suspended",

  // Badges
  BADGE_ASSIGNED: "awp_badge_assigned",
  BADGE_REMOVED: "awp_badge_removed",

  // Disputes
  DISPUTE_RESOLVED: "awp_dispute_resolved",
} as const;

export type AwpEventName = (typeof AWP_EVENTS)[keyof typeof AWP_EVENTS];

// ─── Server-side PostHog client ───────────────────────────────────────────────
let serverPostHogClient: PostHog | null = null;

export function getServerPostHog(): PostHog | null {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return null;
  if (!serverPostHogClient) {
    serverPostHogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com",
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return serverPostHogClient;
}

export async function trackServerEvent(
  distinctId: string,
  event: AwpEventName,
  properties?: Record<string, unknown>
): Promise<void> {
  const client = getServerPostHog();
  if (!client) return;
  client.capture({ distinctId, event, properties: properties ?? {} });
  await client.flush();
}
