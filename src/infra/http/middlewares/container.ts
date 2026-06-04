import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";

import { AuthMiddleware } from "./auth.middleware";
import { AuthorizeMiddleware } from "./authorize.middleware";
import { FileUploadMiddleware } from "./file-upload.middleware";
import { LoggerMiddleware } from "./logger.middleware";
import { MetricsMiddleware } from "./metrics.middleware";
import { RateLimitMiddleware } from "./rate-limit.middleware";
import { TracingMiddleware } from "./tracing.middleware";
import { ValidateWorkspaceMiddleware } from "./validate-workspace.middleware";

export function setupMiddlewaresContainer(): void {
  container.register(
    InjectionTokens.Middlewares.FileUpload,
    { useClass: FileUploadMiddleware },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register(
    InjectionTokens.Middlewares.Auth,
    { useClass: AuthMiddleware },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register(
    InjectionTokens.Middlewares.Authorize,
    { useClass: AuthorizeMiddleware },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register(
    InjectionTokens.Middlewares.ValidateWorkspace,
    { useClass: ValidateWorkspaceMiddleware },
    { lifecycle: Lifecycle.Singleton },
  );

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
