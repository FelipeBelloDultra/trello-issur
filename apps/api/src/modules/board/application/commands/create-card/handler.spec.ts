import { faker } from "@faker-js/faker";

import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { makeColumn } from "@/test/factories/make-column";
import { InMemoryCardRepository } from "@/test/repositories/in-memory-card.repository";
import { InMemoryColumnRepository } from "@/test/repositories/in-memory-column.repository";

import { ColumnNotFoundError } from "../../errors/column-not-found.error";

import { CreateCardCommand } from "./command";
import { CreateCardHandler } from "./handler";

describe("CreateCardHandler", () => {
  let columnRepository: InMemoryColumnRepository;
  let cardRepository: InMemoryCardRepository;
  let sut: CreateCardHandler;

  beforeEach(() => {
    columnRepository = new InMemoryColumnRepository();
    cardRepository = new InMemoryCardRepository();
    sut = new CreateCardHandler(columnRepository, cardRepository);
  });

  it("creates a card at the end of the column, inheriting the column's board", async () => {
    const column = makeColumn();
    columnRepository.items.push(column);

    const result = await sut.execute(
      new CreateCardCommand({ columnId: column.id.toValue(), title: faker.lorem.words(2) }),
    );

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.card.boardId.equals(column.boardId)).toBe(true);
      expect(result.value.card.position.toNumber()).toBe(1);
    }
  });

  it("returns ColumnNotFoundError when the column does not exist", async () => {
    const result = await sut.execute(
      new CreateCardCommand({ columnId: UniqueEntityID.create().toValue(), title: "Card" }),
    );

    expect(result.value).toBeInstanceOf(ColumnNotFoundError);
  });
});
