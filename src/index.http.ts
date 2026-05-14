import "dotenv/config";

import { env } from "@/config/env";
import { databaseClient } from "@/infra/db/client";
import { logger } from "@/infra/logger";

import { createApp } from "./infra/http/app";

async function shutdown(): Promise<void> {
  logger.info("shutting down");
  await databaseClient.disconnect();
  logger.info("database disconnected");
  process.exit(0);
}

function handleSignal() {
  shutdown().catch(() => process.exit(1));
}

function bootstrap(): void {
  databaseClient.connect();
  logger.info("database connected");

  createApp().listen(env.PORT);
  logger.info({ port: env.PORT }, "http server listening");

  process.on("SIGTERM", handleSignal);
  process.on("SIGINT", handleSignal);
}

try {
  bootstrap();
} catch (err: unknown) {
  logger.error({ err }, "failed to start");
  process.exit(1);
}
