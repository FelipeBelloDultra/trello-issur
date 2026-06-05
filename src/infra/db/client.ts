import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { env } from "@/config/env";
import * as schema from "@/infra/db/schema";
import { setupDbPoolMetrics } from "@/infra/metrics/adapters/prometheus";

export class DatabaseClient {
  private pool: Pool | null = null;
  private _db: NodePgDatabase<typeof schema> | null = null;

  public connect(): void {
    this.pool = new Pool({
      connectionString: env.DATABASE_URL,
      max: env.DB_POOL_MAX,
      idleTimeoutMillis: env.DB_IDLE_TIMEOUT * 1000,
      connectionTimeoutMillis: env.DB_CONNECT_TIMEOUT * 1000,
    });
    this._db = drizzle({ client: this.pool, schema });
    setupDbPoolMetrics(this.pool);
  }

  public async disconnect(): Promise<void> {
    await this.pool?.end();
    this.pool = null;
    this._db = null;
  }

  public get query(): NodePgDatabase<typeof schema> {
    if (!this._db) throw new Error("DatabaseClient is not connected. Call connect() first.");
    return this._db;
  }
}
