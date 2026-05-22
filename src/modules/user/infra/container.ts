import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";

import { RegisterUserUseCase } from "../application/use-cases/register-user.use-case";

import { setupDatabaseUserContainer } from "./db/container";
import { setupHTTPUserContainer } from "./http/container";

export function setupUserModule() {
  setupDatabaseUserContainer();
  setupHTTPUserContainer();

  container.register<RegisterUserUseCase>(
    InjectionTokens.UseCases.RegisterUser,
    {
      useClass: RegisterUserUseCase,
    },
    {
      lifecycle: Lifecycle.Singleton,
    },
  );
}
