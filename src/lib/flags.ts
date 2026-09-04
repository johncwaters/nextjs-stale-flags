"use client";

import { useFeatureFlagEnabled } from "@posthog/react";

export function useDarkMode(): boolean {
  return useFeatureFlagEnabled("dark-mode") ?? false;
}

export function useOnboardingChecklist(): boolean {
  return useFeatureFlagEnabled("onboarding-checklist") ?? false;
}
