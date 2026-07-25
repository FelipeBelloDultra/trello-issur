import { Pagination } from "@/core/entity/pagination";
import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { makeWorkspaceInvite } from "@/test/factories/make-workspace-invite";
import { InMemoryWorkspaceInviteRepository } from "@/test/repositories/in-memory-workspace-invite.repository";

import { ListWorkspaceInvitesHandler } from "./handler";
import { ListWorkspaceInvitesQuery } from "./query";

describe("ListWorkspaceInvitesHandler", () => {
  let inviteRepository: InMemoryWorkspaceInviteRepository;
  let sut: ListWorkspaceInvitesHandler;

  beforeEach(() => {
    inviteRepository = new InMemoryWorkspaceInviteRepository();
    sut = new ListWorkspaceInvitesHandler(inviteRepository);
  });

  it("returns only invites scoped to the given workspace", async () => {
    const workspaceId = UniqueEntityID.create().toValue();
    inviteRepository.items.push(
      makeWorkspaceInvite({ workspaceId: UniqueEntityID.create(workspaceId) }),
      makeWorkspaceInvite({ workspaceId: UniqueEntityID.create() }),
    );

    const result = await sut.execute(
      new ListWorkspaceInvitesQuery(workspaceId, Pagination.create({ page: 1, limit: 10 })),
    );

    expect(result.invites).toHaveLength(1);
  });

  it("paginates the results and calculates pagination metadata", async () => {
    const workspaceId = UniqueEntityID.create().toValue();
    for (let i = 0; i < 3; i += 1) {
      inviteRepository.items.push(
        makeWorkspaceInvite({ workspaceId: UniqueEntityID.create(workspaceId) }),
      );
    }

    const result = await sut.execute(
      new ListWorkspaceInvitesQuery(workspaceId, Pagination.create({ page: 1, limit: 2 })),
    );

    expect(result.invites).toHaveLength(2);
    expect(result.pagination).toEqual({
      totalPages: 2,
      currentPage: 1,
      hasNextPage: true,
      hasPreviousPage: false,
    });
  });

  it("returns an empty list when the workspace has no invites", async () => {
    const result = await sut.execute(
      new ListWorkspaceInvitesQuery(
        UniqueEntityID.create().toValue(),
        Pagination.create({ page: 1, limit: 10 }),
      ),
    );

    expect(result.invites).toEqual([]);
    expect(result.pagination.totalPages).toBe(0);
  });
});
