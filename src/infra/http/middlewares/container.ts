import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";

import { LoggerMiddleware } from "./logger.middleware";
import { MetricsMiddleware } from "./metrics.middleware";
import { RateLimitMiddleware } from "./rate-limit.middleware";
import { TracingMiddleware } from "./tracing.middleware";

export function setupMiddlewaresContainer(): void {
  container.register(
    InjectionTokens.Middlewares.RateLimit,
    { useClass: RateLimitMiddleware },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register(
    InjectionTokens.Middlewares.Logger,
    { useClass: LoggerMiddleware },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register(
    InjectionTokens.Middlewares.Tracing,
    { useClass: TracingMiddleware },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register(
    InjectionTokens.Middlewares.Metrics,
    { useClass: MetricsMiddleware },
    { lifecycle: Lifecycle.Singleton },
  );
}
