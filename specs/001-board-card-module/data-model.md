# Phase 1 Data Model: Board & Card Module

Three aggregates (see `research.md` §1), each its own Drizzle table. All PKs are UUID v7,
generated application-side via `UniqueEntityID` (Constitution Principle VI) — no
`gen_random_uuid()` default. No Postgres enum (Principle VI) — no status-like field exists on
these entities in v1, so this doesn't come up, but noted for any future field.

## Board

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` (PK) | UUID v7, app-generated |
| `workspace_id` | `uuid` (FK → `workspaces.id`) | Not nullable — every board belongs to exactly one workspace (spec FR-001) |
| `name` | `text` | Validated by the `BoardName` value object (non-empty, max length — mirrors the existing `WorkspaceName` VO's shape) |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

Domain rule: `BoardName` non-empty on `create()`/`rename()` — throws `BoardNameEmptyError`
(`DomainError`) otherwise.

## Column

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` (PK) | UUID v7, app-generated |
| `board_id` | `uuid` (FK → `boards.id`) | Not nullable |
| `name` | `text` | Validated by `ColumnName` VO (non-empty) |
| `position` | `double precision` | Fractional position within the board (see `research.md` §2) |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

Index: `(board_id, position)` — every column list/reorder query filters by `board_id` and orders
by `position`.

## Card

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` (PK) | UUID v7, app-generated |
| `column_id` | `uuid` (FK → `columns.id`) | Not nullable. Changed by `MoveCard` |
| `board_id` | `uuid` (FK → `boards.id`) | Denormalized copy of the owning column's board — see rationale below |
| `title` | `text` | Validated by `CardTitle` VO (non-empty) |
| `description` | `text`, nullable | No validation beyond presence/absence — free text |
| `position` | `double precision` | Fractional position within the column (see `research.md` §2) |
| `assignee_account_id` | `uuid` (FK → `accounts.id`), nullable | At most one assignee (spec Assumptions) — must be a member of the board's workspace (FR-009), checked at the application layer, not a DB constraint |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

Index: `(column_id, position)` — column view/reorder queries filter by `column_id`, order by
`position`.

**Why `board_id` is denormalized onto `Card`:** `Card` is its own aggregate (research.md §1) and
must reject moving into a column belonging to a different board (FR-007) without loading the
`Board`/`Column` aggregate to find out. Storing `board_id` directly on the card lets
`MoveCard`'s handler validate "target column's board matches this card's board" with two
single-row reads (`Card`, target `Column`) instead of a join through `Column`. Kept in sync by
the `MoveCard` handler whenever `column_id` changes (set together from the resolved target
column's `board_id`, never independently).

## Relationships

```
Workspace (existing) 1───* Board 1───* Column 1───* Card
                                                     │
                                    Account (existing, nullable, existing FK target)
```

- A `Board` cannot outlive its `Workspace` reference conceptually, but there's no DB-level
  `ON DELETE CASCADE` from `workspaces` → `boards` in v1 — workspace deletion is out of this
  feature's scope (not a flow that exists in the product today).
- Deleting a `Board` (FR-010) cascades to its `Column`s and their `Card`s, in the same
  transaction, via the shared `UnitOfWork` (not a DB-level `ON DELETE CASCADE`, to keep the
  delete going through the same repository/domain-event path as everything else in this
  codebase — matches how the rest of the app avoids relying on DB-level cascade for
  domain-significant deletes).

## Validation summary (maps to spec Functional Requirements)

| Rule | Enforced by | Spec FR |
|---|---|---|
| Board must belong to a workspace the creator is a member of | `CreateBoardHandler` (application) via `ValidateWorkspaceMiddleware`-equivalent check | FR-001, FR-002 |
| Non-member cannot create/view/edit/delete/list boards of a workspace | HTTP middleware chain (`AuthorizeMiddleware` + workspace-membership check), same pattern as `workspace` routes | FR-002, FR-011 |
| Column/card name/title non-empty | Domain VOs (`ColumnName`, `CardTitle`) | FR-003, FR-005 |
| New card defaults to end of column | `CreateCardHandler` computes `position = last.position + 1` (or `1`) | FR-005 |
| Card move persists consistently under concurrency | Plain atomic `UPDATE` (research.md §3) | FR-006 |
| Card cannot move into a column of a different board | `MoveCardHandler` compares `card.boardId` to target `Column.boardId` — `ColumnNotInBoardError` if mismatched | FR-007 |
| Editing a card doesn't change position/column | `UpdateCardHandler` only touches `title`/`description` | FR-008 |
| Assignee must be a workspace member | `AssignCardHandler` checks via `AccountRoleRepository`/`WorkspaceMemberRepository` (existing `auth`/`workspace` ports) — `AccountNotWorkspaceMemberError` otherwise | FR-009 |
| Deleting a board removes its columns/cards | `DeleteBoardHandler` via `UnitOfWork` | FR-010 |
| Deleting a column removes its cards | `DeleteColumnHandler` via `UnitOfWork` | FR-012 |
| Card deletable independent of board/column | `DeleteCardHandler` | FR-013 |
| Board renameable | `RenameBoardHandler` | FR-014 |
