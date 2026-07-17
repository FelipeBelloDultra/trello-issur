import { inject, injectable } from "tsyringe";

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
    await this.valkey.client.set(keyFor(accountId), accessToken, "EX", ttlSeconds);
  }

  public async find(accountId: string): Promise<string | null> {
    return this.valkey.client.get(keyFor(accountId));
  }

  public async delete(accountId: string): Promise<void> {
    await this.valkey.client.del(keyFor(accountId));
  }
}
