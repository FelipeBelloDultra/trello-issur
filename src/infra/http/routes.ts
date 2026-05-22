import { Router } from "express";

import { router as accountRoutes } from "@/modules/account/infra/http/routes";
import { authRouter } from "@/modules/auth/infra/http/routes";

import { healthRouter } from "./health.router";
import { metricsRouter } from "./metrics.router";

export class Routes {
  private readonly routes = [healthRouter, metricsRouter, accountRoutes, authRouter];
  public readonly router = Router();

  public constructor() {
    this.routes.forEach((router) => {
      this.router.use(router);
    });
  }
}
