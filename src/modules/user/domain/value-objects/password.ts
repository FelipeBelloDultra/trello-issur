import argon2 from "argon2";

import { ValueObject } from "@/core/entity/value-object";

export class Password extends ValueObject<{ value: string }> {
  private constructor(hash: string) {
    super({ value: hash });
  }

  public static async create(plain: string): Promise<Password> {
    const hash = await argon2.hash(plain);
    return new Password(hash);
  }

  public static restore(hash: string): Password {
    return new Password(hash);
  }

  public async compare(plain: string): Promise<boolean> {
    return argon2.verify(this.props.value, plain);
  }

  public toString(): string {
    return this.props.value;
  }
}
