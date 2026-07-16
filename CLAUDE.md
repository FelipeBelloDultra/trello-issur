# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Role

You are acting as a senior/staff-level software engineer with deep, hands-on experience designing and operating high-throughput, zero-downtime distributed systems in production — including **Domain-Driven Design, Clean Architecture, Ports & Adapters, CQRS, and event-driven/queue-based architectures**, the exact set of patterns this codebase is built on. This bar applies to `apps/api`. `apps/web` is a separate, lower-rigor study project with its own conventions (Feature-Sliced Design — see `apps/web/README.md`); don't carry DDD/CQRS ceremony into frontend work. Hold `apps/api` to that bar, concretely:

- Treat every change as shipping to a live multi-tenant system with in-flight traffic. Favor expand/contract over single-step breaking migrations (see Database below), additive/backward-compatible API and event-payload changes over breaking ones, and reversible deploys over one-way doors.
- Preserve the domain/application/infra boundaries and the three-tier error strategy (`DomainError` → `Either<UseCaseError, T>` → `HttpException`) even under time pressure — that separation is what keeps invariants enforceable and failures typed instead of ad hoc.
- Assume queues, caches, and external services fail. New consumers, gateways, and repositories must be idempotent where relevant and must degrade deliberately (fail open vs. fail closed as a conscious choice, not an accident) — follow the patterns already established (see Queue / event-driven design).
- Match the rigor already present in this repo: typed errors over exceptions-as-control-flow, ports/adapters over vendor calls leaking into domain/application code, commands/queries dispatched through the bus rather than handlers called directly, structured logs over `console.log`, static factories over public constructors, and e2e tests that exercise real Postgres/Valkey rather than mocks.
- When a request conflicts with these constraints — an irreversible migration, a shortcut that leaks an infra type into domain, business logic bypassing the command/query bus, an unbounded retry, a missing idempotency check on a new consumer — say so briefly and propose the safe alternative before implementing.

## What this is

`trello-issur` — a multi-tenant team project management API (Kanban boards, workspaces, RBAC, subscription plans). Node.js + TypeScript, strict **Domain-Driven Design**, **Clean Architecture**, **Ports & Adapters**, **CQRS**. Built with production zero-downtime operation in mind (expand/contract migrations, idempotent consumers, staged retry queues, structured observability) — treat it accordingly, not as a prototype.

## Repo layout

This is a **pnpm-workspaces monorepo** (no Turborepo/Nx, kept plain on purpose):

```
apps/
  api/        this backend — everything the rest of this file describes lives under apps/api/src/
  web/        a companion React SPA study project (Vite + TanStack Router/Query + shadcn/ui,
              Feature-Sliced Design) built against this API — not held to the same production
              rigor as apps/api, see apps/web's own README for its scope
packages/
  eslint-config/       @trello-issur/eslint-config/{base,node,react} — subpath exports;
                       apps compose `base` + whichever runtime block (`node` for apps/api,
                       `react` for apps/web) their eslint.config.ts needs
  prettier-config/     @trello-issur/prettier-config — shared Prettier options both apps extend
  typescript-config/   @trello-issur/typescript-config/{base,node,react}.json — same subpath
                       pattern; apps/api's tsconfig.json extends `node.json`, apps/web's
                       tsconfig.app.json extends `react.json`
infrastructure/        backing services + observability compose file (postgres, valkey,
                       rabbitmq, mailpit, jaeger, minio, prometheus, grafana, exporters) —
                       pulled into the root compose.yml via `include:`, not auto-discovered
                       on its own. Don't confuse with `apps/api/src/infra/` (the DDD layer).
```

Everywhere below, a bare `src/...` path means `apps/api/src/...`. `compose.yml` (root, bootstraps `apps/api`'s http/queue + nginx) and `nginx.conf` stay at the true repo root; `apps/api/Dockerfile` lives with the app it builds (co-located, matching the monorepo convention — the build `context:` in `compose.yml` still points at the repo root, since a pnpm workspace install needs every workspace manifest visible). `.env`/`.env.example` live in `apps/api/` (dotenv loads from `process.cwd()`, and pnpm always runs a package's scripts with `cwd` set to that package) — always pass `--env-file apps/api/.env` to `docker compose` invocations, since Compose only auto-discovers a `.env` next to the compose file itself (true root), not the app-specific one.

## Commands

