import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { UniqueEntityID } from "@/core/entity/unique-entity-id";

import { accounts } from "./accounts";
import { workspaces } from "./workspaces";

export const workspaceInvites = pgTable("workspace_invites", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => UniqueEntityID.create().toValue()),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  invitedByAccountId: uuid("invited_by_account_id")
    .notNull()
    .references(() => accounts.id, { onDelete: "restrict" }),
  email: text("email").notNull(),
  role: text("role").notNull(),
  token: text("token").notNull().unique(),
  status: text("status").notNull().default("pending"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
