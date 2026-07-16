import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { makeWorkspace } from "@/test/factories/make-workspace";
import { InMemoryWorkspaceRepository } from "@/test/repositories/in-memory-workspace.repository";

import { GetWorkspaceHandler } from "./handler";
import { GetWorkspaceQuery } from "./query";

describe("GetWorkspaceHandler", () => {
  let workspaceRepository: InMemoryWorkspaceRepository;
  let sut: GetWorkspaceHandler;

  beforeEach(() => {
    workspaceRepository = new InMemoryWorkspaceRepository();
    sut = new GetWorkspaceHandler(workspaceRepository);
  });

  it("returns the workspace when it exists", async () => {
    const workspace = makeWorkspace();
    workspaceRepository.items.push(workspace);

    const result = await sut.execute(new GetWorkspaceQuery(workspace.id.toValue()));

    expect(result?.id.equals(workspace.id)).toBe(true);
  });

  it("returns null when the workspace does not exist", async () => {
    const result = await sut.execute(new GetWorkspaceQuery(UniqueEntityID.create().toValue()));

    expect(result).toBeNull();
  });
});
