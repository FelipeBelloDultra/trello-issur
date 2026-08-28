import { ValueObject } from "@/core/entity/value-object";

import { BoardNameEmptyError } from "../errors/board-name-empty.error";

export const BOARD_NAME_MAX = 120;

export class BoardName extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  public static create(value: string): BoardName {
    const trimmed = value.trim();

    if (trimmed.length < 1) {
      throw new BoardNameEmptyError();
    }

    return new BoardName(trimmed);
  }

  public static restore(value: string): BoardName {
    return new BoardName(value);
  }

  public toString(): string {
    return this.props.value;
  }
}
