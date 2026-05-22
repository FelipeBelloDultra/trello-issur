import { eq } from "drizzle-orm";
import { inject, injectable } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { DatabaseClient } from "@/infra/db/client";
import { accounts } from "@/infra/db/schema/accounts";
import { AccountRepository } from "@/modules/account/application/repositories/account-repository";
import { Account } from "@/modules/account/domain/entities/account";

import { AccountMapper } from "../mappers/account.mapper";

@injectable()
export class DrizzleAccountRepository implements AccountRepository {
  public constructor(
    @inject(InjectionTokens.Databases.Drizzle)
    private readonly db: DatabaseClient,
  ) {}

  public async findByEmail(email: string): Promise<Account | null> {
    const [row] = await this.db.query
      .select()
      .from(accounts)
      .where(eq(accounts.email, email))
      .limit(1);

    if (!row) return null;

    return AccountMapper.toDomain(row);
  }

  public async create(account: Account): Promise<void> {
    await this.db.query.insert(accounts).values(AccountMapper.toPersistence(account));
  }
}
