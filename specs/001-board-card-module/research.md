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

## 6. Who computes the move target position — client or server?

**Decision**: the server computes the fractional position. `MoveCardDto`/`MoveColumnDto` carry
a zero-based `index: number` (position within the destination list, not a fractional value) —
`MoveCardHandler`/`MoveColumnHandler` fetch the destination list (via
`CardRepository.findAllByColumnId`/`ColumnRepository.findAllByBoardId`, both already ordered by
position), exclude the item being moved from that list, resolve the neighbors at `index - 1`
and `index`, and call `Position.between(before, after)` themselves.

**Rationale**: confirmed with the user after a process failure — the original DTO shape
(`{ columnId, position: number }`, client sends the already-computed float) was decided
unilaterally while writing `/speckit-plan`'s contracts, never surfaced as a decision, and left
`Position.between()` as dead code (see this section's history below). Revisited properly:
fractional positioning is a persistence/ordering strategy — domain logic — not something a
client should have to compute. Sending a raw float leaks that internal representation across
the API boundary and forces every client (web today, any future consumer) to reimplement the
midpoint math. `index` matches what drag-and-drop UI libraries already emit on drop (destination
index in the reordered list), so the client needs no translation either. Computing server-side
also reads the current neighbor positions at write time, not whatever the client's view was at
render time — one less source of staleness.

**Alternatives considered**: anchor-based (`afterCardId: string | null`) — more resistant to an
index shifting under a concurrent insert than a raw index, but requires the client to track a
specific sibling id rather than a visual position; rejected for v1 as more complexity than the
scale here needs. Client-computed float (original, undocumented default) — rejected per the
rationale above.

**History**: this was originally an undisclosed decision baked into the DTO shape during
`/speckit-plan`, not caught by that command's Constitution Check nor by `/speckit-analyze`.
Discovered post-implementation when `Position.between()` turned up as an unused, untested public
method. Reopened as a proper `NEEDS CLARIFICATION` item and resolved here before changing any
code, instead of rationalizing what was already built.

## 7–9. Retroactively documented decisions

The three items below were the same failure as §6 — a request-shape choice made silently while
writing `contracts/` during `/speckit-plan`, never surfaced for confirmation — but, unlike §6,
none left a code defect (no dead method, no unused branch) and each is a widely-used REST idiom
with a single reasonable default. Registered here after the fact, on request, to close the
process gap rather than leave them silently undocumented like §6 was. None were re-opened for
discussion before writing this — if any should have been, that's still open to revisit.

### 7. `PATCH /columns/:columnId` merges rename and reposition into one endpoint

**Decision**: one endpoint, partial body (`{ name?, index? }`, at least one required) handles
both renaming a column and repositioning it, rather than two separate endpoints/routes.

**Rationale**: both are single-column, single-permission (`board:edit`) operations on the same
resource; a partial-update `PATCH` accepting either or both fields is the standard REST shape
for "update this resource's mutable fields" and avoids two near-identical controllers/routes for
one entity. Matches `UpdateCard`'s same merge (§8) for consistency within the module.

**Alternatives considered**: separate `PATCH /columns/:columnId/rename` and
`PATCH /columns/:columnId/position` — rejected, no behavioral or authorization difference between
the two operations that would justify splitting the route.

### 8. `PATCH /cards/:cardId` merges title and description into one endpoint

**Decision**: one endpoint, partial body (`{ title?, description? }`, at least one required),
same shape as §7.

**Rationale**: same as §7 — both fields belong to the same resource, same permission
(`card:edit`), no reason to force two round-trips for what's conceptually one "edit this card's
details" action.

**Alternatives considered**: none seriously — this is the default partial-update shape used by
every other single-resource `PATCH` in this codebase (e.g. `UpdateWorkspaceAvatarController`
mirrors the same pattern for its own field).

### 9. `PATCH /cards/:cardId/assign` uses `assigneeAccountId: null` to unassign

**Decision**: one endpoint handles both assigning and unassigning; sending `null` clears the
assignee instead of a separate `DELETE`-style "unassign" route.

**Rationale**: assign/unassign are the same underlying state transition (set-or-clear one
nullable field, `Card.assignTo(accountId | null)` already models it that way in the domain
entity) — a `null`-accepting `PATCH` is the common REST idiom for "set or clear this optional
relationship" and avoids a second route with near-duplicate authorization/lookup logic for the
inverse of the same operation.

**Alternatives considered**: separate `DELETE /cards/:cardId/assign` for unassigning — rejected,
would duplicate `card:assign` permission checks and card lookup across two controllers for what
is a single field mutation.
