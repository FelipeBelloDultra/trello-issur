import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { TokenGeneratorGateway } from "@/modules/workspace/application/gateways/token-generator.gateway";

import { CryptoTokenGeneratorGateway } from "./crypto-token-generator.gateway";

export function setupCryptoWorkspaceContainer(): void {
  container.register<TokenGeneratorGateway>(
    InjectionTokens.Gateways.TokenGenerator,
    { useClass: CryptoTokenGeneratorGateway },
    { lifecycle: Lifecycle.Singleton },
  );
}
