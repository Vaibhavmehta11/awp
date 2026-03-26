"use client";

import posthog from "posthog-js";
import { useCallback } from "react";
import { AWP_EVENTS, AwpEventName } from "@/lib/posthog-events";

export function usePostHog() {
  const track = useCallback(
    (event: AwpEventName, properties?: Record<string, unknown>) => {
      posthog.capture(event, properties);
    },
    []
  );

  return { track, events: AWP_EVENTS };
}
