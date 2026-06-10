import { inject, injectable } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { QueueConsumer, QueueConsumerConfig } from "@/infra/queue/adapters/rabbitmq/consumer";
import { Exchanges } from "@/infra/queue/adapters/rabbitmq/exchanges";
import { CacheRepository } from "@/shared/cache/application/repositories/cache.repository";
import { QueueEvents } from "@/shared/queue/application/events";

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
    @inject(InjectionTokens.Cache.Repository)
    cache: CacheRepository,
  ) {
    super(cache);
  }

  // TODO: dispatch CreateNotificationCommand when notifications module is ready
  public async handle(_payload: WorkspaceInviteCreatedPayload): Promise<void> {}
}
