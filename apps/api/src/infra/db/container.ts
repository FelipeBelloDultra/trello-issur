import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { UnitOfWork } from "@/shared/database/application/repositories/unit-of-work";

import { DatabaseClient } from "./client";
import { DrizzleExecutor } from "./transaction";
import { DrizzleUnitOfWork } from "./unit-of-work";

export function setupDatabaseContainer(): void {
  container.register<DatabaseClient>(
    InjectionTokens.Databases.Drizzle,
    { useClass: DatabaseClient },
    { lifecycle: Lifecycle.Singleton },
  );

  // The pool-bound default — repositories built against this outside a
  // UnitOfWork run against the normal connection pool. Inside a
  // UnitOfWork's transaction scope, a child container overrides this same
  // token with the active `tx` (see DrizzleUnitOfWork).
  container.register<DrizzleExecutor>(InjectionTokens.Databases.DrizzleExecutor, {
    useFactory: (c) => c.resolve<DatabaseClient>(InjectionTokens.Databases.Drizzle).query,
  });

  container.register<UnitOfWork>(
    InjectionTokens.Databases.UnitOfWork,
    { useClass: DrizzleUnitOfWork },
    { lifecycle: Lifecycle.Singleton },
  );
}
