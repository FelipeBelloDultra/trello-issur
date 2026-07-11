---
name: open-pr
description: Open a pull request for the current branch using the gh CLI — drafts a Conventional Commits-style title, fills .github/pull_request_template.md, and runs the repo's verification commands first. Use when asked to open/create a PR, push and make a PR, or "ship this branch".
---

# Open a PR

This repo has no CI configured yet, so the PR itself is the main gate — get it right locally before pushing.

## 1. Preconditions

- Refuse (and say why) if the current branch is `main` — create/switch to a feature branch first.
- `git status` — make sure there's nothing uncommitted the user still wants staged; don't silently leave work out of the PR.
- `gh auth status` — confirm it's authenticated before relying on `gh` for anything.

## 2. Verify before pushing

Run, and fix or report any failures — don't open a PR on top of a red build:

```sh
pnpm run typecheck
pnpm run lint:check
pnpm run test
```

Run `pnpm run test:e2e` too if the diff touches HTTP controllers, repositories/migrations, or queue consumers (it spins up a real PG schema + Valkey, so it's slower — skip it for pure docs/chore changes that don't touch those layers).

## 3. Understand the full diff

Diff against the merge base, not just the latest commit — a PR usually bundles several commits:

```sh
git fetch origin main
git log origin/main..HEAD --oneline
git diff origin/main...HEAD
```

Read every commit in that range, not just the last one — the PR title/body must represent the whole branch.

## 4. Draft the title

Single line, Conventional Commits, matching this repo's `git log` precedent (see `CLAUDE.md` → Commit conventions):

```
type(scope): imperative, lowercase description
```

- `type` ∈ `feat` / `fix` / `chore` — don't invent `refactor`/`docs`/etc.
- `scope` matches `src/modules/<scope>` or the relevant top-level area (`infra`, `bus`, ...).
- If the branch mixes unrelated concerns across multiple scopes, say so and suggest splitting into separate PRs rather than forcing one title over everything.

## 5. Fill the body from the template

`.github/pull_request_template.md` is the source of truth for structure — read it, don't reinvent the sections. Populate it from what you actually verified in steps 2–3, not boilerplate:

- **Summary** — the why, not a restatement of the diff.
- **Type of change** / **Scope** — check the boxes and name the module(s) that match the title.
- **Checklist** — only check items you actually ran/confirmed this session (typecheck/lint/test results from step 2, e2e if applicable). Leave unchecked + explain if something wasn't verified.
- Pay particular attention to the architecture checklist items (domain/application/infra boundaries, three-tier error strategy, expand/contract migrations, idempotent consumers, backward-compatible event/API changes) — these encode real invariants from `CLAUDE.md`, not filler. If the diff violates one, flag it to the user before opening the PR, don't just check the box.
- **Test plan** — concrete: which specs, which manual steps.

## 6. Push and open the PR

Pushing a branch and opening a PR are both visible, hard-to-fully-reverse actions — confirm with the user before doing either, even mid-skill, unless they've already explicitly told you to push/open without asking further:

```sh
git push -u origin <branch>
gh pr create --title "<type>(<scope>): <description>" --body-file <path-to-filled-template>
```

Write the filled body to a temp file first (e.g. under the scratchpad dir) and pass it via `--body-file` rather than inlining a large `--body` string — easier to review before submitting, and avoids shell-quoting issues with a multi-section markdown body.

Return the PR URL from `gh pr create` output to the user when done.

## Non-goals

- Don't push to `main` or force-push under any circumstance from this skill.
- Don't skip step 2's verification commands to save time — a failing typecheck/lint/test is exactly what a PR should catch before review.
- Don't use `--no-verify` on the push or bypass hooks to work around a failure — fix the underlying issue.
