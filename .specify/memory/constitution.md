<!--
Sync Impact Report
Version change: [UNRATIFIED TEMPLATE] → 1.0.0
Rationale: MAJOR — first ratified version; replaces all placeholder tokens with concrete,
  project-specific principles derived from CLAUDE.md, apps/api/README.md, apps/web/README.md.
Modified principles: n/a (initial ratification, no prior version to diff against)
Added sections:
  - Core Principles I–IX (apps/api I–VII, apps/web VIII–IX)
  - Scope & Rigor Tiers
  - Reference Documentation
  - Governance (amendment procedure, versioning policy, compliance review)
Removed sections: none
Deferred / TODO placeholders: none — RATIFICATION_DATE set to the date this constitution was
  first authored from the project's existing (previously undocumented-as-constitution) conventions.
Templates requiring follow-up: none checked in this run — plan/spec/tasks templates are read at
  runtime by their own commands and were not modified here per this command's scope guard.
-->

# trello-issur Constitution

## Core Principles

### I. Strict Layered Architecture (apps/api)

Dependencies flow one way only: `Domain ← Application ← Infra ← Entry points`. `src/domain/` and
`src/application/` MUST NOT import from `src/infra/`. Cross-cutting ports (gateways, repositories)
are declared as interfaces only in `src/shared/`; concrete adapters live in `src/infra/` and are
never imported by domain or application code. No infra-layer type (a Drizzle row, an AWS SDK
type, an Express `Request`) may leak into domain or application signatures.

**Rationale**: this boundary is what keeps invariants enforceable and failures typed instead of
ad hoc, in a multi-tenant system with in-flight production traffic — see `CLAUDE.md`.

### II. Three-Tier Error Strategy (apps/api)

Domain code throws a typed `DomainError` subclass on invariant violation. Application use-case
handlers return `Either<UseCaseError, T>` — expected business failures are first-class return
values, never thrown exceptions. HTTP controllers switch on the `Either` left's constructor and
map it to a typed `HttpException`; `ErrorHandlerMiddleware` serializes every response into one
consistent JSON envelope. A `DomainError` reaching the HTTP layer is a bug (structured 500 log),
never an expected path. Raw `Error` MUST NOT be thrown in application/domain code for an expected
failure ("already exists", "not found") — it MUST be modeled as a `UseCaseError` and returned via
`left(...)`.

**Rationale**: separates programmer errors (loud, typed, logged) from expected business outcomes
(first-class values) — ad hoc exceptions-as-control-flow erase that distinction.

### III. CQRS Through the Bus, No Direct Handler Calls (apps/api)

Commands (writes) and queries (reads) are plain data objects dispatched through the in-process
`CommandBus`/`QueryBus`. Controllers MUST only build a command/query and call
`commandBus.dispatch()`/`queryBus.dispatch()` — they MUST NOT call a handler or repository
directly. Handlers register keyed by the command/query class reference itself in each module's
`container.ts`.

**Rationale**: keeps the entry-point layer thin and swappable, and keeps business logic reachable
only through one enforced path, not scattered call sites.

### IV. Static Factory Pattern for Domain Objects (apps/api)

Every domain entity and value object has a `private` constructor. Construction goes through a
static `Class.create(...)` (validates, throws a typed `DomainError` on invariant violation) or
`Class.restore(...)`/`fromRaw(...)` when rehydrating already-validated persisted data (no
re-validation). A public `new` on a domain entity/value object MUST NOT exist. Value objects
export their own validation constants so Zod transport DTOs import them directly — one source of
truth between domain rules and transport validation.

**Rationale**: invalid domain state becomes unrepresentable by construction rather than
policed by convention.

### V. Idempotent, Deliberately-Degrading Event-Driven Consumers (apps/api)

