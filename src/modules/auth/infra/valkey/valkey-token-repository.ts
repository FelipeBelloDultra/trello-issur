import { inject, injectable } from "inversify";
import Redis from "ioredis";

import { TOKENS } from "@/infra/container/tokens";

import { TokenRepository } from "../../application/repositories/token-repository";

const keyFor = (userId: string) => `refresh_token:${userId}`;

@injectable()
export class ValkeyTokenRepository implements TokenRepository {
  public constructor(
    @inject(TOKENS.ValkeyClient)
    private readonly redis: Redis,
  ) {}

  public async save(userId: string, refreshToken: string, ttlSeconds: number): Promise<void> {
    await this.redis.set(keyFor(userId), refreshToken, "EX", ttlSeconds);
  }

  public async find(userId: string): Promise<string | null> {
    return this.redis.get(keyFor(userId));
  }

  public async delete(userId: string): Promise<void> {
    await this.redis.del(keyFor(userId));
  }
}
