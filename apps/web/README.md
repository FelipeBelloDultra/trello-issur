# web

Companion React SPA for `trello-issur`'s API — a study project for practicing a
mature frontend architecture (Feature-Sliced Design) against a real backend.

Stack: Vite + React 19 + TypeScript, TanStack Router + TanStack Query, Zustand
(+ `immer` middleware), React Hook Form + Zod, shadcn/ui + Tailwind v4,
ESLint + Prettier (shared config from `packages/*`), `steiger` for FSD
boundary linting.

From the repo root: `pnpm --filter web run dev`.
Requires `apps/api` running and a `.env` with `VITE_API_URL` set (see
`.env.example`).

```
pnpm --filter web run dev          # Vite dev server
pnpm --filter web run typecheck    # tsc -b --noEmit
pnpm --filter web run lint:check   # eslint .
pnpm --filter web run lint:fix     # eslint . --fix
pnpm --filter web run lint:fsd     # steiger ./src — FSD boundary rules
pnpm --filter web run build        # tsc -b && vite build
```

This isn't held to `apps/api`'s DDD/CQRS rigor (see the root `CLAUDE.md`) —
it's a lower-ceremony frontend, but it still has a consistent shape. This
document is that shape, written down so it stays consistent as the app grows
past the one reference slice it started from.

## Layers

Feature-Sliced Design, strict one-directional dependency rule (a layer may
only import from layers below it):

```
shared  →  entities  →  features  →  widgets  →  pages  →  app
```

| Layer | Contains | Example |
|---|---|---|
| `app/` | Composition root: providers, router, route tree, layouts | `app/App.tsx`, `app/routes/` |
| `pages/` | One route's screen; orchestrates features, owns post-action navigation | `pages/signup/ui/signup-page.tsx` |
| `widgets/` | Composite UI blocks combining multiple entities/features | `widgets/app-sidebar/` |
| `features/` | A single user action/use-case: submit a form, log out | `features/authenticate/`, `features/register/` |
| `entities/` | Business objects and their data: fetching, types, client-side rules | `entities/session/`, `entities/workspace/` |
| `shared/` | Framework glue, generic UI primitives, API client — no business meaning | `shared/api/`, `shared/ui/` |

`shared/` is the only layer every other layer may freely import — same role
`apps/api`'s `src/shared/` plays there, minus the DDD port/adapter split.

Every slice (a folder directly under `entities/`, `features/`, `pages/`,
`widgets/`) is internally split by concern, not every segment required:

```
<slice>/
  api/      network calls + TanStack Query hooks/queryOptions
  model/    types, Zod schemas, Zustand stores, non-UI hooks (data + handlers)
  ui/       components
  index.ts  public API — the only thing other layers may import from this slice
```

### Public API boundary

Cross-slice imports go through a slice's `index.ts` barrel
(`@/entities/workspace`, not `@/entities/workspace/api/get-workspaces`) —
`steiger` (`fsd/no-public-api-sidestep`) enforces this. The one deliberate
exception is `app/routes/**`, which is allowed to deep-import a page's
`*-skeleton.tsx` directly (see `apps/web/steiger.config.js`): importing it
through the same barrel `lazyRouteComponent()` dynamically imports collapses
Rollup's code splitting for that route (confirmed via `pnpm run build`'s
`[INEFFECTIVE_DYNAMIC_IMPORT]` warning) — the whole page's JS would land in
the eager bundle instead of its own chunk. If you hit that warning building a
new route, this is why.

Path alias: `@/*` → `./src/*` (`apps/web/tsconfig.app.json`) — independent
from `apps/api`'s own `@/*`, no shared alias config between the two apps.

### A known gap, left as-is on purpose

`steiger` currently flags `features/register` as an "insignificant slice"
(only referenced from `pages/signup`). It's a real finding, not a bug — left
unresolved for now since fixing it (folding it into `pages/signup`) is a
judgment call about where that boundary should live long-term, not a
mechanical cleanup. Don't "fix" it reflexively; ask first.

