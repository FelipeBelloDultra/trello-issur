import "dotenv/config";
import "./container";

import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

import Redis from "ioredis";
import { Client } from "pg";

import { env } from "@/config/env";

const SCHEMA_NAME = `test_${randomUUID().replace(/-/g, "")}`;
const MIGRATIONS_DIR = path.resolve(__dirname, "../src/infra/db/migrations");

let pgClient: Client;

const valkeyTestUrl = new URL(env.VALKEY_URL);
valkeyTestUrl.pathname = "/1";
const valkeyClient = new Redis(valkeyTestUrl.toString());

async function runMigrations(client: Client): Promise<void> {
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
      await client.query(statement);
    }
  }
}

beforeAll(async () => {
  pgClient = new Client({ connectionString: env.DATABASE_URL });
  await pgClient.connect();

  await pgClient.query(`CREATE SCHEMA IF NOT EXISTS "${SCHEMA_NAME}"`);
  await pgClient.query(`SET search_path TO "${SCHEMA_NAME}"`);
  await runMigrations(pgClient);

  await valkeyClient.flushdb();
});

afterAll(async () => {
  await pgClient.query(`DROP SCHEMA IF EXISTS "${SCHEMA_NAME}" CASCADE`);
  await pgClient.end();
  await valkeyClient.quit();
});
