import { Router } from "express";
import { container } from "tsyringe";

import { accountControllers } from "@/modules/account/infra/http/routes";
import { authControllers } from "@/modules/auth/infra/http/routes";
import { workspaceControllers } from "@/modules/workspace/infra/http/routes";

import { Controller } from "./contracts/controller";
import { healthRouter } from "./health.router";
import { metricsRouter } from "./metrics.router";
import { queueRouter } from "./queue.router";

export class Routes {
  private readonly staticRouters = [healthRouter, metricsRouter, queueRouter];
  private readonly controllerTokens = [
    ...accountControllers,
    ...authControllers,
    ...workspaceControllers,
  ];

  public readonly router = Router();

  private mountStaticRouters(): void {
    this.staticRouters.forEach((router) => this.router.use(router));
  }

  private mountControllers(): void {
    this.controllerTokens
      .map((token) => container.resolve<Controller>(token))
      .forEach((ctrl) => {
        this.router[ctrl.method](ctrl.path, ...ctrl.middlewares, (req, res) =>
          ctrl.handler(req, res),
        );
      });
  }

  public constructor() {
    this.mountStaticRouters();
    this.mountControllers();
  }
}