## Patterns

### Data fetching — TanStack Query

Every read lives in a slice's `api/`, exporting **two** things built on one
`queryOptions()` factory: the factory itself (for route loaders'
`ensureQueryData`) and a thin `useXQuery()` hook (for components) — one
source of truth for the query key and fetcher, never duplicated:

```ts
// entities/workspace/api/get-workspaces.ts
export function workspacesQueryOptions() {
  return queryOptions({ queryKey: ["workspaces"], queryFn: getWorkspaces });
}
export function useWorkspacesQuery() {
  return useQuery(workspacesQueryOptions());
}
```

Route loaders call `context.queryClient.ensureQueryData(xQueryOptions())`
directly instead of rendering, then redirecting, then fetching — see
`app/routes/workspace-index.route.tsx`.

### Mutations

`useMutation` hooks live in a slice's `model/` (`model/use-authenticate.ts`,
`model/use-logout.ts`), never called directly from `ui/`. `onSuccess` is
where server-state and client-state get reconciled — invalidate the relevant
query keys, sync the Zustand store — so a component never has to remember to
do both after calling a mutation:

```ts
// features/authenticate/model/use-logout.ts
onSuccess: () => {
  queryClient.clear();
  useAuthStore.getState().setUnauthenticated();
};
```

### Forms — React Hook Form + Zod

