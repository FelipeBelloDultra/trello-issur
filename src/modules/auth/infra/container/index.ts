import { ContainerModule } from "inversify";

import { TOKENS } from "@/infra/container/tokens";

import { LoginUseCase } from "../../application/use-cases/login.use-case";
import { LogoutUseCase } from "../../application/use-cases/logout.use-case";
import { RefreshTokenUseCase } from "../../application/use-cases/refresh-token.use-case";
import { LoginController } from "../http/controllers/login.controller";
import { LogoutController } from "../http/controllers/logout.controller";
import { RefreshTokenController } from "../http/controllers/refresh-token.controller";
import { JwtCryptographGateway } from "../jwt/jwt-cryptograph-gateway";
import { ValkeyTokenRepository } from "../valkey/valkey-token-repository";

export const setupAuthContainerModule = new ContainerModule(({ bind }) => {
  bind(TOKENS.CryptographGateway).to(JwtCryptographGateway).inSingletonScope();
  bind(TOKENS.TokenRepository).to(ValkeyTokenRepository).inSingletonScope();
  bind(TOKENS.LoginUseCase).to(LoginUseCase).inSingletonScope();
  bind(TOKENS.RefreshTokenUseCase).to(RefreshTokenUseCase).inSingletonScope();
  bind(TOKENS.LogoutUseCase).to(LogoutUseCase).inSingletonScope();
  bind(TOKENS.LoginController).to(LoginController).inSingletonScope();
  bind(TOKENS.RefreshTokenController).to(RefreshTokenController).inSingletonScope();
  bind(TOKENS.LogoutController).to(LogoutController).inSingletonScope();
});
