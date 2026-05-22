import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";

import { AccountRepository } from "../../application/repositories/account-repository";

import { DrizzleAccountRepository } from "./repositories/drizzle-account-repository";

export function setupDatabaseAccountContainer() {
  container.register<AccountRepository>(
    InjectionTokens.Repositories.Account,
    { useClass: DrizzleAccountRepository },
    { lifecycle: Lifecycle.Singleton },
  );
}
