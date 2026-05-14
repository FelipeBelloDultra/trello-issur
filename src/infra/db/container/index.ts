import { ContainerModule } from "inversify";

import { TOKENS } from "@/infra/container/tokens";
import { DrizzleUserRepository } from "@/modules/user/infra/db/repositories/drizzle-user-repository";

import { databaseClient } from "../client";

export const setupDatabaseContainer = new ContainerModule(({ bind }) => {
  bind(TOKENS.Database).toDynamicValue(() => databaseClient.db);
  bind(TOKENS.UserRepository).to(DrizzleUserRepository).inSingletonScope();
});