Every published event carries an `x-idempotency-key` AMQP header; every consumer checks it
against Valkey before processing and marks it after success. New consumers MUST be idempotent
under at-least-once delivery. Any dependency-availability failure mode (Valkey down, cache miss
on a check that isn't safety-critical) MUST be a conscious fail-open-or-fail-closed choice,
documented at the point of the check — not an accidental behavior of unhandled error paths. Any
handler that publishes an event after a state-changing write MUST do so through the shared
outbox pattern (`UnitOfWork` + `OutboxRelay`), not a direct `QueuePublisherGateway.publish()` call
right after the write — that reopens the crash window between the two.

**Rationale**: queues, caches, and external services fail in production; behavior under that
failure must be chosen, not incidental.

### VI. Zero-Downtime Data Layer (apps/api)

Primary keys are UUID v7, generated application-side via `UniqueEntityID` — never
`gen_random_uuid()` or another DB-side default. No PostgreSQL enum types — status/role-style
columns are `text` with application-layer validation, because `ALTER TYPE` cannot safely run
mid-transaction. Any schema change affecting an existing column's nullability, name, or type MUST
use expand/contract across two deploys (backward-compatible expand first, contract only once old
code is fully rolled out) — a single migration MUST NOT both add a `NOT NULL` column and ship code
that depends on it existing in the same deploy.

**Rationale**: this system is treated as shipping to a live multi-tenant deployment with
in-flight traffic; single-step breaking migrations are a one-way door this project avoids by
default.

### VII. Structured Observability and Real-Backing Tests (apps/api)

Logs are structured (Pino) — `console.log` MUST NOT appear in production code paths. Every HTTP
response carries `x-trace-id`. End-to-end specs (`*.e2e.spec.ts`) exercise a real Postgres schema
and real Valkey; they MUST NOT mock the database or cache. Unit specs may stub ports with the
hand-written in-memory doubles under `test/{repositories,gateways,cache,queue}/`.

**Rationale**: mocked infrastructure in tests hides exactly the class of bug (real
transaction/query/cache behavior) this system's failure modes come from.

### VIII. Feature-Sliced Design Boundary Integrity (apps/web)

Layers depend one way only: `shared → entities → features → widgets → pages → app`. Cross-slice
imports MUST go through a slice's `index.ts` public-API barrel (`@/entities/workspace`, never a
deep import like `@/entities/workspace/api/get-workspaces`), enforced by `steiger`
(`fsd/no-public-api-sidestep`). The one accepted, documented exception is `app/routes/**`
deep-importing a page's `*-skeleton.tsx` for code-splitting reasons (see `apps/web/README.md`).

**Rationale**: apps/web is a lower-ceremony study project and is not held to apps/api's DDD/CQRS
rigor, but the FSD boundary is the one structural discipline that keeps it from degrading into an
unstructured component tree as it grows.

### IX. Frontend State and Form Discipline (apps/web)

Server-shaped state lives in the TanStack Query cache; it MUST NOT be mirrored into a Zustand
store. Zustand is reserved for state that is genuinely cross-cutting and outlives a single
component tree (today: session/auth only). `useMutation` hooks live in a slice's `model/`
segment, never called directly from a `ui/` component. Every form's Zod schema (and any constant
it is built from) lives in the slice's `model/` segment as its own file, never inlined in the
`ui/*.tsx` component.

**Rationale**: this is the split that keeps server-state, client-state, and presentation from
tangling as slices grow past the project's original reference slice — documented in
`apps/web/README.md` as a fix applied after schemas once lived inline in components.

## Scope & Rigor Tiers

`apps/api` is held to the full rigor of Principles I–VII: every change is treated as shipping to
a live multi-tenant system with in-flight traffic. `apps/web` is a separate, lower-rigor
companion study project governed by Principles VIII–IX only — DDD/CQRS/Clean Architecture
ceremony from apps/api MUST NOT be carried into frontend work. `packages/*` (shared eslint/
prettier/typescript config) and `infrastructure/` are configuration, not governed by these
principles beyond staying consistent with what they configure.

## Reference Documentation

This constitution is the principled summary; it does not replace detailed operational guidance.
For day-to-day implementation detail, module layout, commands, and worked examples, defer to:

- `CLAUDE.md` (repo root) — full architectural guidance, commands, module layout, commit
  conventions; the primary source Principles I–VII are derived from.
- `apps/api/README.md` — apps/api key decisions with rationale (outbox pattern, circuit breaker,
  auth, storage, database).
- `apps/web/README.md` — apps/web FSD layer conventions, data-fetching/forms/state patterns.
- `docs/api/roadmap.md` and `docs/api/specs/` — prior spec-driven decisions recorded before this
  project adopted Spec Kit; historical record, not superseded by this constitution.

## Governance

This constitution supersedes ad hoc convention. A pull request that violates a principle marked
as a MUST/MUST NOT above requires either an explicit, recorded justification in the PR
description or a prior amendment to the principle itself — silently merging past a violation is
not acceptable. `CLAUDE.md` remains the detailed operational guidance; this document is the
principled summary that specs and plans produced by Spec Kit commands (`/speckit-specify`,
`/speckit-plan`, `/speckit-analyze`, `/speckit-checklist`) MUST be checked against.

**Amendment procedure**: propose the change via `/speckit-constitution`, stating which principle
is added, removed, or redefined and why. Version bumps follow semantic versioning: MAJOR for a
backward-incompatible principle removal or redefinition, MINOR for a new principle or materially
expanded guidance, PATCH for wording/clarification with no semantic change. Every amendment
updates `Last Amended` below; `Ratified` never changes once set.

**Compliance review**: `/speckit-analyze` checks a feature's spec/plan/tasks against this
constitution before implementation; reviewers checking a PR against `CLAUDE.md` are implicitly
checking it against this constitution, since CLAUDE.md is this document's detailed operational
expression.

**Version**: 1.0.0 | **Ratified**: 2026-08-28 | **Last Amended**: 2026-08-28
