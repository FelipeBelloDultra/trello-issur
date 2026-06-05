import { InferInsertModel, InferSelectModel } from "drizzle-orm";

import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { accounts } from "@/infra/db/schema/accounts";
import { Account } from "@/modules/account/domain/entities/account";
import { AccountName } from "@/modules/account/domain/value-objects/account-name";
import { Email } from "@/modules/account/domain/value-objects/email";

type AccountRow = InferSelectModel<typeof accounts>;
type AccountInsert = InferInsertModel<typeof accounts>;

export class AccountMapper {
  public static toDomain(raw: AccountRow): Account {
    return Account.create(
      {
        name: AccountName.fromRaw(raw.name),
        email: Email.fromRaw(raw.email),
        passwordHash: raw.passwordHash,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      UniqueEntityID.create(raw.id),
    );
  }

  public static toPersistence(account: Account): AccountInsert {
    return {
      id: account.id.toValue(),
      name: account.name,
      email: account.email,
      passwordHash: account.passwordHash,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }
}
