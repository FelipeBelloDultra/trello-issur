## Summary

<!-- One or two sentences: what changed and why. Link the issue/ticket if there is one. -->

## Type of change

- [ ] `feat` — new capability
- [ ] `fix` — bug fix
- [ ] `chore` — tooling/infra/config, no behavior change

## Scope

<!-- Module(s) touched, e.g. workspace, account, notifications, infra, bus -->

## Checklist

- [ ] `pnpm run typecheck` passes
- [ ] `pnpm run lint:check` passes
- [ ] `pnpm run test` passes (unit/integration)
- [ ] `pnpm run test:e2e` passes, if HTTP/DB/queue behavior changed
- [ ] Domain/application/infra boundaries respected (no infra types leaking into domain/application, no direct handler calls bypassing the bus)
- [ ] Errors modeled per the three-tier strategy (`DomainError` / `Either<UseCaseError, T>` / `HttpException`), not thrown as raw `Error`
- [ ] If this touches an existing DB column (rename, `NOT NULL`, type change): uses expand/contract, not a single breaking migration
- [ ] If this adds/changes a queue consumer: idempotent, staged retry preserved
- [ ] If this changes an event payload or public API shape: additive/backward-compatible, not breaking

## Test plan

<!-- How was this verified? Manual steps, new/updated specs, etc. -->

## Notes for reviewers

<!-- Anything deliberately deferred, known trade-offs, or follow-up work. Optional. -->
