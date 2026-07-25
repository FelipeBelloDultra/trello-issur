import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { WorkspaceMemberRoles } from "@/modules/workspace/domain/value-objects/workspace-member-role";
import { InMemoryWorkspaceMemberRepository } from "@/test/repositories/in-memory-workspace-member.repository";

import { CannotRemoveSelfError } from "../../errors/cannot-remove-self.error";
import { CannotRemoveWorkspaceOwnerError } from "../../errors/cannot-remove-workspace-owner.error";
import { WorkspaceMemberNotFoundError } from "../../errors/workspace-member-not-found.error";

import { RemoveWorkspaceMemberCommand } from "./command";
import { RemoveWorkspaceMemberHandler } from "./handler";

describe("RemoveWorkspaceMemberHandler", () => {
  let memberRepository: InMemoryWorkspaceMemberRepository;
  let sut: RemoveWorkspaceMemberHandler;

  beforeEach(() => {
    memberRepository = new InMemoryWorkspaceMemberRepository();
    sut = new RemoveWorkspaceMemberHandler(memberRepository);
  });

  it("removes the member when requester is different and target is not the owner", async () => {
    const workspaceId = UniqueEntityID.create().toValue();
    const memberId = UniqueEntityID.create().toValue();
    memberRepository.items.push({
      id: memberId,
      workspaceId,
      accountId: UniqueEntityID.create().toValue(),
      role: WorkspaceMemberRoles.Member,
    });

    const result = await sut.execute(
      new RemoveWorkspaceMemberCommand(memberId, workspaceId, UniqueEntityID.create().toValue()),
    );

    expect(result.isRight()).toBe(true);
    expect(memberRepository.items).toHaveLength(0);
  });

  it("returns WorkspaceMemberNotFoundError when the member doesn't exist", async () => {
    const result = await sut.execute(
      new RemoveWorkspaceMemberCommand(
        UniqueEntityID.create().toValue(),
        UniqueEntityID.create().toValue(),
        UniqueEntityID.create().toValue(),
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
      new RemoveWorkspaceMemberCommand(
        memberId,
        UniqueEntityID.create().toValue(),
        UniqueEntityID.create().toValue(),
      ),
    );

    expect(result.value).toBeInstanceOf(WorkspaceMemberNotFoundError);
    expect(memberRepository.items).toHaveLength(1);
  });

  it("returns CannotRemoveSelfError when requester tries to remove themselves", async () => {
    const workspaceId = UniqueEntityID.create().toValue();
    const accountId = UniqueEntityID.create().toValue();
    const memberId = UniqueEntityID.create().toValue();
    memberRepository.items.push({
      id: memberId,
      workspaceId,
      accountId,
      role: WorkspaceMemberRoles.Admin,
    });

    const result = await sut.execute(
      new RemoveWorkspaceMemberCommand(memberId, workspaceId, accountId),
    );

    expect(result.value).toBeInstanceOf(CannotRemoveSelfError);
    expect(memberRepository.items).toHaveLength(1);
  });

  it("returns CannotRemoveWorkspaceOwnerError when target is the workspace owner", async () => {
    const workspaceId = UniqueEntityID.create().toValue();
    const memberId = UniqueEntityID.create().toValue();
    memberRepository.items.push({
      id: memberId,
      workspaceId,
      accountId: UniqueEntityID.create().toValue(),
      role: WorkspaceMemberRoles.Owner,
    });

    const result = await sut.execute(
      new RemoveWorkspaceMemberCommand(memberId, workspaceId, UniqueEntityID.create().toValue()),
    );

    expect(result.value).toBeInstanceOf(CannotRemoveWorkspaceOwnerError);
    expect(memberRepository.items).toHaveLength(1);
  });
});
