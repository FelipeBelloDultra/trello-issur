import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "../container/tokens";

import { ValkeyClient } from "./adapters/ioredis/client";

export function setupValkeyContainer() {
  container.register<ValkeyClient>(
    InjectionTokens.Databases.Valkey,
    {
      useClass: ValkeyClient,
    },
    {
      lifecycle: Lifecycle.Singleton,
    },
  );
}
