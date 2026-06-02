import { Router } from "express";

import { Controller } from "./contracts/controller";

export function registerController(router: Router, ctrl: Controller): void {
  router[ctrl.method](ctrl.path, ...ctrl.middlewares, (req, res) => ctrl.handler(req, res));
}
