import { faker } from "@faker-js/faker";

import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { InMemoryBoardRepository } from "@/test/repositories/in-memory-board.repository";

import { BoardNameEmptyError } from "../../../domain/errors/board-name-empty.error";

import { CreateBoardCommand } from "./command";
import { CreateBoardHandler } from "./handler";

describe("CreateBoardHandler", () => {
  let boardRepository: InMemoryBoardRepository;
  let sut: CreateBoardHandler;

  beforeEach(() => {
    boardRepository = new InMemoryBoardRepository();
    sut = new CreateBoardHandler(boardRepository);
  });

  it("creates a board tied to the given workspace", async () => {
    const workspaceId = UniqueEntityID.create().toValue();

    const { board } = await sut.execute(
      new CreateBoardCommand({ workspaceId, name: faker.lorem.words(2) }),
    );

    expect(boardRepository.items).toHaveLength(1);
    expect(board.workspaceId.toValue()).toBe(workspaceId);
  });

  it("throws BoardNameEmptyError for an empty name", async () => {
    const workspaceId = UniqueEntityID.create().toValue();

    await expect(
      sut.execute(new CreateBoardCommand({ workspaceId, name: "   " })),
    ).rejects.toBeInstanceOf(BoardNameEmptyError);
  });
});
