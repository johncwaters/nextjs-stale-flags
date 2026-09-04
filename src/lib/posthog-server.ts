import { PostHog } from "posthog-node";

export function createPostHogServerClient(): PostHog | null {
  const projectKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!projectKey) return null;
  return new PostHog(projectKey, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    flushAt: 1,
    flushInterval: 0,
  });
}
