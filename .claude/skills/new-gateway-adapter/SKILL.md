---
name: new-gateway-adapter
description: Add a new adapter implementation for an existing port (gateway) — e.g. a new storage/email/crypto driver — or add a brand-new port when application code needs a new external capability. Use when asked to add a new provider/driver for storage, email, hashing, tokens, etc., or to make an existing integration swappable.
---

# New gateway adapter (ports & adapters)

A gateway is a port interface owned by `application/` (module-local, e.g. `PasswordHasherGateway`) or `src/shared/<concern>/application/gateways/` (cross-module, e.g. `StorageGateway`), implemented by one or more concrete adapters in `infra/`. Application and domain code depend only on the interface.

## A. Adding a new adapter for an existing port

Use this when the port already exists and you're adding another driver (e.g. a second email provider, a GCS storage driver alongside S3/local).

1. Read the port interface first — e.g. `src/shared/storage/application/gateways/storage.gateway.ts` — and implement every method. Look at the sibling adapters (`src/infra/storage/adapters/{local,s3}/`) for the expected shape and error handling.
2. Put the new adapter at `src/infra/<concern>/adapters/<vendor>/<vendor>-<concern>.gateway.ts`, `@injectable()`, implementing the port (and any lifecycle interface the port family uses, e.g. `StorageLifecycle.initialize()` for storage drivers that need bootstrapping like bucket creation).
3. Read config from `src/config/env.ts` (`env.<X>`) — validate required env vars in the constructor and throw a clear `Error` if misconfigured (see `S3StorageGateway`'s constructor check), rather than failing obscurely later.
4. **Driver selection** happens in the concern's `container.ts` via an env flag, not via multiple DI registrations — e.g. storage:

   ```ts
   container.register<StorageGateway>(InjectionTokens.Storage.Gateway, {
     useClass: env.STORAGE_DRIVER === "s3" ? S3StorageGateway : LocalStorageGateway,
   });
   ```

   Add your new driver as another branch/value here, and extend the env schema's driver enum in `src/config/env.ts`.
5. Nothing above the `infra/` layer changes — application/domain code already depends only on the port, so switching drivers is a config change, not a code change in callers.

## B. Adding a brand-new port (new external capability)

Use this when no existing interface covers the capability.

1. **Decide scope**: module-local (only one module needs it) → `src/modules/<module>/application/gateways/<name>.gateway.ts`. Cross-module → `src/shared/<concern>/application/gateways/<name>.gateway.ts` (create the `<concern>/application/gateways/` folder if new).
2. **Interface**: name methods by capability, not by vendor (`hash`/`verify`, not `argon2Hash`) — the port must stay implementation-agnostic:

   ```ts
   export interface <Name>Gateway {
     doThing(input: X): Promise<Y>;
   }
   ```
3. **Adapter**: `src/infra/<concern>/adapters/<vendor>/` (or `src/modules/<module>/infra/<vendor>/` for a module-local one, e.g. `src/modules/account/infra/argon2/`), `@injectable()`, implements the interface.
4. **DI token**: add under the right group in `InjectionTokens` (`Gateways`, or a new top-level group if it doesn't fit an existing one).
5. **Register**: create or extend a `container.ts` for the concern and call it from the owning module's `setup<Module>Module()` (module-local) or from `src/infra/container/index.ts` (shared/cross-module) — follow the existing `setup*Container()` call order there.

## Non-goals

- Don't let domain code import a gateway interface directly for hashing/crypto-type concerns that are pure computation with no I/O — those can be plain functions in `core/utils/` if they need zero abstraction. Gateways are for things that need to be swappable or that touch the outside world (network, filesystem, a specific crypto library's API).
- Don't name adapter methods after vendor SDK calls — keep the port's vocabulary business-level (`upload`, `hash`) so a future adapter swap doesn't leak vendor concepts into `application/`.
