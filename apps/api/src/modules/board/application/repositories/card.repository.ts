import { Card } from "@/modules/board/domain/entities/card";

export interface CardRepository {
  create(card: Card): Promise<void>;
  save(card: Card): Promise<void>;
  delete(id: string): Promise<void>;
  deleteAllByBoardId(boardId: string): Promise<void>;
  deleteAllByColumnId(columnId: string): Promise<void>;
  findById(id: string): Promise<Card | null>;
  findAllByColumnId(columnId: string): Promise<Card[]>;
  findAllByBoardId(boardId: string): Promise<Card[]>;
  findLastPositionByColumnId(columnId: string): Promise<number | null>;
}
