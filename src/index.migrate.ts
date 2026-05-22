import "dotenv/config";

import path from "node:path";

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

import { env } from "@/config/env";
import { logger } from "@/infra/logger";

async function run(): Promise<void> {
  const client = postgres(env.DATABASE_URL, {
    max: 1,
    connect_timeout: env.DB_CONNECT_TIMEOUT,
    onnotice: () => {},
  });

  const db = drizzle({ client });

  try {
    await client`SET lock_timeout = '3s'`;
    await client`SET statement_timeout = '120s'`;

    logger.info("running migrations");
    await migrate(db, { migrationsFolder: path.join(__dirname, "infra/db/migrations") });
    logger.info("migrations complete");
  } catch (err: unknown) {
    logger.error({ err }, "migration failed");
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

void run();
