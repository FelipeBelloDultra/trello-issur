import { ValueObject } from "@/core/entity/value-object";

import { ColumnNameEmptyError } from "../errors/column-name-empty.error";

export const COLUMN_NAME_MAX = 120;

export class ColumnName extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  public static create(value: string): ColumnName {
    const trimmed = value.trim();

    if (trimmed.length < 1) {
      throw new ColumnNameEmptyError();
    }

    return new ColumnName(trimmed);
  }

  public static restore(value: string): ColumnName {
    return new ColumnName(value);
  }

  public toString(): string {
    return this.props.value;
  }
}
