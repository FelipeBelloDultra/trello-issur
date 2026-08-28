import { ValueObject } from "@/core/entity/value-object";

import { CardTitleEmptyError } from "../errors/card-title-empty.error";

export const CARD_TITLE_MAX = 200;

export class CardTitle extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  public static create(value: string): CardTitle {
    const trimmed = value.trim();

    if (trimmed.length < 1) {
      throw new CardTitleEmptyError();
    }

    return new CardTitle(trimmed);
  }

  public static restore(value: string): CardTitle {
    return new CardTitle(value);
  }

  public toString(): string {
    return this.props.value;
  }
}
