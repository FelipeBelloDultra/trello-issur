---
name: new-module
description: Scaffold a brand-new vertical module (new bounded context, e.g. "board" or "card") with domain/application/infra layers and wire it into the app. Use when asked to add a new domain/module/bounded context to the system, as opposed to adding a use case to an existing one.
---

# New module

A module is a self-contained vertical slice under `src/modules/<module>/` repeating the domain→application→infra split (see `CLAUDE.md` → "Module layout"). Existing modules to pattern-match against: `account` (simplest — good starting template), `workspace` (fuller — cache, crypto, multiple consumers), `auth`, `notifications`.

This skill is the outer scaffold only — for the pieces inside it, use the dedicated skills: `new-use-case` (commands/queries), `new-http-endpoint` (controllers/routes), `new-repository` (persistence), `new-queue-consumer` (event consumers), `new-gateway-adapter` (external integrations).

## Steps

1. **Create the folder skeleton**:

   ```
   src/modules/<module>/
     domain/{entities,value-objects,errors}/
     application/{commands,queries,dtos,errors,gateways,repositories}/
     infra/{db/{repositories,mappers},http/controllers,queue/consumers,presenters}/
   ```
   Only create the `infra/` subfolders the module actually needs yet (e.g. skip `queue/` if it has no consumers at first) — don't scaffold empty folders speculatively.

2. **Domain first**: define the aggregate root entity (`domain/entities/<entity>.ts`, static `create()`/private constructor, extends `Entity`/`AggregateRoot`) and its value objects (`domain/value-objects/`, `create()`/`restore()` pattern, exported validation constants). See `CLAUDE.md` → "Static factory pattern" and `src/modules/account/domain/` as the reference.

3. **At least one use case** to prove the module works end-to-end — run the `new-use-case` skill for a first command (e.g. `create-<entity>`).

4. **Persistence** — run the `new-repository` skill: schema table in `src/infra/db/schema/`, port + Drizzle adapter + mapper. Generate the migration per the `safe-migration` skill.

5. **Module container** — `src/modules/<module>/infra/container.ts`, the single entry point that wires this module together:

   ```ts
   import { container, Lifecycle } from "tsyringe";
   import { CommandBus } from "@/core/commands/command-bus";
   import { InjectionTokens } from "@/infra/container/tokens";
   import { <UseCase>Command } from "@/modules/<module>/application/commands/<use-case>/command";
   import { <UseCase>Handler } from "@/modules/<module>/application/commands/<use-case>/handler";

   import { setupDatabase<Module>Container } from "./db/container";
   import { setupHTTP<Module>Container } from "./http/container";
   // setupCache<Module>Container, setupQueue<Module>Container, etc. as needed

   export function setup<Module>Module(): void {
     setupDatabase<Module>Container();

     container.register<<UseCase>Handler>(
       InjectionTokens.Handlers.<UseCase>,
       { useClass: <UseCase>Handler },
       { lifecycle: Lifecycle.Singleton },
     );
     const commandBus = container.resolve<CommandBus>(InjectionTokens.Bus.Command);
     commandBus.register(<UseCase>Command, container.resolve(InjectionTokens.Handlers.<UseCase>));

     setupHTTP<Module>Container();
     // register queue consumers into ConsumerRegistry here, if any (see new-queue-consumer skill)
   }
   ```

   For a module with several use cases, split handler registration and bus wiring into two functions (`register<Module>Handlers()` / `wire<Module>Buses()`) the way `src/modules/workspace/infra/container.ts` does — easier to scan once it grows past 3-4 use cases.

6. **Wire the module into the app** — `src/infra/container/index.ts`:

   ```ts
   import { setup<Module>Module } from "@/modules/<module>/infra/container";
   // ...
   setup<Module>Module();
   ```
   Order matters only relative to shared infra (`setupDatabaseContainer()`, `setupBusContainer()`, etc. must run first) — module-to-module order among `setupAccountModule()`, `setupAuthModule()`, etc. doesn't matter since modules only communicate via the bus/queue, never by direct import of each other's handlers.

7. **HTTP routes**, if the module exposes endpoints — `src/infra/http/routes.ts` (`Routes` class) imports the module's `<module>Controllers` array from `infra/http/routes.ts` and spreads it into `controllerTokens`. Add that import + spread when the module has its first controller.

8. **Verify**: `pnpm run typecheck`, `pnpm run test`, `pnpm run test:e2e`, then `pnpm run dev:http` (and `pnpm run dev:queue` if the module has consumers) to confirm the app boots with the new module registered — a missed DI registration typically surfaces as a `tsyringe` resolution error at boot, not a type error.

## Non-goals

- Don't have one module import another module's `domain/`, `application/`, or `infra/` internals directly — cross-module communication goes through the queue (`QueuePublisherGateway.publish()` + a consumer in the other module) or, for synchronous reads within the same request, through a port the other module explicitly exposes in `src/shared/`.
- Don't skip straight to controllers/HTTP before the domain entity and at least one use case exist — domain invariants are the foundation everything else assumes.