```sh
# Local infra (Postgres, Valkey, RabbitMQ, Mailpit, Jaeger, Prometheus/Grafana)
docker compose --env-file apps/api/.env up -d

pnpm install                              # once, from the repo root — installs the whole workspace

pnpm --filter api run db:migrate          # apply migrations
pnpm --filter api run db:generate         # generate a new migration from schema changes (drizzle-kit)
pnpm --filter api run db:seed             # seed data
pnpm --filter api run db:studio           # drizzle-kit studio GUI

pnpm --filter api run dev:http            # HTTP process (tsx --watch)
pnpm --filter api run dev:queue           # queue consumer process — separate process, run alongside dev:http

pnpm --filter api run typecheck           # tsc --noEmit
pnpm --filter api run lint:check
pnpm --filter api run lint:fix

pnpm --filter api run test                # unit/integration specs: src/**/*.spec.ts (excludes *.e2e.spec.ts)
pnpm --filter api run test:watch
pnpm --filter api run test:e2e            # e2e specs: src/**/*.e2e.spec.ts — spins up a throwaway PG schema per run
pnpm --filter api run test:e2e:watch

pnpm --filter web run dev                 # apps/web dev server (Vite) — separate frontend study project
```

There are **no root-level convenience scripts** — each `apps/*`/`packages/*` project owns only its own scripts, invoked via `pnpm --filter <name> run <script>`, so two packages can define the same script name (`typecheck`, `lint:check`, `build`, …) without one silently shadowing the other. Run a single test file with vitest directly from `apps/api`, e.g. `cd apps/api && pnpm exec vitest run -c vitest.config.ts src/modules/account/application/commands/create-account/handler.spec.ts`.

Unit specs (`*.spec.ts`) live next to the code they test, inside module folders. E2E specs (`*.e2e.spec.ts`) live next to HTTP controllers and hit a real Postgres schema (`test/e2e-setup.ts` creates an isolated `test_<uuid>` schema per run, replays migrations into it, and flushes Valkey db 1) plus real Valkey — no mocking of the DB/cache in e2e. `test/factories/` holds entity factories (`makeAccount`, `makeWorkspace`) for building fixtures. Unit specs stub ports with hand-written in-memory doubles under `test/{repositories,gateways,cache,queue}/` (e.g. `InMemoryAccountRepository`, `InMemoryPasswordHasherGateway`) — check there before writing a new one; a typical handler spec composes a couple of these plus a `test/factories/` builder (see `create-account/handler.spec.ts` for the shape).

## Architecture

Strict inward dependency rule across four layers:

```
Domain ← Application ← Infra ← Entry points
```

`src/shared/` holds cross-cutting **port interfaces only** (gateways/repositories as TypeScript interfaces, no implementations) — it's the one layer every other layer may freely import. `src/infra/` contains adapter implementations and is never imported by `domain/` or `application/`. `src/core/` holds framework-agnostic building blocks shared across all modules: `Entity`, `AggregateRoot`, `ValueObject`, `UniqueEntityID` (UUID v7), `Either`, `DomainError`/`UseCaseError`, the command/query bus interfaces, and domain events.

### Module layout

Business logic is organized as vertical modules under `src/modules/{account,auth,workspace,notifications}/`, each internally repeating the same domain→application→infra split:

```
modules/<module>/
  domain/
    entities/            aggregate roots, static create()/fromRaw() factories, private constructors
    value-objects/        self-validating VOs, export their own validation constants (Zod DTOs import these — single source of truth)
    errors/                typed DomainError subclasses
  application/
    commands/<use-case>/   command.ts + handler.ts (+ handler.spec.ts) — one folder per write use case
    queries/<use-case>/    query.ts + handler.ts (+ handler.spec.ts) — one folder per read use case
    dtos/                  Zod schemas for transport validation
    errors/                typed UseCaseError subclasses (expected business failures)
    gateways/               port interfaces for this module (e.g. PasswordHasherGateway)
    repositories/           port interfaces for this module's persistence
  infra/
    db/{repositories,mappers}/   Drizzle repository implementations + entity<->row mappers
    cache/repositories/           Valkey-backed cache repository implementations
    http/{controllers,routes.ts,container.ts}
    queue/consumers/               RabbitMQ consumers for this module's events
    presenters/                    entity -> HTTP JSON shape
    container.ts                   setup<Module>Module() — wires this module's DI registrations
```

Every DI wiring lives in a `container.ts` (per-module, per-concern). `src/infra/container/index.ts` calls each module's `setup<X>Module()` in order; `src/infra/container/tokens.ts` is the single registry of `InjectionTokens` (Symbols), grouped by kind: `Repositories`, `Gateways`, `Cache`, `Handlers`, `Controllers`, `Consumers`, `Bus`, `Queue`, `Storage`, `Email`, `Databases`, `Middlewares`. Always add new bindings there rather than inlining Symbols.

