import { v7 as uuidv7 } from "uuid";

export class UniqueEntityID {
  private id: string;

  public toValue() {
    return this.id;
  }

  private constructor(value?: string) {
    this.id = value ?? uuidv7();
  }

  public equals(id: UniqueEntityID) {
    return this.toValue() === id.toValue();
  }

  public static create(value?: string) {
    return new UniqueEntityID(value);
  }
}
