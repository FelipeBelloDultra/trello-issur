# HTTP Contracts: Board routes

All routes require `AuthMiddleware` + `AuthorizeMiddleware([<permission>])` + a workspace/board
membership check (same pattern as `workspace` routes) — a non-member gets `403`/`404` with no
board data, per FR-002. Request/response bodies are illustrative field lists, not full JSON
Schema — exact Zod DTOs are written during `/speckit-implement`, following `new-http-endpoint`'s
pattern.

## `POST /workspaces/:workspaceId/boards`

**Permission**: `board:create`
**Command**: `CreateBoardCommand`

Request: `{ name: string }`
Response `201`: `{ id, workspaceId, name, createdAt }`
Errors: `401`, `403` (not a member / missing permission), `422` (empty name)

## `GET /workspaces/:workspaceId/boards`

**Permission**: no dedicated `board:view` key exists in the current RBAC registry (only
`create/edit/delete`) — this route relies on the workspace-membership check alone, same as
`list-my-workspaces`.
**Query**: `ListWorkspaceBoardsQuery`

Response `200`: `{ boards: [{ id, name, createdAt }] }`
Errors: `401`, `403` (not a member)

## `GET /boards/:boardId`

**Permission**: workspace-membership check only (read).
**Query**: `GetBoardQuery`

Response `200`: `{ id, workspaceId, name, columns: [{ id, name, position, cards: [{ id, title, description, position, assigneeAccountId }] }] }`
Errors: `401`, `403`/`404` (not a member of the board's workspace)

## `PATCH /boards/:boardId`

**Permission**: `board:edit`
**Command**: `RenameBoardCommand`

Request: `{ name: string }`
Response `200`: `{ id, name, updatedAt }`
Errors: `401`, `403`, `404` (board not found), `422` (empty name)

## `DELETE /boards/:boardId`

**Permission**: `board:delete`
**Command**: `DeleteBoardCommand`

Response `204`
Errors: `401`, `403`, `404`

## `POST /boards/:boardId/columns`

**Permission**: `board:edit` (columns are board structure, not a separate permission key in the
current registry)
**Command**: `CreateColumnCommand`

Request: `{ name: string }`
Response `201`: `{ id, boardId, name, position }`
Errors: `401`, `403`, `404` (board not found), `422` (empty name)

## `PATCH /columns/:columnId`

**Permission**: `board:edit`
**Command**: `MoveColumnCommand` (also handles rename — same endpoint, partial body)

Request: `{ name?: string, index?: number }` (at least one present) — `index` is zero-based
position within the board's column list, excluding the column being moved; server computes the
fractional position via `Position.between()` (see `research.md` §6)
Response `200`: `{ id, name, position, updatedAt }`
Errors: `401`, `403`, `404` (column not found), `422` (empty name if provided)

## `DELETE /columns/:columnId`

**Permission**: `board:edit`
**Command**: `DeleteColumnCommand`

Response `204`
Errors: `401`, `403`, `404`
