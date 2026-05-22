import { InvalidAccountRoleError } from "@/modules/auth/domain/errors/invalid-account-role.error";

import { AccountRole } from "./account-role";

describe("AccountRole", () => {
  it("should throw InvalidAccountRoleError for an unknown role", () => {
    expect(() => AccountRole.create("superuser")).toThrowError(InvalidAccountRoleError);
  });

  it("should return the role name from toString", () => {
    const sut = AccountRole.create("member");

    expect(sut.toString()).toBe("member");
  });

  it("should consider two roles with the same value as equal", () => {
    const sut = AccountRole.create("viewer");
    const anotherViewer = AccountRole.create("viewer");

    expect(sut.equals(anotherViewer)).toBe(true);
  });

  it("should consider two roles with different values as not equal", () => {
    const sut = AccountRole.create("admin");
    const memberRole = AccountRole.create("member");

    expect(sut.equals(memberRole)).toBe(false);
  });

  it("should return true for a permission the role has", () => {
    const sut = AccountRole.create("admin");

    expect(sut.hasPermission("workspace:delete")).toBe(true);
  });

  it("should return false for a permission the role does not have", () => {
    const sut = AccountRole.create("viewer");

    expect(sut.hasPermission("board:create")).toBe(false);
  });

  it("should return false for a permission above the role level", () => {
    const sut = AccountRole.create("member");

    expect(sut.hasPermission("workspace:delete")).toBe(false);
  });
});
