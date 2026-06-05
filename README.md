# trello-issur

A team project management API built with Node.js and TypeScript, following **Domain-Driven Design**, **Clean Architecture**, and **Ports & Adapters** principles. It models Kanban boards, multi-tenant workspaces, role-based access control, and subscription plans.

---

## Architecture

The codebase enforces a strict inward dependency rule across five layers:

```
Domain ← Application ← Shared ← Infrastructure ← Entry points
```

- **Domain** — pure business logic; zero framework or I/O imports. Entities, value objects, domain errors, domain events.
- **Application** — use cases, module-scoped repository/gateway contracts, DTOs validated with Zod.
- **Shared** (`src/shared/`) — cross-cutting port interfaces and constants with no infra dependency. Application code imports from here, never from `infra/`. Follows the same internal structure as modules (`application/repositories/`, `application/gateways/`, etc.).
- **Infrastructure** (`src/infra/`) — adapter implementations only. Implements contracts from `shared/`. Technology-specific internal contracts live in `infra/{concern}/contracts/`.
- **Entry points** — `src/index.{process}.ts` files that wire the DI container and boot the process.

### Domain primitives

| Abstraction | Description |
|---|---|
| `Entity<Props>` | Identity-based object; holds typed `props` and a `UniqueEntityID` (UUID v7) |
| `ValueObject<Props>` | Equality by value via deep `JSON.stringify(props)` comparison |
| `AggregateRoot<Props>` | Entity that owns a collection of domain events |
| `UniqueEntityID` | UUID v7 wrapper — `create()` generates, `create(existing)` wraps |
| `Either<L, R>` | Hand-rolled functional error type — use cases return `Either<UseCaseError, T>` |
| `WatchedList<T>` | Tracks additions and removals on a collection for dirty-state diffing |

All domain objects follow the **static factory pattern** — constructors are `private`, instantiation goes through `ClassName.create(...)`.

### Error strategy

- **Domain layer throws** typed errors (extend `DomainError`) for programmer-level invariant violations.
- **Use case layer returns `Either`** — expected business failures (e.g. invalid credentials, email taken) are `left(error)`, successes are `right(value)`.
- **HTTP layer maps** `Either` lefts to `HttpException`, which the global error handler serialises into structured JSON.

---

## Stack

| Concern | Choice |
|---|---|
| Runtime | Node.js ≥ 24 |
| Language | TypeScript 6 (strict mode) |
| HTTP framework | Express 5 |
| Dependency injection | tsyringe |
| ORM | Drizzle ORM + drizzle-kit |
| Database | PostgreSQL 16 |
| Cache / token store | Valkey 8 (Redis-compatible) |
| Message queue | RabbitMQ (amqplib) |
| Email | Nodemailer (SMTP) + Mailpit (dev) |
| File storage | S3 / MinIO (`@aws-sdk/client-s3`) + local disk |
| Auth | Custom — JWT (jose) + argon2 |
| Validation | Zod 4 |
| Logging | Pino |
| Tracing | OpenTelemetry (OTLP/HTTP → Jaeger) |
| Metrics | prom-client (Prometheus) |
| Dev runner | tsx (hot reload) |
| Build | esbuild |
| Testing | Vitest |
| Containers | Docker + Docker Compose |
| Package manager | pnpm ≥ 10 |

---

## Project structure

