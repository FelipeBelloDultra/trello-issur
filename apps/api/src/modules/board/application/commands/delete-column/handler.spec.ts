import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { InjectionTokens } from "@/infra/container/tokens";
import { makeCard } from "@/test/factories/make-card";
import { makeColumn } from "@/test/factories/make-column";
import { InMemoryCardRepository } from "@/test/repositories/in-memory-card.repository";
import { InMemoryColumnRepository } from "@/test/repositories/in-memory-column.repository";
import { InMemoryUnitOfWork } from "@/test/repositories/in-memory-unit-of-work";

import { ColumnNotFoundError } from "../../errors/column-not-found.error";

import { DeleteColumnCommand } from "./command";
import { DeleteColumnHandler } from "./handler";

describe("DeleteColumnHandler", () => {
  let columnRepository: InMemoryColumnRepository;
  let cardRepository: InMemoryCardRepository;
  let unitOfWork: InMemoryUnitOfWork;
  let sut: DeleteColumnHandler;

  beforeEach(() => {
    columnRepository = new InMemoryColumnRepository();
    cardRepository = new InMemoryCardRepository();
    unitOfWork = new InMemoryUnitOfWork(
      new Map<symbol, unknown>([
        [InjectionTokens.Repositories.Column, columnRepository],
        [InjectionTokens.Repositories.Card, cardRepository],
      ]),
    );
    sut = new DeleteColumnHandler(columnRepository, unitOfWork);
  });

  it("deletes the column and its cards", async () => {
    const column = makeColumn();
    columnRepository.items.push(column);
    cardRepository.items.push(makeCard({ columnId: column.id }), makeCard({ columnId: column.id }));

    const result = await sut.execute(new DeleteColumnCommand(column.id.toValue()));

    expect(result.isRight()).toBe(true);
    expect(columnRepository.items).toHaveLength(0);
    expect(cardRepository.items).toHaveLength(0);
  });

  it("returns ColumnNotFoundError when the column does not exist", async () => {
    const result = await sut.execute(new DeleteColumnCommand(UniqueEntityID.create().toValue()));

    expect(result.value).toBeInstanceOf(ColumnNotFoundError);
  });
});
