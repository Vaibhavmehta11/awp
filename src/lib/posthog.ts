import "server-only";
import { PostHog } from "posthog-node";
import type { AwpEventName } from "./posthog-events";

export { AWP_EVENTS } from "./posthog-events";
export type { AwpEventName } from "./posthog-events";

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
