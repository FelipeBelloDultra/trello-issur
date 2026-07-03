---
name: new-http-endpoint
description: Add a new HTTP endpoint — Zod DTO, controller dispatching through the command/query bus, presenter, and route registration. Use when asked to expose a use case over HTTP, add a REST endpoint, or add a new API route.
---

# New HTTP endpoint

An endpoint in this repo is a thin `Controller` that validates input with Zod, dispatches a command/query via the bus, and maps the `Either` result to an HTTP response. It never contains business logic. If the underlying command/query doesn't exist yet, run the `new-use-case` skill first.

## Steps

1. **DTO** (only for endpoints with a body/params to validate) — `application/dtos/<use-case>.dto.ts`:

   ```ts
   import { z } from "zod";
   import { <SOME_CONSTANT> } from "@/modules/<module>/domain/value-objects/<vo>";

   export const <UseCase>Dto = z.object({
     // reuse validation constants exported by the domain VO — don't redefine limits here
   });

   export type <UseCase>Input = z.infer<typeof <UseCase>Dto>;
   ```

   Field names are `snake_case` at the HTTP boundary (matches existing DTOs, e.g. `create_workspace`), converted to `camelCase` when building the command.

2. **Presenter**, if this endpoint returns an entity — `infra/presenters/<entity>.presenter.ts`:

   ```ts
   export class <Entity>Presenter {
     public static toHTTP(entity: <Entity>) {
       return { id: entity.id.toValue(), /* snake_case fields */ };
     }
   }
   ```

   Reuse the module's existing presenter if one already maps this entity — don't create a second one.

3. **HTTP message(s)**, if a new error needs a user-facing string — add to the relevant section of `src/infra/http/http-messages.ts` (`HttpMessages.<Module>.<Case>`). Don't inline error strings in the controller.

4. **Controller** — `infra/http/controllers/<use-case>.controller.ts`:

   ```ts
   import { Request, RequestHandler, Response } from "express";
   import { inject, injectable } from "tsyringe";

   import { CommandBus } from "@/core/commands/command-bus"; // or QueryBus
   import { Either } from "@/core/either";
   import { InjectionTokens } from "@/infra/container/tokens";
   import { Controller, HttpMethod } from "@/infra/http/contracts/controller";
   import { HttpException } from "@/infra/http/http-exception";
   import { HttpMessages } from "@/infra/http/http-messages";
   import { <UseCase>Command } from "@/modules/<module>/application/commands/<use-case>/command";
   import { <UseCase>Dto } from "@/modules/<module>/application/dtos/<use-case>.dto";
   import { <SomeError> } from "@/modules/<module>/application/errors/<kebab-error>.error";

   import { <Entity>Presenter } from "../../presenters/<entity>.presenter";

   @injectable()
   export class <UseCase>Controller implements Controller {
     public readonly path = "/<resource>";
     public readonly method: HttpMethod = "post"; // get | post | put | patch | delete
     public readonly middlewares: RequestHandler[] = []; // e.g. [authMiddleware] if auth-gated

     public constructor(
       @inject(InjectionTokens.Bus.Command)
       private readonly commandBus: CommandBus,
     ) {}

     public async handler(req: Request, res: Response): Promise<Response> {
       const dto = <UseCase>Dto.parse(req.body);
       const result = await this.commandBus.dispatch<Either<<SomeError>, { /* ... */ }>>(
         new <UseCase>Command({ /* map dto snake_case -> camelCase props */ }),
       );

       if (result.isRight()) {
         return res.status(201).json({ data: <Entity>Presenter.toHTTP(result.value.entity) });
       }

       switch (result.value.constructor) {
         case <SomeError>:
           throw new HttpException({ statusCode: 409, message: HttpMessages.<Module>.<Case> });
         default:
           throw new Error();
       }
     }
   }
   ```

   Rules:
   - Every `Either` left the handler can return must have a `case` in the `switch` mapping it to an `HttpException` with the right status code. Leaving a case to fall through to `default: throw new Error()` turns an expected business failure into a 500 — don't do that for a known error.
   - Auth/authorization goes in `middlewares`, not inline in `handler()` — check `src/infra/http/middlewares/` and other controllers in the module for the existing auth middleware to reuse.
   - Zod throws on `.parse()` failure; the global `ErrorHandlerMiddleware` already turns that into a 400 — don't wrap it in try/catch yourself.

5. **Route registration** — add the controller's DI token to the module's `infra/http/routes.ts` (e.g. `export const <module>Controllers = [..., InjectionTokens.Controllers.<UseCase>]`) and register the controller class in the module's `infra/http/container.ts` (`container.register<<UseCase>Controller>(InjectionTokens.Controllers.<UseCase>, { useClass: <UseCase>Controller }, { lifecycle: Lifecycle.Singleton })`). Add the new token under `InjectionTokens.Controllers` in `src/infra/container/tokens.ts`. Nothing else needs to change — `src/infra/http/routes.ts` (`Routes`) auto-mounts every token listed in each module's `<module>Controllers` array.

6. **e2e spec** next to the controller: `<use-case>.controller.e2e.spec.ts` (pattern: `create-account.controller.e2e.spec.ts`) — hits the real HTTP app + real Postgres/Valkey via `test/e2e-setup.ts`, no mocking.

7. **Verify**: `pnpm run typecheck`, `pnpm run test:e2e -- <use-case>.controller.e2e`, then `pnpm run dev:http` and hit the endpoint manually if the change is non-trivial.

## Non-goals

- Don't query a repository or call a handler directly from the controller — always go through `commandBus`/`queryBus`.
- Don't put snake_case↔camelCase mapping logic anywhere but the controller (dto→command) and the presenter (entity→response).
