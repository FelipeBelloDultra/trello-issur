import { container, Lifecycle } from "tsyringe";

import { InMemoryCommandBus } from "@/infra/bus/adapters/in-memory/command-bus";
import { InMemoryQueryBus } from "@/infra/bus/adapters/in-memory/query-bus";
import { InjectionTokens } from "@/infra/container/tokens";
import { CreateAccountCommand } from "@/modules/account/application/commands/create-account/command";
import { CreateAccountHandler } from "@/modules/account/application/commands/create-account/handler";
import { SendWelcomeEmailCommand } from "@/modules/account/application/commands/send-welcome-email/command";
import { SendWelcomeEmailHandler } from "@/modules/account/application/commands/send-welcome-email/handler";
import { GetAccountHandler } from "@/modules/account/application/queries/get-account/handler";
import { GetAccountQuery } from "@/modules/account/application/queries/get-account/query";

import { setupArgon2Container } from "./argon2/container";
import { setupCacheAccountContainer } from "./cache/container";
import { setupDatabaseAccountContainer } from "./db/container";
import { setupEmailAccountContainer } from "./email/container";
import { setupHTTPAccountContainer } from "./http/container";
import { setupQueueAccountContainer } from "./queue/container";

export function setupAccountModule(): void {
  setupArgon2Container();
  setupCacheAccountContainer();
  setupDatabaseAccountContainer();
  setupEmailAccountContainer();

  container.register<CreateAccountHandler>(
    InjectionTokens.Handlers.CreateAccount,
    { useClass: CreateAccountHandler },
    { lifecycle: Lifecycle.Singleton },
  );
  container.register<GetAccountHandler>(
    InjectionTokens.Handlers.GetAccount,
    { useClass: GetAccountHandler },
    { lifecycle: Lifecycle.Singleton },
  );
  container.register<SendWelcomeEmailHandler>(
    InjectionTokens.Handlers.SendWelcomeEmail,
    { useClass: SendWelcomeEmailHandler },
    { lifecycle: Lifecycle.Singleton },
  );

  const commandBus = container.resolve<InMemoryCommandBus>(InjectionTokens.Bus.Command);
  commandBus.register(
    CreateAccountCommand,
    container.resolve<CreateAccountHandler>(InjectionTokens.Handlers.CreateAccount),
  );
  commandBus.register(
    SendWelcomeEmailCommand,
    container.resolve<SendWelcomeEmailHandler>(InjectionTokens.Handlers.SendWelcomeEmail),
  );

  const queryBus = container.resolve<InMemoryQueryBus>(InjectionTokens.Bus.Query);
  queryBus.register(
    GetAccountQuery,
    container.resolve<GetAccountHandler>(InjectionTokens.Handlers.GetAccount),
  );

  setupHTTPAccountContainer();
  setupQueueAccountContainer();
}
