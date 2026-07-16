import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";

import { AuthenticateController } from "./controllers/authenticate.controller";
import { GetMeController } from "./controllers/get-me.controller";
import { LogoutController } from "./controllers/logout.controller";
import { RefreshTokenController } from "./controllers/refresh-token.controller";

export function setupHTTPAuthContainer(): void {
  container.register(
    InjectionTokens.Controllers.Authenticate,
    { useClass: AuthenticateController },
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
  container.register(
    InjectionTokens.Controllers.GetMe,
    { useClass: GetMeController },
    { lifecycle: Lifecycle.Singleton },
  );
}
