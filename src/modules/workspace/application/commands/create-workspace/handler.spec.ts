import { faker } from "@faker-js/faker";

import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { WorkspaceSlug } from "@/modules/workspace/domain/value-objects/workspace-slug";
import { makeWorkspace } from "@/test/factories/make-workspace";
import { InMemoryWorkspaceMemberRepository } from "@/test/repositories/in-memory-workspace-member.repository";
import { InMemoryWorkspaceRepository } from "@/test/repositories/in-memory-workspace.repository";

import { WorkspaceSlugAlreadyTakenError } from "../../errors/workspace-slug-already-taken.error";

import { CreateWorkspaceCommand } from "./command";
import { CreateWorkspaceHandler } from "./handler";

function makeInput(
  overrides?: Partial<{ name: string; ownerId: string; isPersonal: boolean; description: string | null }>,
) {
  return {
    name: faker.company.name(),
    ownerId: UniqueEntityID.create().toValue(),
    isPersonal: false,
    description: null,
    ...overrides,
  };
}

describe("CreateWorkspaceHandler", () => {
  let workspaceRepository: InMemoryWorkspaceRepository;
  let workspaceMemberRepository: InMemoryWorkspaceMemberRepository;
  let sut: CreateWorkspaceHandler;

  beforeEach(() => {
    workspaceRepository = new InMemoryWorkspaceRepository();
    workspaceMemberRepository = new InMemoryWorkspaceMemberRepository();
    sut = new CreateWorkspaceHandler(workspaceRepository, workspaceMemberRepository);
  });

  it("creates the workspace and assigns owner membership on success", async () => {
    const input = makeInput();

    const result = await sut.execute(
      new CreateWorkspaceCommand({ name: input.name, ownerId: input.ownerId, isPersonal: input.isPersonal }),
    );

    expect(result.isRight()).toBe(true);
    expect(workspaceRepository.items).toHaveLength(1);
    expect(workspaceMemberRepository.items).toHaveLength(1);
    expect(workspaceMemberRepository.items[0].role).toBe("owner");
    expect(workspaceMemberRepository.items[0].accountId).toBe(input.ownerId);
  });

  it("auto-resolves slug collision when creating a personal workspace", async () => {
    const input = makeInput({ name: "My Workspace", isPersonal: true });
    workspaceRepository.items.push(makeWorkspace({ slug: WorkspaceSlug.fromName("My Workspace") }));

    const result = await sut.execute(
      new CreateWorkspaceCommand({ name: input.name, ownerId: input.ownerId, isPersonal: input.isPersonal }),
    );

    expect(result.isRight()).toBe(true);
    expect(workspaceRepository.items).toHaveLength(2);
    expect(workspaceRepository.items[1].slug.toString()).toBe("my-workspace-2");
  });

  it("returns WorkspaceSlugAlreadyTakenError when slug is taken for a manual workspace", async () => {
    const input = makeInput({ name: "My Workspace" });
    workspaceRepository.items.push(makeWorkspace({ slug: WorkspaceSlug.fromName("My Workspace") }));

    const result = await sut.execute(
      new CreateWorkspaceCommand({ name: input.name, ownerId: input.ownerId, isPersonal: input.isPersonal }),
    );

    expect(result.value).toBeInstanceOf(WorkspaceSlugAlreadyTakenError);
  });

  it("does not persist workspace or membership when manual slug is taken", async () => {
    const input = makeInput({ name: "My Workspace" });
    workspaceRepository.items.push(makeWorkspace({ slug: WorkspaceSlug.fromName("My Workspace") }));

    await sut.execute(new CreateWorkspaceCommand({ name: input.name, ownerId: input.ownerId, isPersonal: input.isPersonal }));

    expect(workspaceRepository.items).toHaveLength(1);
    expect(workspaceMemberRepository.items).toHaveLength(0);
  });
});
