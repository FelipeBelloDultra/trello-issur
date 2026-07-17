import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { makeWorkspace } from "@/test/factories/make-workspace";
import { InMemoryAccountRoleRepository } from "@/test/repositories/in-memory-account-role.repository";
import { InMemoryWorkspaceRepository } from "@/test/repositories/in-memory-workspace.repository";

import { ListMyWorkspacesHandler } from "./handler";
import { ListMyWorkspacesQuery } from "./query";

describe("ListMyWorkspacesHandler", () => {
  let workspaceRepository: InMemoryWorkspaceRepository;
  let accountRoleRepository: InMemoryAccountRoleRepository;
  let sut: ListMyWorkspacesHandler;

  beforeEach(() => {
    workspaceRepository = new InMemoryWorkspaceRepository();
    accountRoleRepository = new InMemoryAccountRoleRepository();
    sut = new ListMyWorkspacesHandler(workspaceRepository, accountRoleRepository);
  });

  it("returns each workspace the account belongs to with its role", async () => {
    const accountId = UniqueEntityID.create().toValue();
    const ownerId = UniqueEntityID.create(accountId);
    const workspace = makeWorkspace({ ownerId });
    workspaceRepository.items.push(workspace);
    accountRoleRepository.seed(accountId, workspace.id.toValue(), [], "owner");

    const result = await sut.execute(new ListMyWorkspacesQuery(accountId));

    expect(result).toHaveLength(1);
    expect(result[0]?.workspace.id.equals(workspace.id)).toBe(true);
    expect(result[0]?.role).toBe("owner");
  });

  it("returns an empty array when the account has no workspaces", async () => {
    const result = await sut.execute(new ListMyWorkspacesQuery(UniqueEntityID.create().toValue()));

    expect(result).toEqual([]);
  });

  it("defaults to 'member' when no role is found for a workspace", async () => {
    const accountId = UniqueEntityID.create().toValue();
    const ownerId = UniqueEntityID.create(accountId);
    const workspace = makeWorkspace({ ownerId });
    workspaceRepository.items.push(workspace);

    const result = await sut.execute(new ListMyWorkspacesQuery(accountId));

    expect(result[0]?.role).toBe("member");
  });
});
