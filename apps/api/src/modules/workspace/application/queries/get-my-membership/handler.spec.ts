import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { InMemoryAccountRoleRepository } from "@/test/repositories/in-memory-account-role.repository";

import { GetMyMembershipHandler } from "./handler";
import { GetMyMembershipQuery } from "./query";

describe("GetMyMembershipHandler", () => {
  let accountRoleRepository: InMemoryAccountRoleRepository;
  let sut: GetMyMembershipHandler;

  beforeEach(() => {
    accountRoleRepository = new InMemoryAccountRoleRepository();
    sut = new GetMyMembershipHandler(accountRoleRepository);
  });

  it("returns the account's role and permissions for the workspace", async () => {
    const accountId = UniqueEntityID.create().toValue();
    const workspaceId = UniqueEntityID.create().toValue();
    accountRoleRepository.seed(accountId, workspaceId, ["board:create", "board:edit"], "admin");

    const result = await sut.execute(new GetMyMembershipQuery(accountId, workspaceId));

    expect(result.role).toBe("admin");
    expect(result.permissions).toEqual(["board:create", "board:edit"]);
  });

  it("defaults to 'member' and no permissions when nothing is seeded", async () => {
    const result = await sut.execute(
      new GetMyMembershipQuery(
        UniqueEntityID.create().toValue(),
        UniqueEntityID.create().toValue(),
      ),
    );

    expect(result.role).toBe("member");
    expect(result.permissions).toEqual([]);
  });
});
