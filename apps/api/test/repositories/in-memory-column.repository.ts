import { ColumnRepository } from "@/modules/board/application/repositories/column.repository";
import { Column } from "@/modules/board/domain/entities/column";

export class InMemoryColumnRepository implements ColumnRepository {
  public readonly items: Column[] = [];

  public async create(column: Column): Promise<void> {
    await Promise.resolve(this.items.push(column));
  }

  public async save(column: Column): Promise<void> {
    const index = this.items.findIndex((c) => c.id.equals(column.id));
    if (index >= 0) this.items[index] = column;
    return Promise.resolve();
  }

  public async delete(id: string): Promise<void> {
    const index = this.items.findIndex((c) => c.id.toValue() === id);
    if (index >= 0) this.items.splice(index, 1);
    return Promise.resolve();
  }

  public async deleteAllByBoardId(boardId: string): Promise<void> {
    let index = this.items.findIndex((c) => c.boardId.toValue() === boardId);
    while (index >= 0) {
      this.items.splice(index, 1);
      index = this.items.findIndex((c) => c.boardId.toValue() === boardId);
    }
    return Promise.resolve();
  }

  public async findById(id: string): Promise<Column | null> {
    const column = this.items.find((c) => c.id.toValue() === id);
    return Promise.resolve(column ?? null);
  }

  public async findAllByBoardId(boardId: string): Promise<Column[]> {
    const columns = this.items
      .filter((c) => c.boardId.toValue() === boardId)
      .sort((a, b) => a.position.toNumber() - b.position.toNumber());
    return Promise.resolve(columns);
  }

  public async findLastPositionByBoardId(boardId: string): Promise<number | null> {
    const columns = await this.findAllByBoardId(boardId);
    if (columns.length === 0) return null;
    return columns[columns.length - 1].position.toNumber();
  }
}
