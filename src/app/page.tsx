"use client";

import Link from "next/link";
import { PostHogFeature, useFeatureFlagEnabled, useFeatureFlagVariantKey } from "@posthog/react";

const SIGNUP_COPY_BY_VARIANT: Record<string, string> = {
  control: "Sign up",
  short: "Start",
  long: "Create your free account today",
};

export default function LandingPage() {
  const signupVariant = useFeatureFlagVariantKey("signup-cta-variant");
  const signupCopy = SIGNUP_COPY_BY_VARIANT[String(signupVariant ?? "control")] ?? SIGNUP_COPY_BY_VARIANT.control;
  const showLegacyBanner = useFeatureFlagEnabled("legacy-banner");

  // Holiday promo banner removed after 2024 season; flag "holiday-promo" is still in PostHog if we bring it back.

  return (
    <main className="mx-auto max-w-2xl p-8">
      {showLegacyBanner ? (
        <div className="mb-4 rounded bg-yellow-100 p-3">We moved! Update your bookmarks.</div>
      ) : null}
      <PostHogFeature flag="new-nav" match={true}>
        <nav className="mb-6 flex gap-4 text-sm">
          <Link href="/pricing">Pricing</Link>
          <Link href="/dashboard">Dashboard</Link>
        </nav>
      </PostHogFeature>
      <h1 className="text-4xl font-bold">Burrito tracker</h1>
      <p className="mt-4">Track every burrito. Never lose a burrito again.</p>
      <Link className="mt-8 inline-block rounded bg-black px-4 py-2 text-white" href="/dashboard">
        {signupCopy}
      </Link>
    </main>
  );
}
