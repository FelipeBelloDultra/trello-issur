# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=24

# ─── base ─────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS base
RUN corepack enable
WORKDIR /app

# ─── install (all deps, whole workspace) ──────────────────────────────────────
# a pnpm workspace's frozen-lockfile install needs every workspace project's
# manifest present, not just the one being built — add a COPY line here
# whenever a new apps/* or packages/* project is added.
FROM base AS install
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
# packages/* aren't just install-time manifests here — apps/api's tsconfig.json
# `extends` a workspace:* package (@trello-issur/typescript-config), which pnpm
# links as a symlink to this actual directory. Without it, the symlink dangles
# and tsx's runtime path-alias resolution silently breaks (`@/*` imports 404).
COPY packages ./packages
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# ─── install-prod (production deps only, api only) ────────────────────────────
FROM base AS install-prod
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prod --filter api...

# ─── build ────────────────────────────────────────────────────────────────────
FROM install AS build
COPY . .
RUN pnpm --filter api run build

# ─── dev-watch ────────────────────────────────────────────────────────────────
# apps/api/src is bind-mounted from the host at runtime — no source copy here
FROM install AS dev-watch
COPY apps/api/tsconfig.json ./apps/api/tsconfig.json
WORKDIR /app/apps/api
ENV NODE_ENV=development
EXPOSE 3000

# ─── dev ──────────────────────────────────────────────────────────────────────
FROM build AS dev
WORKDIR /app/apps/api
ENV NODE_ENV=development
EXPOSE 3000
CMD ["pnpm", "run", "dev:http"]

# ─── prod ─────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS prod
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 --ingroup nodejs appuser

# pnpm workspace node_modules are relative symlinks into the root .pnpm store —
# both levels must be copied preserving the same nesting or the symlinks dangle.
COPY --from=install-prod --chown=appuser:nodejs /app/node_modules          ./node_modules
COPY --from=install-prod --chown=appuser:nodejs /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build        --chown=appuser:nodejs /app/apps/api/dist         ./apps/api/dist
COPY --from=build        --chown=appuser:nodejs /app/apps/api/package.json ./apps/api/package.json

USER appuser

ENV NODE_ENV=production \
    NO_UPDATE_NOTIFIER=1

WORKDIR /app/apps/api

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO /dev/null http://localhost:3000/api/health/live || exit 1

CMD ["node", "dist/index.http.js"]
