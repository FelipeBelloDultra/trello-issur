import { faker } from "@faker-js/faker";

import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { User } from "@/modules/user/domain/entities/user";
import { Password } from "@/modules/user/domain/value-objects/password";

export function makeUser(
  overrides?: Partial<Parameters<typeof User.create>[0]>,
  id?: UniqueEntityID,
): User {
  return User.create(
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: Password.restore(faker.internet.password()),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    },
    id,
  );
}
