"use client";

import posthog from "posthog-js";

export function AiAssistantHint() {
  if (!posthog.isFeatureEnabled("ai-assistant")) return null;
  return <p className="text-sm text-zinc-500">Tip: press / to open the AI assistant.</p>;
}
