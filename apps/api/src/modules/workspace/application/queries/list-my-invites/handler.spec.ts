import { Pagination } from "@/core/entity/pagination";
import { InviteExpiry } from "@/modules/workspace/domain/value-objects/invite-expiry";
import { WorkspaceInviteStatuses } from "@/modules/workspace/domain/value-objects/workspace-invite-status";
import { makeWorkspaceInvite } from "@/test/factories/make-workspace-invite";
import { InMemoryWorkspaceInviteRepository } from "@/test/repositories/in-memory-workspace-invite.repository";

import { ListMyInvitesHandler } from "./handler";
import { ListMyInvitesQuery } from "./query";

describe("ListMyInvitesHandler", () => {
  let inviteRepository: InMemoryWorkspaceInviteRepository;
  let sut: ListMyInvitesHandler;

  beforeEach(() => {
    inviteRepository = new InMemoryWorkspaceInviteRepository();
    sut = new ListMyInvitesHandler(inviteRepository);
  });

  it("returns the token alongside pending invites for the given email", async () => {
    const invite = makeWorkspaceInvite({ email: "bruno@example.com" });
    inviteRepository.items.push(invite);

    const result = await sut.execute(
      new ListMyInvitesQuery("bruno@example.com", Pagination.create({ page: 1, limit: 10 })),
    );

    expect(result.invites).toHaveLength(1);
    expect(result.invites[0]?.token).toBe(invite.token);
  });

  it("excludes invites belonging to a different email", async () => {
    inviteRepository.items.push(makeWorkspaceInvite({ email: "someone-else@example.com" }));

    const result = await sut.execute(
      new ListMyInvitesQuery("bruno@example.com", Pagination.create({ page: 1, limit: 10 })),
    );

    expect(result.invites).toEqual([]);
  });

  it("excludes invites that are no longer pending", async () => {
    inviteRepository.items.push(
      makeWorkspaceInvite({ email: "bruno@example.com", status: WorkspaceInviteStatuses.Accepted }),
    );

    const result = await sut.execute(
      new ListMyInvitesQuery("bruno@example.com", Pagination.create({ page: 1, limit: 10 })),
    );

    expect(result.invites).toEqual([]);
  });

  it("excludes invites that have expired even if still marked pending", async () => {
    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() - 1);
    inviteRepository.items.push(
      makeWorkspaceInvite({
        email: "bruno@example.com",
        expiresAt: InviteExpiry.restore(expiredDate),
      }),
    );

    const result = await sut.execute(
      new ListMyInvitesQuery("bruno@example.com", Pagination.create({ page: 1, limit: 10 })),
    );

    expect(result.invites).toEqual([]);
  });
});
