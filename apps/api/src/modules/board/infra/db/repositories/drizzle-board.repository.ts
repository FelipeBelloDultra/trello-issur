import { eq } from "drizzle-orm";
import { inject, injectable } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { boards } from "@/infra/db/schema/boards";
import { DrizzleExecutor } from "@/infra/db/transaction";
import { BoardRepository } from "@/modules/board/application/repositories/board.repository";
import { Board } from "@/modules/board/domain/entities/board";

import { BoardMapper } from "../mappers/board.mapper";

@injectable()
export class DrizzleBoardRepository implements BoardRepository {
  public constructor(
    @inject(InjectionTokens.Databases.DrizzleExecutor)
    private readonly db: DrizzleExecutor,
  ) {}

  public async create(board: Board): Promise<void> {
    await this.db.insert(boards).values(BoardMapper.toPersistence(board));
  }

  public async save(board: Board): Promise<void> {
    await this.db
      .update(boards)
      .set(BoardMapper.toPersistence(board))
      .where(eq(boards.id, board.id.toValue()));
  }

  public async delete(id: string): Promise<void> {
    await this.db.delete(boards).where(eq(boards.id, id));
  }

  public async findById(id: string): Promise<Board | null> {
    const [row] = await this.db.select().from(boards).where(eq(boards.id, id)).limit(1);

    return row ? BoardMapper.toDomain(row) : null;
  }

  public async findAllByWorkspaceId(workspaceId: string): Promise<Board[]> {
    const rows = await this.db.select().from(boards).where(eq(boards.workspaceId, workspaceId));

    return rows.map((row) => BoardMapper.toDomain(row));
  }
}
