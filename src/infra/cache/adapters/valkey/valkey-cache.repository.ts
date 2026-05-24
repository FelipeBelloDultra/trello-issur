import { inject, injectable } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { ValkeyClient } from "@/infra/valkey/adapters/ioredis/client";

import { CacheRepository } from "../../cache.repository";

@injectable()
export class ValkeyCacheRepository implements CacheRepository {
  public constructor(
    @inject(InjectionTokens.Databases.Valkey)
    private readonly valkey: ValkeyClient,
  ) {}

  public async set(key: string, value: string, ttlSeconds = 60 * 15): Promise<void> {
    await this.valkey.client.set(key, value, "EX", ttlSeconds);
  }

  public async get(key: string): Promise<string | null> {
    return this.valkey.client.get(key);
  }

  public async delete(key: string): Promise<void> {
    await this.valkey.client.del(key);
  }

  public async deleteByPrefix(keyPattern: string): Promise<void> {
    const pattern = this.createKey([keyPattern, "*"]);
    const keys = await this.valkey.client.keys(pattern);
    const pipeline = this.valkey.client.pipeline();

    keys.forEach((key) => {
      pipeline.del(key);
    });

    await pipeline.exec();
  }

  public createKey(keys: Array<string>): string {
    return keys.join(".");
  }

  public async increment(key: string, ttlSeconds: number): Promise<number> {
    const count = await this.valkey.client.incr(key);

    if (count === 1) {
      await this.valkey.client.expire(key, ttlSeconds);
    }

    return count;
  }

  public async ttl(key: string): Promise<number> {
    return this.valkey.client.ttl(key);
  }
}
