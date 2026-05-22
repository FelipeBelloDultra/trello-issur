import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";

import { RegisterUserController } from "./controllers/register-user.controller";

export function setupHTTPUserContainer() {
  container.register<RegisterUserController>(
    InjectionTokens.Controllers.RegisterUser,
    {
      useClass: RegisterUserController,
    },
    {
      lifecycle: Lifecycle.Singleton,
    },
  );
}
