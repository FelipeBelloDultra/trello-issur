import { BoardRepository } from "@/modules/board/application/repositories/board.repository";
import { Board } from "@/modules/board/domain/entities/board";

export class InMemoryBoardRepository implements BoardRepository {
  public readonly items: Board[] = [];

  public async create(board: Board): Promise<void> {
    await Promise.resolve(this.items.push(board));
  }

  public async save(board: Board): Promise<void> {
    const index = this.items.findIndex((b) => b.id.equals(board.id));
    if (index >= 0) this.items[index] = board;
    return Promise.resolve();
  }

  public async delete(id: string): Promise<void> {
    const index = this.items.findIndex((b) => b.id.toValue() === id);
    if (index >= 0) this.items.splice(index, 1);
    return Promise.resolve();
  }

  public async findById(id: string): Promise<Board | null> {
    const board = this.items.find((b) => b.id.toValue() === id);
    return Promise.resolve(board ?? null);
  }

  public async findAllByWorkspaceId(workspaceId: string): Promise<Board[]> {
    return Promise.resolve(this.items.filter((b) => b.workspaceId.toValue() === workspaceId));
  }
}
