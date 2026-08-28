import { CardTitleEmptyError } from "../errors/card-title-empty.error";

import { CardTitle } from "./card-title";

describe("CardTitle", () => {
  it("should throw CardTitleEmptyError for an empty value", () => {
    expect(() => CardTitle.create("")).toThrowError(CardTitleEmptyError);
  });

  it("should throw CardTitleEmptyError for a whitespace-only value", () => {
    expect(() => CardTitle.create("   ")).toThrowError(CardTitleEmptyError);
  });

  it("should trim surrounding whitespace", () => {
    const sut = CardTitle.create("  Write e2e test  ");

    expect(sut.toString()).toBe("Write e2e test");
  });

  it("should restore a value without validating it", () => {
    const sut = CardTitle.restore("");

    expect(sut.toString()).toBe("");
  });
});
