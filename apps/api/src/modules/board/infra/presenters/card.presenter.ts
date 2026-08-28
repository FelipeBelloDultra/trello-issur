import { Card } from "@/modules/board/domain/entities/card";

export class CardPresenter {
  public static toHTTP(card: Card) {
    return {
      id: card.id.toValue(),
      column_id: card.columnId.toValue(),
      board_id: card.boardId.toValue(),
      title: card.title.toString(),
      description: card.description,
      position: card.position.toNumber(),
      assignee_account_id: card.assigneeAccountId ? card.assigneeAccountId.toValue() : null,
      created_at: card.createdAt,
      updated_at: card.updatedAt,
    };
  }
}
