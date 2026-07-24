import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { env } from "@/config/env";
import * as schema from "@/infra/db/schema";
import { setupDbPoolMetrics } from "@/infra/metrics/adapters/prometheus";
import { createCircuitBreaker } from "@/infra/resilience/circuit-breaker";

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

    // Guards `pool.query` specifically — it's the one primitive Drizzle's
    // node-postgres driver calls under the hood for every statement, so this
    // covers all query-builder usage without wrapping the whole Pool. Doesn't
    // yet cover `pool.connect()` (dedicated client for transactions), since
    // nothing in the app uses transactions today — revisit when it does.
    const breaker = createCircuitBreaker("postgres");
    const originalQuery = this.pool.query.bind(this.pool) as (
      ...args: unknown[]
    ) => Promise<unknown>;
    this.pool.query = ((...args: unknown[]) =>
      breaker.fire(originalQuery, ...args)) as Pool["query"];

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
