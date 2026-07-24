import { DependencyContainer, inject, injectable, container as rootContainer } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import {
  TransactionScope,
  UnitOfWork,
} from "@/shared/database/application/repositories/unit-of-work";

import { DatabaseClient } from "./client";
import { withTransaction } from "./transaction";

class TsyringeTransactionScope implements TransactionScope {
  public constructor(private readonly scope: DependencyContainer) {}

  public get<T>(token: symbol): T {
    return this.scope.resolve<T>(token);
  }
}

// Opens a Drizzle transaction, then creates a child container that
// overrides only the DrizzleExecutor token with the active `tx` — any
// repository resolved from the resulting scope (from any module, as long
// as its Drizzle adapter is built against DrizzleExecutor rather than
// DatabaseClient directly) transparently runs inside this transaction.
// Everything else falls through to the root container's normal
// registrations, unaffected.
@injectable()
export class DrizzleUnitOfWork implements UnitOfWork {
  public constructor(
    @inject(InjectionTokens.Databases.Drizzle)
    private readonly db: DatabaseClient,
  ) {}

  public execute<T>(work: (scope: TransactionScope) => Promise<T>): Promise<T> {
    return withTransaction(this.db, (tx) => {
      const scope = rootContainer.createChildContainer();
      scope.register(InjectionTokens.Databases.DrizzleExecutor, { useValue: tx });

      return work(new TsyringeTransactionScope(scope));
    });
  }
}
