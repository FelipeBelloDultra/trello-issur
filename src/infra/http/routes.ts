import { Router } from "express";

import { authRouter } from "@/modules/auth/infra/http/routes";
import { router as userRoutes } from "@/modules/user/infra/http/routes";

import { healthRouter } from "./health.router";
import { metricsRouter } from "./metrics.router";

export class Routes {
  private readonly routes = [healthRouter, metricsRouter, userRoutes, authRouter];
  public readonly router = Router();

  public constructor() {
    this.routes.forEach((router) => {
      this.router.use(router);
    });
  }
}
