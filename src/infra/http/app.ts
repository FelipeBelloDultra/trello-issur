import { node } from "@elysiajs/node";
import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";

import { container } from "@/infra/container";
import { TOKENS } from "@/infra/container/tokens";
import { RegisterUserController } from "@/modules/user/infra/http/controllers/register-user.controller";

import { healthPlugin } from "./plugins/health.plugin";
import { loggerPlugin } from "./plugins/logger.plugin";
import { metricsPlugin } from "./plugins/metrics.plugin";

export const createApp = () =>
  new Elysia({ adapter: node() })
    .use(loggerPlugin)
    .use(metricsPlugin)
    .use(healthPlugin)
    .use(openapi())
    .use(container.get<RegisterUserController>(TOKENS.RegisterUserController).setup());
