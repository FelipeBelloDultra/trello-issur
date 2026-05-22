import Redis from "ioredis";

import { env } from "@/config/env";

export class ValkeyClient {
  private _client: Redis | null = null;

  public connect(): void {
    this._client = new Redis(env.VALKEY_URL, { lazyConnect: false, maxRetriesPerRequest: null });
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
