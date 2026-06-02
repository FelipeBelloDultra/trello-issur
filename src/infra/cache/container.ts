import { container, Lifecycle } from "tsyringe";

import { CacheRepository } from "@/shared/cache/application/repositories/cache.repository";

import { InjectionTokens } from "../container/tokens";

import { ValkeyCacheRepository } from "./adapters/valkey/valkey-cache.repository";

export function setupCacheContainer() {
  container.register<CacheRepository>(
    InjectionTokens.Cache.Repository,
    {
      useClass: ValkeyCacheRepository,
    },
    {
      lifecycle: Lifecycle.Singleton,
    },
  );
}
