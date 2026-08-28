# Roadmap — apps/api

Companion to [`backend-map.html`](./backend-map.html) (snapshot of the current state). This
document is the next step: **what to prioritize**, **which flows are still incomplete**, and
**where to go next**. Compiled by reading the source code, no inference.

## Summary

What exists today is a mature account/workspace/RBAC/notifications infrastructure — JWT+Valkey
auth, outbox pattern (now covering 100% of publish-after-write, see "Done" below), staged retry
with dead-letter (idempotent and authenticated), cache-aside with active invalidation, circuit
breaker. Specs 001–005 (all the small/isolated debt identified in this sweep) implemented,
tested, and merged — see the "Done" section for what each one closed. What **doesn't exist yet**
is the product itself: `apps/api/src/modules/` only has `account`, `auth`, `workspace`, and
`notifications`. There's no `board` or `card` module. The `board:create/edit/delete` and
`card:create/edit/delete/move/assign` permission keys
(`src/modules/auth/domain/value-objects/permission-key.ts`) are already in the RBAC registry, but
protect no real route — it's RBAC ready for a feature that hasn't been built yet. With the small
debt closed, the item defining the next work cycle is board/card (spec 001 in the spec-kit flow,
formerly spec 006).

## Priorities

### Missing product

- **The `board`/`card` module doesn't exist.** Without it, `board:*`/`card:*` RBAC is dead code
  and the product lacks its core function (it's a Kanban with no board). Not a bug to fix — a
  scope decision to make before starting (see
  [spec-kit spec 001](../../specs/001-board-card-module/spec.md)).

## Done

Specs 001–005 — implemented, tested (unit + e2e), and merged into `main` via PRs #10–#14
(stacked). Full requirement/design detail in each spec file (marked `Status: Done` in the
header).

- **[001](./specs/001-secure-queue-admin-routes.md) — Authenticate queue routes.**
  `GET /queue/dead-letters` and `POST /queue/dead-letters/:id/replay` require the
  `x-internal-token` header (an operational secret, `QUEUE_ADMIN_TOKEN`), not product login.
- **[002](./specs/002-rbac-cache-invalidation.md) — Active RBAC cache invalidation.**
  `UpdateWorkspaceMemberRoleHandler` and `RemoveWorkspaceMemberHandler` now call
  `AccountRoleCacheRepository.invalidate()` before returning success — a role change/removal
  reflects on the next authorization check, without waiting for the 5 min TTL. The cache
  adapter also now fails open (log + proceed) instead of propagating a Valkey error.
- **[003](./specs/003-close-invite-rejection-flow.md) — Close invite rejection.**
  `reject()` mirrors `accept()`: atomic write via `UnitOfWork` + `workspace-invite.rejected`
  outbox event + `WorkspaceInviteRejectedConsumer` notifying the inviter.
- **[004](./specs/004-dead-letter-replay-idempotency.md) — Idempotency on replay.**
  Replay now publishes with a deterministic key (`replay:<event.id>`) instead of a fresh one on
  every call — two calls for the same event (a race or a double click) no longer duplicate the
  side effect.
- **[005](./specs/005-align-invite-permission-key.md) — Align invite permission.**
  `InviteMemberController` requires `workspace:invite` (Option A) instead of `workspace:manage`
  — `member` already had that permission in `ROLE_PERMISSION_MAP` and it's now actually
  enforced.

Side effect of these specs: the `CLAUDE.md` note about handlers still pending migration to the
outbox was corrected (all 3 handlers that publish events — `CreateAccountHandler`,
`InviteMemberHandler`, `RespondToInviteHandler` — already go through the outbox, no exception
left).

### Minor debt / coverage still open

- `CreateAccountController`: the `default` branch of the error switch does a raw
  `throw new Error()` instead of a structured `HttpException`. Dead code today (only 1 possible
  error exists), but a trap for the next `left` added without updating the controller.
- The invite flow's e2e coverage today only covers create → **reject** (spec 003). Create →
  **accept** still has no dedicated e2e, only unit specs with in-memory repositories.

## Suggested next steps

1. **Size and start the `board` module** (via the `new-module` skill already available in the
   repo) — it's the biggest roadmap item, so it deserves discussion on its own before coding:
   boards, columns, cards, WIP limits, ordering/drag-and-drop, who can see what (the
   `board:*`/`card:*` RBAC already exists and is waiting for this). Don't assume scope here —
   see [spec-kit spec 001](../../specs/001-board-card-module/spec.md), already drafted.
2. **Residual coverage/cleanup** — e2e for the create→accept invite flow, fix the raw
   `throw new Error()` in `CreateAccountController`. Low risk, can be interleaved with the item
   above; neither generates its own spec (too trivial, see `specs/README.md`).

## Consciously deferred

- **Real-time notifications** (WebSocket/SSE) — today it's just polling via
  `GET /notifications`. Not debt, it's a new feature; worth waiting for real usage to know if
  the complexity pays off.
- **Calibrating circuit breaker thresholds** (`CIRCUIT_BREAKER_*`) against real traffic — the
  current values are conservative by design; calibrating without real traffic would be
  guesswork.
