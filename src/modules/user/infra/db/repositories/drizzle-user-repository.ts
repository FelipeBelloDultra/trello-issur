import { eq } from "drizzle-orm";
import { inject, injectable } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { DatabaseClient } from "@/infra/db/client";
import { users } from "@/infra/db/schema/users";
import { UserRepository } from "@/modules/user/application/repositories/user-repository";
import { User } from "@/modules/user/domain/entities/user";

import { UserMapper } from "../mappers/user.mapper";

@injectable()
export class DrizzleUserRepository implements UserRepository {
  public constructor(
    @inject(InjectionTokens.Databases.Drizzle)
    private readonly db: DatabaseClient,
  ) {}

  public async findByEmail(email: string): Promise<User | null> {
    const [row] = await this.db.query.select().from(users).where(eq(users.email, email)).limit(1);

    if (!row) return null;

    return UserMapper.toDomain(row);
  }

  public async create(user: User): Promise<void> {
    await this.db.query.insert(users).values(UserMapper.toPersistence(user));
  }
}
