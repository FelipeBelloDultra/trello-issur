import { NextFunction, Request, Response } from "express";

import { env } from "@/config/env";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Dev-only artificial latency, opt-in via DEV_RESPONSE_DELAY_MS — lets the
// frontend's loading states (RouteProgressBar, SessionTransitionOverlay,
// per-mutation pending UI) be exercised locally without waiting for a slow
// network to happen naturally. A no-op whenever the env var is unset/0, and
// always a no-op outside development regardless of value — never adds
// latency in production or test. Plain function, not a DI-registered
// Middleware — it has no dependencies beyond env, so it's applied directly
// in App.registerMiddlewares() the same way express.json()/helmet()/cors()
// are.
export async function devDelayMiddleware(
  _req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  if (env.NODE_ENV === "development" && env.DEV_RESPONSE_DELAY_MS > 0) {
    await sleep(env.DEV_RESPONSE_DELAY_MS);
  }
  next();
}
