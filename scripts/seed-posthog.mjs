import { readFile } from "node:fs/promises";
import { PostHog } from "posthog-node";

const manifest = JSON.parse(await readFile(new URL("../flags.manifest.json", import.meta.url), "utf8"));

const personalApiKey = requireEnv("POSTHOG_PERSONAL_API_KEY");
const projectId = requireEnv("POSTHOG_PROJECT_ID");
const projectApiKey = requireEnv("NEXT_PUBLIC_POSTHOG_KEY");
const apiHost = process.env.POSTHOG_API_HOST ?? "https://us.posthog.com";
const ingestHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

const flagCount = manifest.flags.length;
if (!process.argv.includes("--yes")) {
  console.error(
    [
      `This will create or overwrite ${flagCount} feature flags and backfill ${flagCount * 2} $feature_flag_called events`,
      `in PostHog project ${projectId} at ${apiHost}. Use a throwaway project, not a real one.`,
      "",
      "Re-run with --yes to proceed:",
      "  node --env-file=.env.local scripts/seed-posthog.mjs --yes",
    ].join("\n"),
  );
  process.exit(2);
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`${name} is required. Copy .env.example to .env.local and fill it in, then run: node --env-file=.env.local scripts/seed-posthog.mjs`);
    process.exit(1);
  }
  return value;
}

async function posthogApi(method, path, body) {
  const response = await fetch(`${apiHost}/api/projects/${projectId}/${path}`, {
    method,
    headers: { Authorization: `Bearer ${personalApiKey}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${method} ${path} -> ${response.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

async function findFlagByKey(key) {
  const search = encodeURIComponent(key);
  const visible = await posthogApi("GET", `feature_flags/?search=${search}`);
  const match = visible.results.find((flag) => flag.key === key);
  if (match) return match;
  const archived = await posthogApi("GET", `feature_flags/?search=${search}&archived=true`);
  return archived.results.find((flag) => flag.key === key) ?? null;
}

function buildFilters(spec) {
  const filters = { groups: [{ properties: [], rollout_percentage: spec.rollout }] };
  if (spec.variants) {
    const evenShare = Math.floor(100 / spec.variants.length);
    const remainder = 100 - evenShare * spec.variants.length;
    filters.multivariate = {
      variants: spec.variants.map((variantKey, index) => ({
        key: variantKey,
        name: variantKey,
        rollout_percentage: evenShare + (index === 0 ? remainder : 0),
      })),
    };
  }
  if (spec.payload) filters.payloads = { true: JSON.stringify(spec.payload) };
  return filters;
}

async function upsertFlag(flag) {
  const spec = flag.posthog;
  const body = { key: flag.key, name: flag.name, active: spec.active, archived: spec.archived, filters: buildFilters(spec) };
  const existing = await findFlagByKey(flag.key);
  if (existing) {
    await posthogApi("PATCH", `feature_flags/${existing.id}/`, { ...body, deleted: spec.deleted });
    return `updated${spec.deleted ? " and deleted" : ""}`;
  }
  const created = await posthogApi("POST", "feature_flags/", body);
  if (!spec.deleted) return "created";
  await posthogApi("PATCH", `feature_flags/${created.id}/`, { deleted: true });
  return "created then deleted";
}

function daysAgoToDate(daysAgo) {
  return new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
}

function backfillFlagCalledEvents(client, flag) {
  const { firstCalledDaysAgo, lastCalledDaysAgo } = flag.posthog;
  const callsByLabel = { first: firstCalledDaysAgo, last: lastCalledDaysAgo };
  let sentCount = 0;
  for (const [label, daysAgo] of Object.entries(callsByLabel)) {
    if (daysAgo === null || daysAgo === undefined) continue;
    // PostHog keeps one $feature_flag_called per (distinct_id, flag) and drops repeats, so each call gets its own id.
    client.capture({
      distinctId: `seed-${flag.key}-${label}`,
      event: "$feature_flag_called",
      properties: { $feature_flag: flag.key, $feature_flag_response: true },
      timestamp: daysAgoToDate(daysAgo),
    });
    sentCount += 1;
  }
  return sentCount;
}

const eventsClient = new PostHog(projectApiKey, { host: ingestHost, flushAt: 1, flushInterval: 0 });
let backfilledCount = 0;
for (const flag of manifest.flags) {
  const outcome = await upsertFlag(flag);
  backfilledCount += backfillFlagCalledEvents(eventsClient, flag);
  console.log(`${flag.key.padEnd(24)} ${outcome}`);
}
await eventsClient.shutdown();
console.log(`\n${manifest.flags.length} flags seeded, ${backfilledCount} $feature_flag_called events backfilled.`);
