import { inject, injectable } from "tsyringe";

import { CommandBus } from "@/core/commands/command-bus";
import { InjectionTokens } from "@/infra/container/tokens";
import { QueueConsumer, QueueConsumerConfig } from "@/infra/queue/adapters/rabbitmq/consumer";
import { Exchanges } from "@/infra/queue/adapters/rabbitmq/exchanges";
import { CreateNotificationCommand } from "@/modules/notifications/application/commands/create-notification/command";
import { WorkspaceInviteRepository } from "@/modules/workspace/application/repositories/workspace-invite.repository";
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
    @inject(InjectionTokens.Bus.Command)
    private readonly commandBus: CommandBus,
    @inject(InjectionTokens.Repositories.WorkspaceInvite)
    private readonly inviteRepository: WorkspaceInviteRepository,
    @inject(InjectionTokens.Cache.Repository)
    cache: CacheRepository,
  ) {
    super(cache);
  }

  public async handle(payload: WorkspaceInviteCreatedPayload): Promise<void> {
    const details = await this.inviteRepository.findDetailsById(payload.inviteId);

    if (!details?.inviteeAccountId) return;

    await this.commandBus.dispatch(
      new CreateNotificationCommand({
        accountId: details.inviteeAccountId,
        type: "workspace_invite",
        title: `you've been invited to ${details.workspaceName}`,
        body: `${details.invitedByName} invited you to join ${details.workspaceName} as ${details.role}`,
        metadata: { workspaceInviteId: details.id },
      }),
    );
  }
}
