import { InferInsertModel, InferSelectModel } from "drizzle-orm";

import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { boards } from "@/infra/db/schema/boards";
import { Board } from "@/modules/board/domain/entities/board";
import { BoardName } from "@/modules/board/domain/value-objects/board-name";

type BoardRow = InferSelectModel<typeof boards>;
type BoardInsert = InferInsertModel<typeof boards>;

export class BoardMapper {
  public static toDomain(raw: BoardRow): Board {
    return Board.create(
      {
        workspaceId: UniqueEntityID.create(raw.workspaceId),
        name: BoardName.restore(raw.name),
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      UniqueEntityID.create(raw.id),
    );
  }

  public static toPersistence(board: Board): BoardInsert {
    return {
      id: board.id.toValue(),
      workspaceId: board.workspaceId.toValue(),
      name: board.name.toString(),
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
    };
  }
}