```
src/
├── config/                  # Env vars — Zod-validated at startup, single source of truth
├── core/                    # Framework-agnostic primitives
│   ├── entity/              # Entity, ValueObject, AggregateRoot, UniqueEntityID, WatchedList
│   ├── errors/              # DomainError, UseCaseError base classes
│   ├── events/              # DomainEvent, EventHandler, DomainEvents dispatcher
│   └── either.ts            # Either<L, R> + left() / right() helpers
├── shared/                  # Cross-cutting ports — no infra deps; safe to import from application/
│   ├── cache/application/repositories/   # CacheRepository
│   ├── email/application/gateways/       # EmailGateway + SendEmailOptions
│   ├── queue/application/
│   │   ├── events.ts                     # QueueEvents routing-key constants
│   │   ├── gateways/                     # QueuePublisherGateway
│   │   └── repositories/                 # DeadLetterRepository + FailedQueueEvent
│   └── storage/application/
│       ├── gateways/                     # StorageGateway + UploadFileOptions
│       └── services/                     # StorageUrlService (resolve key → URL, buildKey)
├── infra/                   # Adapter implementations only
│   ├── container/           # DI root — InjectionTokens + setup orchestration
│   ├── db/                  # DatabaseClient, Drizzle schema, migrations, seeds
│   ├── cache/               # Valkey implementation of CacheRepository
│   ├── email/               # Nodemailer implementation of EmailGateway + React Email templates
│   ├── queue/
│   │   ├── contracts/       # Consumer interface (amqplib-specific — can't live in shared/)
│   │   └── adapters/        # RabbitMQ client, publisher, consumer base, DLQ consumer
│   ├── valkey/              # ValkeyClient lifecycle
│   ├── http/
│   │   ├── contracts/       # Controller interface, Middleware<T> interface
│   │   ├── register-controller.ts  # Wires a Controller onto an Express Router
│   │   └── middlewares/     # Injectable middlewares: logger, tracing, metrics, rate-limit, file-upload
│   ├── logger/              # Pino logger singleton
│   ├── metrics/             # prom-client registry
│   ├── tracing/             # OpenTelemetry SDK bootstrap + shutdown
│   └── storage/
│       ├── contracts/       # StorageLifecycle (initialize() — infra-internal, not in shared/)
│       └── adapters/        # S3StorageGateway (AWS SDK v3 / MinIO), LocalStorageGateway
└── modules/
    ├── auth/
    │   ├── domain/          # Value objects: TokenClaims, TokenPair, PermissionKey, UserRole
    │   ├── application/     # Use cases: Login, Logout, RefreshToken — contracts: CryptographGateway, TokenRepository
    │   └── infra/           # JWT gateway, Valkey token repository, Express controllers
    └── account/
        ├── domain/          # Entity: Account — Value objects: (name, email, password hash)
        ├── application/     # Use cases: CreateAccount, SendWelcomeEmail — contracts: AccountRepository, PasswordHasherGateway
        └── infra/           # Drizzle repository, argon2 gateway, queue consumer, cache, HTTP controller
```

### Module layout convention

Every module follows the same internal pattern:

```
modules/{module}/
├── domain/
│   ├── value-objects/   # Immutable, validated, compared by value
│   ├── entities/        # Objects with identity
│   └── errors/          # Typed domain errors with a `code` property
├── application/
│   ├── commands/        # Write operations — {name}/command.ts + handler.ts (returns Either)
│   ├── queries/         # Read operations  — {name}/query.ts  + handler.ts (returns plain data)
│   ├── dtos/            # Zod schema + inferred type (transport-agnostic)
│   ├── errors/          # Use-case-level errors (implement UseCaseError)
│   ├── repositories/    # Repository interfaces (contracts)
│   └── gateways/        # External-service interfaces (contracts)
└── infra/
    ├── container.ts     # Module DI orchestrator
    ├── db/              # Drizzle repository implementations + mappers
    ├── http/            # Controllers + router
    └── presenters/      # Static presenter classes — map domain → HTTP shapes
```

---

## HTTP layer

### Controllers

Each controller is a single-action injectable class that implements a `Controller` interface:

```ts
export interface Controller {
  readonly path: string;
  readonly method: HttpMethod;
  readonly middlewares: RequestHandler[];
  handler(req: Request, res: Response): Promise<Response>;
}
```

Controllers validate `req.body` with `ZodSchema.parse()`, call the use case, map the `Either` result, and return a structured response. Per-route middlewares (e.g. rate limiting) are injected in the constructor.

### Middlewares

Every middleware is an injectable class implementing `Middleware<HandleData = void>`:

```ts
interface Middleware<T = void> {
  handle(data: T): RequestHandler;
}
```

Global middlewares (logger, tracing, metrics) receive no arguments; per-route middlewares (rate-limit) receive options at call time. The `RateLimitMiddleware` is backed by Valkey using atomic `INCR + EXPIRE`.

### Global error handler

The `App` class registers a single Express error handler that serialises errors into a consistent envelope:

```json
{ "status_code": 422, "message": "...", "errors": [] }
```

It handles `ZodError` (→ 400), `HttpException` (→ configured status), and any uncaught `Error` (→ 500).

---

## Authentication

