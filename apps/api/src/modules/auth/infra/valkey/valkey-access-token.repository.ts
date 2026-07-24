import { inject, injectable } from "tsyringe";

import { safeEqualHex, sha256Hex } from "@/core/utils/hash";
import { InjectionTokens } from "@/infra/container/tokens";
import { ValkeyClient } from "@/infra/valkey/client";

import {
  AccessTokenRepository,
  SaveAccessTokenOptions,
} from "../../application/repositories/access-token.repository";

const keyFor = (accountId: string) => `access_token:${accountId}`;

@injectable()
export class ValkeyAccessTokenRepository implements AccessTokenRepository {
  public constructor(
    @inject(InjectionTokens.Databases.Valkey)
    private readonly valkey: ValkeyClient,
  ) {}

  public async save({ accountId, accessToken, ttlSeconds }: SaveAccessTokenOptions): Promise<void> {
    await this.valkey.client.set(keyFor(accountId), sha256Hex(accessToken), "EX", ttlSeconds);
  }

  public async matches(accountId: string, accessToken: string): Promise<boolean> {
    const stored = await this.valkey.client.get(keyFor(accountId));

    if (!stored) return false;

    return safeEqualHex(stored, sha256Hex(accessToken));
  }

  public async delete(accountId: string): Promise<void> {
    await this.valkey.client.del(keyFor(accountId));
  }
}
