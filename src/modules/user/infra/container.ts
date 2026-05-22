import { container, Lifecycle } from "tsyringe";

import { InMemoryCommandBus } from "@/infra/bus/in-memory-command-bus";
import { InjectionTokens } from "@/infra/container/tokens";
import { RegisterUserCommand } from "@/modules/user/application/commands/register-user/command";
import { RegisterUserHandler } from "@/modules/user/application/commands/register-user/handler";

import { setupDatabaseUserContainer } from "./db/container";
import { setupHTTPUserContainer } from "./http/container";

export function setupUserModule(): void {
  setupDatabaseUserContainer();

  container.register<RegisterUserHandler>(
    InjectionTokens.Handlers.RegisterUser,
    { useClass: RegisterUserHandler },
    { lifecycle: Lifecycle.Singleton },
  );

  const commandBus = container.resolve<InMemoryCommandBus>(InjectionTokens.Bus.Command);
  commandBus.register(
    RegisterUserCommand,
    container.resolve<RegisterUserHandler>(InjectionTokens.Handlers.RegisterUser),
  );

  setupHTTPUserContainer();
}
