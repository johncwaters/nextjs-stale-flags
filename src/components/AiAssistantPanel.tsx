"use client";

import { useFeatureFlagEnabled } from "@posthog/react";

export function AiAssistantPanel() {
  const hasAiAssistant = useFeatureFlagEnabled("ai-assistant");
  if (!hasAiAssistant) return null;
  return <aside className="rounded border p-4">AI assistant panel</aside>;
}
