import { Column } from "@/modules/board/domain/entities/column";

export interface ColumnRepository {
  create(column: Column): Promise<void>;
  save(column: Column): Promise<void>;
  delete(id: string): Promise<void>;
  deleteAllByBoardId(boardId: string): Promise<void>;
  findById(id: string): Promise<Column | null>;
  findAllByBoardId(boardId: string): Promise<Column[]>;
  findLastPositionByBoardId(boardId: string): Promise<number | null>;
}
