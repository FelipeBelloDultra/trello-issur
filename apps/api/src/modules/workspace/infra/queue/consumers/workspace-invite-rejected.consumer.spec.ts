import { CreateNotificationCommand } from "@/modules/notifications/application/commands/create-notification/command";
import { InMemoryCommandBus } from "@/test/bus/in-memory-command-bus";
import { InMemoryCacheRepository } from "@/test/cache/in-memory-cache-repository";
import { makeWorkspaceInvite } from "@/test/factories/make-workspace-invite";
import { InMemoryWorkspaceInviteRepository } from "@/test/repositories/in-memory-workspace-invite.repository";

import { WorkspaceInviteRejectedConsumer } from "./workspace-invite-rejected.consumer";

describe("WorkspaceInviteRejectedConsumer", () => {
  let commandBus: InMemoryCommandBus;
  let inviteRepository: InMemoryWorkspaceInviteRepository;
  let cache: InMemoryCacheRepository;
  let sut: WorkspaceInviteRejectedConsumer;

  beforeEach(() => {
    commandBus = new InMemoryCommandBus();
    inviteRepository = new InMemoryWorkspaceInviteRepository();
    cache = new InMemoryCacheRepository();
    sut = new WorkspaceInviteRejectedConsumer(commandBus, inviteRepository, cache);
  });

  it("notifies the inviter with a workspace_invite_rejected notification", async () => {
    const invite = makeWorkspaceInvite();
    inviteRepository.items.push(invite);

    await sut.handle({ inviteId: invite.id.toValue(), accountId: "responder-account-id" });

    expect(commandBus.dispatched).toHaveLength(1);
    const command = commandBus.dispatched[0] as CreateNotificationCommand;
    expect(command).toBeInstanceOf(CreateNotificationCommand);
    expect(command.props.accountId).toBe(invite.invitedByAccountId.toValue());
    expect(command.props.type).toBe("workspace_invite_rejected");
    expect(command.props.metadata).toEqual({ workspaceInviteId: invite.id.toValue() });
  });

  it("does nothing when the invite no longer exists", async () => {
    await sut.handle({ inviteId: "unknown-invite-id", accountId: "responder-account-id" });

    expect(commandBus.dispatched).toHaveLength(0);
  });
});
