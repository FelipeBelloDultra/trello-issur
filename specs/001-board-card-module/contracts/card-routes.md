# HTTP Contracts: Card routes

Same auth/membership pattern as `board-routes.md`. `card:*` permission keys (`create/edit/
delete/move/assign`) already exist in the RBAC registry, granted per role — this feature is what
finally enforces them.

## `POST /columns/:columnId/cards`

**Permission**: `card:create`
**Command**: `CreateCardCommand`

Request: `{ title: string, description?: string }`
Response `201`: `{ id, columnId, boardId, title, description, position }`
Errors: `401`, `403`, `404` (column not found), `422` (empty title)

## `PATCH /cards/:cardId`

**Permission**: `card:edit`
**Command**: `UpdateCardCommand`

Request: `{ title?: string, description?: string }` (at least one present) — never touches
`columnId`/`position` (FR-008).
Response `200`: `{ id, title, description, updatedAt }`
Errors: `401`, `403`, `404` (card not found), `422` (empty title if provided)

## `PATCH /cards/:cardId/move`

**Permission**: `card:move`
**Command**: `MoveCardCommand`

Request: `{ columnId: string, index: number }` (zero-based position within the destination
column's card list, excluding the card being moved — server computes the fractional position
via `Position.between()`, see `research.md` §6)
Response `200`: `{ id, columnId, position, updatedAt }`
Errors: `401`, `403`, `404` (card or target column not found), `409`
(`ColumnNotInBoardError` — target column belongs to a different board, FR-007)

## `PATCH /cards/:cardId/assign`

**Permission**: `card:assign`
**Command**: `AssignCardCommand`

Request: `{ assigneeAccountId: string | null }` (`null` unassigns)
Response `200`: `{ id, assigneeAccountId, updatedAt }`
Errors: `401`, `403`, `404` (card not found), `409`
(`AccountNotWorkspaceMemberError` — assignee isn't a member of the board's workspace, FR-009)

## `DELETE /cards/:cardId`

**Permission**: `card:delete`
**Command**: `DeleteCardCommand`

Response `204`
Errors: `401`, `403`, `404`
