import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { AccessTokenRepository } from "@/modules/auth/application/repositories/access-token.repository";
import { TokenRepository } from "@/modules/auth/application/repositories/token.repository";

import { ValkeyAccessTokenRepository } from "./valkey-access-token.repository";
import { ValkeyTokenRepository } from "./valkey-token.repository";

export function setupValkeyAuthContainer(): void {
  container.register<TokenRepository>(
    InjectionTokens.Repositories.Token,
    { useClass: ValkeyTokenRepository },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<AccessTokenRepository>(
    InjectionTokens.Repositories.AccessToken,
    { useClass: ValkeyAccessTokenRepository },
    { lifecycle: Lifecycle.Singleton },
  );
}
