import { foo } from "./index";

describe("foo", () => {
  it("returns bar", () => {
    expect(foo()).toBe("bar");
  });
});
