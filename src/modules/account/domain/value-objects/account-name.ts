import { ValueObject } from "@/core/entity/value-object";

import { InvalidAccountNameError } from "../errors/invalid-account-name.error";

export const ACCOUNT_NAME_MAX = 100;
export const ACCOUNT_NAME_WORDS_PATTERN = /^\S{2,}(\s+\S{2,})+$/;

export class AccountName extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  public static create(value: string): AccountName {
    const trimmed = value.trim();

    if (trimmed.length > ACCOUNT_NAME_MAX) {
      throw new InvalidAccountNameError(`must be at most ${ACCOUNT_NAME_MAX} characters`);
    }

    if (!ACCOUNT_NAME_WORDS_PATTERN.test(trimmed)) {
      throw new InvalidAccountNameError(
        "must contain at least two words with at least 2 characters each",
      );
    }

    return new AccountName(trimmed);
  }

  public static restore(value: string): AccountName {
    return new AccountName(value);
  }

  public toString(): string {
    return this.props.value;
  }
}
