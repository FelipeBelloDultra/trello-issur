import { InferInsertModel, InferSelectModel } from "drizzle-orm";

import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { users } from "@/infra/db/schema/users";
import { User } from "@/modules/user/domain/entities/user";
import { Password } from "@/modules/user/domain/value-objects/password";

type UserRow = InferSelectModel<typeof users>;
type UserInsert = InferInsertModel<typeof users>;

export class UserMapper {
  public static toDomain(raw: UserRow): User {
    return User.create(
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

  public static toPersistence(user: User): UserInsert {
    return {
      id: user.id.toValue(),
      name: user.name,
      email: user.email,
      passwordHash: user.password.toString(),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
