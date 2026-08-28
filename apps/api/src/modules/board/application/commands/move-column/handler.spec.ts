import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { Position } from "@/modules/board/domain/value-objects/position";
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

  it("appends a lone column at index 0", async () => {
    const column = makeColumn();
    columnRepository.items.push(column);

    const result = await sut.execute(
      new MoveColumnCommand({ columnId: column.id.toValue(), index: 0 }),
    );

    expect(result.isRight()).toBe(true);
    expect(columnRepository.items[0].position.toNumber()).toBe(1);
  });

  it("computes the midpoint between the two neighbors at the target index (Position.between)", async () => {
    // A column only ever reorders within its own board (unlike cards,
    // which take a target columnId) — all three must share `boardId` for
    // "index" to mean anything here.
    const boardId = UniqueEntityID.create();
    const first = makeColumn({ boardId, position: Position.create(1) });
    const second = makeColumn({ boardId, position: Position.create(2) });
    const moving = makeColumn({ boardId, position: Position.create(3) });
    columnRepository.items.push(first, second, moving);

    // Excluding `moving`, remaining siblings are [first, second] — index 1
    // lands between them.
    const result = await sut.execute(
      new MoveColumnCommand({ columnId: moving.id.toValue(), index: 1 }),
    );

    expect(result.isRight()).toBe(true);
    expect(columnRepository.items.find((c) => c.id.equals(moving.id))?.position.toNumber()).toBe(
      1.5,
    );
  });

  it("excludes the column being moved from its own sibling list", async () => {
    const boardId = UniqueEntityID.create();
    const a = makeColumn({ boardId, position: Position.create(1) });
    const b = makeColumn({ boardId, position: Position.create(2) });
    const c = makeColumn({ boardId, position: Position.create(3) });
    columnRepository.items.push(a, b, c);

    // Move `a` to index 1 — excluding itself, remaining siblings are
    // [b, c], so index 1 lands after b and before c.
    const result = await sut.execute(new MoveColumnCommand({ columnId: a.id.toValue(), index: 1 }));

    expect(result.isRight()).toBe(true);
    expect(columnRepository.items.find((c) => c.id.equals(a.id))?.position.toNumber()).toBe(2.5);
  });

  it("renames a column without touching its position when index is omitted", async () => {
    const column = makeColumn();
    columnRepository.items.push(column);
    const originalPosition = column.position.toNumber();

    await sut.execute(new MoveColumnCommand({ columnId: column.id.toValue(), name: "Doing" }));

    expect(columnRepository.items[0].name.toString()).toBe("Doing");
    expect(columnRepository.items[0].position.toNumber()).toBe(originalPosition);
  });

  it("returns ColumnNotFoundError when the column does not exist", async () => {
    const result = await sut.execute(
      new MoveColumnCommand({ columnId: UniqueEntityID.create().toValue(), index: 0 }),
    );

    expect(result.value).toBeInstanceOf(ColumnNotFoundError);
  });
});
