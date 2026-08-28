import { ColumnNameEmptyError } from "../errors/column-name-empty.error";

import { ColumnName } from "./column-name";

describe("ColumnName", () => {
  it("should throw ColumnNameEmptyError for an empty value", () => {
    expect(() => ColumnName.create("")).toThrowError(ColumnNameEmptyError);
  });

  it("should throw ColumnNameEmptyError for a whitespace-only value", () => {
    expect(() => ColumnName.create("   ")).toThrowError(ColumnNameEmptyError);
  });

  it("should trim surrounding whitespace", () => {
    const sut = ColumnName.create("  To Do  ");

    expect(sut.toString()).toBe("To Do");
  });

  it("should restore a value without validating it", () => {
    const sut = ColumnName.restore("");

    expect(sut.toString()).toBe("");
  });
});
