import "dotenv/config";

import { env } from "@/config/env";
import { databaseClient } from "@/infra/db/client";

import { createApp } from "./infra/http/app";

async function shutdown(): Promise<void> {
  await databaseClient.disconnect();
  process.exit(0);
}

function handleSignal() {
  shutdown().catch(() => process.exit(1));
}

function bootstrap(): void {
  databaseClient.connect();
  createApp().listen(env.PORT);

  process.on("SIGTERM", handleSignal);
  process.on("SIGINT", handleSignal);
}

try {
  bootstrap();
} catch (err: unknown) {
  process.stderr.write(`${String(err)}\n`);
  process.exit(1);
}