JWT-based, stateful refresh tokens:

1. **Login** — verifies credentials with argon2, issues an `access_token` (15 min) and a `refresh_token` (7 days), stores the refresh token in Valkey with TTL.
2. **Refresh** — verifies the refresh token signature and its presence in Valkey, issues a new pair (rotation), invalidates the old refresh token.
3. **Logout** — deletes the refresh token from Valkey.

---

## File storage

Storage is driver-based: set `STORAGE_DRIVER=s3` for AWS S3 or MinIO, `local` for local disk (development only). Both implement the same `StorageGateway` port from `src/shared/`.

- **`StorageUrlService.resolve(key)`** — converts a stored key to a full public URL at read time. Presenters call this; handlers and use cases never do.
- **`StorageUrlService.buildKey(prefix, name)`** — generates a UUID-prefixed key for multi-file contexts.
- **Keys, not URLs, are stored in the database** — columns named `*_url` may hold a storage key/path. This keeps the driver and bucket swappable without a data migration.
- **`StorageLifecycle.initialize()`** is called by `App` and `QueueApp` on boot to create the bucket + public policy (S3/MinIO) or the upload directory (local). It is an infra-internal contract, not part of the shared port — use cases cannot call it.
- Local driver serves files via Express static middleware at `/uploads` — only registered when `STORAGE_DRIVER=local`.

---

## Dependency injection

DI is handled with **tsyringe**. All tokens live in `src/infra/container/tokens.ts` as `Symbol` values in a single `InjectionTokens` const — never inlined at the call site.

Container registration follows a layered setup pattern:

```
src/infra/container/index.ts        ← root; imports reflect-metadata, calls all setup*()
src/infra/{concern}/container.ts    ← registers shared infra bindings
src/modules/{m}/infra/container.ts  ← module orchestrator; calls sub-containers
src/modules/{m}/infra/{c}/container.ts ← concern-specific bindings (db, http, jwt...)
```

All bindings use `Lifecycle.Singleton` — every injectable class is stateless, so singletons are always correct.

---

## Database

- **Migrations** are applied via `src/index.migrate.ts`, which sets `lock_timeout = '3s'` and `statement_timeout = '120s'` — a migration that can't acquire its lock within 3 seconds fails immediately instead of stalling behind a long-running transaction.
- **Primary keys** are UUID v7 generated at the application layer via `UniqueEntityID` — never DB-side.
- **No PostgreSQL enums** — constrained text columns are validated at the application layer (Zod + domain types). Postgres enums require `ALTER TYPE` to extend, which is painful in production.
- **Every `CREATE INDEX`** generated by drizzle-kit is manually converted to `CREATE INDEX CONCURRENTLY` before committing to avoid write locks.
- **Expand / contract** for zero-downtime migrations — unsafe changes (NOT NULL columns, renames, type changes) are split across two deploys.

### Schema (current)

```
accounts              id, name, email, password_hash, created_at, updated_at
roles                 id, name, created_at
permissions           id, key, created_at
role_permissions      role_id, permission_id  (composite PK — immutable junction)
account_roles         account_id, role_id     (composite PK — immutable junction)
workspaces            id, name, slug, owner_id, description, avatar_url, is_personal, created_at, updated_at
failed_queue_events   id, routing_key, payload, error, original_queue, created_at
```

---

## Observability

| Signal | Implementation |
|---|---|
| Structured logs | Pino — JSON in production, pretty-printed in dev |
| Distributed tracing | OpenTelemetry SDK → OTLP/HTTP → Jaeger |
| Metrics | prom-client → `/metrics` (Prometheus scrape endpoint) |

Every response carries an `x-trace-id` header. Tracing is opt-in via `OTEL_ENDPOINT` — omit it to disable with no overhead.

---

## Testing

Unit tests are co-located with source (`src/foo.spec.ts`). E2E tests live in `test/` (`*.e2e.spec.ts`).

Test support infrastructure:

- `test/factories/` — `make{Entity}()` functions using `@faker-js/faker`
- `test/repositories/` — in-memory repository implementations with a public `items` array for seeding and inspection

Use cases are tested against in-memory repositories; domain logic is tested in isolation against value objects and entities. Each layer tests only what it owns — use case specs do not re-test invariants already covered by domain specs.
