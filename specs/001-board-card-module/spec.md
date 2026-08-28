# Feature Specification: Board & Card Module (Kanban core)

**Feature Branch**: `001-board-card-module`

**Created**: 2026-08-28

**Status**: Draft

**Origin**: Migrated from `docs/api/specs/006-board-card-module.md` (status "Proposto",
never implemented) and `docs/api/roadmap.md` → "Produto ausente" section. The old spec stays as
historical record; this document is the active version going forward.

**Input**: User description: "Board & Card module (Kanban core) in apps/api — `src/modules/`
today only has account/auth/workspace/notifications; the `board:*`/`card:*` permission keys
already exist in RBAC (`ROLE_PERMISSION_MAP`) but protect no real route yet."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and view a board with RBAC (Priority: P1)

An account with the `board:create` permission, a member of a workspace, creates a board tied to
that workspace and can view it. An account that is not a member of the workspace cannot create,
view, edit, or delete any board belonging to that workspace.

**Why this priority**: without it there's no product at all — it's the entry point everything
else builds on, and it's where the `board:*` RBAC (dead code today) protects a real route for
the first time.

**Independent Test**: can be tested alone by creating a board with a member account and
confirming a second, non-member account is blocked from accessing it — delivers value even
before any column or card exists.

**Acceptance Scenarios**:

1. **Given** an account that is a workspace member with `board:create`, **When** it creates a
   board with a name, **Then** the board is persisted tied to that `workspaceId` and returned
   with its data.
2. **Given** an existing board in a workspace, **When** an account that is a member of that
   workspace queries the board, **Then** the board's data is returned.
3. **Given** a workspace with multiple boards, **When** a member of that workspace lists the
   workspace's boards, **Then** every board belonging to that workspace is returned.
4. **Given** an existing board, **When** a member of that board's workspace renames it, **Then**
   the new name is persisted.
5. **Given** an existing board in a workspace, **When** an account that is not a member of that
   workspace tries to create, view, edit, or delete that board, **Then** the operation is
   refused and no board data is returned.

---

### User Story 2 - Organize columns within a board (Priority: P1)

Within an existing board, create named columns with an explicit ordering position, and
reposition a column relative to its siblings.

**Why this priority**: a board with no columns isn't usable as a Kanban board — it's the
minimum structure that makes creating cards meaningful.

**Independent Test**: can be tested by creating two columns on a board and reordering them,
verifying the new order is persisted and reflected on a subsequent query — doesn't depend on any
card existing.

**Acceptance Scenarios**:

1. **Given** an existing board, **When** an authorized account creates a column with a name,
   **Then** the column is persisted tied to the board, with an ordering position.
2. **Given** a board with two or more columns, **When** an authorized account repositions a
   column, **Then** the new order is persisted and reflected in future queries of the board.
3. **Given** an existing column, **When** an authorized account deletes it, **Then** the column
   and any cards it contains no longer appear in the board.

---

### User Story 3 - Create and move cards between columns (Priority: P1)

An account with `card:create` creates a card in a column (default position: end of the column,
reorderable). An account with `card:move` moves a card to another column and/or another
position, with the new position persisted consistently even under concurrent edits.

**Why this priority**: creating and moving cards is the central action of any Kanban tool —
without it, boards and columns are just empty structure.

**Independent Test**: can be tested by creating a card in a column and moving it to another
column of the same board, verifying the final position is consistent — testable end-to-end
alongside US1/US2, or standalone assuming a board/columns already exist.

**Acceptance Scenarios**:

1. **Given** an existing column, **When** an account with `card:create` creates a card with a
   title, **Then** the card is persisted at the end of the column, with an explicit position.
2. **Given** an existing card in a column, **When** an account with `card:move` moves the card to
   another column of the same board and/or another position, **Then** the new position is
   persisted.
3. **Given** two clients moving the same card concurrently (a race), **When** both requests are
   processed, **Then** the card ends up in a single valid, consistent position — never lost, never
   duplicated across two columns at once.
4. **Given** an existing card, **When** an account tries to move that card into a column that
   belongs to a different board, **Then** the operation is refused (v1 does not allow moving a
   card between different boards).
5. **Given** an existing card, **When** an authorized account deletes it, **Then** the card no
   longer appears in its column.

---

### User Story 4 - Edit card details (Priority: P2)

An account with `card:edit` updates a card's title/description without affecting its position or
column.

**Why this priority**: important for real day-to-day use of the board, but the board is already
functional (create, move) without it — hence P2, not P1.

**Independent Test**: can be tested by editing an existing card's title and confirming its
column and position stay unchanged.

**Acceptance Scenarios**:

1. **Given** an existing card, **When** an account with `card:edit` updates title and/or
   description, **Then** the change is persisted and the card's position/column stays the same.

---

### User Story 5 - Assign a card to a member (Priority: P2)

An account with `card:assign` sets a card's assignee, validating that the assignee is a member of
the same workspace as the board.

**Why this priority**: useful for assigning work, but doesn't block basic board usage — hence
P2.

**Independent Test**: can be tested by assigning a workspace member to a card and confirming an
account outside the workspace cannot be assigned.

