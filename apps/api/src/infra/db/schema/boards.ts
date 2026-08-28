import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { UniqueEntityID } from "@/core/entity/unique-entity-id";

import { workspaces } from "./workspaces";

export const boards = pgTable("boards", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => UniqueEntityID.create().toValue()),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "restrict" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
