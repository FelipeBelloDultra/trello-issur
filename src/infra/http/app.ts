import { node } from "@elysiajs/node";
import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";

import { container } from "@/infra/container";
import { TOKENS } from "@/infra/container/tokens";
import { LoginController } from "@/modules/auth/infra/http/controllers/login.controller";
import { LogoutController } from "@/modules/auth/infra/http/controllers/logout.controller";
import { RefreshTokenController } from "@/modules/auth/infra/http/controllers/refresh-token.controller";
import { RegisterUserController } from "@/modules/user/infra/http/controllers/register-user.controller";

import { healthPlugin } from "./plugins/health.plugin";
import { loggerPlugin } from "./plugins/logger.plugin";
import { metricsPlugin } from "./plugins/metrics.plugin";
import { tracingPlugin } from "./plugins/tracing.plugin";

export const createApp = () =>
  new Elysia({ adapter: node() })
    .use(tracingPlugin)
    .use(loggerPlugin)
    .use(metricsPlugin)
    .use(healthPlugin)
    .use(openapi())
    .use(container.get<RegisterUserController>(TOKENS.RegisterUserController).setup())
    .use(container.get<LoginController>(TOKENS.LoginController).setup())
    .use(container.get<RefreshTokenController>(TOKENS.RefreshTokenController).setup())
    .use(container.get<LogoutController>(TOKENS.LogoutController).setup());
