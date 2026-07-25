import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { WorkspaceMemberRoles } from "@/modules/workspace/domain/value-objects/workspace-member-role";
import { InMemoryWorkspaceMemberRepository } from "@/test/repositories/in-memory-workspace-member.repository";

import { CannotUpdateOwnerRoleError } from "../../errors/cannot-update-owner-role.error";
import { WorkspaceMemberNotFoundError } from "../../errors/workspace-member-not-found.error";

import { UpdateWorkspaceMemberRoleCommand } from "./command";
import { UpdateWorkspaceMemberRoleHandler } from "./handler";

describe("UpdateWorkspaceMemberRoleHandler", () => {
  let memberRepository: InMemoryWorkspaceMemberRepository;
  let sut: UpdateWorkspaceMemberRoleHandler;

  beforeEach(() => {
    memberRepository = new InMemoryWorkspaceMemberRepository();
    sut = new UpdateWorkspaceMemberRoleHandler(memberRepository);
  });

  it("updates the member's role", async () => {
    const workspaceId = UniqueEntityID.create().toValue();
    const memberId = UniqueEntityID.create().toValue();
    memberRepository.items.push({
      id: memberId,
      workspaceId,
      accountId: UniqueEntityID.create().toValue(),
      role: WorkspaceMemberRoles.Member,
    });

    const result = await sut.execute(
      new UpdateWorkspaceMemberRoleCommand(workspaceId, memberId, WorkspaceMemberRoles.Admin),
    );

    expect(result.isRight()).toBe(true);
    expect(memberRepository.items[0]?.role).toBe(WorkspaceMemberRoles.Admin);
  });

  it("returns WorkspaceMemberNotFoundError when the member doesn't exist", async () => {
    const result = await sut.execute(
      new UpdateWorkspaceMemberRoleCommand(
        UniqueEntityID.create().toValue(),
        UniqueEntityID.create().toValue(),
        WorkspaceMemberRoles.Admin,
      ),
    );

    expect(result.value).toBeInstanceOf(WorkspaceMemberNotFoundError);
  });

  it("returns WorkspaceMemberNotFoundError when the member belongs to a different workspace", async () => {
    const memberId = UniqueEntityID.create().toValue();
    memberRepository.items.push({
      id: memberId,
      workspaceId: UniqueEntityID.create().toValue(),
      accountId: UniqueEntityID.create().toValue(),
      role: WorkspaceMemberRoles.Member,
    });

    const result = await sut.execute(
      new UpdateWorkspaceMemberRoleCommand(
        UniqueEntityID.create().toValue(),
        memberId,
        WorkspaceMemberRoles.Admin,
      ),
    );

    expect(result.value).toBeInstanceOf(WorkspaceMemberNotFoundError);
    expect(memberRepository.items[0]?.role).toBe(WorkspaceMemberRoles.Member);
  });

  it("returns CannotUpdateOwnerRoleError when target is the workspace owner", async () => {
    const workspaceId = UniqueEntityID.create().toValue();
    const memberId = UniqueEntityID.create().toValue();
    memberRepository.items.push({
      id: memberId,
      workspaceId,
      accountId: UniqueEntityID.create().toValue(),
      role: WorkspaceMemberRoles.Owner,
    });

    const result = await sut.execute(
      new UpdateWorkspaceMemberRoleCommand(workspaceId, memberId, WorkspaceMemberRoles.Admin),
    );

    expect(result.value).toBeInstanceOf(CannotUpdateOwnerRoleError);
    expect(memberRepository.items[0]?.role).toBe(WorkspaceMemberRoles.Owner);
  });
});