Every form uses `useForm` + `zodResolver`. The Zod schema (and any constant
it's built from) lives in the slice's `model/` segment as its own file
(`model/register-schema.ts`, `model/login-schema.ts`), never inlined at the
top of the `ui/*.tsx` component — that split is what this doc's own history
just fixed (schemas used to live in the component file). Workspace name
validation lives in `entities/workspace/model/workspace-schema.ts` rather
than in `pages/onboarding/`, since it's a property of the `Workspace` entity,
not of that one page — a future second workspace-name form (e.g. a rename
dialog) reuses it instead of re-deriving it.

When a schema mirrors an `apps/api` domain value object's constraints
(there's no shared codegen between the two apps), say so with a comment
pointing at the exact VO file, e.g.:

```ts
// Mirrors apps/api's WorkspaceName value object
// (src/modules/workspace/domain/value-objects/workspace-name.ts) — that's
// the single source of truth, kept in sync by hand since there's no shared
// codegen between the two apps.
```

A frontend rule stricter than the backend's (e.g. register's password
strength meter) is safe to keep local — it never gets rejected server-side,
so it doesn't need to be "the" source of truth. A rule that must match the
backend exactly (min/max length, format) does need the mirror comment.

**Field-level API errors**: a 422 from `apps/api`'s Zod validation carries
`ApiError.errors: { field, message }[]` (`shared/api/client.ts`). Every form
calls `useFormErrors(form)` (`shared/lib/hooks/use-form-errors.ts`) in its
submit `catch`, which maps each entry onto `form.setError(field, ...)` so it
renders inline via that field's `<FormMessage />` instead of a toast. The
global mutation-error toast (`app/query-client.ts`'s `MutationCache.onError`)
deliberately skips any error that has field-scoped `errors`, so the two never
double up — anything without field-scoped detail (business conflicts,
invalid credentials, rate limiting, ...) still toasts as before.

### Client state — Zustand

Reach for a Zustand store only for state that's genuinely cross-cutting and
outlives a single component tree — today that's just session/auth
(`entities/session/model/auth-store.ts`). Everything server-shaped belongs in
the TanStack Query cache, not a store — don't mirror query data into Zustand.
Stores use the `immer` middleware even where the state is currently flat, so
a store that grows nested state later doesn't need retrofitting:

```ts
export const useAuthStore = create<AuthState>()(
  immer((set) => ({
    /* ... */
  })),
);
```

Read a store from a *handler* (not during render) via `useAuthStore.getState()`,
e.g. inside a route guard's `beforeLoad` or a mutation's `onSuccess` — regular
render-time reads still use the selector form, `useAuthStore((s) => s.user)`.

### Routing — TanStack Router

One file per route under `app/routes/`, composed into a tree in
`app/routes/index.ts`. A few conventions specific to this app:

- **Session bootstrap runs once.** `entities/session/model/bootstrap-session.ts`
  memoizes the `GET /auth/me` call as a shared promise; `rootRoute`'s
  `beforeLoad` (`app/routes/root.route.tsx`) is the only place that triggers
  it. Every other guard (`dashboard-layout.route.tsx`'s auth check,
  `guest-guard.ts`'s `redirectIfAuthenticated`) only *reads*
  `useAuthStore.getState()` synchronously — never re-fetches, never awaits.
- **Guards throw `redirect()`.** TanStack Router's documented pattern; each
  call site carries an inline `eslint-disable-next-line
  @typescript-eslint/only-throw-error` with a reason, rather than a blanket
  rule exception.
- **Pathless layout routes are guards.** `dashboard-layout.route.tsx` has no
  `path`, only a `beforeLoad` that redirects to `/login` when unauthenticated
  — it exists purely to gate everything nested under it.
- **Loaders resolve data before rendering, not after.** See
  `workspace-index.route.tsx` (redirects to the first workspace) and
  `workspace-layout.route.tsx` (resolves membership/permissions for
  `$workspaceId` and exposes them to child routes via context — re-run fresh
  on every workspace switch, never cached across workspaces).
- **Every route with async work has a `pendingComponent` skeleton.** Paired
  1:1 with its page and exported from the same `index.ts`
  (`HomePage`/`HomePageSkeleton`).

### API client

A single `apiRequest<T>()` (`shared/api/client.ts`) wraps `fetch`, unwraps the
`{ data }` / `{ message, errors? }` envelopes `apps/api` returns, and throws a
typed `ApiError`. Two things worth knowing before touching it:

- **Transparent refresh-and-retry**: a `401` (outside `/auth/*` itself)
  triggers one `POST /auth/refresh`, then retries the original request once.
  Concurrent 401s share a single in-flight refresh via a memoized promise
  (`refreshPromise`), so five parallel requests failing at once produce one
  refresh call, not five.
- **Idempotent refresh retry**: if the refresh call itself throws (e.g.
  dropped connection), it's retried once more with the *same* idempotency
  key, so the backend's idempotency middleware can replay the first
  attempt's result instead of rejecting a second refresh against an
  already-rotated token.

### The "hooks-per-page/widget" pattern

Non-trivial pages and widgets get a co-located `model/use-<name>.ts` hook
(`widgets/app-sidebar/model/use-app-sidebar.ts`) that owns data reads,
derived state, and event handlers, leaving the `ui/*.tsx` file close to a
pure render function. This is the intentional pattern here, not an
anti-pattern to avoid — it keeps JSX skimmable and gives the logic a
testable seam, at the cost of one extra file per non-trivial page/widget.
Skip it for pages/widgets simple enough that inlining wouldn't hurt
readability (e.g. `pages/login/ui/login-page.tsx` has none).

### Where orchestration lives

Features own *how* to do one thing (submit this form, call this mutation,
render its own errors) and never import `@tanstack/react-router` themselves
— what happens next is the caller's decision, passed in as a prop
(`onSuccess`). Pages own *what happens after* — see
`pages/signup/ui/signup-page.tsx`: `RegisterForm` reports success upward,
and the page decides whether to auto-sign-in, where to navigate, and how to
recover if the auto-sign-in fails. This keeps a feature reusable across
pages without it knowing which page it's in.

## Reference slice

Only a handful of slices are fully built out (`entities/session`,
`entities/workspace`, `features/authenticate`, `features/register`,
`pages/login`, `pages/signup`, `pages/onboarding`, `pages/home`,
`pages/members`, `widgets/app-sidebar`). New slices should match the shape
and patterns documented above rather than reinventing them.
