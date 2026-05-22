import { inject, injectable } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { ValkeyClient } from "@/infra/valkey/client";

import { TokenRepository } from "../../application/repositories/token-repository";

const keyFor = (userId: string) => `refresh_token:${userId}`;

@injectable()
export class ValkeyTokenRepository implements TokenRepository {
  public constructor(
    @inject(InjectionTokens.Databases.Valkey)
    private readonly valkey: ValkeyClient,
  ) {}

  public async save(userId: string, refreshToken: string, ttlSeconds: number): Promise<void> {
    await this.valkey.client.set(keyFor(userId), refreshToken, "EX", ttlSeconds);
  }

  public async find(userId: string): Promise<string | null> {
    return this.valkey.client.get(keyFor(userId));
  }

  public async delete(userId: string): Promise<void> {
    await this.valkey.client.del(keyFor(userId));
  }
}
