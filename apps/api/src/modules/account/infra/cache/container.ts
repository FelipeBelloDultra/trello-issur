import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { AccountCacheRepository } from "@/modules/account/application/repositories/account-cache.repository";

import { ValkeyAccountCacheRepository } from "./repositories/valkey-account-cache.repository";

export function setupCacheAccountContainer(): void {
  container.register<AccountCacheRepository>(
    InjectionTokens.Cache.Account,
    { useClass: ValkeyAccountCacheRepository },
    { lifecycle: Lifecycle.Singleton },
  );
}
