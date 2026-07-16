import { faker } from "@faker-js/faker";

import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { Account } from "@/modules/account/domain/entities/account";
import { AccountName } from "@/modules/account/domain/value-objects/account-name";
import { Email } from "@/modules/account/domain/value-objects/email";

export function makeAccount(
  overrides?: Partial<Parameters<typeof Account.create>[0]>,
  id?: UniqueEntityID,
): Account {
  return Account.create(
    {
      name: AccountName.create(faker.person.fullName()),
      email: Email.create(faker.internet.email()),
      passwordHash: `hashed:${faker.internet.password()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    },
    id,
  );
}
