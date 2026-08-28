# Implementation Plan: Board & Card Module (Kanban core)

**Branch**: `feat/board-card-module` (spec directory: `001-board-card-module`) | **Date**: 2026-08-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-board-card-module/spec.md`

## Summary

Add a new `board` module to `apps/api` (`Board`, `Column`, `Card`) so the `board:*`/`card:*` RBAC
permission keys — already granted by role but currently dead code — protect real routes. Follows
the exact domain/application/infra layout already used by `account`/`auth`/`workspace`/
`notifications`. `Board`, `Column`, and `Card` are each their own aggregate (their own repository,
their own transactional boundary) rather than `Board` owning `Column`+`Card` as one aggregate —
moving a card only ever touches the `cards` row, never reloads the whole board. Column/card
ordering uses a fractional `position` (double precision) so inserting between two siblings never
requires renumbering the rest.

## Technical Context

**Language/Version**: TypeScript (strict), Node.js ≥ 24 — same as the rest of `apps/api`.

**Primary Dependencies**: Express 5 (routing), tsyringe (DI), Drizzle ORM + drizzle-kit
(persistence), Zod 4 (transport validation). No new dependency introduced by this feature.

**Storage**: PostgreSQL 16 — three new tables (`boards`, `columns`, `cards`). No change to Valkey
(cache) or RabbitMQ (queue) — this module publishes no domain event in v1 (see Constitution Check,
Principle V).

**Testing**: Vitest — `handler.spec.ts` per use case with in-memory repository doubles, plus at
least one `*.e2e.spec.ts` against a real Postgres schema, matching every existing module.

**Target Platform**: Linux server (Node.js), same Docker Compose local stack as the rest of
`apps/api`. No new infrastructure service required.

**Project Type**: Backend module within the existing `apps/api` monolith (not a new
app/service).

**Performance Goals**: No new targets beyond the app's existing per-route norms — the spec's
success criteria (SC-001–SC-004) are functional/correctness, not load-based. Not benchmarked as
part of this feature.

**Constraints**: All three tables are net-new (`CREATE TABLE`) — the migration is purely
additive, so the expand/contract two-deploy split (Constitution Principle VI) doesn't apply here;
it only matters once an existing column changes. Migration must still respect the 3s
`lock_timeout` (trivial for a `CREATE TABLE`).

**Scale/Scope**: Arbitrary boards/columns/cards per workspace — no hard cap in v1 (spec
Clarifications: no plan-tied limit until a billing module exists).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design — see bottom of this
section.*

| Principle | Compliance |
|---|---|
| I. Strict Layered Architecture | `src/modules/board/{domain,application,infra}` — no infra type crosses into domain/application. `BoardRepository`/`ColumnRepository`/`CardRepository` are interfaces in `modules/board/application/repositories/`, matching the existing per-module pattern (not `src/shared/`, since they're not cross-module ports). |
| II. Three-Tier Error Strategy | Domain: `BoardNameEmptyError`, `ColumnNameEmptyError`, `CardTitleEmptyError` (typed `DomainError`, thrown from `create()`). Application: `BoardNotFoundError`, `ColumnNotFoundError`, `CardNotFoundError`, `ColumnNotInBoardError` (FR-007), `AccountNotWorkspaceMemberError` (FR-002/FR-009) — all `UseCaseError`, returned via `left(...)`. Controllers switch on the `Either` left, map to `HttpException`. |
| III. CQRS Through the Bus | Every use case below is a `Command` or `Query` class dispatched through `CommandBus`/`QueryBus`; no controller calls a handler directly. |
| IV. Static Factory Pattern | `Board`/`Column`/`Card` each: private constructor, `create()` (validates), `restore()` (rehydration, no re-validation). |
| V. Idempotent, Deliberately-Degrading Consumers | **Not applicable in v1** — this module publishes no domain event and registers no queue consumer (nothing outside the module needs to react to a board/column/card change today). If a future use case needs to notify on assign or similar, it MUST go through the shared outbox (`UnitOfWork` + `OutboxRelay`), not a direct `publish()` call, per this principle. |
| VI. Zero-Downtime Data Layer | UUID v7 PKs generated app-side via `UniqueEntityID`. No Postgres enum — no status-like column exists on these entities in v1. Migration is additive-only (see Technical Context → Constraints). |
| VII. Structured Observability & Real-Backing Tests | Pino logging via existing middleware, no `console.log`. `*.e2e.spec.ts` for the happy path runs against real Postgres. |

No violations — Complexity Tracking table below stays empty.

**Post-design re-check (after Phase 1)**: unchanged — `data-model.md` and `contracts/` below
introduce no new dependency, no cross-aggregate transaction beyond `Board`'s own delete cascade
(still scoped to one aggregate family, not crossing into `workspace`/`account`), and no deviation
from the layout validated above.

## Project Structure

### Documentation (this feature)

```text
specs/001-board-card-module/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output
├── quickstart.md         # Phase 1 output
├── contracts/             # Phase 1 output
└── tasks.md               # Phase 2 output (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
apps/api/src/modules/board/
├── domain/
│   ├── entities/
│   │   ├── board.ts                 # Board aggregate root
│   │   ├── column.ts                # Column aggregate root
│   │   └── card.ts                  # Card aggregate root
│   ├── value-objects/
│   │   ├── board-name.ts
│   │   ├── column-name.ts
│   │   ├── card-title.ts
│   │   └── position.ts              # fractional position VO (midpoint helper)
│   └── errors/
│       ├── board-name-empty.error.ts
│       ├── column-name-empty.error.ts
│       └── card-title-empty.error.ts
├── application/
│   ├── commands/
│   │   ├── create-board/
│   │   ├── rename-board/
│   │   ├── delete-board/
│   │   ├── create-column/
│   │   ├── move-column/
│   │   ├── delete-column/
│   │   ├── create-card/
│   │   ├── update-card/
│   │   ├── move-card/
│   │   ├── assign-card/
│   │   └── delete-card/
│   ├── queries/
│   │   ├── list-workspace-boards/
│   │   └── get-board/                # returns board + columns + cards
│   ├── dtos/                         # Zod schemas per command/query
│   ├── errors/
│   │   ├── board-not-found.error.ts
│   │   ├── column-not-found.error.ts
│   │   ├── card-not-found.error.ts
│   │   ├── column-not-in-board.error.ts
│   │   └── account-not-workspace-member.error.ts
│   └── repositories/
│       ├── board.repository.ts       # port interfaces
│       ├── column.repository.ts
│       └── card.repository.ts
└── infra/
    ├── db/
    │   ├── schema/ (boards, columns, cards Drizzle table defs — or added to shared schema barrel, matching existing convention)
    │   ├── repositories/
    │   │   ├── drizzle-board.repository.ts
    │   │   ├── drizzle-column.repository.ts
    │   │   └── drizzle-card.repository.ts
    │   └── mappers/
    │       ├── board.mapper.ts
    │       ├── column.mapper.ts
    │       └── card.mapper.ts
    ├── http/
    │   ├── controllers/ (one per use case, see contracts/)
    │   ├── routes.ts
    │   └── container.ts
    ├── presenters/
    │   ├── board.presenter.ts
    │   └── card.presenter.ts
    └── container.ts                  # setupBoardModule()
```

**Structure Decision**: mirrors `src/modules/workspace/` exactly (multiple related entities —
there `Workspace`/`WorkspaceMember`/`WorkspaceInvite`, here `Board`/`Column`/`Card` — inside one
bounded-context module, each still its own repository/aggregate). No new top-level directory
pattern introduced.

## Complexity Tracking

*No constitution violations — table intentionally empty.*
