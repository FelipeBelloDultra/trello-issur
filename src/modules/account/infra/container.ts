import { container, Lifecycle } from "tsyringe";

import { InMemoryCommandBus } from "@/infra/bus/in-memory-command-bus";
import { InjectionTokens } from "@/infra/container/tokens";
import { CreateAccountCommand } from "@/modules/account/application/commands/create-account/command";
import { CreateAccountHandler } from "@/modules/account/application/commands/create-account/handler";

import { setupDatabaseAccountContainer } from "./db/container";
import { setupHTTPAccountContainer } from "./http/container";

export function setupAccountModule(): void {
  setupDatabaseAccountContainer();

  container.register<CreateAccountHandler>(
    InjectionTokens.Handlers.CreateAccount,
    { useClass: CreateAccountHandler },
    { lifecycle: Lifecycle.Singleton },
  );

  const commandBus = container.resolve<InMemoryCommandBus>(InjectionTokens.Bus.Command);
  commandBus.register(
    CreateAccountCommand,
    container.resolve<CreateAccountHandler>(InjectionTokens.Handlers.CreateAccount),
  );

  setupHTTPAccountContainer();
}
