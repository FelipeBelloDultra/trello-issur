import { asc, desc, eq } from "drizzle-orm";
import { inject, injectable } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { cards } from "@/infra/db/schema/cards";
import { DrizzleExecutor } from "@/infra/db/transaction";
import { CardRepository } from "@/modules/board/application/repositories/card.repository";
import { Card } from "@/modules/board/domain/entities/card";

import { CardMapper } from "../mappers/card.mapper";

@injectable()
export class DrizzleCardRepository implements CardRepository {
  public constructor(
    @inject(InjectionTokens.Databases.DrizzleExecutor)
    private readonly db: DrizzleExecutor,
  ) {}

  public async create(card: Card): Promise<void> {
    await this.db.insert(cards).values(CardMapper.toPersistence(card));
  }

  public async save(card: Card): Promise<void> {
    await this.db
      .update(cards)
      .set(CardMapper.toPersistence(card))
      .where(eq(cards.id, card.id.toValue()));
  }

  public async delete(id: string): Promise<void> {
    await this.db.delete(cards).where(eq(cards.id, id));
  }

  public async deleteAllByBoardId(boardId: string): Promise<void> {
    await this.db.delete(cards).where(eq(cards.boardId, boardId));
  }

  public async deleteAllByColumnId(columnId: string): Promise<void> {
    await this.db.delete(cards).where(eq(cards.columnId, columnId));
  }

  public async findById(id: string): Promise<Card | null> {
    const [row] = await this.db.select().from(cards).where(eq(cards.id, id)).limit(1);

    return row ? CardMapper.toDomain(row) : null;
  }

  public async findAllByColumnId(columnId: string): Promise<Card[]> {
    const rows = await this.db
      .select()
      .from(cards)
      .where(eq(cards.columnId, columnId))
      .orderBy(asc(cards.position));

    return rows.map((row) => CardMapper.toDomain(row));
  }

  public async findAllByBoardId(boardId: string): Promise<Card[]> {
    const rows = await this.db
      .select()
      .from(cards)
      .where(eq(cards.boardId, boardId))
      .orderBy(asc(cards.position));

    return rows.map((row) => CardMapper.toDomain(row));
  }

  public async findLastPositionByColumnId(columnId: string): Promise<number | null> {
    const [row] = await this.db
      .select({ position: cards.position })
      .from(cards)
      .where(eq(cards.columnId, columnId))
      .orderBy(desc(cards.position))
      .limit(1);

    return row ? row.position : null;
  }
}
