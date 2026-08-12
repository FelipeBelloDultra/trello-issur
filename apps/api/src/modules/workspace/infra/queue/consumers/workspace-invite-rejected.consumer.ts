import { inject, injectable } from "tsyringe";

import { CommandBus } from "@/core/commands/command-bus";
import { InjectionTokens } from "@/infra/container/tokens";
import { QueueConsumer, QueueConsumerConfig } from "@/infra/queue/adapters/rabbitmq/consumer";
import { Exchanges } from "@/infra/queue/adapters/rabbitmq/exchanges";
import { CreateNotificationCommand } from "@/modules/notifications/application/commands/create-notification/command";
import { WorkspaceInviteRepository } from "@/modules/workspace/application/repositories/workspace-invite.repository";
import { CacheRepository } from "@/shared/cache/application/repositories/cache.repository";
import { QueueEvents } from "@/shared/queue/application/events";

interface WorkspaceInviteRejectedPayload {
  inviteId: string;
  accountId: string;
}

@injectable()
export class WorkspaceInviteRejectedConsumer extends QueueConsumer<WorkspaceInviteRejectedPayload> {
  protected readonly config: QueueConsumerConfig = {
    exchange: Exchanges.Main,
    queue: QueueEvents.WorkspaceInvite.Rejected,
    routingKey: QueueEvents.WorkspaceInvite.Rejected,
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

  public async handle(payload: WorkspaceInviteRejectedPayload): Promise<void> {
    const details = await this.inviteRepository.findRespondedDetails(
      payload.inviteId,
      payload.accountId,
    );

    if (!details) return;

    await this.commandBus.dispatch(
      new CreateNotificationCommand({
        accountId: details.invitedByAccountId,
        type: "workspace_invite_rejected",
        title: `${details.responderName} declined your invite to ${details.workspaceName}`,
        body: `${details.responderName} rejected your invite to join ${details.workspaceName}`,
        metadata: { workspaceInviteId: payload.inviteId },
      }),
    );
  }
}
