import CircuitBreaker from "opossum";

import { env } from "@/config/env";
import { logger } from "@/infra/logger";
import {
  circuitBreakerStateGauge,
  circuitBreakerTripsTotal,
} from "@/infra/metrics/adapters/prometheus";

type AnyAsyncFn = (...args: unknown[]) => Promise<unknown>;

function invoke(fn: AnyAsyncFn, ...args: unknown[]): Promise<unknown> {
  return fn(...args);
}

// One breaker shape reused for any wrapped call: the action always receives
// "which function to run" plus its arguments, so a single breaker instance
// can guard an arbitrary set of methods on a client (see wrapWithCircuitBreaker)
// instead of needing one breaker per method signature.
export function createCircuitBreaker(
  name: string,
  overrides: CircuitBreaker.Options<[AnyAsyncFn, ...unknown[]]> = {},
): CircuitBreaker<[AnyAsyncFn, ...unknown[]], unknown> {
  const breaker = new CircuitBreaker(invoke, {
    name,
    timeout: env.CIRCUIT_BREAKER_TIMEOUT_MS,
    errorThresholdPercentage: env.CIRCUIT_BREAKER_ERROR_THRESHOLD_PERCENTAGE,
    resetTimeout: env.CIRCUIT_BREAKER_RESET_TIMEOUT_MS,
    volumeThreshold: env.CIRCUIT_BREAKER_VOLUME_THRESHOLD,
    ...overrides,
  });

  breaker.on("open", () => {
    logger.warn({ breaker: name }, "circuit breaker open — failing fast");
    circuitBreakerStateGauge.labels(name).set(1);
    circuitBreakerTripsTotal.labels(name).inc();
  });

  breaker.on("halfOpen", () => {
    logger.info({ breaker: name }, "circuit breaker half-open — probing");
    circuitBreakerStateGauge.labels(name).set(0.5);
  });

  breaker.on("close", () => {
    logger.info({ breaker: name }, "circuit breaker closed — resumed normal operation");
    circuitBreakerStateGauge.labels(name).set(0);
  });

  return breaker;
}

// Proxies only the named methods through the breaker; everything else
// (event emitter methods, sync helpers, chainable builders like
// ioredis' pipeline()) passes through untouched. A blanket "wrap every
// function" proxy would silently break any sync/non-fire-and-await method.
export function wrapWithCircuitBreaker<T extends object>(
  target: T,
  breaker: CircuitBreaker<[AnyAsyncFn, ...unknown[]], unknown>,
  methodNames: readonly (keyof T)[],
): T {
  const guarded = new Set<unknown>(methodNames);

  return new Proxy(target, {
    get(obj, prop, receiver) {
      const value = Reflect.get(obj, prop, receiver);

      if (!guarded.has(prop) || typeof value !== "function") return value;

      const bound = (value as AnyAsyncFn).bind(obj);
      return (...args: unknown[]) => breaker.fire(bound, ...args);
    },
  });
}
