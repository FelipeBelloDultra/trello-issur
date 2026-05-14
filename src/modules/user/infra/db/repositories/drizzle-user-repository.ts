import { eq } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { inject, injectable } from "inversify";

import { TOKENS } from "@/infra/container/tokens";
import * as schema from "@/infra/db/schema";
import { users } from "@/infra/db/schema/users";
import { UserRepository } from "@/modules/user/application/repositories/user-repository";
import { User } from "@/modules/user/domain/entities/user";

import { UserMapper } from "../mappers/user.mapper";

type Database = PostgresJsDatabase<typeof schema>;

@injectable()
export class DrizzleUserRepository implements UserRepository {
  public constructor(
    @inject(TOKENS.Database)
    private readonly db: Database,
  ) {}

  public async findByEmail(email: string): Promise<User | null> {
    const [row] = await this.db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!row) return null;

    return UserMapper.toDomain(row);
  }

  public async create(user: User): Promise<void> {
    await this.db.insert(users).values(UserMapper.toPersistence(user));
  }
}
