import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { UniqueEntityID } from "@/core/entity/unique-entity-id";

import { accounts } from "./accounts";

export const workspaces = pgTable("workspaces", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => UniqueEntityID.create().toValue()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => accounts.id, { onDelete: "restrict" }),
  description: text("description"),
  avatarUrl: text("avatar_url"),
  isPersonal: boolean("is_personal").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
