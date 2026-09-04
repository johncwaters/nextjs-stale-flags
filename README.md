# nextjs-stale-flags

Next.js 16 App Router app with 19 PostHog feature flags planted on purpose: 8 stale, 1 warning, 10 healthy. Target repo for developing and testing a stale-flag wizard program. `flags.manifest.json` is the source of truth for every flag's PostHog state, code location, and expected audit verdict.

## Setup

> **Warning:** the seed script creates or overwrites 19 feature flags and backfills 38 `$feature_flag_called` events in the PostHog project you configure. Point it at a throwaway project. It refuses to run without `--yes`.

```bash
npm install
cp .env.example .env.local   # fill in project key, personal API key, project id (a throwaway project)
node --env-file=.env.local scripts/seed-posthog.mjs --yes
npm run dev
```

The seed script creates or updates every flag in your PostHog project to match the manifest and backfills two `$feature_flag_called` events per flag, one at `firstCalledDaysAgo` and one at `lastCalledDaysAgo`, so both flag age and evaluation recency are testable. Each event uses its own distinct id (`seed-<flag>-first`, `seed-<flag>-last`) because PostHog keeps only the first `$feature_flag_called` per distinct id and flag and silently drops repeats. Rerunnable, and reruns do not pile up events for the same reason.

## Check a program's output

Write the program's per-flag verdicts to a JSON array of `{ "key", "verdict" }` where verdict is `stale`, `warning`, or `healthy`, then:

```bash
node scripts/verify-report.mjs findings.json
```

Exit code 0 means every flag matched the manifest.

## Limits

Flag `created_at`, `updated_at`, and the activity log are server-set and cannot be planted. Age in this fixture means the earliest backfilled `$feature_flag_called` event. Git history of a flag reference is also a real age signal on production repos, but every reference here was committed today.
