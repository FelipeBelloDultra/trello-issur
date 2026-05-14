import { node } from "@elysiajs/node";
import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";

import { container } from "@/infra/container";
import { TOKENS } from "@/infra/container/tokens";
import { RegisterUserController } from "@/modules/user/infra/http/controllers/register-user.controller";

import { loggerPlugin } from "./plugins/logger.plugin";

export const createApp = () =>
  new Elysia({ adapter: node() })
    .use(loggerPlugin)
    .use(openapi())
    .get("/health", () => ({ status: "ok" }))
    .use(container.get<RegisterUserController>(TOKENS.RegisterUserController).setup());
