"use client";

import { useState } from "react";
import posthog from "posthog-js";
import { useFeatureFlagEnabled, useFeatureFlagPayload } from "@posthog/react";
import { AiAssistantButton } from "@/components/AiAssistantButton";
import { AiAssistantPanel } from "@/components/AiAssistantPanel";
import { AiAssistantHint } from "@/components/AiAssistantHint";
import { SupportChat } from "@/components/SupportChat";
import { useOnboardingChecklist } from "@/lib/flags";

const DEMO_USER_ID = "demo-user-1";

type AiSummaryPayload = { maxSentences?: number };

export default function DashboardPage() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  const useNewCheckout = useFeatureFlagEnabled("new-checkout");
  const hasBetaDashboard = useFeatureFlagEnabled("beta-dashboard");
  const hasAiAssistant = useFeatureFlagEnabled("ai-assistant");
  const aiSummaryPayload = useFeatureFlagPayload("ai-summaries") as AiSummaryPayload | undefined;
  const showOnboardingChecklist = useOnboardingChecklist();

  function signIn() {
    document.cookie = `demo_distinct_id=${DEMO_USER_ID}; path=/`;
    posthog.identify(DEMO_USER_ID, { plan: "pro" });
    setIsSignedIn(true);
  }

  function exportCsv() {
    if (!posthog.isFeatureEnabled("export-csv")) {
      setExportStatus("CSV export is not enabled for your account.");
      return;
    }
    posthog.capture("csv_exported");
    setExportStatus("Exported burritos.csv");
  }

  if (!isSignedIn) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button className="mt-6 rounded bg-black px-4 py-2 text-white" onClick={signIn}>
          Sign in as demo user
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-3xl font-bold">{hasBetaDashboard ? "Dashboard (beta)" : "Dashboard"}</h1>
      {showOnboardingChecklist ? <p className="mt-2 text-sm">3 of 5 onboarding steps done.</p> : null}
      {aiSummaryPayload ? (
        <p className="mt-4 rounded border p-3">
          Summary (max {aiSummaryPayload.maxSentences ?? 3} sentences): you ate 12 burritos this week.
        </p>
      ) : null}
      <div className="mt-6 flex gap-3">
        <button className="rounded border px-3 py-1" onClick={exportCsv}>Export CSV</button>
        {useNewCheckout ? (
          <button className="rounded bg-green-600 px-3 py-1 text-white">Upgrade (new checkout)</button>
        ) : (
          <button className="rounded bg-zinc-600 px-3 py-1 text-white">Upgrade</button>
        )}
        {hasAiAssistant ? <AiAssistantButton /> : null}
      </div>
      {exportStatus ? <p className="mt-2 text-sm">{exportStatus}</p> : null}
      <div className="mt-8">
        <AiAssistantHint />
        <AiAssistantPanel />
      </div>
      <SupportChat />
    </main>
  );
}
