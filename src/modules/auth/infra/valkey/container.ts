import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { TokenRepository } from "@/modules/auth/application/repositories/token-repository";

import { ValkeyTokenRepository } from "./valkey-token-repository";

export function setupValkeyAuthContainer(): void {
  container.register<TokenRepository>(
    InjectionTokens.Repositories.Token,
    { useClass: ValkeyTokenRepository },
    { lifecycle: Lifecycle.Singleton },
  );
}
