import { ContainerModule } from "inversify";

import { TOKENS } from "@/infra/container/tokens";
import { RegisterUserUseCase } from "@/modules/user/application/use-cases/register-user.use-case";

import { RegisterUserController } from "../http/controllers/register-user.controller";

export const setupUserContainerModule = new ContainerModule(({ bind }) => {
  bind(TOKENS.RegisterUserUseCase).to(RegisterUserUseCase).inSingletonScope();
  bind(TOKENS.RegisterUserController).to(RegisterUserController).inSingletonScope();
});
