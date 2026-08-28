import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { makeBoard } from "@/test/factories/make-board";
import { makeCard } from "@/test/factories/make-card";
import { makeColumn } from "@/test/factories/make-column";
import { InMemoryBoardRepository } from "@/test/repositories/in-memory-board.repository";
import { InMemoryCardRepository } from "@/test/repositories/in-memory-card.repository";
import { InMemoryColumnRepository } from "@/test/repositories/in-memory-column.repository";

import { GetBoardHandler } from "./handler";
import { GetBoardQuery } from "./query";

describe("GetBoardHandler", () => {
  let boardRepository: InMemoryBoardRepository;
  let columnRepository: InMemoryColumnRepository;
  let cardRepository: InMemoryCardRepository;
  let sut: GetBoardHandler;

  beforeEach(() => {
    boardRepository = new InMemoryBoardRepository();
    columnRepository = new InMemoryColumnRepository();
    cardRepository = new InMemoryCardRepository();
    sut = new GetBoardHandler(boardRepository, columnRepository, cardRepository);
  });

  it("returns the board with its columns and cards", async () => {
    const board = makeBoard();
    boardRepository.items.push(board);
    const column = makeColumn({ boardId: board.id });
    columnRepository.items.push(column);
    const card = makeCard({ boardId: board.id, columnId: column.id });
    cardRepository.items.push(card);

    const result = await sut.execute(new GetBoardQuery(board.id.toValue()));

    expect(result?.board.id.equals(board.id)).toBe(true);
    expect(result?.columns).toHaveLength(1);
    expect(result?.cards).toHaveLength(1);
  });

  it("returns null when the board does not exist", async () => {
    const result = await sut.execute(new GetBoardQuery(UniqueEntityID.create().toValue()));

    expect(result).toBeNull();
  });
});
