import { Card } from "@/modules/board/domain/entities/card";
import { Column } from "@/modules/board/domain/entities/column";

import { CardPresenter } from "./card.presenter";

export class ColumnPresenter {
  public static toHTTP(column: Column) {
    return {
      id: column.id.toValue(),
      board_id: column.boardId.toValue(),
      name: column.name.toString(),
      position: column.position.toNumber(),
      created_at: column.createdAt,
      updated_at: column.updatedAt,
    };
  }

  public static toHTTPWithCards(column: Column, cards: Card[]) {
    return {
      ...ColumnPresenter.toHTTP(column),
      cards: cards.map((card) => CardPresenter.toHTTP(card)),
    };
  }
}
