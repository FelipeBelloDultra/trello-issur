import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { WorkspaceMemberRoles } from "@/modules/workspace/domain/value-objects/workspace-member-role";
import { InMemoryAccountRoleCacheRepository } from "@/test/cache/in-memory-account-role-cache-repository";
import { InMemoryWorkspaceMemberRepository } from "@/test/repositories/in-memory-workspace-member.repository";

import { CannotUpdateOwnerRoleError } from "../../errors/cannot-update-owner-role.error";
import { WorkspaceMemberNotFoundError } from "../../errors/workspace-member-not-found.error";

import { UpdateWorkspaceMemberRoleCommand } from "./command";
import { UpdateWorkspaceMemberRoleHandler } from "./handler";

describe("UpdateWorkspaceMemberRoleHandler", () => {
  let memberRepository: InMemoryWorkspaceMemberRepository;
  let accountRoleCache: InMemoryAccountRoleCacheRepository;
  let sut: UpdateWorkspaceMemberRoleHandler;

  beforeEach(() => {
    memberRepository = new InMemoryWorkspaceMemberRepository();
    accountRoleCache = new InMemoryAccountRoleCacheRepository();
    sut = new UpdateWorkspaceMemberRoleHandler(memberRepository, accountRoleCache);
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

  it("invalidates the member's RBAC cache after a successful role change", async () => {
    const workspaceId = UniqueEntityID.create().toValue();
    const memberId = UniqueEntityID.create().toValue();
    const accountId = UniqueEntityID.create().toValue();
    memberRepository.items.push({
      id: memberId,
      workspaceId,
      accountId,
      role: WorkspaceMemberRoles.Member,
    });

    await sut.execute(
      new UpdateWorkspaceMemberRoleCommand(workspaceId, memberId, WorkspaceMemberRoles.Admin),
    );

    expect(accountRoleCache.invalidateCalls).toEqual([{ accountId, workspaceId }]);
  });

  it("does not invalidate the RBAC cache when the member is not found", async () => {
    await sut.execute(
      new UpdateWorkspaceMemberRoleCommand(
        UniqueEntityID.create().toValue(),
        UniqueEntityID.create().toValue(),
        WorkspaceMemberRoles.Admin,
      ),
    );

    expect(accountRoleCache.invalidateCalls).toEqual([]);
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
