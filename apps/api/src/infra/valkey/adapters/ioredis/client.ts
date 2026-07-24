import Redis from "ioredis";

import { env } from "@/config/env";
import { createCircuitBreaker, wrapWithCircuitBreaker } from "@/infra/resilience/circuit-breaker";

// Only the commands this codebase actually issues directly are guarded.
// Chainable/sync helpers (pipeline(), on(), duplicate(), status, ...) pass
// through untouched — see wrapWithCircuitBreaker.
const GUARDED_COMMANDS = ["get", "set", "del", "incr", "expire", "ttl", "keys"] as const;

export class ValkeyClient {
  private _client: Redis | null = null;

  public connect(): void {
    const redis = new Redis(env.VALKEY_URL, { lazyConnect: false, maxRetriesPerRequest: null });
    const breaker = createCircuitBreaker("valkey");

    this._client = wrapWithCircuitBreaker(redis, breaker, GUARDED_COMMANDS);
  }

  public async disconnect(): Promise<void> {
    await this._client?.quit();
    this._client = null;
  }

  public get client(): Redis {
    if (!this._client) throw new Error("ValkeyClient is not connected. Call connect() first.");
    return this._client;
  }
}
