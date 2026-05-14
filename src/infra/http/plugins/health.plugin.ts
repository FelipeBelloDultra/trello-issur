import { sql } from "drizzle-orm";
import { Elysia } from "elysia";

import { databaseClient } from "@/infra/db/client";
import { logger } from "@/infra/logger";

export const healthPlugin = new Elysia({ name: "health" })
  .get("/health/live", () => ({ status: "alive" }))
  .get("/health/ready", async ({ set }) => {
    try {
      await databaseClient.db.execute(sql`SELECT 1`);
      return { status: "ready" };
    } catch (err) {
      logger.error({ err }, "readiness check failed");
      set.status = 503;
      return { status: "not ready", reason: "database" };
    }
  });
