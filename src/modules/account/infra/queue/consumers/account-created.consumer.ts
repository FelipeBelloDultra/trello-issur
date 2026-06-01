import { inject, injectable } from "tsyringe";

import { CommandBus } from "@/core/commands/command-bus";
import { InjectionTokens } from "@/infra/container/tokens";
import { QueueConsumer, QueueConsumerConfig } from "@/infra/queue/adapters/rabbitmq/consumer";
import { Exchanges } from "@/infra/queue/adapters/rabbitmq/exchanges";
import { QueueEvents } from "@/infra/queue/events";
import { SendWelcomeEmailCommand } from "@/modules/account/application/commands/send-welcome-email/command";

interface AccountCreatedPayload {
  accountId: string;
  name: string;
  email: string;
}

@injectable()
export class AccountCreatedConsumer extends QueueConsumer<AccountCreatedPayload> {
  protected readonly config: QueueConsumerConfig = {
    exchange: Exchanges.Main,
    queue: QueueEvents.Account.Created,
    routingKey: QueueEvents.Account.Created,
  };

  public constructor(
    @inject(InjectionTokens.Bus.Command)
    private readonly commandBus: CommandBus,
  ) {
    super();
  }

  public async handle(payload: AccountCreatedPayload): Promise<void> {
    await this.commandBus.dispatch<void>(new SendWelcomeEmailCommand(payload.name, payload.email));
  }
}
