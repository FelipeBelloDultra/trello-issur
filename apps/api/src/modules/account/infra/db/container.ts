import { container } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";

import { AccountRepository } from "../../application/repositories/account.repository";

import { DrizzleAccountRepository } from "./repositories/drizzle-account.repository";

export function setupDatabaseAccountContainer(): void {
  // Deliberately NOT Singleton — see the equivalent comment in
  // infra/queue/container.ts's OutboxRepository registration for why:
  // this repository is built against DrizzleExecutor, which a UnitOfWork
  // overrides per-transaction in a child container, and a cached singleton
  // instance would leak across the parent/child boundary either way.
  container.register<AccountRepository>(InjectionTokens.Repositories.Account, {
    useClass: DrizzleAccountRepository,
  });
}
