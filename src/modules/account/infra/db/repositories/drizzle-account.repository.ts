import { eq } from "drizzle-orm";
import { inject, injectable } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { DatabaseClient } from "@/infra/db/client";
import { accounts } from "@/infra/db/schema/accounts";
import { AccountCacheRepository } from "@/modules/account/application/repositories/account-cache.repository";
import { AccountRepository } from "@/modules/account/application/repositories/account.repository";
import { Account } from "@/modules/account/domain/entities/account";

import { AccountMapper } from "../mappers/account.mapper";

@injectable()
export class DrizzleAccountRepository implements AccountRepository {
  public constructor(
    @inject(InjectionTokens.Databases.Drizzle)
    private readonly db: DatabaseClient,
    @inject(InjectionTokens.Cache.Account)
    private readonly accountCache: AccountCacheRepository,
  ) {}

  public async findById(id: string): Promise<Account | null> {
    const cached = await this.accountCache.findById(id);
    if (cached) return cached;

    const [row] = await this.db.query.select().from(accounts).where(eq(accounts.id, id)).limit(1);
    if (!row) return null;

    const account = AccountMapper.toDomain(row);
    await this.accountCache.store(account);

    return account;
  }

  public async findByEmail(email: string): Promise<Account | null> {
    const cached = await this.accountCache.findByEmail(email);
    if (cached) return cached;

    const [row] = await this.db.query
      .select()
      .from(accounts)
      .where(eq(accounts.email, email))
      .limit(1);
    if (!row) return null;

    const account = AccountMapper.toDomain(row);
    await this.accountCache.store(account);

    return account;
  }

  public async create(account: Account): Promise<void> {
    await this.db.query.insert(accounts).values(AccountMapper.toPersistence(account));
  }
}
