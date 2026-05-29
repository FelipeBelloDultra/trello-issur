import { container, Lifecycle } from "tsyringe";

import { InMemoryCommandBus } from "@/infra/bus/adapters/in-memory/command-bus";
import { InjectionTokens } from "@/infra/container/tokens";
import { AuthenticateCommand } from "@/modules/auth/application/commands/authenticate/command";
import { AuthenticateHandler } from "@/modules/auth/application/commands/authenticate/handler";
import { LogoutCommand } from "@/modules/auth/application/commands/logout/command";
import { LogoutHandler } from "@/modules/auth/application/commands/logout/handler";
import { RefreshTokenCommand } from "@/modules/auth/application/commands/refresh-token/command";
import { RefreshTokenHandler } from "@/modules/auth/application/commands/refresh-token/handler";

import { setupCacheAuthContainer } from "./cache/container";
import { setupDatabaseAuthContainer } from "./db/container";
import { setupHTTPAuthContainer } from "./http/container";
import { setupJwtContainer } from "./jwt/container";
import { setupValkeyAuthContainer } from "./valkey/container";

export function setupAuthModule(): void {
  setupJwtContainer();
  setupCacheAuthContainer();
  setupDatabaseAuthContainer();
  setupValkeyAuthContainer();

  container.register<AuthenticateHandler>(
    InjectionTokens.Handlers.Authenticate,
    { useClass: AuthenticateHandler },
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
    AuthenticateCommand,
    container.resolve<AuthenticateHandler>(InjectionTokens.Handlers.Authenticate),
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