**Acceptance Scenarios**:

1. **Given** an existing card and an account that is a member of the same workspace as the
   board, **When** an account with `card:assign` sets that account as the assignee, **Then** the
   assignment is persisted.
2. **Given** an existing card and an account that is not a member of the board's workspace,
   **When** an account tries to assign it as the responsible party, **Then** the operation is
   refused.

---

### User Story 6 - Delete a board (Priority: P3)

Deleting a board removes (or archives) its columns and cards along with it.

**Why this priority**: a maintenance operation, doesn't block day-to-day board use — hence P3.

**Independent Test**: can be tested by deleting a board that has columns and cards and
confirming a subsequent query no longer returns the board or its contents.

**Acceptance Scenarios**:

1. **Given** a board with columns and cards, **When** an authorized account deletes the board,
   **Then** the board no longer appears in queries, along with its columns and cards.

---

### Edge Cases

- Two clients move the same card concurrently (see US3, scenario 3).
- Deleting a board that still has cards (see US6).
- An account that is not a workspace member attempts any board/column/card operation on that
  workspace (see US1, scenario 3).
- Attempting to move a card into a column belonging to a different board (see US3, scenario 4).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST persist a board tied to the `workspaceId` of the workspace it belongs
  to, when created by a member account with the `board:create` permission.
- **FR-002**: System MUST refuse any attempt to create, view, edit, or delete a board by an
  account that is not a member of that board's workspace.
- **FR-003**: System MUST allow creating columns within a board, each with a name and an explicit
  ordering position.
- **FR-004**: System MUST allow reordering a board's columns, persisting the new order.
- **FR-005**: System MUST allow creating a card within a column, positioning it at the end of the
  column by default, with an explicit position.
- **FR-006**: System MUST allow moving a card to another column of the same board and/or another
  position, persisting the new position consistently even under concurrent moves of the same
  card.
- **FR-007**: System MUST refuse moving a card into a column that belongs to a board different
  from the card's current board.
- **FR-008**: System MUST allow updating a card's title and/or description without changing its
  column or position.
- **FR-009**: System MUST allow assigning a responsible party (assignee) to a card, validating
  that the assignee is a member of the board's workspace before persisting the assignment.
- **FR-010**: System MUST, when a board is deleted, remove (or archive) all its columns and cards
  along with it.
- **FR-011**: System MUST allow a workspace member to list every board belonging to that
  workspace.
- **FR-012**: System MUST allow deleting a column, removing (or archiving) any cards it contains
  along with it.
- **FR-013**: System MUST allow deleting a card individually, independent of its board or
  column being deleted.
- **FR-014**: System MUST allow a workspace member to rename an existing board.

### Key Entities *(data involved)*

- **Board**: a Kanban board, belongs to a workspace (`workspaceId`); has a name.
- **Column**: a board's column (`boardId`); has a name and an ordering position, reorderable.
- **Card**: a unit of work within a column (`columnId`); has a title, description, an ordering
  position within the column, and an optional assignee — at most one per card in v1.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A member account can complete the flow create board → create column → create card
  → move card between columns without error, end to end.
- **SC-002**: No operation (create, view, edit, delete) performed by an account that is not a
  workspace member returns any board, column, or card data belonging to that workspace.
- **SC-003**: Under two concurrent requests moving the same card, the card ends up in a single
  valid position — never lost, never duplicated across two columns at once.
- **SC-004**: 100% of this module's routes enforce their corresponding RBAC permission
  (`board:*`/`card:*`) — no new route ships unprotected (closes the "dead code" RBAC item
  currently tracked in the roadmap).

## Assumptions

- No work-in-progress (WIP) limit per column in v1.
- No labels/tags, due dates, attachments, checklists, or card comments in v1.
- At most one assignee per card in v1 (not a many-to-many relationship).
- No real-time updates (WebSocket/SSE) — same decision already recorded as consciously deferred
  in `docs/api/roadmap.md`; polling-based queries, same as the rest of the product today.
- No board templates or multiple views (swimlane, calendar) beyond plain columns in v1.
- No cross-board card search/filter in v1.
- A card only moves between columns of the same board in v1 — moving between different boards is
  explicitly refused (FR-007), not supported.

## Clarifications

### Session 2026-08-28

- Q: Who can see a board within a workspace? → A: **Every workspace member sees every board in
  that workspace** — no private/per-member board concept in v1. Keeps the same visibility model
  already used by the rest of the product (workspace as the isolation unit) and avoids
  introducing a new permission tier before there's real demand for it.
- Q: Is there a limit on how many boards a workspace can have? → A: **No limit in v1.** The
  domain already mentions "subscription plans", but no billing module exists yet — tying a limit
  to a nonexistent plan would be anticipating another module's decision. Revisit once a billing
  module exists.
- Q: Is deleting a board a hard delete (cascade) or a soft delete/archive? → A: **Hard delete,
  cascading, in v1** (board, columns, and cards permanently removed). Consistent with the pattern
  already used by `workspaces` today, which also has no soft delete — introducing soft delete
  only for `board` would create a pattern inconsistency without proven need yet.
