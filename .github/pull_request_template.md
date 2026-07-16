## Summary

<!-- One or two sentences: what changed and why. Link the issue/ticket if there is one. -->

## Type of change

- [ ] `feat` — new capability
- [ ] `fix` — bug fix (routine, not urgent)
- [ ] `bugfix` — **critical** fix (active incident, security vulnerability, or data loss/corruption)
- [ ] `refactor` — restructuring, no behavior change
- [ ] `chore` — tooling/infra/config, no behavior change
- [ ] `lint` — pure style/formatting, no logic touched
- [ ] `test` — test-only change, no production code touched
- [ ] `docs` — documentation only
- [ ] `perf` — performance improvement, no behavior change

## Scope

<!-- Module(s) touched: an apps/api module (workspace, account, notifications, infra, bus, ...)
     and/or an apps/web FSD slice (entities/<x>, features/<x>, pages/<x>) -->

## Checklist

<!-- Delete whichever block doesn't apply — most PRs touch only one app.
     A change to packages/* (shared eslint/prettier/typescript config) affects both; keep both blocks then. -->

**apps/api:**
- [ ] `pnpm --filter api run typecheck` passes
- [ ] `pnpm --filter api run lint:check` passes
- [ ] `pnpm --filter api run test` passes (unit/integration)
- [ ] `pnpm --filter api run test:e2e` passes, if HTTP/DB/queue behavior changed
- [ ] Domain/application/infra boundaries respected (no infra types leaking into domain/application, no direct handler calls bypassing the bus)
- [ ] Errors modeled per the three-tier strategy (`DomainError` / `Either<UseCaseError, T>` / `HttpException`), not thrown as raw `Error`
- [ ] If this touches an existing DB column (rename, `NOT NULL`, type change): uses expand/contract, not a single breaking migration
- [ ] If this adds/changes a queue consumer: idempotent, staged retry preserved
- [ ] If this changes an event payload or public API shape: additive/backward-compatible, not breaking

**apps/web:**
- [ ] `pnpm --filter web run typecheck` passes
- [ ] `pnpm --filter web run lint:check` passes
- [ ] `pnpm --filter web run lint:fsd` passes (Feature-Sliced Design layer boundaries)

## Test plan

<!-- How was this verified? Manual steps, new/updated specs, etc. -->

## Notes for reviewers

<!-- Anything deliberately deferred, known trade-offs, or follow-up work. Optional. -->
