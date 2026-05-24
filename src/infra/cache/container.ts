import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "../container/tokens";

import { ValkeyCacheRepository } from "./adapters/valkey/valkey-cache.repository";
import { CacheRepository } from "./cache.repository";

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