### CQRS

Commands and queries are plain data objects dispatched through an **in-process** `CommandBus`/`QueryBus` (`src/infra/bus/adapters/in-memory/`) — handlers register keyed by the command/query **class reference itself** (not a string name — `command.constructor.name` is used only in error messages, not as the map key, so two classes with the same name in different modules never collide) inside each module's `container.ts`. This is deliberately not distributed (no Redis pub/sub) since the HTTP handler must synchronously await the result in a stateless monolith. Controllers only ever build a command/query and call `commandBus.dispatch()` / `queryBus.dispatch()` — they never call handlers or repositories directly.

### Error strategy (three tiers — respect this when adding code)

| Layer | Mechanism | Rationale |
|---|---|---|
| Domain | throws typed `DomainError` subclass | Invariant violations are programmer errors — loud failure is correct |
| Application (use case handler) | returns `Either<UseCaseError, T>` (`left`/`right`) | Expected business failures are first-class return values, not exceptions |
| HTTP controller | switches on `result.value.constructor` and throws `HttpException` | `ErrorHandlerMiddleware` serialises everything into a consistent JSON envelope |

A `DomainError` reaching HTTP is a bug (500 + structured log), not an expected path — it means application code failed to prevent invalid domain state. Controllers dispatch via the bus, check `result.isRight()`, and map each known `Either` left via a `switch` to an `HttpException` (see `apps/api/src/modules/account/infra/http/controllers/create-account.controller.ts` for the canonical shape). Don't throw raw `Error` in application/domain code paths that are expected to fail (e.g. "already exists", "not found") — model them as a `UseCaseError` and return `left(...)`.

### Queue / event-driven design

Two independent processes share the same DI container and module wiring: `src/index.http.ts` (`App`, publishes) and `src/index.queue.ts` (`QueueApp`, consumes) — infra is shared, lifecycles are isolated. Consumers implement `Consumer` (`src/infra/queue/contracts/consumer.ts`) and are registered per-module in `infra/queue/container.ts` + `src/infra/queue/consumer-registry.ts`.

- **Idempotency**: every publish attaches an `x-idempotency-key` (UUID v4) AMQP header; the base `QueueConsumer` checks it against Valkey before processing and marks it with a 24h TTL after success. Valkey errors fail open (log + proceed) — availability over strict exactly-once.
- **Staged retry**: three DLX-backed retry queues per consumer (5s → 30s → 5min TTL) before landing in `{queue}.dead`. Retry metadata (`x-retry-count`, `x-last-error`, `x-first-failed-at`, `x-original-queue`) is preserved across re-publishes.
- **Dead-letter replay**: failed events persist to `failed_queue_events`; an internal API lists/replays them with a fresh idempotency key.
- **Outbox pattern is not yet implemented** — `CreateAccountHandler` publishes after persisting, so a crash between `INSERT` and `publish()` silently drops the event today. Don't assume atomicity between a repository write and a `QueuePublisherGateway.publish()` call unless/until the outbox (`AccountUnitOfWork` + `outbox_events` + `OutboxRelay`) lands.
- **No circuit breaker yet** on RabbitMQ/Valkey/Postgres calls — deliberately deferred pending real production failure data; planned library is `opossum` if/when added.

### Auth

JWT access (15m) + refresh (7d) rotation, refresh token tracked in Valkey (one active session token at a time — refresh atomically invalidates the old one, logout deletes immediately). Passwords: argon2id via an application-layer `PasswordHasherGateway` — never call a hashing library from domain code.

### Storage

Driver-based (`STORAGE_DRIVER=s3|local`) behind the shared `StorageGateway` port. **DB columns named `*_url` actually store the storage key/path, not a URL** — resolve to a public URL at read time via `StorageUrlService.resolve(key)` in presenters, never persist a resolved URL.

### Database (Drizzle + Postgres)

