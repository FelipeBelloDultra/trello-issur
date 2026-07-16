import { sql } from "drizzle-orm";
import { Router } from "express";
import { container } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { DatabaseClient } from "@/infra/db/client";
import { logger } from "@/infra/logger";

export const healthRouter = Router();

healthRouter.get("/health/live", (_req, res) => {
  res.status(200).json({ status: "alive" });
});

healthRouter.get("/health/ready", async (_req, res) => {
  const db = container.resolve<DatabaseClient>(InjectionTokens.Databases.Drizzle);

  try {
    await db.query.execute(sql`SELECT 1`);
    res.status(200).json({ status: "ready" });
  } catch (err: unknown) {
    logger.error({ err }, "health/ready check failed");
    res.status(503).json({ status: "not ready", reason: "database" });
  }
});
