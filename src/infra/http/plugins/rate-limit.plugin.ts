import { Elysia } from "elysia";

import { HttpErrors } from "@/infra/http/http-errors";

interface RateLimitOptions {
  max: number;
  windowMs: number;
}

interface Window {
  count: number;
  resetAt: number;
}

function extractIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export function createRateLimitPlugin({ max, windowMs }: RateLimitOptions) {
  const store = new Map<string, Window>();

  return new Elysia({
    name: `rate-limit:${max}:${windowMs}`,
    seed: { max, windowMs },
  }).onBeforeHandle({ as: "scoped" }, ({ request, set }) => {
    const ip = extractIp(request);
    const path = new URL(request.url).pathname;
    const key = `${ip}:${path}`;
    const now = Date.now();

    const current = store.get(key);

    if (!current || now >= current.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return;
    }

    if (current.count >= max) {
      set.status = 429;
      set.headers["retry-after"] = String(Math.ceil((current.resetAt - now) / 1000));
      return HttpErrors.tooManyRequests();
    }

    current.count++;
  });
}
