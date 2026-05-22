import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "../container/tokens";

import { CacheRepository } from "./cache.repository";
import { ValkeyCacheRepository } from "./valkey/valkey-cache.repository";

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
