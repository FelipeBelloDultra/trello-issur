import { Router } from "express";
import { container } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { Controller, registerController } from "@/infra/http/controller";

export const router = Router();

registerController(
  router,
  container.resolve<Controller>(InjectionTokens.Controllers.CreateAccount),
);
