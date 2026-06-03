import { inject, injectable } from "tsyringe";

import { CommandBus } from "@/core/commands/command-bus";
import { InjectionTokens } from "@/infra/container/tokens";
import { QueueConsumer, QueueConsumerConfig } from "@/infra/queue/adapters/rabbitmq/consumer";
import { Exchanges } from "@/infra/queue/adapters/rabbitmq/exchanges";
import { CreateWorkspaceCommand } from "@/modules/workspace/application/commands/create-workspace/command";
import { QueueEvents } from "@/shared/queue/application/events";

interface WorkspacePersonalCreationRequestedPayload {
  accountId: string;
  accountName: string;
}

@injectable()
export class WorkspacePersonalCreationRequestedConsumer extends QueueConsumer<WorkspacePersonalCreationRequestedPayload> {
  protected readonly config: QueueConsumerConfig = {
    exchange: Exchanges.Main,
    queue: QueueEvents.Workspace.PersonalCreationRequested,
    routingKey: QueueEvents.Workspace.PersonalCreationRequested,
  };

  public constructor(
    @inject(InjectionTokens.Bus.Command)
    private readonly commandBus: CommandBus,
  ) {
    super();
  }

  public async handle(payload: WorkspacePersonalCreationRequestedPayload): Promise<void> {
    const [firstName] = payload.accountName.split(" ");
    await this.commandBus.dispatch(
      new CreateWorkspaceCommand({
        name: `${firstName} Workspace`,
        ownerId: payload.accountId,
        isPersonal: true,
      }),
    );
  }
}
