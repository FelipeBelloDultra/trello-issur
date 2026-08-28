import { Entity } from "@/core/entity/entity";
import { UniqueEntityID } from "@/core/entity/unique-entity-id";

import { CardTitle } from "../value-objects/card-title";
import { Position } from "../value-objects/position";

interface CardProps {
  boardId: UniqueEntityID;
  columnId: UniqueEntityID;
  title: CardTitle;
  description: string | null;
  position: Position;
  assigneeAccountId: UniqueEntityID | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Card extends Entity<CardProps> {
  public get boardId(): UniqueEntityID {
    return this.props.boardId;
  }

  public get columnId(): UniqueEntityID {
    return this.props.columnId;
  }

  public get title(): CardTitle {
    return this.props.title;
  }

  public get description(): string | null {
    return this.props.description;
  }

  public get position(): Position {
    return this.props.position;
  }

  public get assigneeAccountId(): UniqueEntityID | null {
    return this.props.assigneeAccountId;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Title/description only — position/column are never touched here (spec FR-008).
  public updateDetails(props: { title?: CardTitle; description?: string | null }): void {
    if (props.title) this.props.title = props.title;
    if (props.description !== undefined) this.props.description = props.description;
    this.touch();
  }

  // Column + position always move together — a card can't have a position
  // without a column, so partial updates aren't a valid state to construct.
  public moveTo(columnId: UniqueEntityID, position: Position): void {
    this.props.columnId = columnId;
    this.props.position = position;
    this.touch();
  }

  public assignTo(accountId: UniqueEntityID | null): void {
    this.props.assigneeAccountId = accountId;
    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  private constructor(props: CardProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(props: CardProps, id?: UniqueEntityID): Card {
    return new Card(props, id);
  }
}
