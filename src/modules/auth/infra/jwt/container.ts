import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { CryptographGateway } from "@/modules/auth/application/gateways/cryptograph.gateway";

import { JwtCryptographGateway } from "./jwt-cryptograph-gateway";

export function setupJwtContainer(): void {
  container.register<CryptographGateway>(
    InjectionTokens.Gateways.Cryptograph,
    { useClass: JwtCryptographGateway },
    { lifecycle: Lifecycle.Singleton },
  );
}
