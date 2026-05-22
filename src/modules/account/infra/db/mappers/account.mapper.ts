import { InferInsertModel, InferSelectModel } from "drizzle-orm";

import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { accounts } from "@/infra/db/schema/accounts";
import { Account } from "@/modules/account/domain/entities/account";
import { Password } from "@/modules/account/domain/value-objects/password";

type AccountRow = InferSelectModel<typeof accounts>;
type AccountInsert = InferInsertModel<typeof accounts>;

export class AccountMapper {
  public static toDomain(raw: AccountRow): Account {
    return Account.create(
      {
        name: raw.name,
        email: raw.email,
        password: Password.restore(raw.passwordHash),
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
      passwordHash: account.password.toString(),
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }
}
