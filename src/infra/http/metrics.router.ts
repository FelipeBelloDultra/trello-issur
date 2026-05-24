import { Router } from "express";

import { registry } from "@/infra/metrics/adapters/prometheus";

export const metricsRouter = Router();

metricsRouter.get("/metrics", async (_req, res) => {
  res.setHeader("content-type", registry.contentType);
  res.send(await registry.metrics());
});
