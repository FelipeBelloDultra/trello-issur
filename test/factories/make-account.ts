import { faker } from "@faker-js/faker";

import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { Account } from "@/modules/account/domain/entities/account";

export function makeAccount(
  overrides?: Partial<Parameters<typeof Account.create>[0]>,
  id?: UniqueEntityID,
): Account {
  return Account.create(
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      passwordHash: `hashed:${faker.internet.password()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    },
    id,
  );
}
