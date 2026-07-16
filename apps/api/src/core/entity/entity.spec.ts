import { Entity } from "@/core/entity/entity";
import { UniqueEntityID } from "@/core/entity/unique-entity-id";

class SomeClass extends Entity {
  public static create(id?: UniqueEntityID) {
    return new SomeClass({}, id);
  }
}

describe("Entity", () => {
  it("should create a new entity", () => {
    const sut = SomeClass.create();

    expect(sut.id.toValue()).toEqual(expect.any(String));
    expect(sut).toBeInstanceOf(Entity);
    expect(sut.id).toBeInstanceOf(UniqueEntityID);
  });

  it("should restore the entity with old id", () => {
    const id = UniqueEntityID.create();
    const sut = SomeClass.create(id);

    expect(sut.id.toValue()).toEqual(id.toValue());
  });
});
