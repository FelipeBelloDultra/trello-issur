import { faker } from "@faker-js/faker";

import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { Column } from "@/modules/board/domain/entities/column";
import { ColumnName } from "@/modules/board/domain/value-objects/column-name";
import { Position } from "@/modules/board/domain/value-objects/position";

interface MakeColumnOverrides {
  boardId?: UniqueEntityID;
  name?: ColumnName;
  position?: Position;
  createdAt?: Date;
  updatedAt?: Date;
}

export function makeColumn(overrides: MakeColumnOverrides = {}, id?: UniqueEntityID): Column {
  return Column.create(
    {
      boardId: overrides.boardId ?? UniqueEntityID.create(),
      name: overrides.name ?? ColumnName.create(faker.lorem.word()),
      position: overrides.position ?? Position.first(),
      createdAt: overrides.createdAt ?? new Date(),
      updatedAt: overrides.updatedAt ?? new Date(),
    },
    id,
  );
}
