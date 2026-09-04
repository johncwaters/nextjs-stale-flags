import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createPostHogServerClient } from "@/lib/posthog-server";

const DEMO_RESULTS = ["Burrito", "Taco", "Quesadilla", "Nachos"];

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  const distinctId = request.cookies.get("demo_distinct_id")?.value ?? "anonymous";
  const client = createPostHogServerClient();
  if (!client) return NextResponse.json({ results: DEMO_RESULTS, engine: "v1" });

  const isRateLimited = await client.isFeatureEnabled("server-rate-limit", distinctId);
  if (isRateLimited && query.length > 100) {
    await client.shutdown();
    return NextResponse.json({ error: "query too long" }, { status: 429 });
  }

  const pricingTestVariant = await client.getFeatureFlag("old-pricing-test", distinctId);
  const useSearchV2 = await client.isFeatureEnabled("search-v2", distinctId);
  await client.shutdown();

  const results = useSearchV2
    ? DEMO_RESULTS.filter((item) => item.toLowerCase().includes(query.toLowerCase()))
    : DEMO_RESULTS.filter((item) => item.toLowerCase().startsWith(query.toLowerCase()));

  return NextResponse.json({
    results,
    engine: useSearchV2 ? "v2" : "v1",
    pricingBadge: pricingTestVariant === "discounted" ? "20% off" : null,
  });
}
