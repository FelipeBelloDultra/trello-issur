# trello-issur

A multi-tenant team project management API built with Node.js and TypeScript, following **Domain-Driven Design**, **Clean Architecture**, and **Ports & Adapters**. Models Kanban boards, workspaces, role-based access control, and subscription plans.

---

## Architecture

Strict inward dependency rule across four layers:

```
Domain ← Application ← Infra ← Entry points
```

Cross-cutting port interfaces live in `src/shared/` — the only layer that all others may freely import. `src/infra/` contains adapter implementations only and is never imported by `domain/` or `application/`.

---

## Key decisions

### Domain design

**Value objects carry their own invariants.** Every VO validates on construction via a static `fromRaw()` factory and throws a typed `DomainError` if the invariant is violated. Validation constants (`ACCOUNT_NAME_MAX`, `ACCOUNT_NAME_WORDS_PATTERN`) are exported from the VO itself so Zod DTOs import them directly — single source of truth, no drift between transport validation and domain rules.

**`DomainError` is an abstract class, not an interface.** Interfaces are erased at compile time. The global error handler uses `instanceof DomainError` to identify unhandled invariant violations and log them with their typed `code` property — a signal of data corruption or a validation gap in the application layer. A runtime check requires a runtime presence.

**Static factory pattern** — constructors are `private`; instantiation goes through `ClassName.create()` or `ClassName.fromRaw()`. Invalid state is unrepresentable by construction.

### Error strategy (three tiers)

| Layer | Mechanism | Rationale |
|---|---|---|
| Domain | throws typed `DomainError` | Invariant violations are programmer errors — loud failures are correct |
| Use case | returns `Either<UseCaseError, T>` | Expected business failures are first-class return values, not exceptions |
| HTTP | maps `Either` lefts to `HttpException` | The `ErrorHandlerMiddleware` serialises everything into a consistent JSON envelope |

`DomainError` reaching the HTTP layer is treated as a 500 with a structured log entry: it means the application layer failed to prevent an invalid domain state from being constructed.

### CQRS

Commands (writes) and queries (reads) are dispatched through an in-memory bus. The bus stays in-process deliberately — distributing it via Redis pub/sub would require correlation IDs, reply channels, and timeout handling, adding failure modes with no benefit in a stateless monolith where the HTTP handler must synchronously await the result.

### Queue and event-driven design

Two independent processes share the same DI container: `index.http.ts` publishes, `index.queue.ts` consumes. Shared infra but isolated lifecycles.

**Idempotency** is enforced at the consumer base class. Every `RabbitMQPublisher.publish()` call attaches an `x-idempotency-key` (UUID v4) to the AMQP message headers. Before processing, `QueueConsumer` checks the key against Valkey; on success it marks the key with a 24-hour TTL. Keys propagate automatically through retry dead-letter queues because AMQP headers are preserved in the re-publish header spread. Valkey errors **fail open** — the consumer logs a warning and proceeds, trading strict exactly-once semantics for availability.

**Staged retry strategy** uses three DLX-backed queues per consumer:

```
{queue}           → fail → {queue}.retry.1  (5 s TTL)
{queue}.retry.1   → fail → {queue}.retry.2  (30 s TTL)
{queue}.retry.2   → fail → {queue}.retry.3  (5 min TTL)
{queue}.retry.3   → fail → {queue}.dead
```

Each retry queue has `x-dead-letter-exchange` pointing back to the main exchange, so re-queued messages re-enter the original consumer after the delay. Retry count is tracked via `x-retry-count` header alongside `x-last-error`, `x-first-failed-at`, and `x-original-queue` for operational visibility.

**Dead-letter replay** — failed events are persisted to `failed_queue_events` with a nullable `replayed_at` timestamp. An internal API exposes list and replay endpoints: replay republishes to the original routing key with a fresh idempotency key, preventing accidental double-processing.

### Authentication

JWT-based with stateful refresh token rotation:

1. Login issues an `access_token` (15 min) and a `refresh_token` (7 days), storing the refresh token in Valkey with a matching TTL.
2. Refresh verifies signature and Valkey presence, issues a new pair, and atomically invalidates the old token — one active token per session at all times.
3. Logout deletes the Valkey entry immediately, revoking the token before its natural expiry.

Passwords are hashed with **argon2id** (memory-hard, GPU-resistant). Hash verification is kept out of the domain layer — it lives in an application-layer `PasswordHasher` gateway so the domain stays pure and the hashing algorithm is swappable without touching business logic.

### File storage

Driver-based: `STORAGE_DRIVER=s3` routes to `S3StorageGateway` (AWS SDK v3, MinIO-compatible), `local` routes to `LocalStorageGateway`. Both implement the same `StorageGateway` port from `src/shared/`.

**The database stores keys, not URLs.** Columns named `*_url` hold the storage key/path. Presenters call `StorageUrlService.resolve(key)` at read time to produce the full public URL. This keeps the bucket, domain, and driver swappable without a data migration.

### Database

- **UUID v7 primary keys** generated at the application layer via `UniqueEntityID`, not DB-side. UUID v7 is time-ordered, making it B-tree friendly while remaining globally unique and decentralised.
- **No PostgreSQL enums** — `text` columns with application-layer validation. `ALTER TYPE ... ADD VALUE` cannot run inside a transaction in older Postgres versions, and even in Postgres 12+ it requires careful coordination. Plain text + application constraints avoids that class of deployment risk entirely.
- **Expand / contract for zero-downtime DDL** — unsafe changes (NOT NULL columns, renames, type changes) are split across two deploys: an expand phase that is backward-compatible with the running code, followed by a contract phase after old code is gone.
- Migration runner sets `lock_timeout = '3s'` — a migration that cannot acquire its DDL lock within 3 seconds aborts immediately rather than stalling behind a long-running transaction.

### Observability

| Signal | Implementation |
|---|---|
| Structured logs | Pino — JSON in production, pretty-printed in dev |
| Distributed tracing | OpenTelemetry SDK → OTLP/HTTP → Jaeger; opt-in via `OTEL_ENDPOINT` |
| Metrics | prom-client → `/metrics` (Prometheus scrape); request duration histograms per route |

Every HTTP response carries an `x-trace-id` header. Tracing is zero-cost when `OTEL_ENDPOINT` is unset.

---

## Stack

| Concern | Choice |
|---|---|
| Runtime | Node.js ≥ 24 |
| Language | TypeScript (strict mode) |
| HTTP framework | Express 5 |
| Dependency injection | tsyringe |
| ORM | Drizzle ORM + drizzle-kit |
| Database | PostgreSQL 16 |
| Cache / token store | Valkey 8 (Redis-compatible) |
| Message queue | RabbitMQ (amqplib) |
| Email | Nodemailer (SMTP) + Mailpit (dev) |
| File storage | S3 / MinIO + local disk |
| Auth | Custom — JWT (jose) + argon2 |
| Validation | Zod 4 |
| Logging | Pino |
| Tracing | OpenTelemetry (OTLP/HTTP → Jaeger) |
| Metrics | prom-client (Prometheus) |
| Testing | Vitest |
| Package manager | pnpm ≥ 10 |

---

## Running locally

```sh
cp .env.example .env
docker compose up -d
pnpm install
pnpm run db:migrate
pnpm run dev:http    # HTTP process
pnpm run dev:queue   # queue consumer process (separate)
```
