import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "tsyringe";

import { CacheRepository } from "@/infra/cache/cache.repository";
import { InjectionTokens } from "@/infra/container/tokens";

import { HttpException } from "../http-exception";
import { Middleware } from "../middleware";

interface RateLimitOptions {
  max: number;
  windowMs: number;
}

@injectable()
export class RateLimitMiddleware implements Middleware<RateLimitOptions> {
  public constructor(
    @inject(InjectionTokens.Cache.Repository)
    private readonly cache: CacheRepository,
  ) {}

  public handle(options: RateLimitOptions) {
    const windowSecs = Math.ceil(options.windowMs / 1000);

    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const ip =
        (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ??
        req.ip ??
        "unknown";
      const key = this.cache.createKey(["rate-limit", ip, req.path]);

      const count = await this.cache.increment(key, windowSecs);

      if (count > options.max) {
        const ttl = await this.cache.ttl(key);
        res.setHeader("retry-after", String(Math.max(ttl, 0)));

        throw new HttpException({
          statusCode: 429,
          message: "Rate limit exceeded. Please try again later.",
        });
      }

      next();
    };
  }
}
