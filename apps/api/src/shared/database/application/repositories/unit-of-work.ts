// A transaction-scoped dependency lookup: `get(token)` returns the same
// concrete instance the container would normally inject for that token,
// except every repository resolved through it shares one active DB
// transaction. Ports/adapters resolved outside a UnitOfWork are unaffected.
//
// This is a deliberate, narrow exception to constructor injection (the
// pattern every other port in this codebase follows) — resolving by token
// inside a method body is Service Locator, a recognized DI anti-pattern,
// because the dependency no longer shows up in the class's public
// signature, only inside the method that uses it. It's accepted here only
// because the alternative (a UnitOfWork type per module, or a single
// interface enumerating every repository across every module) doesn't
// scale once two modules need to write inside the same transaction.
export interface TransactionScope {
  get<T>(token: symbol): T;
}

// One UnitOfWork, shared across modules — not per module. Use it to keep
// an aggregate's own write together with its own side effects atomic (e.g.
// an entity plus the outbox row recording its domain event: the outbox row
// isn't a domain aggregate, it's a delivery-reliability mechanism for an
// event the aggregate already raised correctly, so this isn't really
// crossing an aggregate boundary).
//
// Don't reach for this to force atomicity across two *different* domain
// aggregates or modules (e.g. writing both `accounts` and `workspaces` in
// one transaction) just because the mechanism allows it — per DDD, a
// transaction should stay scoped to one aggregate; consistency between
// aggregates should be eventual, coordinated by a domain event (this same
// outbox pattern), not forced atomicity. Needing that is a signal to
// reconsider the module/aggregate boundary, not a reason to expand this
// UnitOfWork's reach.
export interface UnitOfWork {
  execute<T>(work: (scope: TransactionScope) => Promise<T>): Promise<T>;
}
