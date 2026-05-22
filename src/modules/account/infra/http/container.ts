import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";

import { CreateAccountController } from "./controllers/create-account.controller";

export function setupHTTPAccountContainer() {
  container.register<CreateAccountController>(
    InjectionTokens.Controllers.CreateAccount,
    { useClass: CreateAccountController },
    { lifecycle: Lifecycle.Singleton },
  );
}
