import { Router } from "express";
import { container } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { Controller } from "@/infra/http/controller";
import { registerController } from "@/infra/http/controller";

export const router = Router();

registerController(router, container.resolve<Controller>(InjectionTokens.Controllers.RegisterUser));
