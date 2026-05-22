import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { TokenRepository } from "@/modules/auth/application/repositories/token-repository";
import { LoginUseCase } from "@/modules/auth/application/use-cases/login.use-case";
import { LogoutUseCase } from "@/modules/auth/application/use-cases/logout.use-case";
import { RefreshTokenUseCase } from "@/modules/auth/application/use-cases/refresh-token.use-case";

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
  container.register<LoginUseCase>(
    InjectionTokens.UseCases.Login,
    { useClass: LoginUseCase },
    { lifecycle: Lifecycle.Singleton },
  );
  container.register<LogoutUseCase>(
    InjectionTokens.UseCases.Logout,
    { useClass: LogoutUseCase },
    { lifecycle: Lifecycle.Singleton },
  );
  container.register<RefreshTokenUseCase>(
    InjectionTokens.UseCases.RefreshToken,
    { useClass: RefreshTokenUseCase },
    { lifecycle: Lifecycle.Singleton },
  );

  setupHTTPAuthContainer();
}
