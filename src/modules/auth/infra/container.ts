import { container, Lifecycle } from "tsyringe";

import { InMemoryCommandBus } from "@/infra/bus/in-memory-command-bus";
import { InjectionTokens } from "@/infra/container/tokens";
import { LoginCommand } from "@/modules/auth/application/commands/login/command";
import { LoginHandler } from "@/modules/auth/application/commands/login/handler";
import { LogoutCommand } from "@/modules/auth/application/commands/logout/command";
import { LogoutHandler } from "@/modules/auth/application/commands/logout/handler";
import { RefreshTokenCommand } from "@/modules/auth/application/commands/refresh-token/command";
import { RefreshTokenHandler } from "@/modules/auth/application/commands/refresh-token/handler";
import { TokenRepository } from "@/modules/auth/application/repositories/token-repository";

import { setupHTTPAuthContainer } from "./http/container";
import { setupJwtContainer } from "./jwt/container";
import { ValkeyTokenRepository } from "./valkey/valkey-token-repository";

export function setupAuthModule(): void {
  setupJwtContainer();

  container.register<TokenRepository>(
    InjectionTokens.Repositories.Token,
    { useClass: ValkeyTokenRepository },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<LoginHandler>(
    InjectionTokens.Handlers.Login,
    { useClass: LoginHandler },
    { lifecycle: Lifecycle.Singleton },
  );
  container.register<LogoutHandler>(
    InjectionTokens.Handlers.Logout,
    { useClass: LogoutHandler },
    { lifecycle: Lifecycle.Singleton },
  );
  container.register<RefreshTokenHandler>(
    InjectionTokens.Handlers.RefreshToken,
    { useClass: RefreshTokenHandler },
    { lifecycle: Lifecycle.Singleton },
  );

  const commandBus = container.resolve<InMemoryCommandBus>(InjectionTokens.Bus.Command);
  commandBus.register(
    LoginCommand,
    container.resolve<LoginHandler>(InjectionTokens.Handlers.Login),
  );
  commandBus.register(
    LogoutCommand,
    container.resolve<LogoutHandler>(InjectionTokens.Handlers.Logout),
  );
  commandBus.register(
    RefreshTokenCommand,
    container.resolve<RefreshTokenHandler>(InjectionTokens.Handlers.RefreshToken),
  );

  setupHTTPAuthContainer();
}
