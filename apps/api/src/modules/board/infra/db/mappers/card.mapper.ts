import { InferInsertModel, InferSelectModel } from "drizzle-orm";

import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { cards } from "@/infra/db/schema/cards";
import { Card } from "@/modules/board/domain/entities/card";
import { CardTitle } from "@/modules/board/domain/value-objects/card-title";
import { Position } from "@/modules/board/domain/value-objects/position";

type CardRow = InferSelectModel<typeof cards>;
type CardInsert = InferInsertModel<typeof cards>;

export class CardMapper {
  public static toDomain(raw: CardRow): Card {
    return Card.create(
      {
        boardId: UniqueEntityID.create(raw.boardId),
        columnId: UniqueEntityID.create(raw.columnId),
        title: CardTitle.restore(raw.title),
        description: raw.description,
        position: Position.restore(raw.position),
        assigneeAccountId: raw.assigneeAccountId
          ? UniqueEntityID.create(raw.assigneeAccountId)
          : null,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      UniqueEntityID.create(raw.id),
    );
  }

  public static toPersistence(card: Card): CardInsert {
    return {
      id: card.id.toValue(),
      boardId: card.boardId.toValue(),
      columnId: card.columnId.toValue(),
      title: card.title.toString(),
      description: card.description,
      position: card.position.toNumber(),
      assigneeAccountId: card.assigneeAccountId ? card.assigneeAccountId.toValue() : null,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
    };
  }
}
