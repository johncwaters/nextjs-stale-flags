import posthog from "posthog-js";

export function applyLegacyTheme(): void {
  if (!posthog.isFeatureEnabled("legacy-theme")) return;
  document.documentElement.classList.add("legacy-theme");
}
