import { Entity } from "@/core/entity/entity";
import { UniqueEntityID } from "@/core/entity/unique-entity-id";

import { BoardName } from "../value-objects/board-name";

interface BoardProps {
  workspaceId: UniqueEntityID;
  name: BoardName;
  createdAt: Date;
  updatedAt: Date;
}

export class Board extends Entity<BoardProps> {
  public get workspaceId(): UniqueEntityID {
    return this.props.workspaceId;
  }

  public get name(): BoardName {
    return this.props.name;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public rename(name: BoardName): void {
    this.props.name = name;
    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  private constructor(props: BoardProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(props: BoardProps, id?: UniqueEntityID): Board {
    return new Board(props, id);
  }
}
