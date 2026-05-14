import { node } from "@elysiajs/node";
import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";

import { container } from "@/infra/container";
import { RegisterUserController } from "@/modules/user/infra/http/controllers/register-user.controller";

import { TOKENS } from "../container/tokens";

export const createApp = () =>
  new Elysia({ adapter: node() })
    .use(openapi())
    .get("/health", () => ({ status: "ok" }))
    .use(container.get<RegisterUserController>(TOKENS.RegisterUserController).setup());
