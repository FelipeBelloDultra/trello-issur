import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { Position } from "@/modules/board/domain/value-objects/position";
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

  it("moves a card to another column of the same board, appending at the given index", async () => {
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
        index: 0,
      }),
    );

    expect(result.isRight()).toBe(true);
    expect(cardRepository.items[0].columnId.equals(targetColumn.id)).toBe(true);
    expect(cardRepository.items[0].position.toNumber()).toBe(1);
  });

  it("computes the midpoint between the two neighbors at the target index (Position.between)", async () => {
    const boardId = UniqueEntityID.create();
    const column = makeColumn({ boardId });
    columnRepository.items.push(column);
    const first = makeCard({ boardId, columnId: column.id, position: Position.create(1) });
    const second = makeCard({ boardId, columnId: column.id, position: Position.create(2) });
    cardRepository.items.push(first, second);
    const moving = makeCard({ boardId, columnId: UniqueEntityID.create() });
    cardRepository.items.push(moving);

    // Insert at index 1 — between `first` (index 0) and `second` (index 1
    // once `moving` isn't counted, since it isn't a sibling of `column` yet).
    const result = await sut.execute(
      new MoveCardCommand({ cardId: moving.id.toValue(), columnId: column.id.toValue(), index: 1 }),
    );

    expect(result.isRight()).toBe(true);
    expect(cardRepository.items.find((c) => c.id.equals(moving.id))?.position.toNumber()).toBe(1.5);
  });

  it("excludes the card being moved from its own sibling list when reordering within the same column", async () => {
    const boardId = UniqueEntityID.create();
    const column = makeColumn({ boardId });
    columnRepository.items.push(column);
    const a = makeCard({ boardId, columnId: column.id, position: Position.create(1) });
    const b = makeCard({ boardId, columnId: column.id, position: Position.create(2) });
    const c = makeCard({ boardId, columnId: column.id, position: Position.create(3) });
    cardRepository.items.push(a, b, c);

    // Move `a` to index 1 within its own column — excluding itself, the
    // remaining siblings are [b, c], so index 1 lands after b and before c.
    const result = await sut.execute(
      new MoveCardCommand({ cardId: a.id.toValue(), columnId: column.id.toValue(), index: 1 }),
    );

    expect(result.isRight()).toBe(true);
    expect(cardRepository.items.find((card) => card.id.equals(a.id))?.position.toNumber()).toBe(
      2.5,
    );
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
        index: 0,
      }),
    );

    expect(result.value).toBeInstanceOf(ColumnNotInBoardError);
  });

  it("returns CardNotFoundError when the card does not exist", async () => {
    const result = await sut.execute(
      new MoveCardCommand({
        cardId: UniqueEntityID.create().toValue(),
        columnId: UniqueEntityID.create().toValue(),
        index: 0,
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
        index: 0,
      }),
    );

    expect(result.value).toBeInstanceOf(ColumnNotFoundError);
  });
});
