import { InferInsertModel, InferSelectModel } from "drizzle-orm";

import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { columns } from "@/infra/db/schema/columns";
import { Column } from "@/modules/board/domain/entities/column";
import { ColumnName } from "@/modules/board/domain/value-objects/column-name";
import { Position } from "@/modules/board/domain/value-objects/position";

type ColumnRow = InferSelectModel<typeof columns>;
type ColumnInsert = InferInsertModel<typeof columns>;

export class ColumnMapper {
  public static toDomain(raw: ColumnRow): Column {
    return Column.create(
      {
        boardId: UniqueEntityID.create(raw.boardId),
        name: ColumnName.restore(raw.name),
        position: Position.restore(raw.position),
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      UniqueEntityID.create(raw.id),
    );
  }

  public static toPersistence(column: Column): ColumnInsert {
    return {
      id: column.id.toValue(),
      boardId: column.boardId.toValue(),
      name: column.name.toString(),
      position: column.position.toNumber(),
      createdAt: column.createdAt,
      updatedAt: column.updatedAt,
    };
  }
}
