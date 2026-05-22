import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";

import { UserRepository } from "../../application/repositories/user-repository";

import { DrizzleUserRepository } from "./repositories/drizzle-user-repository";

export function setupDatabaseUserContainer() {
  container.register<UserRepository>(
    InjectionTokens.Repositories.User,
    {
      useClass: DrizzleUserRepository,
    },
    {
      lifecycle: Lifecycle.Singleton,
    },
  );
}
