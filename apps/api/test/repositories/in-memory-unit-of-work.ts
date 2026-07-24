import {
  TransactionScope,
  UnitOfWork,
} from "@/shared/database/application/repositories/unit-of-work";

export class InMemoryTransactionScope implements TransactionScope {
  public constructor(private readonly registry: Map<symbol, unknown>) {}

  public get<T>(token: symbol): T {
    if (!this.registry.has(token)) {
      throw new Error(`InMemoryTransactionScope: no registration for token ${String(token)}`);
    }

    return this.registry.get(token) as T;
  }
}

// No real atomicity — resolves whatever was registered and runs the
// callback against it. Good enough for handler specs, which only care
// that the right repositories receive the right calls, not that a DB
// transaction actually rolled back on failure (that's covered live
// against a real Postgres, see the UnitOfWork adapter's own verification).
export class InMemoryUnitOfWork implements UnitOfWork {
  public constructor(private readonly registry: Map<symbol, unknown>) {}

  public execute<T>(work: (scope: TransactionScope) => Promise<T>): Promise<T> {
    return work(new InMemoryTransactionScope(this.registry));
  }
}
