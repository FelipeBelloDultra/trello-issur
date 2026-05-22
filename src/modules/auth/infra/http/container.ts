import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";

import { LoginController } from "./controllers/login.controller";
import { LogoutController } from "./controllers/logout.controller";
import { RefreshTokenController } from "./controllers/refresh-token.controller";

export function setupHTTPAuthContainer(): void {
  container.register(
    InjectionTokens.Controllers.Login,
    { useClass: LoginController },
    { lifecycle: Lifecycle.Singleton },
  );
  container.register(
    InjectionTokens.Controllers.Logout,
    { useClass: LogoutController },
    { lifecycle: Lifecycle.Singleton },
  );
  container.register(
    InjectionTokens.Controllers.RefreshToken,
    { useClass: RefreshTokenController },
    { lifecycle: Lifecycle.Singleton },
  );
}
