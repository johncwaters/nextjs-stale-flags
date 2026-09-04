import Link from "next/link";
import { cookies } from "next/headers";
import { createPostHogServerClient } from "@/lib/posthog-server";

export default async function PricingPage() {
  const cookieStore = await cookies();
  const distinctId = cookieStore.get("demo_distinct_id")?.value ?? "anonymous";
  const client = createPostHogServerClient();
  const flags = client ? await client.getAllFlags(distinctId) : {};
  if (client) await client.shutdown();

  const showAnnualDiscount = flags["annual-discount"] === true;

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-3xl font-bold">Pricing</h1>
      <ul className="mt-6 space-y-2">
        <li>Free: $0</li>
        <li>Pro: $20 / month</li>
        {showAnnualDiscount ? <li>Pro annual: $200 / year (save 2 months)</li> : null}
      </ul>
      <Link className="mt-8 block underline" href="/">Back home</Link>
    </main>
  );
}
