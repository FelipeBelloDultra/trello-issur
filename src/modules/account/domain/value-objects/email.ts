import { ValueObject } from "@/core/entity/value-object";

import { InvalidEmailError } from "../errors/invalid-email.error";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export class Email extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  public static create(value: string): Email {
    const normalized = value.trim().toLowerCase();

    if (!EMAIL_PATTERN.test(normalized)) {
      throw new InvalidEmailError(value);
    }

    return new Email(normalized);
  }

  public static restore(value: string): Email {
    return new Email(value);
  }

  public toString(): string {
    return this.props.value;
  }
}
