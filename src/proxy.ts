import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createPostHogServerClient } from "@/lib/posthog-server";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const client = createPostHogServerClient();
  if (!client) return response;

  const distinctId = request.cookies.get("demo_distinct_id")?.value ?? "anonymous";
  const showMaintenanceBanner = await client.isFeatureEnabled("maintenance-banner", distinctId);
  await client.shutdown();

  if (showMaintenanceBanner) response.headers.set("x-maintenance-banner", "1");
  return response;
}

export const config = {
  matcher: ["/((?!_next|ingest|favicon.ico).*)"],
};