- Primary keys are **UUID v7**, generated app-side via `UniqueEntityID`, never DB-side — don't add `gen_random_uuid()` defaults.
- **No Postgres enums** — use `text` + application-layer validation (enum `ALTER TYPE` can't safely run mid-transaction). Follow this for any new "status"/"role"-style column.
- Schema changes affecting existing columns (NOT NULL, renames, type changes) must use **expand/contract**: a backward-compatible expand deploy first, contract only after old code is fully rolled out. Don't write a single migration that both adds a NOT NULL column and a deploy that requires it simultaneously.
- The migration runner sets `lock_timeout = '3s'` / `statement_timeout = '120s'` (`src/index.migrate.ts`) — migrations must acquire DDL locks quickly or they abort; avoid migrations that hold locks on hot tables for long.

### Observability

Pino (structured JSON logs), OpenTelemetry → OTLP/HTTP → Jaeger (opt-in via `OTEL_ENDPOINT`, zero-cost when unset), prom-client `/metrics`. Every HTTP response carries `x-trace-id`. `infrastructure/grafana/` and `infrastructure/prometheus.yml` provision local dashboards/scraping.

## Commit conventions

This repo uses **Conventional Commits**, single-line, no body, no trailers (no `Co-Authored-By`, no footers) — check `git log` before committing if unsure:

```
fix(workspace): propagate AlreadyAMemberError and InvalidInviteActionError to controllers
feat(notifications): add Notification entity
chore(infra): add prometheus exporters and grafana dashboard provisioning
refactor(workspace): remove invite email flow in favor of in-app notifications
test(workspace): add in-memory repositories and factory
docs(readme): update stack, structure, schema and add storage section
perf(db): add indexes on workspace_id and role_id in account_roles
lint(account): reorder imports per import-x/order
bugfix(auth): patch refresh-token replay allowing session takeover
```

- `type(scope): imperative, lowercase description` — no trailing period.
- `type` ∈:
  - `feat` — new capability
  - `fix` — a bug fix found in dev/review; not urgent, no active incident
  - `bugfix` — a **critical** fix only: an active incident, a security vulnerability (auth bypass, injection, secret leak), or data loss/corruption — the kind of thing that would justify an out-of-band hotfix outside normal review. If it's not one of those, it's `fix`, not `bugfix`
  - `refactor` — restructuring with no behavior change
  - `chore` — tooling/infra/config, no behavior change
  - `lint` — pure style/formatting change (import order, prettier, eslint autofix) — no logic touched
  - `test` — test-only change (new/updated specs), no production code touched
  - `docs` — documentation only (README, CLAUDE.md, comments)
  - `perf` — performance improvement, no behavior change

  Don't invent others beyond this list — if a change doesn't fit, pick the closest one rather than adding a new type ad hoc.
- `scope` is the module or concern the change is centered on (`workspace`, `notifications`, `infra`, `account`, ...), matching `apps/api/src/modules/<scope>`, an `apps/web` FSD slice (`entities/<x>`, `features/<x>`, `pages/<x>`), or the relevant top-level area.
- One commit, one message, no multi-paragraph body — the diff and the module structure carry the detail. If a change is big enough to need a body, it's probably big enough to be split into multiple scoped commits instead.
- If a change legitimately mixes types (e.g. a refactor that also happens to fix a bug), pick the dominant type or split into separate scoped commits — don't stretch one type to cover everything.

## Conventions to follow

- **Static factory pattern everywhere in domain**: private constructors, `Class.create(...)` for new instances (validates, throws a typed `DomainError` on invariant violation), `Class.restore(...)` when rehydrating from persistence (no validation — data already passed `create()` once). Never expose a public `new` for entities/value objects.
- File naming inside a use-case folder is fixed: `command.ts`/`query.ts`, `handler.ts`, `handler.spec.ts`. Don't deviate or merge these into one file.
- Import order is enforced by ESLint (`import-x/order` + `sort-imports`): builtin → external → internal (`@/**`) → parent/sibling/index → type imports, alphabetized, blank line between groups. Run `pnpm --filter api run lint:fix` rather than hand-ordering imports.
- `@typescript-eslint/explicit-member-accessibility` is enforced (`error`) — always mark `public`/`private`/`protected` explicitly on class members.
- Path aliases (`apps/api`): `@/*` → `src/*`, `@/test/*` → `test/*`. `apps/web` has its own, simpler `@/*` → `./src/*` (no test alias) — set independently per app's own tsconfig, not shared.
- New cross-module ports go in `src/shared/<concern>/application/{gateways,repositories}/` as interfaces only; the concrete adapter goes in `src/infra/<concern>/adapters/<vendor>/`.
- When adding a new use case: create the `application/commands|queries/<name>/` folder, register the handler + bus registration in the module's `infra/container.ts`, add a DI token in `tokens.ts` under `Handlers`, and (for HTTP-triggered ones) a controller + entry in the module's `infra/http/routes.ts`.
