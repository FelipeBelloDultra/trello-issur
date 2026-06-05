# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=24

# ─── base ─────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS base
RUN corepack enable

# ─── install (all deps) ───────────────────────────────────────────────────────
FROM base AS install
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# ─── install-prod (production deps only) ──────────────────────────────────────
FROM base AS install-prod
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prod

# ─── build ────────────────────────────────────────────────────────────────────
FROM install AS build
COPY . .
RUN pnpm run build

# ─── dev-watch ────────────────────────────────────────────────────────────────
# src/ is bind-mounted from the host at runtime — no source copy here
FROM install AS dev-watch
WORKDIR /app
COPY tsconfig.json ./
ENV NODE_ENV=development
EXPOSE 3000

# ─── dev ──────────────────────────────────────────────────────────────────────
FROM build AS dev
ENV NODE_ENV=development
EXPOSE 3000
CMD ["pnpm", "run", "dev:http"]

# ─── prod ─────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS prod
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 --ingroup nodejs appuser

COPY --from=install-prod --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=build        --chown=appuser:nodejs /app/dist         ./dist
COPY --from=build        --chown=appuser:nodejs /app/package.json ./package.json

USER appuser

ENV NODE_ENV=production \
    NO_UPDATE_NOTIFIER=1

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO /dev/null http://localhost:3000/api/health/live || exit 1

CMD ["node", "dist/index.http.js"]
