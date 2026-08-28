import { faker } from "@faker-js/faker";

import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { Card } from "@/modules/board/domain/entities/card";
import { CardTitle } from "@/modules/board/domain/value-objects/card-title";
import { Position } from "@/modules/board/domain/value-objects/position";

interface MakeCardOverrides {
  boardId?: UniqueEntityID;
  columnId?: UniqueEntityID;
  title?: CardTitle;
  description?: string | null;
  position?: Position;
  assigneeAccountId?: UniqueEntityID | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export function makeCard(overrides: MakeCardOverrides = {}, id?: UniqueEntityID): Card {
  return Card.create(
    {
      boardId: overrides.boardId ?? UniqueEntityID.create(),
      columnId: overrides.columnId ?? UniqueEntityID.create(),
      title: overrides.title ?? CardTitle.create(faker.lorem.words(3)),
      description: overrides.description ?? null,
      position: overrides.position ?? Position.first(),
      assigneeAccountId: overrides.assigneeAccountId ?? null,
      createdAt: overrides.createdAt ?? new Date(),
      updatedAt: overrides.updatedAt ?? new Date(),
    },
    id,
  );
}
