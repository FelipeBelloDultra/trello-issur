import { index, pgTable, timestamp, unique, uuid } from "drizzle-orm/pg-core";

import { UniqueEntityID } from "@/core/entity/unique-entity-id";

import { accounts } from "./accounts";
import { roles } from "./roles";

export const accountRoles = pgTable(
  "account_roles",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => UniqueEntityID.create().toValue()),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "restrict" }),
    // TODO: add FK to workspaces.id once workspace module is built
    workspaceId: uuid("workspace_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    unique("account_roles_account_role_workspace_uniq").on(
      table.accountId,
      table.roleId,
      table.workspaceId,
    ),
    index("account_roles_account_workspace_idx").on(table.accountId, table.workspaceId),
  ],
);
