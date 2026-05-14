import "dotenv/config";

import { AnyElysia } from "elysia";

import { env } from "@/config/env";
import { databaseClient } from "@/infra/db/client";
import { logger } from "@/infra/logger";

import { createApp } from "./infra/http/app";

const DRAIN_TIMEOUT_MS = 30_000;

async function shutdown(app: AnyElysia): Promise<void> {
  logger.info("shutdown initiated");

  let timedOut = false;
  const timeout = new Promise<void>((resolve) =>
    setTimeout(() => {
      timedOut = true;
      resolve();
    }, DRAIN_TIMEOUT_MS),
  );

  await Promise.race([app.stop(), timeout]);

  if (timedOut) {
    logger.warn({ timeoutMs: DRAIN_TIMEOUT_MS }, "drain timeout exceeded, forcing close");
    await app.stop(true);
  }

  await databaseClient.disconnect();
  logger.info("shutdown complete");
  process.exit(0);
}

function bootstrap(): void {
  databaseClient.connect();
  logger.info("database connected");

  const app = createApp();
  app.listen(env.PORT);
  logger.info({ port: env.PORT }, "http server listening");

  const handleSignal = () => {
    shutdown(app).catch(() => process.exit(1));
  };

  process.on("SIGTERM", handleSignal);
  process.on("SIGINT", handleSignal);
}

try {
  bootstrap();
} catch (err: unknown) {
  logger.error({ err }, "failed to start");
  process.exit(1);
}
