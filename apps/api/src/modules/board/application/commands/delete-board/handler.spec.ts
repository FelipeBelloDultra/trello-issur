import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { InjectionTokens } from "@/infra/container/tokens";
import { makeBoard } from "@/test/factories/make-board";
import { makeCard } from "@/test/factories/make-card";
import { makeColumn } from "@/test/factories/make-column";
import { InMemoryBoardRepository } from "@/test/repositories/in-memory-board.repository";
import { InMemoryCardRepository } from "@/test/repositories/in-memory-card.repository";
import { InMemoryColumnRepository } from "@/test/repositories/in-memory-column.repository";
import { InMemoryUnitOfWork } from "@/test/repositories/in-memory-unit-of-work";

import { BoardNotFoundError } from "../../errors/board-not-found.error";

import { DeleteBoardCommand } from "./command";
import { DeleteBoardHandler } from "./handler";

describe("DeleteBoardHandler", () => {
  let boardRepository: InMemoryBoardRepository;
  let columnRepository: InMemoryColumnRepository;
  let cardRepository: InMemoryCardRepository;
  let unitOfWork: InMemoryUnitOfWork;
  let sut: DeleteBoardHandler;

  beforeEach(() => {
    boardRepository = new InMemoryBoardRepository();
    columnRepository = new InMemoryColumnRepository();
    cardRepository = new InMemoryCardRepository();
    unitOfWork = new InMemoryUnitOfWork(
      new Map<symbol, unknown>([
        [InjectionTokens.Repositories.Board, boardRepository],
        [InjectionTokens.Repositories.Column, columnRepository],
        [InjectionTokens.Repositories.Card, cardRepository],
      ]),
    );
    sut = new DeleteBoardHandler(boardRepository, unitOfWork);
  });

  it("deletes the board along with its columns and cards", async () => {
    const board = makeBoard();
    boardRepository.items.push(board);
    const column = makeColumn({ boardId: board.id });
    columnRepository.items.push(column);
    cardRepository.items.push(makeCard({ boardId: board.id, columnId: column.id }));

    const result = await sut.execute(new DeleteBoardCommand(board.id.toValue()));

    expect(result.isRight()).toBe(true);
    expect(boardRepository.items).toHaveLength(0);
    expect(columnRepository.items).toHaveLength(0);
    expect(cardRepository.items).toHaveLength(0);
  });

  it("returns BoardNotFoundError when the board does not exist", async () => {
    const result = await sut.execute(new DeleteBoardCommand(UniqueEntityID.create().toValue()));

    expect(result.value).toBeInstanceOf(BoardNotFoundError);
  });
});
