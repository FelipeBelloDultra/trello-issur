import { CacheRepository } from "@/infra/cache/cache.repository";

export class InMemoryCacheRepository implements CacheRepository {
  public items: Map<string, string> = new Map();

  public async set(key: string, value: string, _ttlSeconds?: number): Promise<void> {
    this.items.set(key, value);
    await Promise.resolve();
  }

  public async get(key: string): Promise<string | null> {
    return Promise.resolve(this.items.get(key) ?? null);
  }

  public async delete(key: string): Promise<void> {
    this.items.delete(key);
    await Promise.resolve();
  }

  public async deleteByPrefix(keyPattern: string): Promise<void> {
    const prefix = keyPattern.replace(".*", "");
    for (const key of this.items.keys()) {
      if (key.startsWith(prefix)) this.items.delete(key);
    }
    await Promise.resolve();
  }

  public createKey(keys: string[]): string {
    return keys.join(".");
  }

  public async increment(key: string, _ttlSeconds: number): Promise<number> {
    const current = Number(this.items.get(key) ?? 0) + 1;
    this.items.set(key, String(current));
    return Promise.resolve(current);
  }

  public async ttl(_key: string): Promise<number> {
    return Promise.resolve(-1);
  }
}
