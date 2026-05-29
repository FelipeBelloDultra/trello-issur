import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { AccountRoleCacheRepository } from "@/modules/auth/application/repositories/account-role-cache.repository";

import { ValkeyAccountRoleCacheRepository } from "./repositories/valkey-account-role-cache.repository";

export function setupCacheAuthContainer(): void {
  container.register<AccountRoleCacheRepository>(
    InjectionTokens.Cache.AccountRole,
    { useClass: ValkeyAccountRoleCacheRepository },
    { lifecycle: Lifecycle.Singleton },
  );
}
