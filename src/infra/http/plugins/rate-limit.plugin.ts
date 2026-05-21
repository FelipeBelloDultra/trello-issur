import { Elysia } from "elysia";

import { HttpErrors } from "@/infra/http/http-errors";
import { valkeyClient } from "@/infra/valkey/client";

interface RateLimitOptions {
  max: number;
  windowMs: number;
}

function extractIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export function createRateLimitPlugin({ max, windowMs }: RateLimitOptions) {
  const windowSecs = Math.ceil(windowMs / 1000);

  return new Elysia({
    name: `rate-limit:${max}:${windowMs}`,
    seed: { max, windowMs },
  }).onBeforeHandle({ as: "scoped" }, async ({ request, set }) => {
    const ip = extractIp(request);
    const path = new URL(request.url).pathname;
    const key = `rate-limit:${ip}:${path}`;
    const redis = valkeyClient.client;

    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, windowSecs);
    }

    if (count > max) {
      const ttl = await redis.ttl(key);
      set.status = 429;
      set.headers["retry-after"] = String(Math.max(ttl, 0));
      return HttpErrors.tooManyRequests();
    }
  });
}
