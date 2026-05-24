import "dotenv/config";
import "./container";

import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

import Redis from "ioredis";
import postgres from "postgres";

import { env } from "@/config/env";

const SCHEMA_NAME = `test_${randomUUID().replace(/-/g, "")}`;
const MIGRATIONS_DIR = path.resolve(__dirname, "../src/infra/db/migrations");

let pgClient: postgres.Sql;

const valkeyTestUrl = new URL(env.VALKEY_URL);
valkeyTestUrl.pathname = "/1";
const valkeyClient = new Redis(valkeyTestUrl.toString());

async function runMigrations(client: postgres.Sql): Promise<void> {
  type MigrationJournal = { entries: Array<{ tag: string }> };
  const journal = JSON.parse(
    readFileSync(path.join(MIGRATIONS_DIR, "meta/_journal.json"), "utf-8"),
  ) as MigrationJournal;

  for (const entry of journal.entries) {
    const rawSql = readFileSync(path.join(MIGRATIONS_DIR, `${entry.tag}.sql`), "utf-8");
    const statements = rawSql
      .replace(/"public"\./g, `"${SCHEMA_NAME}".`)
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter(Boolean);

    for (const statement of statements) {
      await client.unsafe(statement);
    }
  }
}

beforeAll(async () => {
  pgClient = postgres(env.DATABASE_URL, {
    max: 1,
    connect_timeout: env.DB_CONNECT_TIMEOUT,
    onnotice: () => {},
    connection: { search_path: SCHEMA_NAME },
  });

  await pgClient.unsafe(`CREATE SCHEMA IF NOT EXISTS "${SCHEMA_NAME}"`);
  await runMigrations(pgClient);

  await valkeyClient.flushdb();
});

afterAll(async () => {
  await pgClient.unsafe(`DROP SCHEMA IF EXISTS "${SCHEMA_NAME}" CASCADE`);
  await pgClient.end();
  await valkeyClient.quit();
});
