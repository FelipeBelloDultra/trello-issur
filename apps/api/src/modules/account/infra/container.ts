import { container, Lifecycle } from "tsyringe";

import { CommandBus } from "@/core/commands/command-bus";
import { QueryBus } from "@/core/queries/query-bus";
import { InjectionTokens } from "@/infra/container/tokens";
import { CreateAccountCommand } from "@/modules/account/application/commands/create-account/command";
import { CreateAccountHandler } from "@/modules/account/application/commands/create-account/handler";
import { SendWelcomeEmailCommand } from "@/modules/account/application/commands/send-welcome-email/command";
import { SendWelcomeEmailHandler } from "@/modules/account/application/commands/send-welcome-email/handler";
import { GetAccountHandler } from "@/modules/account/application/queries/get-account/handler";
import { GetAccountQuery } from "@/modules/account/application/queries/get-account/query";

import { setupArgon2AccountContainer } from "./argon2/container";
import { setupCacheAccountContainer } from "./cache/container";
import { setupDatabaseAccountContainer } from "./db/container";
import { setupEmailAccountContainer } from "./email/container";
import { setupHTTPAccountContainer } from "./http/container";
import { setupQueueAccountContainer } from "./queue/container";

export function setupAccountModule(): void {
  setupArgon2AccountContainer();
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

  const commandBus = container.resolve<CommandBus>(InjectionTokens.Bus.Command);
  commandBus.register(
    CreateAccountCommand,
    container.resolve<CreateAccountHandler>(InjectionTokens.Handlers.CreateAccount),
  );
  commandBus.register(
    SendWelcomeEmailCommand,
    container.resolve<SendWelcomeEmailHandler>(InjectionTokens.Handlers.SendWelcomeEmail),
  );

  const queryBus = container.resolve<QueryBus>(InjectionTokens.Bus.Query);
  queryBus.register(
    GetAccountQuery,
    container.resolve<GetAccountHandler>(InjectionTokens.Handlers.GetAccount),
  );

  setupHTTPAccountContainer();
  setupQueueAccountContainer();
}
