import { InvalidUserRoleError } from "@/modules/auth/domain/errors/invalid-user-role.error";

import { UserRole } from "./user-role";

describe("UserRole", () => {
  it("should throw InvalidUserRoleError for an unknown role", () => {
    expect(() => UserRole.create("superuser")).toThrowError(InvalidUserRoleError);
  });

  it("should return the role name from toString", () => {
    const sut = UserRole.create("member");

    expect(sut.toString()).toBe("member");
  });

  it("should consider two roles with the same value as equal", () => {
    const sut = UserRole.create("viewer");
    const anotherViewer = UserRole.create("viewer");

    expect(sut.equals(anotherViewer)).toBe(true);
  });

  it("should consider two roles with different values as not equal", () => {
    const sut = UserRole.create("admin");
    const memberRole = UserRole.create("member");

    expect(sut.equals(memberRole)).toBe(false);
  });

  it("should return true for a permission the role has", () => {
    const sut = UserRole.create("admin");

    expect(sut.hasPermission("workspace:delete")).toBe(true);
  });

  it("should return false for a permission the role does not have", () => {
    const sut = UserRole.create("viewer");

    expect(sut.hasPermission("board:create")).toBe(false);
  });

  it("should return false for a permission above the role level", () => {
    const sut = UserRole.create("member");

    expect(sut.hasPermission("workspace:delete")).toBe(false);
  });
});
