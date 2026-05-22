import { ValueObject } from "@/core/entity/value-object";
import { InvalidAccountRoleError } from "@/modules/auth/domain/errors/invalid-account-role.error";

import { RawPermissionKey } from "./permission-key";

const ROLE_REGISTRY = [
  { name: "admin", description: "Full control over the workspace" },
  { name: "member", description: "Can create and edit content" },
  { name: "viewer", description: "Read-only access" },
] as const;

export type RawAccountRole = (typeof ROLE_REGISTRY)[number]["name"];

const ROLE_PERMISSION_MAP: Record<RawAccountRole, RawPermissionKey[]> = {
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

export class AccountRole extends ValueObject<{ value: RawAccountRole }> {
  public static readonly registry = ROLE_REGISTRY;
  public static readonly permissionMap = ROLE_PERMISSION_MAP;

  private constructor(value: RawAccountRole) {
    super({ value });
  }

  public static create(value: string): AccountRole {
    const found = ROLE_REGISTRY.find((r) => r.name === value);
    if (!found) throw new InvalidAccountRoleError(value);

    return new AccountRole(found.name);
  }

  public hasPermission(key: RawPermissionKey): boolean {
    return ROLE_PERMISSION_MAP[this.props.value].includes(key);
  }

  public toString(): string {
    return this.props.value;
  }
}
