import { asc, desc, eq } from "drizzle-orm";
import { inject, injectable } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { columns } from "@/infra/db/schema/columns";
import { DrizzleExecutor } from "@/infra/db/transaction";
import { ColumnRepository } from "@/modules/board/application/repositories/column.repository";
import { Column } from "@/modules/board/domain/entities/column";

import { ColumnMapper } from "../mappers/column.mapper";

@injectable()
export class DrizzleColumnRepository implements ColumnRepository {
  public constructor(
    @inject(InjectionTokens.Databases.DrizzleExecutor)
    private readonly db: DrizzleExecutor,
  ) {}

  public async create(column: Column): Promise<void> {
    await this.db.insert(columns).values(ColumnMapper.toPersistence(column));
  }

  public async save(column: Column): Promise<void> {
    await this.db
      .update(columns)
      .set(ColumnMapper.toPersistence(column))
      .where(eq(columns.id, column.id.toValue()));
  }

  public async delete(id: string): Promise<void> {
    await this.db.delete(columns).where(eq(columns.id, id));
  }

  public async deleteAllByBoardId(boardId: string): Promise<void> {
    await this.db.delete(columns).where(eq(columns.boardId, boardId));
  }

  public async findById(id: string): Promise<Column | null> {
    const [row] = await this.db.select().from(columns).where(eq(columns.id, id)).limit(1);

    return row ? ColumnMapper.toDomain(row) : null;
  }

  public async findAllByBoardId(boardId: string): Promise<Column[]> {
    const rows = await this.db
      .select()
      .from(columns)
      .where(eq(columns.boardId, boardId))
      .orderBy(asc(columns.position));

    return rows.map((row) => ColumnMapper.toDomain(row));
  }

  public async findLastPositionByBoardId(boardId: string): Promise<number | null> {
    const [row] = await this.db
      .select({ position: columns.position })
      .from(columns)
      .where(eq(columns.boardId, boardId))
      .orderBy(desc(columns.position))
      .limit(1);

    return row ? row.position : null;
  }
}
