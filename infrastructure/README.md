# Infrastructure

Backing services for local development, started via `docker compose --env-file apps/api/.env up -d`
from the repo root (`infrastructure/compose.yml` is pulled in by the root `compose.yml` via `include:`).

## Service URLs

| Service | URL | Purpose | Credentials |
|---|---|---|---|
| API (via nginx) | http://localhost:3000 | Main entrypoint — load-balances across the `http` app replicas | — |
| Postgres | `localhost:${DB_PORT:-5432}` | Primary database (TCP, not HTTP — connect with `psql` or a DB client) | `DB_USER` / `DB_PASSWORD` / `DB_NAME` from `apps/api/.env` |
| Valkey | `localhost:6379` | Cache + refresh-token store (Redis protocol) | none |
| RabbitMQ (AMQP) | `localhost:${RABBITMQ_PORT:-5672}` | Queue broker connection (AMQP protocol) | `RABBITMQ_USER` / `RABBITMQ_PASSWORD` from `apps/api/.env` (default `guest` / `guest`) |
| RabbitMQ (management UI) | http://localhost:15672 | Queues, exchanges, dead-letter inspection | same as above |
| Mailpit (SMTP) | `localhost:${SMTP_PORT:-1025}` | Catches outbound app emails (SMTP protocol) | none |
| Mailpit (web UI) | http://localhost:8025 | Inbox for emails caught above | none |
| Jaeger UI | http://localhost:16686 | Distributed trace viewer | none |
| Jaeger (OTLP/HTTP receiver) | `localhost:4318` | Where the app pushes traces to (set as `OTEL_ENDPOINT`) — not a browsable UI | none |
| MinIO (S3 API) | `localhost:9000` | S3-compatible object storage endpoint — not a browsable UI | `S3_ACCESS_KEY` / `S3_SECRET_KEY` from `apps/api/.env` (default `minioadmin` / `minioadmin`) |
| MinIO (console UI) | http://localhost:9001 | Browse buckets/objects | same as above |
| Prometheus | http://localhost:9090 | Metrics query UI + scrape target status | none |
| Grafana | http://localhost:3001 | Provisioned dashboards (RabbitMQ, Postgres, node, Redis) | `admin` / `admin` (hardcoded in `infrastructure/compose.yml`, dev-only) |

## Not exposed to the host

These run only inside the compose network — Prometheus scrapes them internally, there's no host port
published, so they're not reachable from your browser/CLI directly:

| Service | Internal port | Purpose |
|---|---|---|
| `postgres-exporter` | 9187 | Translates Postgres stats into Prometheus metrics |
| `redis-exporter` | 9121 | Translates Valkey stats into Prometheus metrics |
| `node-exporter` | 9100 | Host-level metrics (CPU, memory, disk) |
| `http` / `queue` (app containers) | 3000 | Reached only through the `nginx` reverse proxy above |

## Notes

- Ports with a `${VAR:-default}` form can be overridden in `apps/api/.env`; the rest are fixed in
  `infrastructure/compose.yml`.
- `docker compose --env-file apps/api/.env up -d` is required (not plain `docker compose up -d`) —
  see the root `CLAUDE.md` for why: several of the values above (`DB_USER`, `DB_PASSWORD`, `DB_NAME`,
  ports) are interpolated directly into this compose file and need `--env-file` to resolve, regardless
  of any `env_file:` a service declares.
