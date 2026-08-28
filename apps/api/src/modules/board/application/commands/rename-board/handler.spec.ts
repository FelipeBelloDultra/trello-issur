import { faker } from "@faker-js/faker";

import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { makeBoard } from "@/test/factories/make-board";
import { InMemoryBoardRepository } from "@/test/repositories/in-memory-board.repository";

import { BoardNotFoundError } from "../../errors/board-not-found.error";

import { RenameBoardCommand } from "./command";
import { RenameBoardHandler } from "./handler";

describe("RenameBoardHandler", () => {
  let boardRepository: InMemoryBoardRepository;
  let sut: RenameBoardHandler;

  beforeEach(() => {
    boardRepository = new InMemoryBoardRepository();
    sut = new RenameBoardHandler(boardRepository);
  });

  it("renames an existing board", async () => {
    const board = makeBoard();
    boardRepository.items.push(board);
    const newName = faker.lorem.words(3);

    const result = await sut.execute(
      new RenameBoardCommand({ boardId: board.id.toValue(), name: newName }),
    );

    expect(result.isRight()).toBe(true);
    expect(boardRepository.items[0].name.toString()).toBe(newName);
  });

  it("returns BoardNotFoundError when the board does not exist", async () => {
    const result = await sut.execute(
      new RenameBoardCommand({ boardId: UniqueEntityID.create().toValue(), name: "New name" }),
    );

    expect(result.value).toBeInstanceOf(BoardNotFoundError);
  });
});
