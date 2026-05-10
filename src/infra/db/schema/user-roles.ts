import { index, pgTable, timestamp, unique, uuid } from "drizzle-orm/pg-core";

import { UniqueEntityID } from "@/core/entity/unique-entity-id";

import { roles } from "./roles";
import { users } from "./users";

export const userRoles = pgTable(
  "user_roles",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => UniqueEntityID.create().toValue()),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "restrict" }),
    // TODO::: add FK to workspaces.id once workspace module is built
    workspaceId: uuid("workspace_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    unique("user_roles_user_role_workspace_uniq").on(table.userId, table.roleId, table.workspaceId),
    index("user_roles_user_workspace_idx").on(table.userId, table.workspaceId),
  ],
);
