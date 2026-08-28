import { faker } from "@faker-js/faker";

import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { Board } from "@/modules/board/domain/entities/board";
import { BoardName } from "@/modules/board/domain/value-objects/board-name";

interface MakeBoardOverrides {
  workspaceId?: UniqueEntityID;
  name?: BoardName;
  createdAt?: Date;
  updatedAt?: Date;
}

export function makeBoard(overrides: MakeBoardOverrides = {}, id?: UniqueEntityID): Board {
  return Board.create(
    {
      workspaceId: overrides.workspaceId ?? UniqueEntityID.create(),
      name: overrides.name ?? BoardName.create(faker.lorem.words(2)),
      createdAt: overrides.createdAt ?? new Date(),
      updatedAt: overrides.updatedAt ?? new Date(),
    },
    id,
  );
}
