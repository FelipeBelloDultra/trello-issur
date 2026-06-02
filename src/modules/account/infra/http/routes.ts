import { Router } from "express";
import { container } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { Controller } from "@/infra/http/contracts/controller";
import { registerController } from "@/infra/http/register-controller";

export const router = Router();

registerController(
  router,
  container.resolve<Controller>(InjectionTokens.Controllers.CreateAccount),
);
