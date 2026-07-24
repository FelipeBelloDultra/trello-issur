import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { logger } from "@/infra/logger";
import { CacheRepository } from "@/shared/cache/application/repositories/cache.repository";

import { Middleware } from "../contracts/middleware";

interface IdempotencyOptions {
  ttlSeconds: number;
}

interface CachedResponse {
  statusCode: number;
  headers: Record<string, string | string[]>;
  body: unknown;
}

// Headers Express recomputes on send — replaying a stale value would conflict
// with what the actual response ends up carrying.
const SKIPPED_HEADERS = new Set(["content-length", "etag", "date", "connection"]);

// Opt-in via `x-idempotency-key` (same header name and cache-key shape as the
// queue consumers' idempotency check) — a client-supplied key that survives
// across retries of the SAME logical attempt. Requests without the header
// pass through untouched. On first use of a key, the full response (status +
// headers + body) is snapshotted and cached; a retry with the same key
// replays that exact snapshot instead of re-running the handler, which
// matters specifically for non-idempotent operations like token rotation —
// re-running would reject the retry with a stale-token error even though the
// original attempt already succeeded.
@injectable()
export class IdempotencyMiddleware implements Middleware<IdempotencyOptions> {
  public constructor(
    @inject(InjectionTokens.Cache.Repository)
    private readonly cache: CacheRepository,
  ) {}

  public handle(options: IdempotencyOptions) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const idempotencyKey = req.headers["x-idempotency-key"];

      if (typeof idempotencyKey !== "string" || idempotencyKey.length === 0) {
        next();
        return;
      }

      const cacheKey = this.cache.createKey(["idempotency", "http", req.path, idempotencyKey]);

      const cached = await this.readCached(cacheKey);

      if (cached) {
        for (const [name, value] of Object.entries(cached.headers)) {
          res.setHeader(name, value);
        }
        res.status(cached.statusCode).send(cached.body);
        return;
      }

      const originalSend = res.send.bind(res);

      res.send = ((body?: unknown) => {
        this.storeCached(cacheKey, res, body, options.ttlSeconds);
        return originalSend(body);
      }) as typeof res.send;

      next();
    };
  }

  private async readCached(cacheKey: string): Promise<CachedResponse | null> {
    try {
      const raw = await this.cache.get(cacheKey);
      return raw ? (JSON.parse(raw) as CachedResponse) : null;
    } catch (err: unknown) {
      logger.warn({ err }, "idempotency check failed — proceeding without dedup");
      return null;
    }
  }

  private storeCached(cacheKey: string, res: Response, body: unknown, ttlSeconds: number): void {
    const headers: Record<string, string | string[]> = {};

    for (const [name, value] of Object.entries(res.getHeaders())) {
      if (SKIPPED_HEADERS.has(name) || value === undefined) continue;
      headers[name] = value as string | string[];
    }

    const snapshot: CachedResponse = { statusCode: res.statusCode, headers, body };

    this.cache.set(cacheKey, JSON.stringify(snapshot), ttlSeconds).catch((err: unknown) => {
      logger.warn({ err }, "idempotency: failed to cache response");
    });
  }
}
