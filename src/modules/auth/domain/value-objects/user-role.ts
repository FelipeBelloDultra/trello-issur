import { ValueObject } from "@/core/entity/value-object";

import { RawPermissionKey } from "./permission-key";

const ROLE_REGISTRY = [
  { name: "admin", description: "Full control over the workspace" },
  { name: "member", description: "Can create and edit content" },
  { name: "viewer", description: "Read-only access" },
] as const;

export type RawUserRole = (typeof ROLE_REGISTRY)[number]["name"];

export const ROLE_PERMISSION_MAP: Record<RawUserRole, RawPermissionKey[]> = {
  admin: [
    "workspace:manage",
    "workspace:delete",
    "workspace:invite",
    "workspace:remove-member",
    "board:create",
    "board:edit",
    "board:delete",
    "card:create",
    "card:edit",
    "card:delete",
    "card:move",
    "card:assign",
  ],
  member: [
    "workspace:invite",
    "board:create",
    "board:edit",
    "card:create",
    "card:edit",
    "card:move",
    "card:assign",
  ],
  viewer: [],
};

export class UserRole extends ValueObject<{ value: RawUserRole }> {
  public static readonly registry = ROLE_REGISTRY;
  public static readonly permissionMap = ROLE_PERMISSION_MAP;

  private constructor(value: RawUserRole) {
    super({ value });
  }

  public static create(value: string): UserRole {
    const found = ROLE_REGISTRY.find((r) => r.name === value);
    if (!found) throw new Error(`Unknown role: "${value}"`);
    return new UserRole(value as RawUserRole);
  }

  public toString(): string {
    return this.props.value;
  }
}
