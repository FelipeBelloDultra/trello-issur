import { Entity } from "@/core/entity/entity";
import { UniqueEntityID } from "@/core/entity/unique-entity-id";

import { ColumnName } from "../value-objects/column-name";
import { Position } from "../value-objects/position";

interface ColumnProps {
  boardId: UniqueEntityID;
  name: ColumnName;
  position: Position;
  createdAt: Date;
  updatedAt: Date;
}

export class Column extends Entity<ColumnProps> {
  public get boardId(): UniqueEntityID {
    return this.props.boardId;
  }

  public get name(): ColumnName {
    return this.props.name;
  }

  public get position(): Position {
    return this.props.position;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public rename(name: ColumnName): void {
    this.props.name = name;
    this.touch();
  }

  public reposition(position: Position): void {
    this.props.position = position;
    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  private constructor(props: ColumnProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(props: ColumnProps, id?: UniqueEntityID): Column {
    return new Column(props, id);
  }
}
