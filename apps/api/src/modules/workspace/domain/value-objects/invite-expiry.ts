import { ValueObject } from "@/core/entity/value-object";

export class InviteExpiry extends ValueObject<{ value: Date }> {
  private static readonly EXPIRY_DAYS = 7;

  public get value(): Date {
    return this.props.value;
  }

  public isExpired(): boolean {
    return new Date() > this.props.value;
  }

  private constructor(value: Date) {
    super({ value });
  }

  public static create(): InviteExpiry {
    const date = new Date();
    date.setDate(date.getDate() + InviteExpiry.EXPIRY_DAYS);
    return new InviteExpiry(date);
  }

  public static restore(value: Date): InviteExpiry {
    return new InviteExpiry(value);
  }

  public toString(): string {
    return this.props.value.toISOString();
  }
}
