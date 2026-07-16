import { InvalidPermissionKeyError } from "@/modules/auth/domain/errors/invalid-permission-key.error";

import { PermissionKey } from "./permission-key";

describe("PermissionKey", () => {
  it("should throw InvalidPermissionKeyError for an unknown key", () => {
    expect(() => PermissionKey.create("unknown:action")).toThrowError(InvalidPermissionKeyError);
  });

  it("should return the key string from toString", () => {
    const sut = PermissionKey.create("card:edit");

    expect(sut.toString()).toBe("card:edit");
  });

  it("should consider two keys with the same value as equal", () => {
    const sut = PermissionKey.create("workspace:invite");
    const workspaceInvite = PermissionKey.create("workspace:invite");

    expect(sut.equals(workspaceInvite)).toBe(true);
  });

  it("should consider two keys with different values as not equal", () => {
    const sut = PermissionKey.create("board:create");
    const boardDelete = PermissionKey.create("board:delete");

    expect(sut.equals(boardDelete)).toBe(false);
  });
});
