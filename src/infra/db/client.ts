import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/config/env";
import * as schema from "@/infra/db/schema";

export class DatabaseClient {
  private client: postgres.Sql | null = null;
  private _db: PostgresJsDatabase<typeof schema> | null = null;

  public connect(): void {
    this.client = postgres(env.DATABASE_URL, { max: env.DB_POOL_MAX });
    this._db = drizzle({ client: this.client, schema });
  }

  public async disconnect(): Promise<void> {
    await this.client?.end();
    this.client = null;
    this._db = null;
  }

  public get db(): PostgresJsDatabase<typeof schema> {
    if (!this._db) throw new Error("DatabaseClient is not connected. Call connect() first.");
    return this._db;
  }
}

export const databaseClient = new DatabaseClient();
