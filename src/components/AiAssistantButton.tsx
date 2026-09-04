"use client";

import { useFeatureFlagEnabled } from "@posthog/react";

export function AiAssistantButton() {
  const hasAiAssistant = useFeatureFlagEnabled("ai-assistant");
  if (!hasAiAssistant) return null;
  return <button className="rounded border px-3 py-1">Ask AI</button>;
}
