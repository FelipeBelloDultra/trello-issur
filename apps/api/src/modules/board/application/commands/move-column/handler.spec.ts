import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { makeColumn } from "@/test/factories/make-column";
import { InMemoryColumnRepository } from "@/test/repositories/in-memory-column.repository";

import { ColumnNotFoundError } from "../../errors/column-not-found.error";

import { MoveColumnCommand } from "./command";
import { MoveColumnHandler } from "./handler";

describe("MoveColumnHandler", () => {
  let columnRepository: InMemoryColumnRepository;
  let sut: MoveColumnHandler;

  beforeEach(() => {
    columnRepository = new InMemoryColumnRepository();
    sut = new MoveColumnHandler(columnRepository);
  });

  it("repositions an existing column", async () => {
    const column = makeColumn();
    columnRepository.items.push(column);

    const result = await sut.execute(
      new MoveColumnCommand({ columnId: column.id.toValue(), position: 5.5 }),
    );

    expect(result.isRight()).toBe(true);
    expect(columnRepository.items[0].position.toNumber()).toBe(5.5);
  });

  it("renames a column without touching its position when position is omitted", async () => {
    const column = makeColumn();
    columnRepository.items.push(column);
    const originalPosition = column.position.toNumber();

    await sut.execute(new MoveColumnCommand({ columnId: column.id.toValue(), name: "Doing" }));

    expect(columnRepository.items[0].name.toString()).toBe("Doing");
    expect(columnRepository.items[0].position.toNumber()).toBe(originalPosition);
  });

  it("returns ColumnNotFoundError when the column does not exist", async () => {
    const result = await sut.execute(
      new MoveColumnCommand({ columnId: UniqueEntityID.create().toValue(), position: 1 }),
    );

    expect(result.value).toBeInstanceOf(ColumnNotFoundError);
  });
});
