import { UniqueEntityID } from "@/core/entity/unique-entity-id";

describe("Unique entity ID", () => {
  it("should create a unique entity", () => {
    const sut = UniqueEntityID.create();

    expect(sut.toValue()).toEqual(expect.any(String));
  });

  it("should use a unique entity if provided", () => {
    const oldId = UniqueEntityID.create();
    const sut = UniqueEntityID.create(oldId.toValue());

    expect(sut.toValue()).toEqual(oldId.toValue());
  });

  it("should compare if two entities has the same value", () => {
    const oldId = UniqueEntityID.create();
    const sut = UniqueEntityID.create(oldId.toValue());

    expect(sut.equals(oldId)).toBe(true);
  });
});
