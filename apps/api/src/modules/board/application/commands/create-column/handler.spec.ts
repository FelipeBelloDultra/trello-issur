import { faker } from "@faker-js/faker";

import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { Position } from "@/modules/board/domain/value-objects/position";
import { makeColumn } from "@/test/factories/make-column";
import { InMemoryColumnRepository } from "@/test/repositories/in-memory-column.repository";

import { CreateColumnCommand } from "./command";
import { CreateColumnHandler } from "./handler";

describe("CreateColumnHandler", () => {
  let columnRepository: InMemoryColumnRepository;
  let sut: CreateColumnHandler;

  beforeEach(() => {
    columnRepository = new InMemoryColumnRepository();
    sut = new CreateColumnHandler(columnRepository);
  });

  it("creates the first column at position 1 when the board has none", async () => {
    const boardId = UniqueEntityID.create().toValue();

    const { column } = await sut.execute(
      new CreateColumnCommand({ boardId, name: faker.lorem.word() }),
    );

    expect(column.position.toNumber()).toBe(1);
  });

  it("appends a new column after the last existing one", async () => {
    const boardId = UniqueEntityID.create();
    columnRepository.items.push(makeColumn({ boardId, position: Position.first() }));

    const { column } = await sut.execute(
      new CreateColumnCommand({ boardId: boardId.toValue(), name: faker.lorem.word() }),
    );

    expect(column.position.toNumber()).toBe(2);
  });
});
