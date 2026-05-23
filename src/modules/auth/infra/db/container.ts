import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { AccountRoleRepository } from "@/modules/auth/application/repositories/account-role-repository";

import { DrizzleAccountRoleRepository } from "./repositories/drizzle-account-role-repository";

export function setupDatabaseAuthContainer(): void {
  container.register<AccountRoleRepository>(
    InjectionTokens.Repositories.AccountRole,
    { useClass: DrizzleAccountRoleRepository },
    { lifecycle: Lifecycle.Singleton },
  );
}
