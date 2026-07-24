import { inject, injectable } from "tsyringe";

import { safeEqualHex, sha256Hex } from "@/core/utils/hash";
import { InjectionTokens } from "@/infra/container/tokens";
import { ValkeyClient } from "@/infra/valkey/client";

import { SaveTokenOptions, TokenRepository } from "../../application/repositories/token.repository";

const keyFor = (accountId: string) => `refresh_token:${accountId}`;

@injectable()
export class ValkeyTokenRepository implements TokenRepository {
  public constructor(
    @inject(InjectionTokens.Databases.Valkey)
    private readonly valkey: ValkeyClient,
  ) {}

  public async save({ accountId, refreshToken, ttlSeconds }: SaveTokenOptions): Promise<void> {
    await this.valkey.client.set(keyFor(accountId), sha256Hex(refreshToken), "EX", ttlSeconds);
  }

  public async matches(accountId: string, refreshToken: string): Promise<boolean> {
    const stored = await this.valkey.client.get(keyFor(accountId));

    if (!stored) return false;

    return safeEqualHex(stored, sha256Hex(refreshToken));
  }

  public async delete(accountId: string): Promise<void> {
    await this.valkey.client.del(keyFor(accountId));
  }
}
