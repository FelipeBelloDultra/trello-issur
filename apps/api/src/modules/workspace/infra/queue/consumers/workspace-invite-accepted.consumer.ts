import { inject, injectable } from "tsyringe";

import { CommandBus } from "@/core/commands/command-bus";
import { InjectionTokens } from "@/infra/container/tokens";
import { QueueConsumer, QueueConsumerConfig } from "@/infra/queue/adapters/rabbitmq/consumer";
import { Exchanges } from "@/infra/queue/adapters/rabbitmq/exchanges";
import { CreateNotificationCommand } from "@/modules/notifications/application/commands/create-notification/command";
import { WorkspaceInviteRepository } from "@/modules/workspace/application/repositories/workspace-invite.repository";
import { CacheRepository } from "@/shared/cache/application/repositories/cache.repository";
import { QueueEvents } from "@/shared/queue/application/events";

interface WorkspaceInviteAcceptedPayload {
  inviteId: string;
  accountId: string;
}

@injectable()
export class WorkspaceInviteAcceptedConsumer extends QueueConsumer<WorkspaceInviteAcceptedPayload> {
  protected readonly config: QueueConsumerConfig = {
    exchange: Exchanges.Main,
    queue: QueueEvents.WorkspaceInvite.Accepted,
    routingKey: QueueEvents.WorkspaceInvite.Accepted,
  };

  public constructor(
    @inject(InjectionTokens.Bus.Command)
    private readonly commandBus: CommandBus,
    @inject(InjectionTokens.Repositories.WorkspaceInvite)
    private readonly inviteRepository: WorkspaceInviteRepository,
    @inject(InjectionTokens.Cache.Repository)
    cache: CacheRepository,
  ) {
    super(cache);
  }

  public async handle(payload: WorkspaceInviteAcceptedPayload): Promise<void> {
    const details = await this.inviteRepository.findAcceptanceDetails(
      payload.inviteId,
      payload.accountId,
    );

    if (!details) return;

    await this.commandBus.dispatch(
      new CreateNotificationCommand({
        accountId: details.invitedByAccountId,
        type: "workspace_invite_accepted",
        title: `${details.accepterName} joined ${details.workspaceName}`,
        body: `${details.accepterName} accepted your invite to ${details.workspaceName}`,
        metadata: { workspaceInviteId: payload.inviteId },
      }),
    );
  }
}
