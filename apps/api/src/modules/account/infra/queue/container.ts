import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { ConsumerRegistry } from "@/infra/queue/consumer-registry";

import { AccountCreatedConsumer } from "./consumers/account-created.consumer";

export function setupQueueAccountContainer(): void {
  container.register<AccountCreatedConsumer>(
    InjectionTokens.Consumers.AccountCreated,
    { useClass: AccountCreatedConsumer },
    { lifecycle: Lifecycle.Singleton },
  );

  const registry = container.resolve<ConsumerRegistry>(InjectionTokens.Queue.ConsumerRegistry);
  registry.register(
    container.resolve<AccountCreatedConsumer>(InjectionTokens.Consumers.AccountCreated),
  );
}
