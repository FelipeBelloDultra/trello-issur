---
description: "Task list for Board & Card Module (Kanban core)"
---

# Tasks: Board & Card Module (Kanban core)

**Input**: Design documents from `specs/001-board-card-module/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: included — this repo's constitution (Principle VII) requires `handler.spec.ts` per
use case plus at least one real-backing `*.e2e.spec.ts`; not optional here.

**Organization**: grouped by user story (spec.md priorities). All paths are relative to
`apps/api/`.

## Phase 1: Setup

- [ ] T001 Scaffold `src/modules/board/{domain,application,infra}` directory skeleton (empty,
      matching the layout in `plan.md` → Project Structure)
- [ ] T002 [P] Add `Repositories`/`Handlers`/`Controllers` injection tokens for `board`/`column`/
      `card` in `src/infra/container/tokens.ts`
- [ ] T003 Create `src/modules/board/infra/container.ts` with an empty `setupBoardModule()` and
      register the call in `src/infra/container/index.ts`

**Checkpoint**: module skeleton exists, wired into the DI bootstrap, no behavior yet.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: domain entities, VOs, errors, ports, and the DB schema/migration every user story
needs. No user story task starts before this phase is done.

- [ ] T004 [P] Create `BoardName` value object in
      `src/modules/board/domain/value-objects/board-name.ts` (non-empty, throws
      `BoardNameEmptyError`)
- [ ] T005 [P] Create `ColumnName` value object in
      `src/modules/board/domain/value-objects/column-name.ts` (non-empty, throws
      `ColumnNameEmptyError`)
- [ ] T006 [P] Create `CardTitle` value object in
      `src/modules/board/domain/value-objects/card-title.ts` (non-empty, throws
      `CardTitleEmptyError`)
- [ ] T007 [P] Create `Position` value object in
      `src/modules/board/domain/value-objects/position.ts` — fractional midpoint helper
      (`between(before, after)`) and end-of-list helper (`afterLast(last)`), per
      `research.md` §2
- [ ] T008 [P] Create `Board` aggregate (`create`/`restore`, private constructor) in
      `src/modules/board/domain/entities/board.ts`
- [ ] T009 [P] Create `Column` aggregate in `src/modules/board/domain/entities/column.ts`
- [ ] T010 [P] Create `Card` aggregate in `src/modules/board/domain/entities/card.ts`
      (`boardId`, `columnId`, `title`, `description`, `position`, `assigneeAccountId`)
- [ ] T011 [P] Define `BoardRepository` port in
      `src/modules/board/application/repositories/board.repository.ts`
- [ ] T012 [P] Define `ColumnRepository` port in
      `src/modules/board/application/repositories/column.repository.ts`
- [ ] T013 [P] Define `CardRepository` port in
      `src/modules/board/application/repositories/card.repository.ts`
- [ ] T014 [P] Define application errors (`BoardNotFoundError`, `ColumnNotFoundError`,
      `CardNotFoundError`, `ColumnNotInBoardError`, `AccountNotWorkspaceMemberError`) in
      `src/modules/board/application/errors/`
- [ ] T015 Define Drizzle tables `boards`, `columns`, `cards` per `data-model.md` in
      `src/infra/db/schema/boards.ts`, `src/infra/db/schema/columns.ts`,
      `src/infra/db/schema/cards.ts`; export from `src/infra/db/schema/index.ts`; add relations
      to `src/infra/db/schema/relations.ts`
- [ ] T016 Generate the migration (`pnpm --filter api run db:generate`) for T015's tables —
      additive only, no expand/contract needed (plan.md → Technical Context)
- [ ] T017 [P] Create `Board`↔row mapper in `src/modules/board/infra/db/mappers/board.mapper.ts`
- [ ] T018 [P] Create `Column`↔row mapper in
      `src/modules/board/infra/db/mappers/column.mapper.ts`
- [ ] T019 [P] Create `Card`↔row mapper in `src/modules/board/infra/db/mappers/card.mapper.ts`
- [ ] T020 Implement `DrizzleBoardRepository` in
      `src/modules/board/infra/db/repositories/drizzle-board.repository.ts` (depends on T011,
      T015, T017)
- [ ] T021 Implement `DrizzleColumnRepository` in
      `src/modules/board/infra/db/repositories/drizzle-column.repository.ts` (depends on T012,
      T015, T018)
- [ ] T022 Implement `DrizzleCardRepository` in
      `src/modules/board/infra/db/repositories/drizzle-card.repository.ts` (depends on T013,
      T015, T019)
- [ ] T023 [P] Create in-memory test doubles `InMemoryBoardRepository`,
      `InMemoryColumnRepository`, `InMemoryCardRepository` in `test/repositories/` (matching
      existing doubles' shape)
- [ ] T024 [P] Add `makeBoard`/`makeColumn`/`makeCard` factories in `test/factories/`

**Checkpoint**: entities, ports, repositories, and DB schema exist and compile. No route is
reachable yet — every user story phase below builds on this.

---

## Phase 3: User Story 1 - Create, view, list, and rename a board with RBAC (Priority: P1) 🎯 MVP

**Goal**: a member creates/renames/lists/views boards in their workspace; a non-member is
blocked. First route where `board:*` RBAC stops being dead code.

**Independent Test**: create a board as a member, confirm a non-member is refused; list the
workspace's boards; rename the board — all without any column or card existing.

### Tests for User Story 1

- [ ] T025 [P] [US1] `handler.spec.ts` for `CreateBoardHandler` in
      `src/modules/board/application/commands/create-board/handler.spec.ts` — covers FR-001,
      FR-002
- [ ] T026 [P] [US1] `handler.spec.ts` for `RenameBoardHandler` in
      `src/modules/board/application/commands/rename-board/handler.spec.ts` — covers FR-014
- [ ] T027 [P] [US1] `handler.spec.ts` for `ListWorkspaceBoardsHandler` in
      `src/modules/board/application/queries/list-workspace-boards/handler.spec.ts` — covers
      FR-011
- [ ] T028 [P] [US1] `handler.spec.ts` for `GetBoardHandler` in
      `src/modules/board/application/queries/get-board/handler.spec.ts`
- [ ] T029 [US1] `*.e2e.spec.ts` for board create/list/get/rename + non-member `403`/`404` in
      `src/modules/board/infra/http/controllers/create-board.controller.e2e.spec.ts` (or the
      module's existing e2e-per-controller convention) — covers SC-001 (partial), SC-002

### Implementation for User Story 1

- [ ] T030 [US1] `CreateBoardCommand` + `CreateBoardHandler` in
      `src/modules/board/application/commands/create-board/` (depends on T008, T011, T014)
- [ ] T031 [US1] `RenameBoardCommand` + `RenameBoardHandler` in
      `src/modules/board/application/commands/rename-board/`
- [ ] T032 [US1] `ListWorkspaceBoardsQuery` + `ListWorkspaceBoardsHandler` in
      `src/modules/board/application/queries/list-workspace-boards/`
- [ ] T033 [US1] `GetBoardQuery` + `GetBoardHandler` (returns board + columns + cards, per
      `research.md` §5) in `src/modules/board/application/queries/get-board/` (depends on T011,
      T012, T013)
- [ ] T034 [P] [US1] Zod DTOs for create/rename board requests in
      `src/modules/board/application/dtos/`
- [ ] T035 [US1] `CreateBoardController` in
      `src/modules/board/infra/http/controllers/create-board.controller.ts` — `POST
      /workspaces/:workspaceId/boards`, permission `board:create`
- [ ] T036 [US1] `RenameBoardController` — `PATCH /boards/:boardId`, permission `board:edit`
- [ ] T037 [US1] `ListWorkspaceBoardsController` — `GET /workspaces/:workspaceId/boards`,
      workspace-membership check only (no dedicated permission key, per contracts/board-routes.md)
- [ ] T038 [US1] `GetBoardController` — `GET /boards/:boardId`, workspace-membership check only
- [ ] T039 [P] [US1] `BoardPresenter` (with nested columns/cards for `GetBoard`) in
      `src/modules/board/infra/presenters/board.presenter.ts`
- [ ] T040 [US1] Register routes in `src/modules/board/infra/http/routes.ts` and wire
      handlers/controllers into `src/modules/board/infra/container.ts` (commands/queries onto
      `CommandBus`/`QueryBus`, per Constitution Principle III)

**Checkpoint**: US1 fully functional and independently testable — `board:*` RBAC now protects
real routes.

---

## Phase 4: User Story 2 - Organize columns within a board (Priority: P1)

**Goal**: create, rename/reposition, and delete columns on an existing board.

**Independent Test**: create two columns, reposition one, delete one — verified via `GetBoard`.

### Tests for User Story 2

- [ ] T041 [P] [US2] `handler.spec.ts` for `CreateColumnHandler` — covers FR-003
- [ ] T042 [P] [US2] `handler.spec.ts` for `MoveColumnHandler` — covers FR-004
- [ ] T043 [P] [US2] `handler.spec.ts` for `DeleteColumnHandler` — covers FR-012
- [ ] T044 [US2] `*.e2e.spec.ts` covering create → reposition → delete column

### Implementation for User Story 2

- [ ] T045 [US2] `CreateColumnCommand` + `CreateColumnHandler` (position = `afterLast`, per
      `Position` VO from T007) in `src/modules/board/application/commands/create-column/`
- [ ] T046 [US2] `MoveColumnCommand` + `MoveColumnHandler` (rename and/or reposition, per
      `research.md` §4) in `src/modules/board/application/commands/move-column/`
- [ ] T047 [US2] `DeleteColumnCommand` + `DeleteColumnHandler` (cascades to the column's cards via
      shared `UnitOfWork`, per FR-012) in `src/modules/board/application/commands/delete-column/`
- [ ] T048 [P] [US2] Zod DTOs for create/move column requests
- [ ] T049 [US2] `CreateColumnController` — `POST /boards/:boardId/columns`, permission
      `board:edit`
- [ ] T050 [US2] `MoveColumnController` — `PATCH /columns/:columnId`, permission `board:edit`
- [ ] T051 [US2] `DeleteColumnController` — `DELETE /columns/:columnId`, permission `board:edit`
- [ ] T052 [US2] Register US2 routes in `routes.ts` and wire into `container.ts`

**Checkpoint**: US1 + US2 both independently functional.

---

## Phase 5: User Story 3 - Create and move cards between columns (Priority: P1)

**Goal**: create cards, move them within/between columns of the same board, consistent under
concurrency; reject cross-board moves; delete a card individually.

**Independent Test**: create a card, move it to another column, confirm final position via
`GetBoard`; attempt (and confirm rejection of) a move into a different board's column.

### Tests for User Story 3

- [ ] T053 [P] [US3] `handler.spec.ts` for `CreateCardHandler` — covers FR-005
- [ ] T054 [P] [US3] `handler.spec.ts` for `MoveCardHandler` — covers FR-006, FR-007 (including
      the `ColumnNotInBoardError` case)
- [ ] T055 [P] [US3] `handler.spec.ts` for `DeleteCardHandler` — covers FR-013
- [ ] T056 [US3] `*.e2e.spec.ts` for the full happy path from `quickstart.md` (create board →
      column → card → move) — covers SC-001
- [ ] T057 [US3] `*.e2e.spec.ts` (or a focused integration test) issuing two concurrent `MoveCard`
      requests for the same card and asserting the final state is single-valued — covers SC-003
      (validates the plain-atomic-update decision in `research.md` §3)

### Implementation for User Story 3

- [ ] T058 [US3] `CreateCardCommand` + `CreateCardHandler` (position = `afterLast` within the
      column) in `src/modules/board/application/commands/create-card/`
- [ ] T059 [US3] `MoveCardCommand` + `MoveCardHandler` — reads the card, reads the target column,
      compares `column.boardId` to `card.boardId` (`ColumnNotInBoardError` on mismatch, FR-007),
      then a single atomic `UPDATE` (research.md §3) in
      `src/modules/board/application/commands/move-card/`
- [ ] T060 [US3] `DeleteCardCommand` + `DeleteCardHandler` in
      `src/modules/board/application/commands/delete-card/`
- [ ] T061 [P] [US3] Zod DTOs for create/move card requests
- [ ] T062 [US3] `CreateCardController` — `POST /columns/:columnId/cards`, permission
      `card:create`
- [ ] T063 [US3] `MoveCardController` — `PATCH /cards/:cardId/move`, permission `card:move`
- [ ] T064 [US3] `DeleteCardController` — `DELETE /cards/:cardId`, permission `card:delete`
- [ ] T065 [P] [US3] `CardPresenter` in `src/modules/board/infra/presenters/card.presenter.ts`
- [ ] T066 [US3] Register US3 routes in `routes.ts` and wire into `container.ts`

**Checkpoint**: US1 + US2 + US3 complete — the module's P1 core (spec's MVP boundary) is done and
independently testable; `quickstart.md`'s happy path is fully runnable.

---

## Phase 6: User Story 4 - Edit card details (Priority: P2)

**Goal**: update a card's title/description without touching its position/column.

**Independent Test**: edit a card's title, confirm its column/position are unchanged.

### Tests for User Story 4

- [ ] T067 [P] [US4] `handler.spec.ts` for `UpdateCardHandler` — covers FR-008

### Implementation for User Story 4

- [ ] T068 [US4] `UpdateCardCommand` + `UpdateCardHandler` (touches only `title`/`description`) in
      `src/modules/board/application/commands/update-card/`
- [ ] T069 [P] [US4] Zod DTO for update-card request
- [ ] T070 [US4] `UpdateCardController` — `PATCH /cards/:cardId`, permission `card:edit`
- [ ] T071 [US4] Register route in `routes.ts` and wire into `container.ts`

**Checkpoint**: US4 independently functional alongside US1–US3.

---

## Phase 7: User Story 5 - Assign a card to a member (Priority: P2)

**Goal**: set/unset a card's assignee, validated against workspace membership.

**Independent Test**: assign a workspace member to a card; confirm assigning a non-member is
refused.

### Tests for User Story 5

- [ ] T072 [P] [US5] `handler.spec.ts` for `AssignCardHandler` — covers FR-009 (both the success
      and the `AccountNotWorkspaceMemberError` path)

### Implementation for User Story 5

- [ ] T073 [US5] `AssignCardCommand` + `AssignCardHandler` — checks the assignee's membership via
      the existing `WorkspaceMemberRepository`/`AccountRoleRepository` port from `auth`/
      `workspace` (no new port) in `src/modules/board/application/commands/assign-card/`
- [ ] T074 [P] [US5] Zod DTO for assign-card request (`assigneeAccountId: string | null`)
- [ ] T075 [US5] `AssignCardController` — `PATCH /cards/:cardId/assign`, permission `card:assign`
- [ ] T076 [US5] Register route in `routes.ts` and wire into `container.ts`

**Checkpoint**: US5 independently functional alongside US1–US4.

---

## Phase 8: User Story 6 - Delete a board (Priority: P3)

**Goal**: deleting a board removes its columns and cards in the same transaction.

**Independent Test**: delete a board that has columns/cards, confirm none of them are queryable
afterward.

### Tests for User Story 6

- [ ] T077 [P] [US6] `handler.spec.ts` for `DeleteBoardHandler` using `InMemoryUnitOfWork` (same
      pattern as `RespondToInviteHandler`'s spec) — covers FR-010
- [ ] T078 [US6] `*.e2e.spec.ts`: delete a board with columns/cards, confirm `GetBoard` and column
      queries return not-found afterward

### Implementation for User Story 6

- [ ] T079 [US6] `DeleteBoardCommand` + `DeleteBoardHandler` — deletes board + its columns + their
      cards inside the shared `UnitOfWork` (per `data-model.md` → Relationships) in
      `src/modules/board/application/commands/delete-board/`
- [ ] T080 [US6] `DeleteBoardController` — `DELETE /boards/:boardId`, permission `board:delete`
- [ ] T081 [US6] Register route in `routes.ts` and wire into `container.ts`

**Checkpoint**: all 6 user stories independently functional — feature complete per spec.md.

---

## Phase 9: Polish & Cross-Cutting Concerns

- [ ] T082 [P] Update `docs/api/backend-map.html` to reflect the new `board` module and its
      routes (matches the pattern every closed spec 001–005 already followed)
- [ ] T083 [P] Update `docs/api/roadmap.md` — remove/close the "Missing product" item now that
      `board`/`card` exists
- [ ] T084 Run `pnpm --filter api run lint:fix` and `pnpm --filter api run typecheck` across the
      new module
- [ ] T085 Run `quickstart.md`'s manual happy-path and negative-path scenarios against a local
      `docker compose` stack as a final sanity check

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies.
- **Foundational (Phase 2)**: depends on Setup — blocks every user story phase.
- **US1 (Phase 3)**: depends only on Foundational. No dependency on any other story.
- **US2 (Phase 4)**: depends on Foundational + US1's `Board` existing to attach columns to
  (needs a board to test against, but no US1 *code* dependency — US2's handlers only touch
  `Column`/`Card` ports).
- **US3 (Phase 5)**: depends on Foundational + a column to create cards in (same relationship to
  US2 as US2 has to US1 — data dependency for testing, not a code dependency).
- **US4, US5 (Phases 6–7)**: depend on Foundational + US3's `Card` existing; independent of each
  other.
- **US6 (Phase 8)**: depends on Foundational; independent of US2–US5 code-wise, but most
  meaningfully tested once there's a board with columns/cards to delete (US1–US3).
- **Polish (Phase 9)**: depends on every user story phase being done.

### Parallel Opportunities

- Within Phase 2: T004–T014 (domain/ports/errors) are all `[P]` — different files, no
  cross-dependency. T015 (schema) can run in parallel with those too.
- Within each user story's Tests block: all `[P]`-marked spec files are independent.
- US4 and US5 (Phases 6–7) can be built in parallel by different people once US3 is done.

---

## Implementation Strategy

### MVP first

Phases 1 → 2 → 3 (US1) is the smallest deployable increment: `board:*` RBAC stops being dead
code, boards exist. Stop and validate there before continuing.

### Incremental delivery

1. Setup + Foundational → foundation ready.
2. US1 → board CRUD+list with RBAC → demoable (boards exist, no columns/cards yet).
3. US2 → columns → demoable.
4. US3 → cards + move → **this is the point `quickstart.md`'s full happy path becomes runnable**
   — natural release candidate for the module's core value.
5. US4, US5 → card polish (edit, assign) → can ship independently, in either order.
6. US6 → board delete → ships last, lowest priority (P3) per spec.md.
7. Polish → docs + lint/typecheck + manual quickstart pass.
