import { Router } from "express";
import { container } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { Controller } from "@/infra/http/controller";
import { registerController } from "@/infra/http/controller";

export const authRouter = Router();

[
  InjectionTokens.Controllers.Login,
  InjectionTokens.Controllers.Logout,
  InjectionTokens.Controllers.RefreshToken,
]
  .map((token) => container.resolve<Controller>(token))
  .forEach((ctrl) => registerController(authRouter, ctrl));
