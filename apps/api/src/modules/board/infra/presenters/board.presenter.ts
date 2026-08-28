import { GetBoardResult } from "@/modules/board/application/queries/get-board/handler";
import { Board } from "@/modules/board/domain/entities/board";

import { ColumnPresenter } from "./column.presenter";

export class BoardPresenter {
  public static toHTTP(board: Board) {
    return {
      id: board.id.toValue(),
      workspace_id: board.workspaceId.toValue(),
      name: board.name.toString(),
      created_at: board.createdAt,
      updated_at: board.updatedAt,
    };
  }

  public static toHTTPWithDetails(result: GetBoardResult) {
    const cardsByColumnId = new Map<string, typeof result.cards>();

    for (const card of result.cards) {
      const key = card.columnId.toValue();
      const bucket = cardsByColumnId.get(key) ?? [];
      bucket.push(card);
      cardsByColumnId.set(key, bucket);
    }

    return {
      ...BoardPresenter.toHTTP(result.board),
      columns: result.columns.map((column) =>
        ColumnPresenter.toHTTPWithCards(column, cardsByColumnId.get(column.id.toValue()) ?? []),
      ),
    };
  }
}
