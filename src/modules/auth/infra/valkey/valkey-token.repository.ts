import { inject, injectable } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { ValkeyClient } from "@/infra/valkey/client";

import { TokenRepository } from "../../application/repositories/token.repository";

const keyFor = (accountId: string) => `refresh_token:${accountId}`;

@injectable()
export class ValkeyTokenRepository implements TokenRepository {
  public constructor(
    @inject(InjectionTokens.Databases.Valkey)
    private readonly valkey: ValkeyClient,
  ) {}

  public async save(accountId: string, refreshToken: string, ttlSeconds: number): Promise<void> {
    await this.valkey.client.set(keyFor(accountId), refreshToken, "EX", ttlSeconds);
  }

  public async find(accountId: string): Promise<string | null> {
    return this.valkey.client.get(keyFor(accountId));
  }

  public async delete(accountId: string): Promise<void> {
    await this.valkey.client.del(keyFor(accountId));
  }
}
