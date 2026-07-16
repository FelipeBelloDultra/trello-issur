# web

Companion React SPA for `trello-issur`'s API — a study project for practicing a
mature frontend architecture (Feature-Sliced Design) against a real backend.

Stack: Vite + React 19 + TypeScript, TanStack Router + TanStack Query, shadcn/ui
+ Tailwind v4, ESLint + Prettier (shared config from `packages/*`), `steiger`
for FSD boundary linting.

From the repo root: `pnpm run dev:web` (or `pnpm --filter web run dev`).
Requires `apps/api` running and a `.env` with `VITE_API_URL` set (see
`.env.example`).

Only one reference vertical slice is implemented (`entities/account` +
`features/authenticate` + `pages/login`/`pages/home` — login and "who am I").
Everything else is left to replicate as a learning exercise.
