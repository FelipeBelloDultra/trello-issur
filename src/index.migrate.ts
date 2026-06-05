import "dotenv/config";

import path from "node:path";

import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Client } from "pg";

import { env } from "@/config/env";
import { logger } from "@/infra/logger";

async function run(): Promise<void> {
  const client = new Client({
    connectionString: env.DATABASE_URL,
    connectionTimeoutMillis: env.DB_CONNECT_TIMEOUT * 1000,
  });

  await client.connect();

  const db = drizzle({ client });

  try {
    await client.query("SET lock_timeout = '3s'");
    await client.query("SET statement_timeout = '120s'");

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
