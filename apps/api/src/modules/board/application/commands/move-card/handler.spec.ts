import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { makeCard } from "@/test/factories/make-card";
import { makeColumn } from "@/test/factories/make-column";
import { InMemoryCardRepository } from "@/test/repositories/in-memory-card.repository";
import { InMemoryColumnRepository } from "@/test/repositories/in-memory-column.repository";

import { CardNotFoundError } from "../../errors/card-not-found.error";
import { ColumnNotFoundError } from "../../errors/column-not-found.error";
import { ColumnNotInBoardError } from "../../errors/column-not-in-board.error";

import { MoveCardCommand } from "./command";
import { MoveCardHandler } from "./handler";

describe("MoveCardHandler", () => {
  let cardRepository: InMemoryCardRepository;
  let columnRepository: InMemoryColumnRepository;
  let sut: MoveCardHandler;

  beforeEach(() => {
    cardRepository = new InMemoryCardRepository();
    columnRepository = new InMemoryColumnRepository();
    sut = new MoveCardHandler(cardRepository, columnRepository);
  });

  it("moves a card to another column of the same board", async () => {
    const boardId = UniqueEntityID.create();
    const sourceColumn = makeColumn({ boardId });
    const targetColumn = makeColumn({ boardId });
    columnRepository.items.push(sourceColumn, targetColumn);
    const card = makeCard({ boardId, columnId: sourceColumn.id });
    cardRepository.items.push(card);

    const result = await sut.execute(
      new MoveCardCommand({
        cardId: card.id.toValue(),
        columnId: targetColumn.id.toValue(),
        position: 3,
      }),
    );

    expect(result.isRight()).toBe(true);
    expect(cardRepository.items[0].columnId.equals(targetColumn.id)).toBe(true);
    expect(cardRepository.items[0].position.toNumber()).toBe(3);
  });

  it("rejects moving a card into a column of a different board", async () => {
    const card = makeCard();
    cardRepository.items.push(card);
    const otherBoardColumn = makeColumn();
    columnRepository.items.push(otherBoardColumn);

    const result = await sut.execute(
      new MoveCardCommand({
        cardId: card.id.toValue(),
        columnId: otherBoardColumn.id.toValue(),
        position: 1,
      }),
    );

    expect(result.value).toBeInstanceOf(ColumnNotInBoardError);
  });

  it("returns CardNotFoundError when the card does not exist", async () => {
    const result = await sut.execute(
      new MoveCardCommand({
        cardId: UniqueEntityID.create().toValue(),
        columnId: UniqueEntityID.create().toValue(),
        position: 1,
      }),
    );

    expect(result.value).toBeInstanceOf(CardNotFoundError);
  });

  it("returns ColumnNotFoundError when the target column does not exist", async () => {
    const card = makeCard();
    cardRepository.items.push(card);

    const result = await sut.execute(
      new MoveCardCommand({
        cardId: card.id.toValue(),
        columnId: UniqueEntityID.create().toValue(),
        position: 1,
      }),
    );

    expect(result.value).toBeInstanceOf(ColumnNotFoundError);
  });
});
