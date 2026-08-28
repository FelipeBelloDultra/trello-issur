# Quickstart: Board & Card Module

Validates the feature end to end (spec SC-001) once implemented. Assumes local infra is already
up and you have an authenticated account that's a member of a workspace (see `apps/api/README.md`
→ "Running locally" if not).

## Prerequisites

```sh
docker compose --env-file apps/api/.env up -d   # brings up infra + http/queue/nginx, port 3000
pnpm --filter api run db:migrate                 # after this feature's migration is generated
```

An `access_token` for an account that's a member of some `<workspaceId>` (via `POST
/auth/login`).

## Happy path

```sh
# 1. Create a board
curl -sX POST localhost:3000/workspaces/<workspaceId>/boards \
  -H "Authorization: Bearer <access_token>" -H "Content-Type: application/json" \
  -d '{"name":"Sprint 1"}'
# → 201, note the returned board id as <boardId>

# 2. Create two columns
curl -sX POST localhost:3000/boards/<boardId>/columns \
  -H "Authorization: Bearer <access_token>" -H "Content-Type: application/json" \
  -d '{"name":"To Do"}'
# → 201, note id as <columnAId>
curl -sX POST localhost:3000/boards/<boardId>/columns \
  -H "Authorization: Bearer <access_token>" -H "Content-Type: application/json" \
  -d '{"name":"Done"}'
# → 201, note id as <columnBId>

# 3. Create a card in the first column
curl -sX POST localhost:3000/columns/<columnAId>/cards \
  -H "Authorization: Bearer <access_token>" -H "Content-Type: application/json" \
  -d '{"title":"Write quickstart"}'
# → 201, note id as <cardId>

# 4. Move the card to the second column
curl -sX PATCH localhost:3000/cards/<cardId>/move \
  -H "Authorization: Bearer <access_token>" -H "Content-Type: application/json" \
  -d '{"columnId":"<columnBId>","index":0}'
# → 200

# 5. View the board — the card must now show under "Done"
curl -s localhost:3000/boards/<boardId> -H "Authorization: Bearer <access_token>"
# → 200, columns[1].cards contains the card
```

## Negative path (SC-002 — non-member isolation)

Repeat step 5 with a token for an account that is **not** a member of `<workspaceId>` — must get
`403`/`404`, no board data in the response body.

## Automated equivalent

This flow is what the feature's `*.e2e.spec.ts` (see `tasks.md` once generated) exercises against
a real Postgres schema — this document is for manual/local verification, not a substitute for
that test.
