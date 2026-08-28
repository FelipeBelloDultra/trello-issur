import { relations } from "drizzle-orm";

import { accountRoles } from "./account-roles";
import { accounts } from "./accounts";
import { boards } from "./boards";
import { cards } from "./cards";
import { columns } from "./columns";
import { permissions } from "./permissions";
import { rolePermissions } from "./role-permissions";
import { roles } from "./roles";
import { workspaces } from "./workspaces";

export const accountsRelations = relations(accounts, ({ many }) => ({
  accountRoles: many(accountRoles),
  assignedCards: many(cards),
}));

export const boardsRelations = relations(boards, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [boards.workspaceId], references: [workspaces.id] }),
  columns: many(columns),
  cards: many(cards),
}));

export const columnsRelations = relations(columns, ({ one, many }) => ({
  board: one(boards, { fields: [columns.boardId], references: [boards.id] }),
  cards: many(cards),
}));

export const cardsRelations = relations(cards, ({ one }) => ({
  column: one(columns, { fields: [cards.columnId], references: [columns.id] }),
  board: one(boards, { fields: [cards.boardId], references: [boards.id] }),
  assignee: one(accounts, { fields: [cards.assigneeAccountId], references: [accounts.id] }),
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
  boards: many(boards),
}));

export const accountRolesRelations = relations(accountRoles, ({ one }) => ({
  account: one(accounts, { fields: [accountRoles.accountId], references: [accounts.id] }),
  role: one(roles, { fields: [accountRoles.roleId], references: [roles.id] }),
  workspace: one(workspaces, { fields: [accountRoles.workspaceId], references: [workspaces.id] }),
}));
