---
name: new-use-case
description: Scaffold a new command (write) or query (read) use case for a module — command/query object, handler, spec, DI token, and bus registration. Use when asked to add a new use case, command, query, or "action" to a module (e.g. "add an archive-board command").
---

# New use case (command or query)

Every write in this codebase is a **command** dispatched through `CommandBus`; every read is a **query** dispatched through `QueryBus`. Controllers and queue consumers never call handlers or repositories directly — they always go through the bus. See `CLAUDE.md` → "CQRS" and "Error strategy" before starting.

## Decide: command or query?

- **Mutates state** (create/update/delete, side effects like publishing an event) → command, returns `Either<UseCaseError, T>`.
- **Pure read** → query, returns the value directly (no `Either` — see `get-account/handler.ts`, which returns `Account | null`). Only wrap a query in `Either` if the read itself has an expected failure mode beyond "not found".

## Steps (command example — queries drop the `Either`/error parts)

1. **Folder**: `apps/api/src/modules/<module>/application/commands/<kebab-use-case-name>/`.

2. **`command.ts`** — plain data holder:

   ```ts
   import { Command } from "@/core/commands/command";

   interface <UseCase>CommandProps {
     // ...
   }

   export class <UseCase>Command implements Command {
     public constructor(public readonly props: <UseCase>CommandProps) {}
   }
   ```

3. **Error(s)**, if this use case has an expected failure mode — `application/errors/<kebab-error>.error.ts`:

   ```ts
   import { UseCaseError } from "@/core/errors/use-case-error";

   export class <SomeError> extends Error implements UseCaseError {
     public readonly code = "<SCREAMING_SNAKE_CODE>";
     public constructor(/* context */) {
       super(`<human readable message>`);
     }
   }
   ```

4. **`handler.ts`**:

   ```ts
   import { inject, injectable } from "tsyringe";

   import { CommandHandler } from "@/core/commands/command-handler";
   import { Either, left, right } from "@/core/either";
   import { InjectionTokens } from "@/infra/container/tokens";

   import { <SomeError> } from "../../errors/<kebab-error>.error";
   import { <Something>Repository } from "../../repositories/<something>.repository";

   import { <UseCase>Command } from "./command";

   type OnError = <SomeError>;
   type OnSuccess = { /* ... */ };
   type Output = Promise<Either<OnError, OnSuccess>>;

   @injectable()
   export class <UseCase>Handler implements CommandHandler<<UseCase>Command, Either<OnError, OnSuccess>> {
     public constructor(
       @inject(InjectionTokens.Repositories.<Something>)
       private readonly repository: <Something>Repository,
     ) {}

     public async execute(command: <UseCase>Command): Output {
       // load/validate, construct or mutate the entity via its static factory,
       // persist, optionally this.publisher.publish(QueueEvents.<Domain>.<Event>, ...)
       return right({ /* ... */ });
     }
   }
   ```

   Rules:
   - Never `throw` an expected business failure from a handler — return `left(new SomeError(...))`. Only let `DomainError` (from entity/VO construction) propagate — that's an unexpected/programmer-error path by design.
   - Depend on repository/gateway **interfaces** from `application/repositories|gateways/`, injected via `InjectionTokens`, never on a concrete `infra/` class.

5. **`handler.spec.ts`** next to the handler — unit test with fakes/mocks for repositories and gateways (see `create-account/handler.spec.ts` for shape). This is a unit spec (`apps/api/src/**/*.spec.ts`), not an e2e spec — no real DB.

6. **DI wiring** in the module's `infra/container.ts`:
   - Add a token under `InjectionTokens.Handlers.<UseCase>` in `apps/api/src/infra/container/tokens.ts`.
   - `container.register<<UseCase>Handler>(InjectionTokens.Handlers.<UseCase>, { useClass: <UseCase>Handler }, { lifecycle: Lifecycle.Singleton })`.
   - Register on the bus: `commandBus.register(<UseCase>Command, container.resolve(...))` (or `queryBus.register(...)` for a query) — see `wireWorkspaceBuses()` in `apps/api/src/modules/workspace/infra/container.ts` for the pattern when a module has many use cases.

7. If this use case is meant to be reachable over HTTP or from a queue consumer, that's a separate step — see the `new-http-endpoint` or `new-queue-consumer` skills.

## Non-goals

- Don't put business logic in a controller or consumer — it belongs in the handler.
- Don't call another module's handler directly from a handler — publish a queue event instead (see `CreateAccountHandler` publishing `QueueEvents.Workspace.PersonalCreationRequested`), keeping modules decoupled.
