# trello-issur

A multi-tenant team project management API (Kanban boards, workspaces, RBAC, subscription plans), plus a companion React SPA — organized as a pnpm-workspaces monorepo.

```
apps/
  api/        the backend — Node.js + TypeScript, DDD, Clean Architecture, Ports & Adapters, CQRS
              see apps/api/README.md for architecture decisions, stack, and full run instructions
  web/        companion React SPA study project (Vite, TanStack Router/Query, shadcn/ui, FSD)
              see apps/web/README.md
packages/
  eslint-config/       shared ESLint flat-config, split into base/node/react subpath exports
  prettier-config/     shared Prettier config
  typescript-config/   shared strict tsconfig, split into base/node/react subpath exports
infrastructure/        backing services + observability (Postgres, Valkey, RabbitMQ, Mailpit,
                       Jaeger, MinIO, Prometheus, Grafana) — its own compose.yml, pulled into
                       the root one via `include:`
```

`compose.yml` (root) bootstraps the application layer (`apps/api`'s http/queue processes,
nginx) and includes `infrastructure/compose.yml` for everything else. `apps/api/Dockerfile`
lives with the app it builds.

There are no root-level scripts — each package owns its own; run everything
via `pnpm --filter <name> run <script>`.

## Running locally

```sh
cp apps/api/.env.example apps/api/.env
docker compose --env-file apps/api/.env up -d   # Postgres, Valkey, RabbitMQ, Mailpit, Jaeger, Prometheus/Grafana, MinIO
pnpm install
pnpm --filter api run db:migrate
pnpm --filter api run dev:http     # HTTP process
pnpm --filter api run dev:queue    # queue consumer process, separate process
pnpm --filter web run dev          # frontend dev server
```

See `apps/api/README.md` for the backend's architecture and design decisions, and `CLAUDE.md` for repo conventions.
