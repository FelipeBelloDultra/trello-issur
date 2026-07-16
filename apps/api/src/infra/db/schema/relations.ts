import { relations } from "drizzle-orm";

import { accountRoles } from "./account-roles";
import { accounts } from "./accounts";
import { permissions } from "./permissions";
import { rolePermissions } from "./role-permissions";
import { roles } from "./roles";
import { workspaces } from "./workspaces";

export const accountsRelations = relations(accounts, ({ many }) => ({
  accountRoles: many(accountRoles),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  rolePermissions: many(rolePermissions),
  accountRoles: many(accountRoles),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, { fields: [rolePermissions.roleId], references: [roles.id] }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(accounts, { fields: [workspaces.ownerId], references: [accounts.id] }),
  accountRoles: many(accountRoles),
}));

export const accountRolesRelations = relations(accountRoles, ({ one }) => ({
  account: one(accounts, { fields: [accountRoles.accountId], references: [accounts.id] }),
  role: one(roles, { fields: [accountRoles.roleId], references: [roles.id] }),
  workspace: one(workspaces, { fields: [accountRoles.workspaceId], references: [workspaces.id] }),
}));
