# Phase 0 Research: Board & Card Module

All items below were open questions in the old `docs/api/specs/006-board-card-module.md` or
surfaced while turning the spec into a concrete design. None remain as `NEEDS CLARIFICATION`.

## 1. Aggregate boundary: Card as its own aggregate vs. Board owning Column+Card

**Decision**: `Board`, `Column`, and `Card` are each their own aggregate, each with its own
repository. `Card` references `boardId` + `columnId` by id, not by object reference.

**Rationale**: confirmed with the user (spec-kit clarification round before this plan). Moving a
card — the module's highest-frequency write, per the spec's own priority ordering (US3 is P1) —
touches exactly one `cards` row. A single-aggregate design (`Board` owning `Column`+`Card` in
memory) would require loading the entire board (all columns, all cards) to move one card,
getting more expensive as a board grows — the opposite of what a Kanban tool's most common
action should do.

**Alternatives considered**: `Board` as one aggregate containing `Column`+`Card` — rejected for
the reason above; was the non-default option presented to the user and not chosen.

## 2. Ordering strategy: fractional position vs. sequential integer vs. lexorank string

**Decision**: fractional `position` (`double precision`). Inserting between two siblings sets
`position = (before.position + after.position) / 2`. Appending to the end sets
`position = last.position + 1` (or `1` if the list is empty).

**Rationale**: confirmed with the user. Avoids renumbering every sibling on a single reorder —
the sequential-integer alternative would require a write per shifted sibling on every move,
which is worse exactly on the operation the spec prioritizes (US3, card move, P1). Simpler to
implement and reason about than a lexorank string scheme (no base-N string arithmetic, no
alphabet-exhaustion edge case at the string level) while keeping the same core benefit
(no mass renumbering).

**Known limitation, deliberately not solved in v1**: repeated inserts between the same two
neighbors can eventually exhaust `double` precision (in practice this requires very many
successive inserts at the same spot — not a v1-scale concern per the spec's Scale/Scope).
No automatic rebalancing job is built now; if it's ever needed, the fix is a maintenance
operation that reassigns sequential-then-spread positions for one column/board, done later, out
of this feature's scope.

**Alternatives considered**: sequential integer position (rejected — mass-renumber cost cited
above); lexorank/fractional string (rejected — same core benefit as the double-precision
approach at higher implementation complexity, no precedent in this codebase, no proven need for
its extra headroom at current scale).

## 3. Concurrency on MoveCard: how "two clients moving the same card at once" is handled

**Decision**: a plain, unconditional `UPDATE cards SET column_id = $1, position = $2 WHERE id =
$3` — no optimistic locking (no `version` column), no explicit row lock, no application-level
retry.

**Rationale**: re-reading the actual requirement (spec FR-006/SC-003): "the card ends up in a
single valid, consistent position — never lost, never duplicated across two columns at once." A
single-row `UPDATE` in Postgres is already atomic — two concurrent updates to the same row
serialize at the storage layer; whichever commits last determines the final `column_id`/
`position`, and there is no partial write that could leave the card duplicated across columns or
deleted. This satisfies the requirement as written without adding a concurrency-control pattern
(optimistic locking / version columns) that doesn't exist anywhere else in this codebase today —
introducing one for a single use case would be new surface area to maintain for a guarantee the
plain atomic update already provides.

**Alternatives considered**: optimistic locking via a `version` column (rejected — solves
"last-write-wins is surprising to the loser," which the spec doesn't require; would be the first
use of this pattern in the repo, no established convention to follow) — `SELECT ... FOR UPDATE`
inside a transaction (rejected — same atomicity outcome as a plain `UPDATE` for a single-row
change, adds a transaction + lock for no additional guarantee here).

## 4. Column reorder: bulk endpoint vs. single-column move

**Decision**: one endpoint that repositions a single column at a time (`PATCH /columns/:id`
accepting a new `position`), not a bulk "send the whole new order" endpoint.

**Rationale**: fractional positioning makes a single-item move a one-row write, matching how
drag-and-drop UIs already operate (one item moved per user action) and mirroring `MoveCard`'s
shape. A bulk endpoint would need to accept and validate an entire ordered list, adding surface
area the fractional-position approach exists specifically to avoid.

**Alternatives considered**: bulk `ReorderColumns` (array of `{columnId, position}`) — rejected,
redundant with single-column move under fractional positioning; kept as a documented
non-decision, not built.

## 5. GetBoard response shape

**Decision**: `GetBoard` returns the board together with its columns and their cards in one
response (not three separate round trips).

**Rationale**: avoids an N+1 client-side fetch pattern (board → each column → each column's
cards) for what is the module's primary read (viewing a board). No spec requirement blocks this;
it's the reasonable default for a Kanban board view.

**Alternatives considered**: separate `ListColumns`/`ListColumnCards` queries — not built for v1;
`GetBoard`'s single nested response covers the only read scenario the spec's user stories
require (US1 "view a board").
