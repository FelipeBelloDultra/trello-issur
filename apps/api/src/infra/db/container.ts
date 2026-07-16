import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";

import { DatabaseClient } from "./client";

export function setupDatabaseContainer(): void {
  container.register<DatabaseClient>(
    InjectionTokens.Databases.Drizzle,
    { useClass: DatabaseClient },
    { lifecycle: Lifecycle.Singleton },
  );
}
