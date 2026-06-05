import { inject, injectable } from "tsyringe";

import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { InjectionTokens } from "@/infra/container/tokens";
import { AccountCacheRepository } from "@/modules/account/application/repositories/account-cache.repository";
import { Account } from "@/modules/account/domain/entities/account";
import { AccountName } from "@/modules/account/domain/value-objects/account-name";
import { Email } from "@/modules/account/domain/value-objects/email";
import { CacheRepository } from "@/shared/cache/application/repositories/cache.repository";

interface AccountPayload {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

const TTL = 60 * 60;

@injectable()
export class ValkeyAccountCacheRepository implements AccountCacheRepository {
  public constructor(
    @inject(InjectionTokens.Cache.Repository)
    private readonly cache: CacheRepository,
  ) {}

  public async findById(id: string): Promise<Account | null> {
    const raw = await this.cache.get(this.idKey(id));
    if (!raw) return null;
    return this.deserialize(raw);
  }

  public async findByEmail(email: string): Promise<Account | null> {
    const raw = await this.cache.get(this.emailKey(email));
    if (!raw) return null;
    return this.deserialize(raw);
  }

  public async store(account: Account): Promise<void> {
    const serialized = this.serialize(account);
    await Promise.all([
      this.cache.set(this.idKey(account.id.toValue()), serialized, TTL),
      this.cache.set(this.emailKey(account.email), serialized, TTL),
    ]);
  }

  public async invalidate(id: string, email: string): Promise<void> {
    await Promise.all([this.cache.delete(this.idKey(id)), this.cache.delete(this.emailKey(email))]);
  }

  private idKey(id: string): string {
    return this.cache.createKey(["account", "id", id]);
  }

  private emailKey(email: string): string {
    return this.cache.createKey(["account", "email", email]);
  }

  private serialize(account: Account): string {
    return JSON.stringify({
      id: account.id.toValue(),
      name: account.name,
      email: account.email,
      passwordHash: account.passwordHash,
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString(),
    } satisfies AccountPayload);
  }

  private deserialize(raw: string): Account {
    const payload = JSON.parse(raw) as AccountPayload;
    return Account.create(
      {
        name: AccountName.fromRaw(payload.name),
        email: Email.fromRaw(payload.email),
        passwordHash: payload.passwordHash,
        createdAt: new Date(payload.createdAt),
        updatedAt: new Date(payload.updatedAt),
      },
      UniqueEntityID.create(payload.id),
    );
  }
}
