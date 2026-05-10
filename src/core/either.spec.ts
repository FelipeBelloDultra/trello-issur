import { Either, left, right } from "@/core/either";

function doSomeThing(shouldSuccess: boolean): Either<string, number> {
  if (shouldSuccess) {
    return right(10);
  }
  return left("error");
}

describe("Either", () => {
  it("should return the success result", () => {
    const sut = doSomeThing(true);

    expect(sut.isRight()).toBe(true);
    expect(sut.isLeft()).toBe(false);
  });

  it("should return the error result", () => {
    const sut = doSomeThing(false);

    expect(sut.isLeft()).toBe(true);
    expect(sut.isRight()).toBe(false);
  });
});
