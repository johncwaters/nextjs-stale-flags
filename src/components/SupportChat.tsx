"use client";

import { useFeatureFlagEnabled } from "@posthog/react";

export function SupportChat() {
  const hasSupportChat = useFeatureFlagEnabled("support-chat");
  if (!hasSupportChat) return null;
  return <button className="fixed bottom-4 right-4 rounded-full border px-4 py-2">Chat</button>;
}
