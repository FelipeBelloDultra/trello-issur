import { Pool } from "pg";
import { collectDefaultMetrics, Counter, Gauge, Histogram, Registry } from "prom-client";

import { env } from "@/config/env";

export const registry = new Registry();

collectDefaultMetrics({ register: registry, labels: { instance: env.INSTANCE_ID } });

export const httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"] as const,
  registers: [registry],
});

export const httpRequestDurationSeconds = new Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [registry],
});

export const circuitBreakerStateGauge = new Gauge({
  name: "circuit_breaker_state",
  help: "Circuit breaker state: 0=closed, 0.5=half-open, 1=open",
  labelNames: ["breaker"] as const,
  registers: [registry],
});

export const circuitBreakerTripsTotal = new Counter({
  name: "circuit_breaker_trips_total",
  help: "Total number of times a circuit breaker has opened",
  labelNames: ["breaker"] as const,
  registers: [registry],
});

export function setupDbPoolMetrics(pool: Pool): void {
  new Gauge({
    name: "db_pool_connections_total",
    help: "Total connections in the database pool (active + idle)",
    registers: [registry],
    collect() {
      this.set(pool.totalCount);
    },
  });

  new Gauge({
    name: "db_pool_connections_idle",
    help: "Idle connections in the database pool",
    registers: [registry],
    collect() {
      this.set(pool.idleCount);
    },
  });

  new Gauge({
    name: "db_pool_connections_active",
    help: "Active (in-use) connections in the database pool",
    registers: [registry],
    collect() {
      this.set(pool.totalCount - pool.idleCount);
    },
  });

  new Gauge({
    name: "db_pool_connections_waiting",
    help: "Clients waiting for a database pool connection",
    registers: [registry],
    collect() {
      this.set(pool.waitingCount);
    },
  });
}
