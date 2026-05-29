import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { PasswordHasherGateway } from "@/modules/account/application/gateways/password-hasher.gateway";

import { Argon2PasswordHasherGateway } from "./argon2-password-hasher.gateway";

export function setupArgon2Container(): void {
  container.register<PasswordHasherGateway>(
    InjectionTokens.Gateways.PasswordHasher,
    { useClass: Argon2PasswordHasherGateway },
    { lifecycle: Lifecycle.Singleton },
  );
}
