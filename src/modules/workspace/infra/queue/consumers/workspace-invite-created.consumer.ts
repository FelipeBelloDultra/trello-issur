import { inject, injectable } from "tsyringe";

import { CommandBus } from "@/core/commands/command-bus";
import { InjectionTokens } from "@/infra/container/tokens";
import { QueueConsumer, QueueConsumerConfig } from "@/infra/queue/adapters/rabbitmq/consumer";
import { Exchanges } from "@/infra/queue/adapters/rabbitmq/exchanges";
import { SendInviteEmailCommand } from "@/modules/workspace/application/commands/send-invite-email/command";
import { CacheRepository } from "@/shared/cache/application/repositories/cache.repository";
import { QueueEvents } from "@/shared/queue/application/events";

// TODO: when notifications module is ready, also dispatch CreateNotificationCommand
// for the invited account (if one exists) so they see it in their notification feed.

interface WorkspaceInviteCreatedPayload {
  inviteId: string;
}

@injectable()
export class WorkspaceInviteCreatedConsumer extends QueueConsumer<WorkspaceInviteCreatedPayload> {
  protected readonly config: QueueConsumerConfig = {
    exchange: Exchanges.Main,
    queue: QueueEvents.WorkspaceInvite.Created,
    routingKey: QueueEvents.WorkspaceInvite.Created,
  };

  public constructor(
    @inject(InjectionTokens.Bus.Command)
    private readonly commandBus: CommandBus,
    @inject(InjectionTokens.Cache.Repository)
    cache: CacheRepository,
  ) {
    super(cache);
  }

  public async handle(payload: WorkspaceInviteCreatedPayload): Promise<void> {
    await this.commandBus.dispatch(new SendInviteEmailCommand(payload.inviteId));
  }
}
