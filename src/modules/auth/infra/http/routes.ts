import { Router } from "express";
import { container } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { Controller } from "@/infra/http/contracts/controller";
import { registerController } from "@/infra/http/register-controller";

export const authRouter = Router();

[
  InjectionTokens.Controllers.Authenticate,
  InjectionTokens.Controllers.Logout,
  InjectionTokens.Controllers.RefreshToken,
  InjectionTokens.Controllers.GetMe,
]
  .map((token) => container.resolve<Controller>(token))
  .forEach((ctrl) => registerController(authRouter, ctrl));
